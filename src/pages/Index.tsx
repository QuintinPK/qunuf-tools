
import React from "react";
import Dashboard from "@/components/Dashboard";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto py-8 px-4'}`}>
      <Dashboard />
    </div>
  );
};

export default Index;
