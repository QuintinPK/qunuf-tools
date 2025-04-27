
import { Invoice, UtilityType } from "../types/invoice";

export const extractInvoiceData = async (file: File): Promise<Invoice> => {
  // Generate a temporary URL for the file
  const fileUrl = URL.createObjectURL(file);
  
  // Extract customer number from filename (without .pdf extension)
  const fileName = file.name;
  const customerNumberFromFileName = fileName.replace(/\.pdf$/i, "");
  
  // In a real implementation, this would parse the PDF and extract these fields
  // For now, we'll simulate finding these specific fields
  const mockPdfContent = "ADRES: Kaya Grandi 15\nFactuurnummer: INV-2024-001\nVerval Datum: 04/15/2024\nFACTUUR DATUM: 03/30/2024\nTE BETALEN: 150.00";
  
  // Parse address (after "ADRES:")
  const addressMatch = mockPdfContent.match(/ADRES:\s*(.*?)(?:\n|$)/);
  const address = addressMatch ? addressMatch[1] : "Unknown Address";
  
  // Parse invoice number (after "Factuurnummer:")
  const invoiceNumberMatch = mockPdfContent.match(/Factuurnummer:\s*(.*?)(?:\n|$)/);
  const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : `INV-${Math.random().toString(36).substring(7)}`;
  
  // Parse due date (after "Verval Datum:")
  const dueDateMatch = mockPdfContent.match(/Verval Datum:\s*(\d{2})\/(\d{2})\/(\d{4})/);
  const dueDate = dueDateMatch 
    ? `${dueDateMatch[2]}/${dueDateMatch[1]}/${dueDateMatch[3]}` // Convert to DD/MM/YYYY
    : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Parse invoice date (after "FACTUUR DATUM:")
  const invoiceDateMatch = mockPdfContent.match(/FACTUUR DATUM:\s*(\d{2})\/(\d{2})\/(\d{4})/);
  const invoiceDate = invoiceDateMatch 
    ? `${invoiceDateMatch[2]}/${invoiceDateMatch[1]}/${invoiceDateMatch[3]}` // Convert to DD/MM/YYYY
    : new Date().toISOString().split('T')[0];
  
  // Parse amount (after "TE BETALEN:")
  const amountMatch = mockPdfContent.match(/TE BETALEN:\s*(\d+\.?\d*)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
  
  // Detect utility type
  const utilityType: UtilityType = detectUtilityType(mockPdfContent);
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
  
  return {
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
    pdfBlob: file,
  };
};

export const detectUtilityType = (text: string): UtilityType | null => {
  // In a real implementation, this would analyze the PDF text content
  if (text.includes("m3") || text.toLowerCase().includes("water")) {
    return "water";
  } else if (text.includes("kWh") || text.toLowerCase().includes("electricity")) {
    return "electricity";
  }
  return null;
};
