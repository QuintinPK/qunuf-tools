import * as pdfjs from 'pdfjs-dist';
import pdfjsWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.js';
import { Invoice, UtilityType } from "../types/invoice";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;

/**
 * Extracts text from a PDF file
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
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
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

/**
 * Extracts customer number from filename or text
 */
export const extractCustomerNumber = (fileName: string, text: string): string => {
  // First try to get from filename by removing extension
  const fileNameWithoutExt = fileName.replace(/\.pdf$/i, "");
  
  // If filename looks like a customer number, use it
  if (/^[A-Z0-9-]+$/i.test(fileNameWithoutExt)) {
    return fileNameWithoutExt;
  }
  
  // Otherwise try to find it in the text
  const patterns = [
    /klantnummer[:\s]+([A-Z0-9-]+)/i,
    /customer\s+number[:\s]+([A-Z0-9-]+)/i,
    /customer[:\s]+([A-Z0-9-]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return fileNameWithoutExt || "Unknown";
};

/**
 * Extracts invoice number from text
 */
export const extractInvoiceNumber = (text: string): string => {
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

  return "";
};

/**
 * Extracts address from text
 */
export const extractAddress = (text: string): string => {
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

  return addressLine?.trim() || "";
};

/**
 * Extracts invoice date from text and formats it
 */
export const extractInvoiceDate = (text: string): string => {
  const patterns = [
    /FACTUUR DATUM[:\s]+(\d{2})[\/-](\d{2})[\/-](\d{4})/i,
    /Invoice Date[:\s]+(\d{2})[\/-](\d{2})[\/-](\d{4})/i,
    /Datum[:\s]+(\d{2})[\/-](\d{2})[\/-](\d{4})/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[2] && match[3]) {
      // Format as YYYY-MM-DD for consistent database storage
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
  }
  
  return "";
};

/**
 * Extracts due date from text and formats it
 */
export const extractDueDate = (text: string): string => {
  const patterns = [
    /Verval Datum[:\s]+(\d{2})[\/-](\d{2})[\/-](\d{4})/i,
    /Due Date[:\s]+(\d{2})[\/-](\d{2})[\/-](\d{4})/i,
    /Betaal voor[:\s]+(\d{2})[\/-](\d{2})[\/-](\d{4})/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[2] && match[3]) {
      // Format as YYYY-MM-DD for consistent database storage
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
  }
  
  return "";
};

/**
 * Extracts total amount due from text
 */
export const extractAmount = (text: string): number => {
  const patterns = [
    /TE BETALEN[:\s]+[€£$]?\s*(\d+[.,]?\d*)/i,
    /TOTAL[:\s]+[€£$]?\s*(\d+[.,]?\d*)/i,
    /Totaal[:\s]+[€£$]?\s*(\d+[.,]?\d*)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return parseFloat(match[1].replace(',', '.'));
    }
  }

  return 0;
};

/**
 * Detects utility type based on keywords in the text
 */
export const detectUtilityType = (text: string): UtilityType => {
  if (text.toLowerCase().includes("m3") || text.toLowerCase().includes("water")) {
    return "water";
  } else if (text.toLowerCase().includes("kwh") || text.toLowerCase().includes("electricity")) {
    return "electricity";
  }
  return "water"; // Default to water if type cannot be determined
};

/**
 * Parses a PDF file to extract invoice information
 */
export const parsePDFInvoice = async (file: File): Promise<Partial<Invoice>> => {
  try {
    const text = await extractTextFromPDF(file);
    
    return {
      customerNumber: extractCustomerNumber(file.name, text),
      invoiceNumber: extractInvoiceNumber(text),
      address: extractAddress(text),
      invoiceDate: extractInvoiceDate(text),
      dueDate: extractDueDate(text),
      amount: extractAmount(text),
      utilityType: detectUtilityType(text),
      fileName: file.name,
      pdfBlob: file
    };
  } catch (error) {
    console.error("Error parsing PDF invoice:", error);
    throw error;
  }
};
