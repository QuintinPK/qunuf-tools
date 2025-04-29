// AddressCheckboxes.tsx (Alternative)
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface AddressCheckboxesProps {
  addresses: string[];
  selectedAddresses: string[];
  onAddressChange: (address: string) => void;
}

const AddressCheckboxes = ({ addresses, selectedAddresses, onAddressChange }: AddressCheckboxesProps) => {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold flex items-center mb-3">
        <MapPin className="mr-2" size={18} />
        Select Addresses
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {addresses.map((address) => {
          const isSelected = selectedAddresses.includes(address);
          return (
            <div
              key={address}
              className={`
                flex items-center space-x-3 p-3 rounded-lg
                border-2 transition-all
                ${isSelected ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-primary/50 hover:bg-primary/5'}
              `}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onAddressChange(address)}
                id={`address-${address}`}
                className="h-5 w-5"
              />
              <Label
                htmlFor={`address-${address}`}
                className="flex-1 cursor-pointer text-sm font-medium"
              >
                {address}
              </Label>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default AddressCheckboxes;
