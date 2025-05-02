import React, { useState } from "react";
import { format, parseISO, startOfMonth, endOfMonth, differenceInMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TimeTrackerSession } from "@/types/time-tracker";
import { Download } from "lucide-react";

interface TimeTrackerExportProps {
  sessions: TimeTrackerSession[];
  isLoading: boolean;
}

// Add type definition for Microsoft's msSaveBlob
interface MSNavigator extends Navigator {
  msSaveBlob?: (blob: Blob, defaultName: string) => boolean;
}

const TimeTrackerExport: React.FC<TimeTrackerExportProps> = ({ sessions, isLoading }) => {
  const [exportType, setExportType] = useState<"all" | "month" | "custom">("all");
  const [exportMonth, setExportMonth] = useState<string>(format(new Date(), "yyyy-MM"));

  const getFilteredSessions = () => {
    switch (exportType) {
      case "month":
        const [year, month] = exportMonth.split("-").map(Number);
        const monthStart = startOfMonth(new Date(year, month - 1));
        const monthEnd = endOfMonth(new Date(year, month - 1));
        return sessions.filter(s => {
          const date = parseISO(s.start_time);
          return date >= monthStart && date <= monthEnd;
        });
      default:
        return sessions;
    }
  };

  const handleExport = () => {
    const filteredSessions = getFilteredSessions();
    
    if (filteredSessions.length === 0) {
      alert("No data to export for the selected period");
      return;
    }
    
    // Create CSV content
    let csvContent = "Date,Start Time,End Time,Duration (minutes),Category,Custom Category,Notes\n";
    
    filteredSessions.forEach(session => {
      const startDate = parseISO(session.start_time);
      const endDate = session.end_time ? parseISO(session.end_time) : null;
      const duration = endDate ? differenceInMinutes(endDate, startDate) : '';
      
      const row = [
        format(startDate, "yyyy-MM-dd"),
        format(startDate, "HH:mm:ss"),
        endDate ? format(endDate, "HH:mm:ss") : '',
        duration,
        session.category,
        session.custom_category || '',
        session.notes ? `"${session.notes.replace(/"/g, '""')}"` : ''
      ];
      
      csvContent += row.join(",") + "\n";
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    const fileName = exportType === "month" 
      ? `time-tracking-${exportMonth}.csv` 
      : "time-tracking-export.csv";
    
    // Cast the navigator to our extended MSNavigator type
    const msNavigator = navigator as MSNavigator;
    
    if (msNavigator.msSaveBlob) {
      // IE 10+
      msNavigator.msSaveBlob(blob, fileName);
    } else {
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Time Tracking Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <RadioGroup value={exportType} onValueChange={(value: "all" | "month" | "custom") => setExportType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All sessions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="month" id="month" />
                <Label htmlFor="month">Specific month</Label>
              </div>
            </RadioGroup>
          </div>
          
          {exportType === "month" && (
            <div className="space-y-2">
              <Label htmlFor="exportMonth">Select Month</Label>
              <input
                id="exportMonth"
                type="month"
                value={exportMonth}
                onChange={(e) => setExportMonth(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}
          
          <Button 
            onClick={handleExport} 
            disabled={isLoading || sessions.length === 0}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackerExport;
