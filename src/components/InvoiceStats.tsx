
import React, { useMemo } from 'react';
import { Invoice } from '@/types/invoice';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface InvoiceStatsProps {
  invoices: Invoice[];
}

// Custom sort order for addresses
const addressOrder = [
  'Watervillas 84-A',
  'Watervillas 84-B',
  'Kaya Kuarts 23'
];

// Custom sort function
const sortByCustomOrder = (a: any, b: any) => {
  const indexA = addressOrder.indexOf(a.address);
  const indexB = addressOrder.indexOf(b.address);
  
  if (indexA === -1 && indexB === -1) return 0;
  if (indexA === -1) return 1;
  if (indexB === -1) return -1;
  
  return indexA - indexB;
};

const InvoiceStats: React.FC<InvoiceStatsProps> = ({ invoices }) => {
  const electricityData = useMemo(() => {
    const addressTotals = new Map<string, { total: number, count: number }>();
    
    invoices
      .filter(inv => inv.utilityType === 'electricity')
      .forEach(inv => {
        const current = addressTotals.get(inv.address) || { total: 0, count: 0 };
        addressTotals.set(inv.address, { 
          total: current.total + inv.amount, 
          count: current.count + 1 
        });
      });
    
    return Array.from(addressTotals.entries())
      .map(([address, data]) => ({
        address,
        total: data.total,
        average: data.total / data.count
      }))
      .sort(sortByCustomOrder);
  }, [invoices]);

  const waterData = useMemo(() => {
    const addressTotals = new Map<string, { total: number, count: number }>();
    
    invoices
      .filter(inv => inv.utilityType === 'water')
      .forEach(inv => {
        const current = addressTotals.get(inv.address) || { total: 0, count: 0 };
        addressTotals.set(inv.address, { 
          total: current.total + inv.amount, 
          count: current.count + 1 
        });
      });
    
    return Array.from(addressTotals.entries())
      .map(([address, data]) => ({
        address,
        total: data.total,
        average: data.total / data.count
      }))
      .sort(sortByCustomOrder);
  }, [invoices]);

  // Custom tooltip formatter to display the average
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
          <p className="font-bold text-sm">{label}</p>
          <p className="text-electricity-dark">
            <span className="font-medium">Total: </span>
            <span className="font-bold">${payload[0].value.toFixed(2)}</span>
          </p>
          <p className="text-electricity-dark">
            <span className="font-medium">Avg: </span>
            <span className="font-bold">${payload[0].payload.average.toFixed(2)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-8">
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
    </div>
  );
};

export default InvoiceStats;
