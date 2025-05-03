
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  isLoading?: boolean;
  subtitle?: string;
  additionalInfo?: string; // Adding this new property for the date range cost
}

const StatsCard = ({ title, value, isLoading = false, subtitle, additionalInfo }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? (
            <div className="h-8 w-24 animate-pulse bg-muted rounded" />
          ) : (
            value
          )}
        </div>
        {additionalInfo && (
          <p className="text-xs text-muted-foreground mt-1">
            {additionalInfo}
          </p>
        )}
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;
