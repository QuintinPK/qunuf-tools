
import React from 'react';
import { Invoice } from '@/types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface UnpaidTotalProps {
  invoices: Invoice[];
}

const UnpaidTotal: React.FC<UnpaidTotalProps> = ({ invoices }) => {
  const unpaidTotal = invoices
    .filter(inv => !inv.isPaid)
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
