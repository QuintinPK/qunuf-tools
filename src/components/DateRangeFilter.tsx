
import React, { useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRangeFilterProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

const DateRangeFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange }: DateRangeFilterProps) => {
  // Refs for popover triggers
  const endDateTriggerRef = useRef<HTMLButtonElement>(null);
  
  // Handle start date change
  const handleStartDateChange = (date: Date | undefined) => {
    onStartDateChange(date);
    
    // After selecting start date, focus on end date selector
    if (date) {
      setTimeout(() => {
        endDateTriggerRef.current?.click();
      }, 100);
    }
  };

  // Quick selection options
  const handleQuickSelect = (option: string) => {
    const today = new Date();
    let start: Date | undefined;
    let end: Date | undefined = today;
    
    switch (option) {
      case "today":
        start = today;
        break;
      case "yesterday":
        start = new Date(today);
        start.setDate(today.getDate() - 1);
        end = new Date(start);
        break;
      case "last7days":
        start = new Date(today);
        start.setDate(today.getDate() - 6);
        break;
      case "last30days":
        start = new Date(today);
        start.setDate(today.getDate() - 29);
        break;
      case "thisMonth":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "lastMonth":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "clear":
        start = undefined;
        end = undefined;
        break;
      default:
        return;
    }
    
    onStartDateChange(start);
    onEndDateChange(end);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        <Select onValueChange={handleQuickSelect}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Quick select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="last7days">Last 7 days</SelectItem>
            <SelectItem value="last30days">Last 30 days</SelectItem>
            <SelectItem value="thisMonth">This month</SelectItem>
            <SelectItem value="lastMonth">Last month</SelectItem>
            <SelectItem value="clear">Clear dates</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-3 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[200px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Start date"}
                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateChange}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <span className="text-sm text-muted-foreground">to</span>

          <Popover>
            <PopoverTrigger asChild>
              <Button 
                ref={endDateTriggerRef}
                variant="outline" 
                className="min-w-[200px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "End date"}
                <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={onEndDateChange}
                initialFocus
                className="p-3 pointer-events-auto"
                disabled={(date) => startDate ? date < startDate : false}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {startDate && endDate && (
        <p className="text-sm text-muted-foreground">
          Showing data from {format(startDate, "PPP")} to {format(endDate, "PPP")}
        </p>
      )}
    </div>
  );
};

export default DateRangeFilter;
