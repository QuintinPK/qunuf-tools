
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
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);

  // Fetch unique addresses
  const { data: addresses = [] } = useQuery({
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

  // Set up selected addresses when addresses data loads
  useEffect(() => {
    if (addresses.length > 0) {
      setSelectedAddresses(addresses);
    }
  }, [addresses]);

  const handleAddressChange = (address: string) => {
    setSelectedAddresses(prev => {
      if (prev.includes(address)) {
        return prev.filter(a => a !== address);
      } else {
        return [...prev, address];
      }
    });
  };

  // Fetch meter readings
  const { data: readings, isLoading: isLoadingReadings } = useQuery<MeterReading[]>({
    queryKey: ['meter-readings', startDate, endDate, selectedAddresses],
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

      // Filter by selected addresses
      if (selectedAddresses.length > 0) {
        query = query.in('address', selectedAddresses);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data as MeterReading[];
    }
  });

  // Calculate statistics for each selected address
  const calculateStats = (address: string, utilityType: 'electricity' | 'water') => {
    if (!readings || !readings.length) {
      return { avg_consumption_per_day: 0 };
    }

    // Filter readings for the specific address
    const addressReadings = readings.filter(r => r.address === address);
    if (addressReadings.length < 2) return { avg_consumption_per_day: 0 };

    // Sort readings by date (oldest first)
    const sortedReadings = [...addressReadings].sort(
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
        <AddressCheckboxes
          addresses={addresses}
          selectedAddresses={selectedAddresses}
          onAddressChange={handleAddressChange}
        />
      </div>

      {selectedAddresses.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {selectedAddresses.map(address => (
            <React.Fragment key={`stats-${address}`}>
              <StatsCard
                title={`Electricity (${address})`}
                value={calculateStats(address, 'electricity').avg_consumption_per_day.toFixed(2) || "0.00"}
                isLoading={isLoadingReadings}
              />
              <StatsCard
                title={`Water (${address})`}
                value={calculateStats(address, 'water').avg_consumption_per_day.toFixed(2) || "0.00"}
                isLoading={isLoadingReadings}
              />
            </React.Fragment>
          ))}
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
