
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";

interface DateRangeFilterProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

const DateRangeFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange }: DateRangeFilterProps) => {
  return (
    <div className="flex gap-4 items-center">
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[240px] justify-start text-left font-normal">
              <CalendarDays className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : "Pick start date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={onStartDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[240px] justify-start text-left font-normal">
              <CalendarDays className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : "Pick end date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={onEndDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DateRangeFilter;
