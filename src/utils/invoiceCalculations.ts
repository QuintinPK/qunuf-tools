
import { Invoice } from "@/types/invoice";

export const calculatePercentageDifference = (
  currentInvoice: Invoice,
  allInvoices: Invoice[]
): number | null => {
  // Filter previous invoices with same address and utility type
  const previousInvoices = allInvoices.filter(invoice => 
    invoice.address === currentInvoice.address &&
    invoice.utilityType === currentInvoice.utilityType &&
    new Date(invoice.invoiceDate) < new Date(currentInvoice.invoiceDate)
  );

  if (previousInvoices.length === 0) {
    return null;
  }

  // Calculate average of previous invoices
  const averageAmount = previousInvoices.reduce((sum, invoice) => 
    sum + invoice.amount, 0) / previousInvoices.length;

  // Calculate percentage difference
  const percentageDiff = ((currentInvoice.amount - averageAmount) / averageAmount) * 100;

  return percentageDiff;
};

