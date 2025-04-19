import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Download, FileText, AlertTriangle } from "lucide-react";
import { parseCSV, convertToCSV, downloadCSV } from "@/lib/utils";
import type { ProductWithDetails, InventoryWithDetails } from "@shared/schema";

// Form schema for import
const importFormSchema = z.object({
  type: z.string().min(1, "Import type is required"),
  data: z.string().min(1, "CSV data is required"),
});

type ImportFormValues = z.infer<typeof importFormSchema>;

// Form schema for export
const exportFormSchema = z.object({
  type: z.string().min(1, "Export type is required"),
});

type ExportFormValues = z.infer<typeof exportFormSchema>;

export default function ImportExport() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("import");
  const [importResult, setImportResult] = useState<{ imported: number; errors: number } | null>(null);
  
  const { data: products } = useQuery<ProductWithDetails[]>({
    queryKey: ['/api/products'],
  });
  
  const { data: inventory } = useQuery<InventoryWithDetails[]>({
    queryKey: ['/api/inventory'],
  });
  
  const { data: stockMovements } = useQuery({
    queryKey: ['/api/stock-movements'],
  });
  
  // Import form
  const importForm = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      type: "",
      data: "",
    },
  });
  
  // Export form
  const exportForm = useForm<ExportFormValues>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      type: "",
    },
  });
  
  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const csvContent = event.target?.result as string;
        importForm.setValue("data", csvContent);
      };
      
      reader.readAsText(file);
    }
  };
  
  // Import CSV data
  const onImportSubmit = async (values: ImportFormValues) => {
    try {
      setImportResult(null);
      
      // Parse CSV to JSON
      const csvData = parseCSV(values.data);
      
      // Send to API
      const response = await apiRequest('POST', '/api/import', {
        type: values.type,
        data: csvData,
      });
      
      const result = await response.json();
      
      // Update result state
      setImportResult({
        imported: result.imported,
        errors: result.errors,
      });
      
      // Show toast
      toast({
        title: "Import Completed",
        description: `Imported ${result.imported} items with ${result.errors} errors.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please check your CSV format and try again.",
        variant: "destructive",
      });
    }
  };
  
  // Export data to CSV
  const onExportSubmit = async (values: ExportFormValues) => {
    try {
      const response = await apiRequest('GET', `/api/export/${values.type}`);
      const data = await response.json();
      
      // Convert to CSV and download
      const csvData = convertToCSV(data);
      downloadCSV(csvData, `${values.type}-export.csv`);
      
      toast({
        title: "Export Successful",
        description: `${values.type} data has been exported to CSV.`,
      });
      
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Import/Export Data</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>
                Import products or inventory data from a CSV file.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...importForm}>
                <form onSubmit={importForm.handleSubmit(onImportSubmit)} className="space-y-6">
                  <FormField
                    control={importForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Import Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select what to import" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="products">Products</SelectItem>
                            <SelectItem value="inventory">Inventory</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">CSV File</h3>
                    <Input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleFileUpload}
                      className="mb-2"
                    />
                    <p className="text-sm text-gray-500 mb-4">
                      Or paste CSV content below:
                    </p>
                  </div>
                  
                  <FormField
                    control={importForm.control}
                    name="data"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            rows={10} 
                            placeholder="Paste CSV data here..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {importResult && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">Import Results</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Successfully imported {importResult.imported} items.
                          {importResult.errors > 0 && (
                            <span className="text-amber-700 ml-1">
                              {importResult.errors} items had errors and were skipped.
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800">Format Guidelines</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Products CSV should include: name, sku, description, categoryName, unitCost, minStockLevel<br/>
                        Inventory CSV should include: sku, locationName, quantity
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto"
                    disabled={!importForm.formState.isValid}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Export your inventory data to a CSV file.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...exportForm}>
                <form onSubmit={exportForm.handleSubmit(onExportSubmit)} className="space-y-6">
                  <FormField
                    control={exportForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Export Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select what to export" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="products">Products ({products?.length || 0} items)</SelectItem>
                            <SelectItem value="inventory">Inventory ({inventory?.length || 0} items)</SelectItem>
                            <SelectItem value="stock-movements">Stock Movements ({stockMovements?.length || 0} items)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Export Information</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Exported files will be downloaded in CSV format and will include all relevant data fields for each item.
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto"
                    disabled={!exportForm.formState.isValid}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export to CSV
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
