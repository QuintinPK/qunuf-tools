
import { Invoice, UtilityType } from "../types/invoice";
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.js';
import { supabase } from "@/integrations/supabase/client";

// Initialize PDF.js worker with ES modules compatible syntax
const initializeWorker = () => {
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;
};

// Initialize the worker right away
initializeWorker();

export const extractInvoiceData = async (file: File): Promise<Invoice> => {
  // Extract customer number from filename (without .pdf extension)
  const fileName = file.name;
  const customerNumberFromFileName = fileName.replace(/\.pdf$/i, "");
  
  try {
    // Convert file to ArrayBuffer for PDF.js
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    // Extract text content from all pages
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => 'str' in item ? item.str : '')
        .join(' ');
      fullText += pageText + ' ';
    }
    
    console.log("Extracted PDF text:", fullText);
    
    // Parse address (after "ADRES")
    const addressMatch = fullText.match(/ADRES[:\s]+([^\n]+)/i);
    const address = addressMatch ? addressMatch[1].trim() : "Unknown Address";
    
    // Parse invoice number (after "Factuurnummer:")
    const invoiceNumberMatch = fullText.match(/Factuurnummer:[:\s]+([^\n]+)/i);
    const invoiceNumber = invoiceNumberMatch 
      ? invoiceNumberMatch[1].trim() 
      : `INV-${Math.random().toString(36).substring(7)}`;
    
    // Parse due date (after "Verval Datum")
    const dueDateMatch = fullText.match(/Verval Datum[:\s]+(\d{2})\/(\d{2})\/(\d{4})/i);
    const dueDate = dueDateMatch 
      ? `${dueDateMatch[2]}/${dueDateMatch[1]}/${dueDateMatch[3]}` // Convert to DD/MM/YYYY
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Parse invoice date (after "FACTUUR DATUM")
    const invoiceDateMatch = fullText.match(/FACTUUR DATUM[:\s]+(\d{2})\/(\d{2})\/(\d{4})/i);
    const invoiceDate = invoiceDateMatch 
      ? `${invoiceDateMatch[2]}/${invoiceDateMatch[1]}/${invoiceDateMatch[3]}` // Convert to DD/MM/YYYY
      : new Date().toISOString().split('T')[0];
    
    // Parse amount (after "TE BETALEN")
    const amountMatch = fullText.match(/TE BETALEN[:\s]+(\d+\.?\d*)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    
    // Detect utility type based on content
    const utilityType: UtilityType = detectUtilityType(fullText);
    
    const invoice: Invoice = {
      id: Math.random().toString(36).substring(2, 15),
      customerNumber: customerNumberFromFileName,
      invoiceNumber,
      address,
      invoiceDate,
      dueDate,
      amount,
      isPaid: false,
      utilityType,
      fileName,
      pdfBlob: file
    };

    // Store invoice in Supabase
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
      console.error("Error storing invoice:", error);
      throw new Error(`Failed to store invoice: ${error.message}`);
    }

    return invoice;
  } catch (error) {
    console.error("Error extracting PDF data:", error);
    throw new Error(`Failed to extract data from PDF: ${error.message}`);
  }
};

export const detectUtilityType = (text: string): UtilityType => {
  if (text.toLowerCase().includes("m3") || text.toLowerCase().includes("water")) {
    return "water";
  } else if (text.toLowerCase().includes("kwh") || text.toLowerCase().includes("electricity")) {
    return "electricity";
  }
  return "water"; // Default to water if type cannot be determined
};
