
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, CheckCircle2, XCircle } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import { cn } from '@/lib/utils';

interface InvoiceDetailsDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTogglePaid: (invoice: Invoice) => void;
}

const InvoiceDetailsDialog: React.FC<InvoiceDetailsDialogProps> = ({
  invoice,
  open,
  onOpenChange,
  onTogglePaid,
}) => {
  if (!invoice) return null;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(invoice.amount);

  const handleDownload = () => {
    if (invoice.pdfBlob) {
      const url = URL.createObjectURL(invoice.pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = invoice.fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  const handleViewOriginal = () => {
    if (invoice.pdfBlob) {
      const url = URL.createObjectURL(invoice.pdfBlob);
      window.open(url, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Invoice Details</span>
            <Badge
              variant={invoice.isPaid ? "outline" : "default"}
              className={cn(
                invoice.isPaid ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
              )}
            >
              {invoice.isPaid ? "Paid" : "Unpaid"}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {invoice.utilityType === "water" ? "Water" : "Electricity"} invoice for {invoice.address}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-sm font-medium">Customer Number:</div>
          <div className="text-sm">{invoice.customerNumber}</div>
          
          <div className="text-sm font-medium">Invoice Number:</div>
          <div className="text-sm">{invoice.invoiceNumber}</div>
          
          <div className="text-sm font-medium">Invoice Date:</div>
          <div className="text-sm">{invoice.invoiceDate}</div>
          
          <div className="text-sm font-medium">Due Date:</div>
          <div className="text-sm">{invoice.dueDate}</div>
          
          <div className="text-sm font-medium">Amount Due:</div>
          <div className={cn(
            "text-sm font-bold",
            invoice.isPaid ? "line-through opacity-70" : ""
          )}>
            {formattedAmount}
          </div>
        </div>

        <Separator />

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleViewOriginal}>
            View Original PDF
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button
            onClick={() => invoice && onTogglePaid(invoice)}
            variant={invoice.isPaid ? "outline" : "default"}
            className={invoice.isPaid ? "bg-gray-100" : ""}
          >
            {invoice.isPaid ? (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Mark as Unpaid
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Paid
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetailsDialog;
