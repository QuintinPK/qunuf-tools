
interface AddressMapping {
  customerNumber: string;
  address: string;
  utilityType: "water" | "electricity";
}

const addressMappings: AddressMapping[] = [
  { customerNumber: "031650", address: "KAYA WATERVILLAS 84-A", utilityType: "electricity" },
  { customerNumber: "913531", address: "KAYA WATERVILLAS 84-A", utilityType: "water" },
  { customerNumber: "031561", address: "KAYA WATERVILLAS 84-B", utilityType: "electricity" },
  { customerNumber: "913646", address: "KAYA WATERVILLAS 84-B", utilityType: "water" },
  { customerNumber: "022379", address: "KAYA KUARTS 23", utilityType: "electricity" },
  { customerNumber: "903340", address: "KAYA KUARTS 23", utilityType: "water" }
];

export const getAddressFromCustomerNumber = (customerNumber: string): { address: string; utilityType: "water" | "electricity" } | null => {
  const mapping = addressMappings.find(m => m.customerNumber === customerNumber);
  if (!mapping) return null;
  return {
    address: mapping.address,
    utilityType: mapping.utilityType
  };
};
