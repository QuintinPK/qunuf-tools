
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import FileUploader from './FileUploader';
import InvoiceCard from './InvoiceCard';
import InvoiceDetailsDialog from './InvoiceDetailsDialog';
import InvoiceFilter from './InvoiceFilter';
import { Invoice, FilterOptions } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    utilityType: 'all',
    paymentStatus: 'all',
  });
  const { toast } = useToast();
  
  // Apply filters whenever filters or invoices change
  useEffect(() => {
    let filtered = [...invoices];
    
    if (filters.address) {
      filtered = filtered.filter(inv => 
        inv.address.toLowerCase().includes(filters.address!.toLowerCase())
      );
    }
    
    if (filters.utilityType && filters.utilityType !== 'all') {
      filtered = filtered.filter(inv => inv.utilityType === filters.utilityType);
    }
    
    if (filters.paymentStatus && filters.paymentStatus !== 'all') {
      filtered = filtered.filter(inv => 
        (filters.paymentStatus === 'paid' ? inv.isPaid : !inv.isPaid)
      );
    }
    
    setFilteredInvoices(filtered);
  }, [invoices, filters]);
  
  const handleFileProcessed = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
  };
  
  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsOpen(true);
  };
  
  const handleTogglePaid = (invoice: Invoice) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoice.id ? { ...inv, isPaid: !inv.isPaid } : inv
    ));
    
    if (selectedInvoice && selectedInvoice.id === invoice.id) {
      setSelectedInvoice({ ...selectedInvoice, isPaid: !selectedInvoice.isPaid });
    }
    
    toast({
      title: invoice.isPaid ? "Marked as Unpaid" : "Marked as Paid",
      description: `Invoice #${invoice.invoiceNumber} for ${invoice.address}`,
    });
  };
  
  const waterInvoices = filteredInvoices.filter(inv => inv.utilityType === 'water');
  const electricityInvoices = filteredInvoices.filter(inv => inv.utilityType === 'electricity');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Utility Bill Manager</h1>
        <p className="text-muted-foreground">
          Upload and manage your water and electricity invoices
        </p>
      </div>
      
      <Separator />
      
      <FileUploader onFileProcessed={handleFileProcessed} />
      
      <Separator />
      
      <InvoiceFilter filters={filters} onFilterChange={setFilters} />
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Invoices ({filteredInvoices.length})</TabsTrigger>
          <TabsTrigger value="water">Water ({waterInvoices.length})</TabsTrigger>
          <TabsTrigger value="electricity">Electricity ({electricityInvoices.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No invoices found. Upload your first invoice to get started.
            </p>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInvoices.map(invoice => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onViewDetails={handleViewDetails}
                    onTogglePaid={handleTogglePaid}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
        
        <TabsContent value="water" className="space-y-4">
          {waterInvoices.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No water invoices found with the current filters.
            </p>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {waterInvoices.map(invoice => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onViewDetails={handleViewDetails}
                    onTogglePaid={handleTogglePaid}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
        
        <TabsContent value="electricity" className="space-y-4">
          {electricityInvoices.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No electricity invoices found with the current filters.
            </p>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {electricityInvoices.map(invoice => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onViewDetails={handleViewDetails}
                    onTogglePaid={handleTogglePaid}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
      
      <InvoiceDetailsDialog
        invoice={selectedInvoice}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onTogglePaid={handleTogglePaid}
      />
    </div>
  );
};

export default Dashboard;
