
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string;
  isLoading?: boolean;
}

const StatsCard = ({ title, value, isLoading = false }: StatsCardProps) => {
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
      </CardContent>
    </Card>
  );
};

export default StatsCard;
