
import { cn } from "@/lib/utils";
import { Invoice } from "@/types/invoice";
import { calculatePercentageDifference } from "@/utils/invoiceCalculations";

interface PercentageDifferenceProps {
  currentInvoice: Invoice;
  allInvoices: Invoice[];
}

const PercentageDifference: React.FC<PercentageDifferenceProps> = ({
  currentInvoice,
  allInvoices
}) => {
  const percentageDiff = calculatePercentageDifference(currentInvoice, allInvoices);

  if (percentageDiff === null) {
    return <span className="text-muted-foreground">n/a</span>;
  }

  const isPositive = percentageDiff > 0;
  const formattedPercentage = `${isPositive ? '+' : ''}${percentageDiff.toFixed(1)}%`;

  return (
    <span className={cn(
      "font-medium",
      isPositive ? "text-red-600" : "text-green-600"
    )}>
      {formattedPercentage}
    </span>
  );
};

export default PercentageDifference;

