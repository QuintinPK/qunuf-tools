import { supabase } from "@/integrations/supabase/client";
import { Invoice, UtilityType } from "@/types/invoice";

/**
 * Saves an invoice to the database
 */
export const saveInvoice = async (invoice: Invoice): Promise<Invoice> => {
  const { error } = await supabase
    .from('invoices')
    .insert({
      customer_number: invoice.customerNumber,
      invoice_number: invoice.invoiceNumber,
      address: invoice.address,
      invoice_date: invoice.invoiceDate,
      due_date: invoice.dueDate,
      amount: invoice.amount,
      is_paid: invoice.isPaid,
      utility_type: invoice.utilityType,
      file_name: invoice.fileName
    });

  if (error) {
    console.error("Error saving invoice:", error);
    throw new Error(`Failed to save invoice: ${error.message}`);
  }

  return invoice;
};

/**
 * Fetches all invoices from the database
 */
export const fetchInvoices = async (): Promise<Invoice[]> => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*');

  if (error) {
    console.error("Error fetching invoices:", error);
    throw new Error(`Failed to fetch invoices: ${error.message}`);
  }

  return (data || []).map(item => ({
    id: item.id,
    customerNumber: item.customer_number,
    invoiceNumber: item.invoice_number,
    address: item.address,
    invoiceDate: item.invoice_date,
    dueDate: item.due_date,
    amount: item.amount,
    isPaid: item.is_paid || false,
    utilityType: item.utility_type as UtilityType || "water",
    fileName: item.file_name
  }));
};

/**
 * Updates an invoice in the database
 */
export const updateInvoice = async (invoice: Invoice): Promise<Invoice> => {
  const { error } = await supabase
    .from('invoices')
    .update({
      customer_number: invoice.customerNumber,
      invoice_number: invoice.invoiceNumber,
      address: invoice.address,
      invoice_date: invoice.invoiceDate,
      due_date: invoice.dueDate,
      amount: invoice.amount,
      is_paid: invoice.isPaid,
      payment_date: invoice.paymentDate,
      utility_type: invoice.utilityType,
      file_name: invoice.fileName
    })
    .eq('id', invoice.id);

  if (error) {
    console.error("Error updating invoice:", error);
    throw new Error(`Failed to update invoice: ${error.message}`);
  }

  return invoice;
};

/**
 * Deletes an invoice from the database
 */
export const deleteInvoice = async (invoiceId: string): Promise<void> => {
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId);

  if (error) {
    console.error("Error deleting invoice:", error);
    throw new Error(`Failed to delete invoice: ${error.message}`);
  }
};
