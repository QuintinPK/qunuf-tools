
import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  useFetchAllUtilityPrices, 
  addUtilityPrice, 
  updateUtilityPrice, 
  deleteUtilityPrice,
  UtilityPrice 
} from "@/hooks/use-utility-prices";
import { Plus, Edit, Trash2 } from "lucide-react";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { format, parseISO } from "date-fns";

type DialogMode = 'add' | 'edit';

const UtilityPrices = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('add');
  const [selectedPrice, setSelectedPrice] = useState<UtilityPrice | null>(null);
  
  // Form states
  const [utilityType, setUtilityType] = useState<'electricity' | 'water'>('electricity');
  const [pricePerUnit, setPricePerUnit] = useState<number>(0);
  const [unitName, setUnitName] = useState<string>('kWh');
  const [currency, setCurrency] = useState<string>('USD');
  const [effectiveFrom, setEffectiveFrom] = useState<string>(new Date().toISOString().split('T')[0]);
  const [effectiveUntil, setEffectiveUntil] = useState<string>('');
  
  // Query for fetching all utility prices
  const { data: prices, isLoading, refetch } = useFetchAllUtilityPrices();
  
  // Reset form for adding new price
  const resetForm = () => {
    setUtilityType('electricity');
    setPricePerUnit(0);
    setUnitName('kWh');
    setCurrency('USD');
    setEffectiveFrom(new Date().toISOString().split('T')[0]);
    setEffectiveUntil('');
  };
  
  // Open dialog for adding new price
  const handleAddPrice = () => {
    resetForm();
    setDialogMode('add');
    setIsDialogOpen(true);
  };
  
  // Open dialog for editing price
  const handleEditPrice = (price: UtilityPrice) => {
    setSelectedPrice(price);
    setDialogMode('edit');
    
    // Populate form with selected price data
    setUtilityType(price.utility_type as 'electricity' | 'water');
    setPricePerUnit(price.price_per_unit);
    setUnitName(price.unit_name);
    setCurrency(price.currency);
    setEffectiveFrom(price.effective_from.split('T')[0]);
    setEffectiveUntil(price.effective_until ? price.effective_until.split('T')[0] : '');
    
    setIsDialogOpen(true);
  };
  
  // Open dialog for deleting price
  const handleDeleteClick = (price: UtilityPrice) => {
    setSelectedPrice(price);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle form submission (add or edit)
  const handleSavePrice = async () => {
    try {
      // Format dates with timezone
      const formattedEffectiveFrom = new Date(effectiveFrom).toISOString();
      const formattedEffectiveUntil = effectiveUntil ? new Date(effectiveUntil).toISOString() : null;
      
      if (dialogMode === 'add') {
        // Add new price
        await addUtilityPrice({
          utility_type: utilityType,
          price_per_unit: pricePerUnit,
          unit_name: unitName,
          currency,
          effective_from: formattedEffectiveFrom,
          effective_until: formattedEffectiveUntil,
        });
        
        toast({
          title: "Success",
          description: "Utility price added successfully",
        });
      } else {
        // Update existing price
        if (!selectedPrice) return;
        
        await updateUtilityPrice(selectedPrice.id, {
          utility_type: utilityType,
          price_per_unit: pricePerUnit,
          unit_name: unitName,
          currency,
          effective_from: formattedEffectiveFrom,
          effective_until: formattedEffectiveUntil,
        });
        
        toast({
          title: "Success",
          description: "Utility price updated successfully",
        });
      }
      
      // Close dialog and refresh data
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error saving utility price:", error);
      toast({
        title: "Error",
        description: "Failed to save utility price",
        variant: "destructive",
      });
    }
  };
  
  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!selectedPrice) return;
    
    try {
      await deleteUtilityPrice(selectedPrice.id);
      
      toast({
        title: "Success",
        description: "Utility price deleted successfully",
      });
      
      // Close dialog and refresh data
      setIsDeleteDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Error deleting utility price:", error);
      toast({
        title: "Error",
        description: "Failed to delete utility price",
        variant: "destructive",
      });
    }
  };
  
  // Handle utility type change
  const handleUtilityTypeChange = (type: 'electricity' | 'water') => {
    setUtilityType(type);
    // Set default unit name based on type
    setUnitName(type === 'electricity' ? 'kWh' : 'm3');
  };
  
  return (
    <div className={`${isMobile ? 'px-2 py-4' : 'container mx-auto py-8 px-4'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Utility Prices</h1>
        <Button onClick={handleAddPrice} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Add New Price
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading prices...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utility Type</TableHead>
                  <TableHead>Price per Unit</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Effective From</TableHead>
                  <TableHead>Effective Until</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prices && prices.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell className="capitalize">{price.utility_type}</TableCell>
                    <TableCell>{price.price_per_unit}</TableCell>
                    <TableCell>{price.unit_name}</TableCell>
                    <TableCell>{price.currency}</TableCell>
                    <TableCell>
                      {format(parseISO(price.effective_from), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell>
                      {price.effective_until 
                        ? format(parseISO(price.effective_until), 'yyyy-MM-dd') 
                        : 'No end date'}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditPrice(price)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteClick(price)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {(!prices || prices.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No utility prices found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'add' ? 'Add New Utility Price' : 'Edit Utility Price'}
            </DialogTitle>
            <DialogDescription>
              Enter the details for the utility price
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="utilityType">Utility Type</Label>
              <div className="flex space-x-2">
                <Button 
                  type="button"
                  variant={utilityType === 'electricity' ? 'default' : 'outline'}
                  onClick={() => handleUtilityTypeChange('electricity')}
                >
                  Electricity
                </Button>
                <Button 
                  type="button"
                  variant={utilityType === 'water' ? 'default' : 'outline'}
                  onClick={() => handleUtilityTypeChange('water')}
                >
                  Water
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pricePerUnit">Price per Unit</Label>
              <Input
                id="pricePerUnit"
                type="number"
                step="0.0001"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                placeholder="Enter price per unit"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unitName">Unit Name</Label>
              <Input
                id="unitName"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                placeholder="Enter unit name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="Enter currency"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="effectiveFrom">Effective From</Label>
              <Input
                id="effectiveFrom"
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                placeholder="Select effective from date"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="effectiveUntil">Effective Until (optional)</Label>
              <Input
                id="effectiveUntil"
                type="date"
                value={effectiveUntil}
                onChange={(e) => setEffectiveUntil(e.target.value)}
                placeholder="Select effective until date"
              />
              <p className="text-sm text-muted-foreground">
                Leave empty for indefinite validity
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePrice}>
              {dialogMode === 'add' ? 'Add Price' : 'Update Price'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the utility price record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UtilityPrices;
