// MeterReadingForm.tsx
import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddressCheckboxes from "./AddressCheckboxes";

interface FormData {
  electricityReading?: number;
  waterReading?: number;
}

const MeterReadingForm = () => {
  const { toast } = useToast();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null); // Changed to single string or null
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  // Fetch unique addresses
  const { data: addresses = [], isLoading } = useQuery({
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
    if (!selectedAddress) {
      toast({
        title: "Error",
        description: "Please select an address",
        variant: "destructive"
      });
      return;
    }

    try {
      // Insert a single meter reading for the selected address
      await supabase
        .from('meter_readings')
        .insert([
          {
            address: selectedAddress,
            electricity_reading: data.electricityReading,
            water_reading: data.waterReading,
          }
        ]);

      toast({
        title: "Success",
        description: "Meter reading recorded successfully",
      });

      reset();
      setSelectedAddress(null); // Clear selection after submission
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record meter reading",
        variant: "destructive"
      });
    }
  };

  // Memoized handler for toggling address selection
  const handleAddressChange = useCallback((address: string | null) => {
    console.log('Setting address:', address); // Debug to ensure correct behavior
    setSelectedAddress(address); // Set the new address or clear selection
  }, []); // Empty deps since setSelectedAddress is stable

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isLoading ? (
        <div className="py-4 text-center">Loading addresses...</div>
      ) : (
        <AddressCheckboxes 
          addresses={addresses}
          selectedAddress={selectedAddress} // Changed prop name
          onAddressChange={handleAddressChange}
        />
      )}

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
            Submit Reading
          </Button>
        </div>
      </Card>
    </form>
  );
};

export default MeterReadingForm;
