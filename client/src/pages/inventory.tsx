import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DownloadIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import InventoryList from "@/components/InventoryList";
import StockAdjustmentForm from "@/components/StockAdjustmentForm";
import { apiRequest } from "@/lib/queryClient";
import { downloadCSV, convertToCSV } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function InventoryPage() {
  const { toast } = useToast();
  const [stockAdjustmentOpen, setStockAdjustmentOpen] = useState(false);
  
  // Export inventory data
  const handleExport = async () => {
    try {
      const response = await apiRequest('GET', '/api/export/inventory');
      const data = await response.json();
      
      // Convert to CSV and download
      const csvData = convertToCSV(data);
      downloadCSV(csvData, 'inventory-export.csv');
      
      toast({
        title: "Export Successful",
        description: "Inventory data has been exported to CSV.",
      });
      
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export inventory data. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">Manage your inventory items</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleExport}
          >
            <DownloadIcon className="h-4 w-4" />
            Export
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setStockAdjustmentOpen(true)}
          >
            <PlusIcon className="h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>
      
      <InventoryList />
      
      <StockAdjustmentForm
        open={stockAdjustmentOpen}
        onOpenChange={setStockAdjustmentOpen}
      />
    </div>
  );
}
