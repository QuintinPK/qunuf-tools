
import React, { useState } from "react";
import { format, parseISO, startOfWeek, endOfWeek, differenceInMinutes } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimeTrackerSession } from "@/types/time-tracker";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { formatDuration } from "@/utils/time-utils";

interface TimeTrackerStatsProps {
  sessions: TimeTrackerSession[];
  isLoading: boolean;
}

const CHART_COLORS = ["#1e88e5", "#fb8c00", "#43a047", "#e53935", "#5e35b1"];

const TimeTrackerStats: React.FC<TimeTrackerStatsProps> = ({ sessions, isLoading }) => {
  const [period, setPeriod] = useState<"week" | "month" | "all">("week");
  
  // Filter sessions based on selected period
  const filteredSessions = React.useMemo(() => {
    const now = new Date();
    
    switch (period) {
      case "week":
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        return sessions.filter(s => parseISO(s.start_time) >= weekStart);
      
      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return sessions.filter(s => parseISO(s.start_time) >= monthStart);
      
      default:
        return sessions;
    }
  }, [sessions, period]);

  // Calculate total minutes per category
  const categoryData = React.useMemo(() => {
    const data: Record<string, number> = {};
    
    filteredSessions.forEach(session => {
      if (!session.end_time) return;
      
      const category = session.category === "Other" && session.custom_category
        ? `${session.category}: ${session.custom_category}`
        : session.category;
      
      const minutes = differenceInMinutes(parseISO(session.end_time), parseISO(session.start_time));
      
      data[category] = (data[category] || 0) + minutes;
    });
    
    return Object.entries(data).map(([name, minutes]) => ({
      name,
      minutes,
      hours: +(minutes / 60).toFixed(1)
    }));
  }, [filteredSessions]);

  // Calculate daily totals
  const dailyData = React.useMemo(() => {
    const data: Record<string, number> = {};
    
    filteredSessions.forEach(session => {
      if (!session.end_time) return;
      
      const dateKey = format(parseISO(session.start_time), "yyyy-MM-dd");
      const minutes = differenceInMinutes(parseISO(session.end_time), parseISO(session.start_time));
      
      data[dateKey] = (data[dateKey] || 0) + minutes;
    });
    
    return Object.entries(data).map(([date, minutes]) => ({
      name: format(new Date(date), "MMM dd"),
      minutes,
      hours: +(minutes / 60).toFixed(1)
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredSessions]);

  // Calculate total time
  const totalTime = React.useMemo(() => {
    return filteredSessions.reduce((total, session) => {
      if (!session.end_time) return total;
      return total + differenceInMinutes(parseISO(session.end_time), parseISO(session.start_time));
    }, 0);
  }, [filteredSessions]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-2 border rounded shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{formatDuration(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Time Tracking Statistics</h3>
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {isLoading ? (
        <div className="py-10 text-center text-muted-foreground">Loading statistics...</div>
      ) : filteredSessions.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground">
          No data available for the selected period
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(totalTime)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredSessions.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Session Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredSessions.length > 0 
                    ? formatDuration(Math.round(totalTime / filteredSessions.length))
                    : "0h 0m"}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Time by Day</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => `${Math.floor(value / 60)}h`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="minutes" fill="#1e88e5" name="Time">
                      {dailyData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Time by Category</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="minutes"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      label={(entry) => entry.name}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={CHART_COLORS[index % CHART_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category, i) => (
                    <div key={category.name} className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <div className="flex-1">{category.name}</div>
                      <div className="font-medium">{formatDuration(category.minutes)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default TimeTrackerStats;
