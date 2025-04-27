
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
    
    console.log("Extracted PDF text:", fullText);
    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
};

/**
 * AI-enhanced customer number extraction
 */
export const extractCustomerNumber = (fileName: string, text: string): string => {
  // First try to get from filename by removing extension
  const fileNameWithoutExt = fileName.replace(/\.pdf$/i, "");
  
  // If filename looks like a customer number, use it
  if (/^[A-Z0-9-]+$/i.test(fileNameWithoutExt)) {
    return fileNameWithoutExt;
  }
  
  // Multiple patterns to match customer numbers in various formats
  const patterns = [
    /klantnummer[:\s]+([A-Z0-9-]+)/i,
    /customer\s+number[:\s]+([A-Z0-9-]+)/i,
    /customer[:\s]+([A-Z0-9-]+)/i,
    /account\s+number[:\s]+([A-Z0-9-]+)/i,
    /account\s+#[:\s]*([A-Z0-9-]+)/i,
    /client\s+number[:\s]+([A-Z0-9-]+)/i,
    /reference\s+number[:\s]+([A-Z0-9-]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Try to find any alphanumeric string that looks like a customer ID
  const customerIdPatterns = [
    /\b([A-Z]{2,3}[0-9]{4,})\b/i,  // Like AB1234
    /\b([A-Z][0-9]{5,})\b/i,       // Like C12345
    /\b([0-9]{5,}[A-Z])\b/i,       // Like 12345C
  ];
  
  for (const pattern of customerIdPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return fileNameWithoutExt || "Unknown";
};

/**
 * AI-enhanced invoice number extraction
 */
export const extractInvoiceNumber = (text: string): string => {
  const patterns = [
    /Factuurnummer[:\s]+([^\n]+)/i,
    /FACTUUR(?:\s+)?NR?(?:\.|:|\s)+([^\n]+)/i,
    /Invoice\s+number[:\s]+([^\n]+)/i,
    /Invoice\s+#[:\s]*([^\n]+)/i,
    /FACTUUR\s+([A-Z0-9-]+)/i,
    /bill\s+number[:\s]+([^\n]+)/i,
    /invoice\s+reference[:\s]+([^\n]+)/i,
    /INV[:\s#-]+([A-Z0-9-]+)/i,
    /INVOICE[:\s#]+([A-Z0-9-\/]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }

  // Try to find invoice number based on common formats
  const formatPatterns = [
    /\b(INV-[A-Z0-9-]+)\b/i,
    /\b([A-Z]{2,}-[0-9]{4,})\b/i,
    /\b(F[A-Z0-9]{5,})\b/i,
  ];
  
  for (const pattern of formatPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return "";
};

/**
 * AI-enhanced address extraction with multiple detection strategies
 */
export const extractAddress = (text: string): string => {
  // Common labeled address patterns
  const labeledPatterns = [
    /ADRES[:\s]+([^\n]+\s[^\n]+)/i,
    /LEVERINGSADRES[:\s]+([^\n]+\s[^\n]+)/i,
    /FACTUUR ADRES[:\s]+([^\n]+\s[^\n]+)/i,
    /ADRESS?E?[:\s]+([^\n]+\s[^\n]+)/i,
    /delivery address[:\s]+([^\n]+\s[^\n]+)/i,
    /billing address[:\s]+([^\n]+\s[^\n]+)/i,
    /service address[:\s]+([^\n]+\s[^\n]+)/i,
    /property address[:\s]+([^\n]+\s[^\n]+)/i,
  ];

  for (const pattern of labeledPatterns) {
    const match = text.match(pattern);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }

  // If no pattern matches, try to find lines that look like addresses
  const lines = text.split('\n');
  
  // Find lines containing typical address components
  const addressIndicators = [
    /\d+\s+[A-Za-z\s]+\s+(street|st|avenue|ave|road|rd|lane|ln|drive|dr|boulevard|blvd|way|place|pl)/i,
    /\b[A-Za-z\s]+\s+\d+\b.*\b[A-Z]{2}\b.*\b\d{5}\b/i,  // City pattern with zip
    /\b\d{1,5}\s+[A-Za-z\s]+\b.*\b[A-Z]{2}\b/i,  // House number and street with state
  ];
  
  for (const line of lines) {
    for (const pattern of addressIndicators) {
      if (pattern.test(line)) {
        return line.trim();
      }
    }
  }
  
  // Try to find something that looks like a street address
  const streetPattern = /\d+\s+[A-Za-z\s.]+\s*,?\s*[A-Za-z\s]+/i;
  const streetMatch = text.match(streetPattern);
  if (streetMatch && streetMatch[0]) {
    return streetMatch[0].trim();
  }

  return "";
};

/**
 * AI-enhanced date extraction with improved format detection
 */
export const extractInvoiceDate = (text: string): string => {
  // Match common date patterns (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
  const datePatterns = [
    // Try to find dates with labels first
    /(?:FACTUUR DATUM|Invoice Date|Date|Datum)[:\s]+(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/i,
    /(?:FACTUUR DATUM|Invoice Date|Date|Datum)[:\s]+(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/i,
    /(?:FACTUUR DATUM|Invoice Date|Date|Datum)[:\s]+([A-Za-z]+)\s+(\d{1,2})[,\s]+(\d{4})/i, // Month DD, YYYY
    
    // Then general date formats without labels
    /\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})\b/,
    /\b(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})\b/,
    /\b([A-Za-z]+)\s+(\d{1,2})[,\s]+(\d{4})\b/, // Month DD, YYYY
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Check if this is YYYY-MM-DD format
      if (match[1].length === 4) {
        // It's already in YYYY-MM-DD
        return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
      }
      
      // Check if it's a month name
      if (isNaN(parseInt(match[1]))) {
        const monthNames = ["january", "february", "march", "april", "may", "june", "july", 
                          "august", "september", "october", "november", "december"];
        const monthIndex = monthNames.findIndex(m => 
          m.toLowerCase().startsWith(match[1].toLowerCase().substring(0, 3))
        );
        if (monthIndex !== -1) {
          return `${match[3]}-${(monthIndex + 1).toString().padStart(2, '0')}-${match[2].padStart(2, '0')}`;
        }
      }
      
      // Assume DD/MM/YYYY format and convert to YYYY-MM-DD
      return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
    }
  }
  
  return "";
};

/**
 * AI-enhanced due date extraction
 */
export const extractDueDate = (text: string): string => {
  const datePatterns = [
    // Try to find dates with labels first
    /(?:Verval Datum|Due Date|Betaal voor|Payment due|Pay by)[:\s]+(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/i,
    /(?:Verval Datum|Due Date|Betaal voor|Payment due|Pay by)[:\s]+(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/i,
    /(?:Verval Datum|Due Date|Betaal voor|Payment due|Pay by)[:\s]+([A-Za-z]+)\s+(\d{1,2})[,\s]+(\d{4})/i,
    
    // Try to find sentences mentioning payment due dates
    /(?:payment is due|pay before|pay by)[:\s]+(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/i,
    /(?:payment is due|pay before|pay by)[:\s]+([A-Za-z]+)\s+(\d{1,2})[,\s]+(\d{4})/i,
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Check if this is YYYY-MM-DD format
      if (match[1].length === 4) {
        // It's already in YYYY-MM-DD
        return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
      }
      
      // Check if it's a month name
      if (isNaN(parseInt(match[1]))) {
        const monthNames = ["january", "february", "march", "april", "may", "june", "july", 
                          "august", "september", "october", "november", "december"];
        const monthIndex = monthNames.findIndex(m => 
          m.toLowerCase().startsWith(match[1].toLowerCase().substring(0, 3))
        );
        if (monthIndex !== -1) {
          return `${match[3]}-${(monthIndex + 1).toString().padStart(2, '0')}-${match[2].padStart(2, '0')}`;
        }
      }
      
      // Assume DD/MM/YYYY format and convert to YYYY-MM-DD
      return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
    }
  }
  
  return "";
};

/**
 * AI-enhanced amount extraction with currency detection
 */
export const extractAmount = (text: string): number => {
  // Look for patterns with common keywords for total amount
  const amountPatterns = [
    /(?:TE BETALEN|TOTAL|Totaal|Amount due|Total Amount|Total Due|Pay this amount)[:\s]+[€£$]?\s*(\d+[.,]?\d*)/i,
    /(?:TOTAL|Totaal|Amount due|Total Amount|Total Due|Pay this amount|Total invoice|To pay)[:\s]+[€£$]?\s*(\d+[.,]?\d*)/i,
    /(?:Total:)[:\s]+[€£$]?\s*(\d+[.,]?\d*)/i,
    /[€£$]?\s*(\d+[.,]?\d*)[:\s]+(?:total)/i,
    /Amount[:\s]+[€£$]?\s*(\d+[.,]?\d*)/i,
    /[€£$]\s*(\d+[.,]?\d*)/i,  // Just look for currency symbols
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Replace comma with dot for proper float parsing
      return parseFloat(match[1].replace(',', '.'));
    }
  }

  // Try to find the largest number near keywords related to payment
  const lines = text.split('\n');
  const paymentLines = lines.filter(line => 
    /(?:total|amount|due|pay|betalen|payment)/i.test(line)
  );
  
  let largestAmount = 0;
  for (const line of paymentLines) {
    const numbers = line.match(/\d+[.,]?\d*/g);
    if (numbers) {
      for (const num of numbers) {
        const amount = parseFloat(num.replace(',', '.'));
        if (amount > largestAmount) {
          largestAmount = amount;
        }
      }
    }
  }
  
  if (largestAmount > 0) {
    return largestAmount;
  }

  return 0;
};

/**
 * AI-enhanced utility type detection
 */
export const detectUtilityType = (text: string): UtilityType => {
  // Look for water-related keywords
  const waterKeywords = ['water', 'm3', 'cubic meter', 'tap water', 'drinking water', 'water utility', 'water bill', 'water supply'];
  
  // Look for electricity-related keywords
  const electricityKeywords = ['electricity', 'kwh', 'kilowatt', 'power', 'electric', 'energy', 'electric bill', 'power supply'];
  
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Count occurrences of water keywords
  const waterCount = waterKeywords.reduce((count, keyword) => {
    return count + (lowerText.includes(keyword.toLowerCase()) ? 1 : 0);
  }, 0);
  
  // Count occurrences of electricity keywords
  const electricityCount = electricityKeywords.reduce((count, keyword) => {
    return count + (lowerText.includes(keyword.toLowerCase()) ? 1 : 0);
  }, 0);
  
  // Choose the type with more keyword matches
  if (electricityCount > waterCount) {
    return "electricity";
  }
  
  // Default to water if undetermined or tied
  return "water";
};

/**
 * Parses a PDF file to extract invoice information with AI-enhanced methods
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
