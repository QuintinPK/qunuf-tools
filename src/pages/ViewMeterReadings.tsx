
import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import DateRangeFilter from "@/components/DateRangeFilter";
import StatsCard from "@/components/StatsCard";
import AddressCheckboxes from "@/components/AddressCheckboxes";

interface MeterReading {
  id: string;
  address: string;
  electricity_reading: number | null;
  water_reading: number | null;
  created_at: string;
}

const ViewMeterReadings = () => {
  const isMobile = useIsMobile();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

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

  // Fetch meter readings
  const { data: readings, isLoading: isLoadingReadings } = useQuery<MeterReading[]>({
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
  const calculateStats = (utilityType: 'electricity' | 'water') => {
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
    
    return { avg_consumption_per_day: avgConsumption };
  };

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
            value={calculateStats('electricity').avg_consumption_per_day.toFixed(2) || "0.00"}
            isLoading={isLoadingReadings}
          />
          <StatsCard
            title={`Water (${selectedAddress})`}
            value={calculateStats('water').avg_consumption_per_day.toFixed(2) || "0.00"}
            isLoading={isLoadingReadings}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings?.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell>{reading.address}</TableCell>
                  <TableCell>{reading.electricity_reading || '-'}</TableCell>
                  <TableCell>{reading.water_reading || '-'}</TableCell>
                  <TableCell>{new Date(reading.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default ViewMeterReadings;
