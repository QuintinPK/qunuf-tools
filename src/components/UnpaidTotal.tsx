
import React from 'react';
import { Invoice, FilterOptions } from '@/types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface UnpaidTotalProps {
  invoices: Invoice[];
  filters: FilterOptions;
}

const UnpaidTotal: React.FC<UnpaidTotalProps> = ({ invoices, filters }) => {
  const unpaidTotal = invoices
    .filter(inv => {
      // Apply address filter if set
      if (filters.address && !inv.address.toLowerCase().includes(filters.address.toLowerCase())) {
        return false;
      }
      
      // Apply utility type filter if set
      if (filters.utilityType !== 'all' && inv.utilityType !== filters.utilityType) {
        return false;
      }
      
      // Only include unpaid invoices
      return !inv.isPaid;
    })
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <Card className="bg-amber-50">
      <CardHeader>
        <CardTitle className="text-amber-800">Total Unpaid Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-amber-900">
          ${unpaidTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </CardContent>
    </Card>
  );
};

export default UnpaidTotal;
