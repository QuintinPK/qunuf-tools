
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MeterReadingForm = () => {
  const [selectedAddress, setSelectedAddress] = useState("");
  const [electricityReading, setElectricityReading] = useState("");
  const [waterReading, setWaterReading] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addresses')
        .select('address_label')
        .order('address_label');
      
      if (error) throw error;
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="address">Select Address</Label>
        <select
          id="address"
          value={selectedAddress}
          onChange={(e) => setSelectedAddress(e.target.value)}
          className="w-full mt-1 rounded-md border border-input bg-background px-3 h-10"
          required
        >
          <option value="">Select an address...</option>
          {addresses?.map((addr) => (
            <option key={addr.address} value={addr.address}>
              {addr.address}
            </option>
          ))}
        </select>
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
