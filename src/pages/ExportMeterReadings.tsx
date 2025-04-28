import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText } from "lucide-react";

const ExportMeterReadings = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from('meter_readings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert data to CSV
      const headers = ['Address', 'Electricity Reading', 'Water Reading', 'Date'];
      const csvData = data.map(reading => [
        reading.address,
        reading.electricity_reading || '',
        reading.water_reading || '',
        new Date(reading.created_at).toLocaleDateString()
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `meter-readings-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: "Your meter readings have been exported to CSV",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your meter readings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto py-8 px-4'}`}>
      <h1 className="text-3xl font-bold mb-6">Export Meter Readings</h1>
      <Card className="p-6">
        <div className="text-center">
          <p className="mb-6 text-muted-foreground">
            Download all your meter readings as a CSV file. The file will include address, electricity readings, water readings, and dates.
          </p>
          <Button onClick={handleExport} className="w-full md:w-auto">
            <FileText className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ExportMeterReadings;
