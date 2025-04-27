
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FilterOptions } from '@/types/invoice';

interface InvoiceFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const InvoiceFilter: React.FC<InvoiceFilterProps> = ({ filters, onFilterChange }) => {
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      address: e.target.value,
    });
  };

  const handleUtilityTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      utilityType: value as FilterOptions['utilityType'],
    });
  };

  const handlePaymentStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      paymentStatus: value as FilterOptions['paymentStatus'],
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Filter Invoices</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address-filter">Property Address</Label>
          <Input
            id="address-filter"
            placeholder="Search address..."
            value={filters.address || ''}
            onChange={handleAddressChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="utility-filter">Utility Type</Label>
          <Select
            value={filters.utilityType || 'all'}
            onValueChange={handleUtilityTypeChange}
          >
            <SelectTrigger id="utility-filter">
              <SelectValue placeholder="All Utilities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Utilities</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="electricity">Electricity</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="payment-filter">Payment Status</Label>
          <Select
            value={filters.paymentStatus || 'all'}
            onValueChange={handlePaymentStatusChange}
          >
            <SelectTrigger id="payment-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilter;
