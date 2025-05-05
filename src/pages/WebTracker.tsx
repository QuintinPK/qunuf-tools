
import React from "react";
import Dashboard from "@/components/Dashboard";
import { useIsMobile } from "@/hooks/use-mobile";
import { AlertCircle } from "lucide-react";

const WebTracker = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto py-8 px-4'}`}>
      <h1 className="text-3xl font-bold mb-6">WEB Tracker</h1>
      <p className="text-muted-foreground mb-4">Track your Water & Electricity bills all in one place</p>
      
      <div className="flex items-center mb-4 p-2 bg-red-50 border border-red-200 rounded-md">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
        <p className="text-red-700 text-sm">
          <span className="font-semibold">Note:</span> Overdue invoices are highlighted in red
        </p>
      </div>
      
      <Dashboard />
    </div>
  );
};

export default WebTracker;
