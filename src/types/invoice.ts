
export type UtilityType = "water" | "electricity";

export interface Invoice {
  id: string;
  customerNumber: string;
  invoiceNumber: string;
  address: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  isPaid: boolean;
  utilityType: UtilityType;
  fileName: string;
  pdfBlob?: Blob;
}

export interface FilterOptions {
  address?: string;
  utilityType?: UtilityType | "all";
  paymentStatus?: "paid" | "unpaid" | "all";
}
