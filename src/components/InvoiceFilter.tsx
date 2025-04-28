
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FilterOptions } from '@/types/invoice';
import { useIsMobile } from '@/hooks/use-mobile';

interface InvoiceFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  invoices: any[]; // We'll use this to extract unique addresses
}

const InvoiceFilter: React.FC<InvoiceFilterProps> = ({ filters, onFilterChange, invoices }) => {
  const isMobile = useIsMobile();
  
  // Extract unique addresses from invoices
  const uniqueAddresses = React.useMemo(() => {
    const addresses = new Set<string>();
    addresses.add('all'); // Add the "all" option
    
    if (invoices && invoices.length) {
      invoices.forEach(invoice => {
        if (invoice.address) {
          addresses.add(invoice.address);
        }
      });
    }
    
    return Array.from(addresses);
  }, [invoices]);

  const handleAddressChange = (value: string) => {
    onFilterChange({
      ...filters,
      address: value === 'all' ? '' : value,
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
      
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-4'}`}>
        <div className="space-y-2">
          <Label htmlFor="address-filter">Property Address</Label>
          <Select
            value={filters.address || 'all'}
            onValueChange={handleAddressChange}
          >
            <SelectTrigger id="address-filter">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {uniqueAddresses.filter(addr => addr !== 'all').map(address => (
                <SelectItem key={address} value={address}>{address}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
