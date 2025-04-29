
import React from "react";
import Dashboard from "@/components/Dashboard";
import { useIsMobile } from "@/hooks/use-mobile";

const WebTracker = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto py-8 px-4'}`}>
      <h1 className="text-3xl font-bold mb-6">WEB Tracker</h1>
      <p className="text-muted-foreground mb-8">Track your Water & Electricity bills all in one place</p>
      <Dashboard />
    </div>
  );
};

export default WebTracker;
