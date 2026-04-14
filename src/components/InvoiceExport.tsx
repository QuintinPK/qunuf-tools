import React, { useState, useMemo } from "react";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { nl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Invoice } from "@/types/invoice";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvoiceExportProps {
  invoices: Invoice[];
}

const InvoiceExport: React.FC<InvoiceExportProps> = ({ invoices }) => {
  const { toast } = useToast();
  const [selectedAddress, setSelectedAddress] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const uniqueAddresses = useMemo(() => {
    const addresses = [...new Set(invoices.map(inv => inv.address))];
    return addresses.sort();
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (selectedAddress !== "all" && inv.address !== selectedAddress) return false;
      if (dateFrom) {
        const invDate = parseISO(inv.invoiceDate);
        if (invDate < startOfDay(parseISO(dateFrom))) return false;
      }
      if (dateTo) {
        const invDate = parseISO(inv.invoiceDate);
        if (invDate > endOfDay(parseISO(dateTo))) return false;
      }
      return true;
    });
  }, [invoices, selectedAddress, dateFrom, dateTo]);

  const handleExport = () => {
    if (filteredInvoices.length === 0) {
      toast({
        title: "Geen data",
        description: "Er zijn geen facturen gevonden voor de geselecteerde filters.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Factuurnummer", "Adres", "Type", "Factuurdatum", "Vervaldatum", "Bedrag", "Status", "Betaaldatum"];
    const rows = filteredInvoices.map(inv => [
      inv.invoiceNumber,
      `"${inv.address}"`,
      inv.utilityType === "water" ? "Water" : "Elektriciteit",
      inv.invoiceDate,
      inv.dueDate,
      inv.amount.toFixed(2),
      inv.isPaid ? "Betaald" : "Onbetaald",
      inv.paymentDate || "",
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const fileName = selectedAddress !== "all"
      ? `facturen-${selectedAddress.replace(/\s+/g, "-").toLowerCase()}.csv`
      : "facturen-export.csv";

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export succesvol",
      description: `${filteredInvoices.length} facturen geëxporteerd.`,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Data Exporteren</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Adres</Label>
            <Select value={selectedAddress} onValueChange={setSelectedAddress}>
              <SelectTrigger>
                <SelectValue placeholder="Alle adressen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle adressen</SelectItem>
                {uniqueAddresses.map(addr => (
                  <SelectItem key={addr} value={addr}>{addr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Van</Label>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Tot</Label>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            {filteredInvoices.length} facturen gevonden
          </span>
          <Button onClick={handleExport} size="sm" disabled={filteredInvoices.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceExport;
