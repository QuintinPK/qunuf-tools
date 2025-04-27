
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types/invoice';
import InvoiceUploader from './InvoiceUploader';
import { saveInvoice } from '@/services/invoiceService';

const Dashboard = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const handleInvoiceProcessed = async (invoice: Invoice) => {
    try {
      const savedInvoice = await saveInvoice(invoice);
      setInvoices(prev => [savedInvoice, ...prev]);
      
      toast({
        title: "Invoice saved",
        description: `Invoice ${invoice.invoiceNumber} has been saved successfully`,
      });
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Error saving invoice",
        description: "There was an error saving the invoice to the database",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-8">Invoice Processing Dashboard</h1>
      
      <div className="grid gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Upload New Invoice</h2>
          <InvoiceUploader onInvoiceProcessed={handleInvoiceProcessed} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
