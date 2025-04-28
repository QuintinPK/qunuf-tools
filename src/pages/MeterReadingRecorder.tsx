
import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card } from "@/components/ui/card";
import MeterReadingForm from "@/components/MeterReadingForm";

const MeterReadingRecorder = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto py-8 px-4'}`}>
      <h1 className="text-3xl font-bold mb-6">Meter Reading Recorder</h1>
      <p className="text-muted-foreground mb-8">Quickly record your electricity and water meter readings</p>
      <Card className="p-4">
        <MeterReadingForm />
      </Card>
    </div>
  );
};

export default MeterReadingRecorder;
