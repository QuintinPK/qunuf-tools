import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types/invoice';
import InvoiceUploader from './InvoiceUploader';
import { fetchInvoices, saveInvoice, updateInvoice, deleteInvoice } from '@/services/invoiceService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import InvoiceCard from './InvoiceCard';
import InvoiceFilter from './InvoiceFilter';
import { FilterOptions } from '@/types/invoice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoiceDetailsDialog from './InvoiceDetailsDialog';
import InvoiceStats from './InvoiceStats';
import UnpaidTotal from './UnpaidTotal';
import PercentageDifference from './PercentageDifference';

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
  const [showUploader, setShowUploader] = useState(false);

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

  const handleTogglePaid = async (invoice: Invoice, paymentDate?: Date) => {
    try {
      const updatedInvoice = { 
        ...invoice, 
        isPaid: !invoice.isPaid,
        paymentDate: invoice.isPaid ? undefined : paymentDate ? paymentDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
      
      await updateInvoice(updatedInvoice);
      setInvoices(prev => prev.map(inv => inv.id === invoice.id ? updatedInvoice : inv));
      
      toast({
        title: updatedInvoice.isPaid ? "Invoice marked as paid" : "Invoice marked as unpaid",
        description: `Invoice ${invoice.invoiceNumber} has been updated`
      });
      
      return updatedInvoice;
    } catch (error) {
      console.error("Error updating invoice:", error);
      toast({
        title: "Error updating invoice",
        description: "There was an error updating the invoice payment status",
        variant: "destructive"
      });
      return invoice;
    }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    try {
      await deleteInvoice(invoice.id);
      setInvoices(prev => prev.filter(inv => inv.id !== invoice.id));
      toast({
        title: "Invoice deleted",
        description: `Invoice ${invoice.invoiceNumber} has been deleted`
      });
      setDialogOpen(false);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast({
        title: "Error deleting invoice",
        description: "There was an error deleting the invoice",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const filteredAndSortedInvoices = invoices
    .filter(invoice => {
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
    })
    .sort((a, b) => {
      const addressComparison = a.address.localeCompare(b.address);
      if (addressComparison !== 0) return addressComparison;
      
      return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
    });

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="grid gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upload New Invoice</h2>
            <Button 
              onClick={() => setShowUploader(!showUploader)}
              variant={showUploader ? "secondary" : "default"}
            >
              {showUploader ? "Cancel Upload" : "Upload PDF"}
            </Button>
          </div>
          {showUploader && (
            <InvoiceUploader onInvoiceProcessed={(invoice) => {
              handleInvoiceProcessed(invoice);
              setShowUploader(false);
            }} />
          )}
        </div>

        <Tabs defaultValue="invoices" className="mt-12">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-6">
            <div className="space-y-6">
              <UnpaidTotal invoices={invoices} filters={filters} />

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Your Invoices</h2>
                  <Tabs value={viewType} onValueChange={(value) => setViewType(value as 'list' | 'grid')} className="w-[200px]">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="list">List</TabsTrigger>
                      <TabsTrigger value="grid">Grid</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <InvoiceFilter 
                  filters={filters} 
                  onFilterChange={handleFilterChange}
                  invoices={invoices}
                />
                
                {loading ? (
                  <div className="text-center py-8">Loading invoices...</div>
                ) : filteredAndSortedInvoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No invoices found. Upload your first invoice to get started.
                  </div>
                ) : (
                  <>
                    {viewType === 'list' ? (
                      <Table className="mt-6">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Invoice Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>vs. Average</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAndSortedInvoices.map(invoice => (
                            <TableRow key={invoice.id}>
                              <TableCell>{invoice.invoiceNumber}</TableCell>
                              <TableCell>{invoice.address}</TableCell>
                              <TableCell>
                                <span className={invoice.utilityType === 'water' ? 'text-water' : 'text-electricity'}>
                                  {invoice.utilityType === 'water' ? 'Water' : 'Electricity'}
                                </span>
                              </TableCell>
                              <TableCell>{invoice.invoiceDate}</TableCell>
                              <TableCell>{invoice.dueDate}</TableCell>
                              <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                              <TableCell>
                                <PercentageDifference 
                                  currentInvoice={invoice} 
                                  allInvoices={invoices} 
                                />
                              </TableCell>
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
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                        {filteredAndSortedInvoices.map(invoice => (
                          <InvoiceCard 
                            key={invoice.id}
                            invoice={invoice}
                            onViewDetails={handleViewDetails}
                            onTogglePaid={handleTogglePaid}
                            onDelete={handleDeleteInvoice}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <InvoiceStats invoices={invoices} />
          </TabsContent>
        </Tabs>
      </div>

      <InvoiceDetailsDialog 
        invoice={selectedInvoice}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onTogglePaid={handleTogglePaid}
        onDelete={handleDeleteInvoice}
      />
    </div>
  );
};

export default Dashboard;
