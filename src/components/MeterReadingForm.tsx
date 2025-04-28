
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MeterReadingForm = () => {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [electricityReading, setElectricityReading] = useState("");
  const [waterReading, setWaterReading] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: addresses, isLoading: isLoadingAddresses, error: addressesError } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addresses')
        .select('address')
        .order('address');
      
      if (error) {
        console.error("Error fetching addresses:", error);
        throw error;
      }
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('meter_readings')
        .insert({
          address: selectedAddress,
          electricity_reading: electricityReading ? parseFloat(electricityReading) : null,
          water_reading: waterReading ? parseFloat(waterReading) : null,
        });

      if (error) throw error;

      toast.success("Readings saved successfully");
      setElectricityReading("");
      setWaterReading("");
    } catch (error) {
      console.error("Error saving readings:", error);
      toast.error("Failed to save readings");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (addressesError) {
    return <div className="text-red-500">Error loading addresses. Please try again later.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="address">Select Address</Label>
        <Select value={selectedAddress} onValueChange={setSelectedAddress}>
          <SelectTrigger id="address" className="w-full mt-1">
            <SelectValue placeholder="Select an address..." />
          </SelectTrigger>
          <SelectContent>
            {isLoadingAddresses ? (
              <SelectItem value="loading" disabled>Loading addresses...</SelectItem>
            ) : addresses?.map((addr) => (
              <SelectItem key={addr.address} value={addr.address}>
                {addr.address}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="electricity">Electricity Reading</Label>
        <Input
          id="electricity"
          type="number"
          step="0.01"
          value={electricityReading}
          onChange={(e) => setElectricityReading(e.target.value)}
          className="mt-1"
          placeholder="Enter electricity reading"
          inputMode="decimal"
        />
      </div>

      <div>
        <Label htmlFor="water">Water Reading</Label>
        <Input
          id="water"
          type="number"
          step="0.01"
          value={waterReading}
          onChange={(e) => setWaterReading(e.target.value)}
          className="mt-1"
          placeholder="Enter water reading"
          inputMode="decimal"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Readings"}
      </Button>
    </form>
  );
};

export default MeterReadingForm;
