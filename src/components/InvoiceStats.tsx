
import React, { useMemo } from 'react';
import { Invoice } from '@/types/invoice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface InvoiceStatsProps {
  invoices: Invoice[];
}

const InvoiceStats: React.FC<InvoiceStatsProps> = ({ invoices }) => {
  const electricityData = useMemo(() => {
    const addressTotals = new Map<string, number>();
    invoices
      .filter(inv => inv.utilityType === 'electricity')
      .forEach(inv => {
        addressTotals.set(inv.address, (addressTotals.get(inv.address) || 0) + inv.amount);
      });
    return Array.from(addressTotals.entries()).map(([address, total]) => ({
      address,
      total
    }));
  }, [invoices]);

  const waterData = useMemo(() => {
    const addressTotals = new Map<string, number>();
    invoices
      .filter(inv => inv.utilityType === 'water')
      .forEach(inv => {
        addressTotals.set(inv.address, (addressTotals.get(inv.address) || 0) + inv.amount);
      });
    return Array.from(addressTotals.entries()).map(([address, total]) => ({
      address,
      total
    }));
  }, [invoices]);

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Electricity Costs by Address</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={electricityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="address" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#2563eb" name="Total Amount ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Water Costs by Address</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="address" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#0891b2" name="Total Amount ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceStats;
