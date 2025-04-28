import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import DateRangeFilter from "@/components/DateRangeFilter";
import StatsCard from "@/components/StatsCard";

const ViewMeterReadings = () => {
  const isMobile = useIsMobile();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const { data: readings, isLoading: isLoadingReadings } = useQuery({
    queryKey: ['meter-readings', startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from('meter_readings')
        .select('*')
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: electricityStats, isLoading: isLoadingElectricityStats } = useQuery({
    queryKey: ['electricity-stats', startDate, endDate],
    queryFn: async () => {
      interface ElectricityStatsResult {
        avg_consumption_per_day: number;
      }

      const { data, error } = await supabase
        .rpc<ElectricityStatsResult, {start_date: string, end_date: string}>('calculate_electricity_consumption_per_day', {
          start_date: startDate?.toISOString() || new Date(0).toISOString(),
          end_date: endDate?.toISOString() || new Date().toISOString()
        });
      
      if (error) throw error;
      return data ? data[0] : { avg_consumption_per_day: 0 };
    },
    enabled: Boolean(startDate || endDate)
  });

  const { data: waterStats, isLoading: isLoadingWaterStats } = useQuery({
    queryKey: ['water-stats', startDate, endDate],
    queryFn: async () => {
      interface WaterStatsResult {
        avg_consumption_per_day: number;
      }

      const { data, error } = await supabase
        .rpc<WaterStatsResult, {start_date: string, end_date: string}>('calculate_water_consumption_per_day', {
          start_date: startDate?.toISOString() || new Date(0).toISOString(),
          end_date: endDate?.toISOString() || new Date().toISOString()
        });
      
      if (error) throw error;
      return data ? data[0] : { avg_consumption_per_day: 0 };
    },
    enabled: Boolean(startDate || endDate)
  });

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

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <StatsCard
          title="Average Daily Electricity Consumption"
          value={electricityStats?.avg_consumption_per_day?.toFixed(2) || "0.00"}
          isLoading={isLoadingElectricityStats}
        />
        <StatsCard
          title="Average Daily Water Consumption"
          value={waterStats?.avg_consumption_per_day?.toFixed(2) || "0.00"}
          isLoading={isLoadingWaterStats}
        />
      </div>

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
