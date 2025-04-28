
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import AddressCheckboxes from "./AddressCheckboxes";

interface FormData {
  electricityReading?: number;
  waterReading?: number;
}

const MeterReadingForm = () => {
  const { toast } = useToast();
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  // Fetch unique addresses
  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addresses')
        .select('address')
        .order('address');
      
      if (error) throw error;
      return data.map(item => item.address);
    }
  });

  const onSubmit = async (data: FormData) => {
    if (selectedAddresses.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one address",
        variant: "destructive"
      });
      return;
    }

    try {
      const promises = selectedAddresses.map(address => 
        supabase
          .from('meter_readings')
          .insert([
            {
              address,
              electricity_reading: data.electricityReading,
              water_reading: data.waterReading,
            }
          ])
      );

      await Promise.all(promises);

      toast({
        title: "Success",
        description: "Meter readings recorded successfully",
      });

      reset();
      setSelectedAddresses([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record meter readings",
        variant: "destructive"
      });
    }
  };

  const handleAddressChange = (address: string) => {
    setSelectedAddresses(prev => {
      if (prev.includes(address)) {
        return prev.filter(a => a !== address);
      } else {
        return [...prev, address];
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <AddressCheckboxes 
        addresses={addresses}
        selectedAddresses={selectedAddresses}
        onAddressChange={handleAddressChange}
      />

      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="electricityReading" className="block text-sm font-medium mb-1">
              Electricity Reading
            </label>
            <Input
              id="electricityReading"
              type="number"
              step="0.01"
              {...register("electricityReading")}
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="waterReading" className="block text-sm font-medium mb-1">
              Water Reading
            </label>
            <Input
              id="waterReading"
              type="number"
              step="0.01"
              {...register("waterReading")}
              className="w-full"
            />
          </div>

          <Button type="submit" className="w-full">
            Submit Readings
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default MeterReadingForm;
