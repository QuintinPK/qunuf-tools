
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

// Helper function to find the best match for an address in the text
const findAddress = (text: string): string => {
  // Common address patterns in invoices
  const patterns = [
    /ADRES[:\s]+([^\n]+)/i,
    /LEVERINGSADRES[:\s]+([^\n]+)/i,
    /FACTUUR ADRES[:\s]+([^\n]+)/i,
    /ADRESS?E?[:\s]+([^\n]+)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }

  // If no pattern matches, try to find a line that looks like an address
  const lines = text.split('\n');
  const addressLine = lines.find(line => 
    /\d+.*(?:street|straat|lane|weg|laan)/i.test(line) ||
    /(?:street|straat|lane|weg|laan).*\d+/i.test(line)
  );

  return addressLine?.trim() || "Address not found";
};

// Helper function to find invoice number
const findInvoiceNumber = (text: string): string => {
  const patterns = [
    /Factuurnummer[:\s]+([^\n]+)/i,
    /FACTUUR(?:\s+)?NR?(?:\.|:|\s)+([^\n]+)/i,
    /Invoice\s+number[:\s]+([^\n]+)/i,
    /FACTUUR\s+([A-Z0-9-]+)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }

  return `INV-${Math.random().toString(36).substring(7)}`;
};

// Helper function to parse dates
const parseDate = (dateStr: string): string => {
  try {
    const [day, month, year] = dateStr.split(/[\/.-]/).map(num => num.trim());
    return `${month}/${day}/${year}`; // Convert to MM/DD/YYYY format
  } catch (error) {
    console.error("Error parsing date:", dateStr);
    return new Date().toISOString().split('T')[0];
  }
};

export const extractInvoiceData = async (file: File): Promise<Invoice> => {
  const customerNumberFromFileName = file.name.replace(/\.pdf$/i, "");
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
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
    
    // Find address using our smart address detection
    const address = findAddress(fullText);
    
    // Find invoice number using multiple patterns
    const invoiceNumber = findInvoiceNumber(fullText);
    
    // Parse dates with better pattern matching
    const dueDateMatch = fullText.match(/Verval Datum[:\s]+(\d{2})[\/-](\d{2})[\/-](\d{4})/i) ||
                        fullText.match(/Due Date[:\s]+(\d{2})[\/-](\d{2})[\/-](\d{4})/i);
    const dueDate = dueDateMatch 
      ? parseDate(`${dueDateMatch[1]}/${dueDateMatch[2]}/${dueDateMatch[3]}`)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const invoiceDateMatch = fullText.match(/FACTUUR DATUM[:\s]+(\d{2})[\/-](\d{2})[\/-](\d{4})/i) ||
                            fullText.match(/Invoice Date[:\s]+(\d{2})[\/-](\d{2})[\/-](\d{4})/i);
    const invoiceDate = invoiceDateMatch 
      ? parseDate(`${invoiceDateMatch[1]}/${invoiceDateMatch[2]}/${invoiceDateMatch[3]}`)
      : new Date().toISOString().split('T')[0];
    
    // Parse amount with better pattern matching
    const amountMatch = fullText.match(/TE BETALEN[:\s]+(\d+[.,]?\d*)/i) ||
                       fullText.match(/TOTAL[:\s]+(\d+[.,]?\d*)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;
    
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
      fileName: file.name, // Fixed: use file.name instead of undefined fileName
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
