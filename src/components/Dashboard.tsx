
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types/invoice';
import InvoiceUploader from './InvoiceUploader';
import { fetchInvoices, saveInvoice } from '@/services/invoiceService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import InvoiceCard from './InvoiceCard';
import InvoiceFilter from './InvoiceFilter';
import { FilterOptions } from '@/types/invoice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoiceDetailsDialog from './InvoiceDetailsDialog';

const Dashboard = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<FilterOptions>({
    address: '',
    utilityType: 'all',
    paymentStatus: 'all'
  });
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const fetchedInvoices = await fetchInvoices();
      setInvoices(fetchedInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: 'Error loading invoices',
        description: 'Could not load invoices from the database',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleTogglePaid = (invoice: Invoice) => {
    const updatedInvoice = { ...invoice, isPaid: !invoice.isPaid };
    setInvoices(prev => prev.map(inv => inv.id === invoice.id ? updatedInvoice : inv));
    toast({
      title: updatedInvoice.isPaid ? "Invoice marked as paid" : "Invoice marked as unpaid",
      description: `Invoice ${invoice.invoiceNumber} has been updated`
    });
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
    toast({
      title: "Invoice deleted",
      description: `Invoice ${invoice.invoiceNumber} has been deleted`
    });
    setDialogOpen(false);
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filters.address && !invoice.address.toLowerCase().includes(filters.address.toLowerCase())) {
      return false;
    }
    
    if (filters.utilityType !== 'all' && invoice.utilityType !== filters.utilityType) {
      return false;
    }
    
    if (filters.paymentStatus === 'paid' && !invoice.isPaid) {
      return false;
    }
    
    if (filters.paymentStatus === 'unpaid' && invoice.isPaid) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-8">Invoice Processing Dashboard</h1>
      
      <div className="grid gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Upload New Invoice</h2>
          <InvoiceUploader onInvoiceProcessed={handleInvoiceProcessed} />
        </div>

        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Invoices</h2>
            <Tabs value={viewType} onValueChange={(value) => setViewType(value as 'list' | 'grid')} className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">List</TabsTrigger>
                <TabsTrigger value="grid">Grid</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <InvoiceFilter filters={filters} onFilterChange={handleFilterChange} />
          
          {loading ? (
            <div className="text-center py-8">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invoices found. Upload your first invoice to get started.
            </div>
          ) : (
            <>
              {viewType === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {filteredInvoices.map(invoice => (
                    <InvoiceCard 
                      key={invoice.id}
                      invoice={invoice}
                      onViewDetails={handleViewDetails}
                      onTogglePaid={handleTogglePaid}
                      onDelete={handleDeleteInvoice}
                    />
                  ))}
                </div>
              ) : (
                <Table className="mt-6">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map(invoice => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.address}</TableCell>
                        <TableCell>
                          <span className={invoice.utilityType === 'water' ? 'text-water' : 'text-electricity'}>
                            {invoice.utilityType === 'water' ? 'Water' : 'Electricity'}
                          </span>
                        </TableCell>
                        <TableCell>{invoice.invoiceDate}</TableCell>
                        <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={invoice.isPaid ? 'text-green-600' : 'text-amber-600'}>
                            {invoice.isPaid ? 'Paid' : 'Unpaid'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleViewDetails(invoice)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </div>
      </div>

      <InvoiceDetailsDialog 
        invoice={selectedInvoice}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onTogglePaid={handleTogglePaid}
      />
    </div>
  );
};

export default Dashboard;
