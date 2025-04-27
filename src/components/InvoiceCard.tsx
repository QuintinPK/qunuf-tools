import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Download, Eye, Trash2 } from 'lucide-react';
import { Invoice, UtilityType } from '@/types/invoice';
import { cn } from '@/lib/utils';

interface InvoiceCardProps {
  invoice: Invoice;
  onViewDetails: (invoice: Invoice) => void;
  onTogglePaid: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}

const UtilityIcon: React.FC<{ type: UtilityType }> = ({ type }) => {
  if (type === "water") {
    return (
      <div className="h-8 w-8 rounded-full bg-water-light flex items-center justify-center text-water-dark">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v6"></path>
          <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path>
        </svg>
      </div>
    );
  } else {
    return (
      <div className="h-8 w-8 rounded-full bg-electricity-light flex items-center justify-center text-electricity-dark">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2 L3 14 h9 l-1 8 l10 -12 h-9 l1 -8z"></path>
        </svg>
      </div>
    );
  }
};

const InvoiceCard: React.FC<InvoiceCardProps> = ({ 
  invoice, 
  onViewDetails, 
  onTogglePaid,
  onDelete 
}) => {
  const { utilityType, address, invoiceNumber, invoiceDate, amount, isPaid } = invoice;
  
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      onDelete(invoice);
    }
  };

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      utilityType === "water" ? "border-l-4 border-l-water" : "border-l-4 border-l-electricity",
      isPaid ? "opacity-80" : ""
    )}>
      <CardHeader className="pb-3 flex flex-row justify-between items-start">
        <div className="flex items-center gap-2">
          <UtilityIcon type={utilityType} />
          <div>
            <CardTitle className="text-base font-medium">{address}</CardTitle>
            <p className="text-sm text-muted-foreground">#{invoiceNumber}</p>
          </div>
        </div>
        <Badge
          variant={isPaid ? "outline" : "default"}
          className={cn(
            isPaid ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-amber-100 text-amber-800 hover:bg-amber-100"
          )}
        >
          {isPaid ? "Paid" : "Unpaid"}
        </Badge>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-1 text-sm">
          <span className="text-muted-foreground">Invoice Date:</span>
          <span className="font-medium">{invoiceDate}</span>
          
          <span className="text-muted-foreground">Amount:</span>
          <span className={cn(
            "font-medium",
            isPaid ? "line-through text-muted-foreground" : "text-foreground"
          )}>
            {formattedAmount}
          </span>
        </div>
      </CardContent>
      <CardFooter className="pt-1 flex gap-2 justify-end border-t">
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs"
          onClick={() => onTogglePaid(invoice)}
        >
          {isPaid ? "Mark Unpaid" : "Mark Paid"}
          {isPaid && <Check className="h-3 w-3 ml-1" />}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-xs text-destructive hover:text-destructive-foreground hover:bg-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
        <Button 
          size="sm"
          onClick={() => onViewDetails(invoice)}
          className={cn(
            "text-xs",
            utilityType === "water" ? "bg-water hover:bg-water-dark" : "bg-electricity hover:bg-electricity-dark"
          )}
        >
          View Details
          <Eye className="h-3 w-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InvoiceCard;
