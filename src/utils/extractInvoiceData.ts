
import { Invoice, UtilityType } from "../types/invoice";

// This is a mock implementation that simulates extracting data from a PDF
// In a real application, you would need to use a PDF parsing library
export const extractInvoiceData = async (file: File): Promise<Invoice> => {
  // Generate a temporary URL for the file to simulate viewing it
  const fileUrl = URL.createObjectURL(file);
  
  // Extract file name without extension to use as customer number by default
  const fileName = file.name;
  const customerNumberFromFileName = fileName.replace(/\.pdf$/i, "");
  
  // Simulate random data to represent extracted data from the PDF
  const utilityType: UtilityType = Math.random() > 0.5 ? "water" : "electricity";
  
  // Generate random addresses
  const addresses = [
    "Kaya Watervillas 84-A",
    "Kaya Rincon 22",
    "Kaya Grandi 15",
    "Playa 102-B",
    "Kaya Den Haag 30"
  ];
  
  // Randomize invoice date within the last year
  const today = new Date();
  const randomDaysAgo = Math.floor(Math.random() * 365);
  const invoiceDate = new Date(today);
  invoiceDate.setDate(today.getDate() - randomDaysAgo);
  
  // Due date is 14 days after invoice date
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(invoiceDate.getDate() + 14);
  
  // Generate a random invoice number
  const invoiceNumber = `INV-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;
  
  // Random amount between $10 and $300
  const amount = Math.floor(Math.random() * 29000 + 1000) / 100;

  // Simulate a delay to mimic processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    id: Math.random().toString(36).substring(2, 15),
    customerNumber: customerNumberFromFileName,
    invoiceNumber,
    address: addresses[Math.floor(Math.random() * addresses.length)],
    invoiceDate: invoiceDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
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
