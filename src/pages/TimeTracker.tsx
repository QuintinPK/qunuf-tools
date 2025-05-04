
import React, { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import TimeTrackerDashboard from "@/components/time-tracker/TimeTrackerDashboard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TimeTracker = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  useEffect(() => {
    const activeSession = localStorage.getItem("activeTimeTrackerSession");
    if (activeSession) {
      const sessionData = JSON.parse(activeSession);
      
      // Display a toast notification about the active session
      toast({
        title: "Tracking Resumed",
        description: `Time tracking for "${sessionData.category}" has been resumed.`,
      });
    }
    
    // Set up real-time subscription to time tracking sessions
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_tracking_sessions'
        },
        (payload) => {
          console.log('Change received!', payload);
          // The TimeTrackerDashboard component will handle refreshing the data
        }
      )
      .subscribe();
      
    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);
  
  return (
    <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto py-8 px-4'}`}>
      <h1 className="text-3xl font-bold mb-6">Time Tracker</h1>
      <p className="text-muted-foreground mb-8">Track time spent managing your Airbnbs</p>
      <TimeTrackerDashboard />
    </div>
  );
};

export default TimeTracker;
