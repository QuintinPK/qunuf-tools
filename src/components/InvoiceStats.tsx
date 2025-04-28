
import React, { useMemo, useState } from 'react';
import { Invoice } from '@/types/invoice';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, LabelList, ReferenceLine 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChartContainer, ChartTooltip } from './ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { format } from 'date-fns';

interface InvoiceStatsProps {
  invoices: Invoice[];
}

const addressOrder = [
  'Watervillas 84-A',
  'Watervillas 84-B',
  'Kaya Kuarts 23'
];

const sortByCustomOrder = (a: any, b: any) => {
  const indexA = addressOrder.indexOf(a.address);
  const indexB = addressOrder.indexOf(b.address);
  
  if (indexA === -1 && indexB === -1) return 0;
  if (indexA === -1) return 1;
  if (indexB === -1) return -1;
  
  return indexA - indexB;
};

const InvoiceStats: React.FC<InvoiceStatsProps> = ({ invoices }) => {
  const [selectedAddress, setSelectedAddress] = useState<string>('all');
  
  const addresses = [...new Set(invoices.map(inv => inv.address))];
  
  const prepareMonthlyData = (utilityType: 'electricity' | 'water') => {
    const filteredInvoices = invoices
      .filter(inv => inv.utilityType === utilityType)
      .filter(inv => selectedAddress === 'all' || inv.address === selectedAddress);

    const monthlyData = new Map<string, { total: number, count: number }>();
    
    filteredInvoices.forEach(inv => {
      const monthKey = format(new Date(inv.invoiceDate), 'yyyy-MM');
      const current = monthlyData.get(monthKey) || { total: 0, count: 0 };
      monthlyData.set(monthKey, {
        total: current.total + inv.amount,
        count: current.count + 1
      });
    });

    return Array.from(monthlyData.entries())
      .map(([date, data]) => ({
        date,
        amount: data.total,
        average: data.total / data.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const electricityData = prepareMonthlyData('electricity');
  const waterData = prepareMonthlyData('water');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-sm">{format(new Date(label), 'MMMM yyyy')}</p>
          <p className="text-electricity-dark">
            <span className="font-medium">Total: </span>
            <span className="font-bold">${payload[0].value.toFixed(2)}</span>
          </p>
          {payload[1] && (
            <p className="text-electricity-dark">
              <span className="font-medium">Average: </span>
              <span className="font-bold">${payload[1].value.toFixed(2)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-8">
      <div className="w-full max-w-xs">
        <Select value={selectedAddress} onValueChange={setSelectedAddress}>
          <SelectTrigger>
            <SelectValue placeholder="Select address" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Addresses</SelectItem>
            {addresses.map(address => (
              <SelectItem key={address} value={address}>
                {address}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-gradient-to-br from-electricity-light to-white">
        <CardHeader>
          <CardTitle className="text-electricity-dark text-xl">Electricity Costs by Address</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={electricityData} 
              layout="vertical"
              margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `$${value}`} 
                domain={[0, 'dataMax + 50']}
              />
              <YAxis 
                type="category" 
                dataKey="address" 
                width={120}
                tick={{ fill: '#333', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                x={electricityData.reduce((acc, curr) => acc + curr.average, 0) / electricityData.length} 
                stroke="#FB8C00" 
                strokeDasharray="3 3" 
                label={{ value: "Overall Avg", position: "insideTopRight", fill: "#FB8C00" }} 
              />
              <Bar 
                dataKey="total" 
                fill="#FB8C00" 
                radius={[0, 4, 4, 0]}
                barSize={40}
              >
                {electricityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`rgba(251, 140, 0, ${0.5 + (index * 0.2)})`} />
                ))}
                <LabelList 
                  dataKey="average" 
                  position="center" 
                  formatter={(value: number) => `Avg: $${value.toFixed(2)}`}
                  style={{ fill: 'white', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-water-light to-white">
        <CardHeader>
          <CardTitle className="text-water-dark text-xl">Water Costs by Address</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={waterData} 
              layout="vertical"
              margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `$${value}`} 
                domain={[0, 'dataMax + 50']}
              />
              <YAxis 
                type="category" 
                dataKey="address" 
                width={120}
                tick={{ fill: '#333', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine 
                x={waterData.reduce((acc, curr) => acc + curr.average, 0) / waterData.length} 
                stroke="#1E88E5" 
                strokeDasharray="3 3" 
                label={{ value: "Overall Avg", position: "insideTopRight", fill: "#1E88E5" }} 
              />
              <Bar 
                dataKey="total" 
                fill="#1E88E5" 
                radius={[0, 4, 4, 0]}
                barSize={40}
              >
                {waterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`rgba(30, 136, 229, ${0.5 + (index * 0.2)})`} />
                ))}
                <LabelList 
                  dataKey="average" 
                  position="center" 
                  formatter={(value: number) => `Avg: $${value.toFixed(2)}`} 
                  style={{ fill: 'white', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-electricity-light to-white">
        <CardHeader>
          <CardTitle className="text-electricity-dark text-xl">Monthly Electricity Costs</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={electricityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM yyyy')}
              />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#FB8C00" 
                strokeWidth={2}
                dot={{ fill: '#FB8C00' }}
                name="Total"
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="#FFB74D" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#FFB74D' }}
                name="Average"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-water-light to-white">
        <CardHeader>
          <CardTitle className="text-water-dark text-xl">Monthly Water Costs</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={waterData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM yyyy')}
              />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#1E88E5" 
                strokeWidth={2}
                dot={{ fill: '#1E88E5' }}
                name="Total"
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="#64B5F6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#64B5F6' }}
                name="Average"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceStats;
