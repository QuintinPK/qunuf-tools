
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import TimeTrackerDashboard from "@/components/time-tracker/TimeTrackerDashboard";

const TimeTracker = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto py-8 px-4'}`}>
      <h1 className="text-3xl font-bold mb-6">Time Tracker</h1>
      <p className="text-muted-foreground mb-8">Track time spent managing your Airbnbs</p>
      <TimeTrackerDashboard />
    </div>
  );
};

export default TimeTracker;
