import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import DateRangeFilter from "@/components/DateRangeFilter";
import StatsCard from "@/components/StatsCard";
import AddressCheckboxes from "@/components/AddressCheckboxes";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFetchUtilityPrice } from "@/hooks/use-utility-prices";

interface MeterReading {
  id: string;
  address: string;
  electricity_reading: number | null;
  water_reading: number | null;
  created_at: string;
}

interface CalculationResult {
  avg_consumption_per_day: number;
  estimated_cost_per_month?: number;
  price_per_unit?: number;
  unit_name?: string;
  total_cost?: number;
  days_diff?: number;
  total_consumption?: number;
}

const ViewMeterReadings = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  
  // Add state for editing functionality
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentReading, setCurrentReading] = useState<MeterReading | null>(null);
  const [editElectricityReading, setEditElectricityReading] = useState<number | null>(null);
  const [editWaterReading, setEditWaterReading] = useState<number | null>(null);

  // Fetch utility prices
  const { data: electricityPrice } = useFetchUtilityPrice('electricity');
  const { data: waterPrice } = useFetchUtilityPrice('water');

  // Fetch unique addresses
  const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['unique-addresses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addresses')
        .select('address')
        .order('address', { ascending: true });

      if (error) throw error;
      return data.map(item => item.address);
    }
  });

  // Setup selected addresses when addresses data loads
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0]);
    }
  }, [addresses, selectedAddress]);

  // Simple handler for address selection
  const handleAddressChange = (address: string | null) => {
    setSelectedAddress(address);
  };

  // Fetch meter readings with refetch function
  const { data: readings, isLoading: isLoadingReadings, refetch } = useQuery<MeterReading[]>({
    queryKey: ['meter-readings', startDate, endDate, selectedAddress],
    queryFn: async () => {
      let query = supabase
        .from('meter_readings')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply date filters if they exist
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      // Filter by selected address
      if (selectedAddress) {
        query = query.eq('address', selectedAddress);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data as MeterReading[];
    },
    enabled: !!selectedAddress,
  });

  // Calculate statistics for the selected address
  const calculateStats = (utilityType: 'electricity' | 'water'): CalculationResult => {
    if (!readings || !readings.length || !selectedAddress) {
      return { avg_consumption_per_day: 0 };
    }

    // Sort readings by date (oldest first)
    const sortedReadings = [...readings].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Get the first and last reading
    const firstReading = sortedReadings[0];
    const lastReading = sortedReadings[sortedReadings.length - 1];

    // Calculate days between readings
    const daysDiff = Math.max(1, Math.round(
      (new Date(lastReading.created_at).getTime() - new Date(firstReading.created_at).getTime()) / 
      (1000 * 60 * 60 * 24)
    ));

    // Calculate consumption difference based on utility type
    const firstValue = utilityType === 'electricity' ? 
      firstReading.electricity_reading : firstReading.water_reading;
    const lastValue = utilityType === 'electricity' ? 
      lastReading.electricity_reading : lastReading.water_reading;

    if (firstValue === null || lastValue === null) {
      return { avg_consumption_per_day: 0 };
    }

    // Calculate daily average consumption
    const totalConsumption = lastValue - firstValue;
    const avgConsumption = totalConsumption / daysDiff;
    
    // Calculate cost if price data is available
    const currentPrice = utilityType === 'electricity' ? electricityPrice : waterPrice;
    
    if (currentPrice) {
      // Calculate cost for the selected date range
      const totalCost = totalConsumption * currentPrice.price_per_unit;
      
      // Estimate monthly cost (30 days)
      const estimatedCostPerMonth = avgConsumption * 30 * currentPrice.price_per_unit;
      
      return { 
        avg_consumption_per_day: avgConsumption,
        estimated_cost_per_month: estimatedCostPerMonth,
        price_per_unit: currentPrice.price_per_unit,
        unit_name: currentPrice.unit_name,
        total_cost: totalCost,
        days_diff: daysDiff,
        total_consumption: totalConsumption
      };
    }
    
    return { avg_consumption_per_day: avgConsumption };
  };

  // Handle edit button click
  const handleEditClick = (reading: MeterReading) => {
    setCurrentReading(reading);
    setEditElectricityReading(reading.electricity_reading);
    setEditWaterReading(reading.water_reading);
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (reading: MeterReading) => {
    setCurrentReading(reading);
    setIsDeleteDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!currentReading) return;

    try {
      const { error } = await supabase
        .from('meter_readings')
        .update({
          electricity_reading: editElectricityReading,
          water_reading: editWaterReading
        })
        .eq('id', currentReading.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meter reading updated successfully",
      });
      
      // Refresh the data
      refetch();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating meter reading:", error);
      toast({
        title: "Error",
        description: "Failed to update meter reading",
        variant: "destructive",
      });
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!currentReading) return;

    try {
      const { error } = await supabase
        .from('meter_readings')
        .delete()
        .eq('id', currentReading.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meter reading deleted successfully",
      });
      
      // Refresh the data
      refetch();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting meter reading:", error);
      toast({
        title: "Error",
        description: "Failed to delete meter reading",
        variant: "destructive",
      });
    }
  };

  const electricityStats = calculateStats('electricity');
  const waterStats = calculateStats('water');

  return (
    <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto py-8 px-4'}`}>
      <h1 className="text-3xl font-bold mb-6">View Meter Readings</h1>

      <div className="mb-6">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      <div className="mb-6">
        {isLoadingAddresses ? (
          <div className="p-4 text-center">Loading addresses...</div>
        ) : (
          <AddressCheckboxes
            addresses={addresses}
            selectedAddress={selectedAddress}
            onAddressChange={handleAddressChange}
          />
        )}
      </div>

      {selectedAddress && (
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <StatsCard
            title={`Electricity (${selectedAddress})`}
            value={`${electricityStats.avg_consumption_per_day.toFixed(2) || "0.00"} ${electricityStats.unit_name || 'kWh'}/day`}
            isLoading={isLoadingReadings}
            additionalInfo={electricityStats.total_cost ? 
              `Cost for ${electricityStats.days_diff} days (${electricityStats.total_consumption?.toFixed(2)} ${electricityStats.unit_name}): $${electricityStats.total_cost.toFixed(2)}` : 
              undefined}
            subtitle={electricityStats.estimated_cost_per_month ? 
              `Est. monthly cost: $${electricityStats.estimated_cost_per_month.toFixed(2)}` : 
              undefined}
          />
          <StatsCard
            title={`Water (${selectedAddress})`}
            value={`${waterStats.avg_consumption_per_day.toFixed(2) || "0.00"} ${waterStats.unit_name || 'm³'}/day`}
            isLoading={isLoadingReadings}
            additionalInfo={waterStats.total_cost ? 
              `Cost for ${waterStats.days_diff} days (${waterStats.total_consumption?.toFixed(2)} ${waterStats.unit_name}): $${waterStats.total_cost.toFixed(2)}` : 
              undefined}
            subtitle={waterStats.estimated_cost_per_month ? 
              `Est. monthly cost: $${waterStats.estimated_cost_per_month.toFixed(2)}` : 
              undefined}
          />
        </div>
      )}

      <Card className="p-4">
        {isLoadingReadings ? (
          <p>Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>Electricity Reading</TableHead>
                <TableHead>Water Reading</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings?.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell>{reading.address}</TableCell>
                  <TableCell>{reading.electricity_reading || '-'}</TableCell>
                  <TableCell>{reading.water_reading || '-'}</TableCell>
                  <TableCell>{new Date(reading.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditClick(reading)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteClick(reading)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Meter Reading</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="electricity">Electricity Reading</Label>
              <Input
                id="electricity"
                type="number"
                value={editElectricityReading !== null ? editElectricityReading : ''}
                onChange={(e) => setEditElectricityReading(e.target.value ? Number(e.target.value) : null)}
                placeholder="Enter electricity reading"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="water">Water Reading</Label>
              <Input
                id="water"
                type="number"
                value={editWaterReading !== null ? editWaterReading : ''}
                onChange={(e) => setEditWaterReading(e.target.value ? Number(e.target.value) : null)}
                placeholder="Enter water reading"
                step="0.01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the meter reading.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ViewMeterReadings;
