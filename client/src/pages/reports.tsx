import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3Icon, 
  DownloadIcon,
  RefreshCwIcon 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDateTime, formatDate, convertToCSV, downloadCSV } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { ColumnDef } from "@tanstack/react-table";

export default function ReportsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("stock-movements");
  
  // Fetch stock movements for report
  const { data: stockMovements, isLoading: isStockMovementsLoading } = useQuery({
    queryKey: ['/api/stock-movements'],
  });
  
  // Fetch products for product value report
  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ['/api/products'],
  });
  
  // Fetch inventory for location report
  const { data: inventory, isLoading: isInventoryLoading } = useQuery({
    queryKey: ['/api/inventory'],
  });
  
  // Export movements data
  const handleExport = async () => {
    try {
      const response = await apiRequest('GET', '/api/export/stock-movements');
      const data = await response.json();
      
      // Convert to CSV and download
      const csvData = convertToCSV(data);
      downloadCSV(csvData, 'stock-movements-export.csv');
      
      toast({
        title: "Export Successful",
        description: "Stock movements data has been exported to CSV.",
      });
      
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Stock Movement Table Columns
  const stockMovementColumns: ColumnDef<any>[] = [
    {
      accessorKey: "productName",
      header: "Product",
    },
    {
      accessorKey: "locationName",
      header: "Location",
    },
    {
      accessorKey: "quantity",
      header: "Quantity Change",
      cell: ({ row }) => {
        const quantity = row.original.quantity;
        return (
          <span className={quantity > 0 ? "text-success" : quantity < 0 ? "text-danger" : ""}>
            {quantity > 0 ? `+${quantity}` : quantity}
          </span>
        );
      },
    },
    {
      accessorKey: "note",
      header: "Note",
    },
    {
      accessorKey: "timestamp",
      header: "Date/Time",
      cell: ({ row }) => {
        return formatDateTime(row.original.timestamp);
      },
    },
  ];
  
  // Prepare data for Product Value chart
  const productValueData = products ? 
    // Group by category and sum value
    Object.values(products.reduce((acc: Record<string, any>, product: any) => {
      const categoryName = product.categoryName || "Uncategorized";
      const stockValue = (product.stockQuantity || 0) * product.unitCost;
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          value: 0,
        };
      }
      
      acc[categoryName].value += stockValue;
      return acc;
    }, {})).sort((a: any, b: any) => b.value - a.value) : 
    [];
  
  // Prepare data for Location Distribution chart
  const locationData = inventory ? 
    // Group by location and count items
    Object.values(inventory.reduce((acc: Record<string, any>, item: any) => {
      const locationName = item.locationName || "Unknown";
      
      if (!acc[locationName]) {
        acc[locationName] = {
          name: locationName,
          count: 0,
        };
      }
      
      acc[locationName].count += 1;
      return acc;
    }, {})) : 
    [];
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">View and analyze your inventory data</p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleExport}
        >
          <DownloadIcon className="h-4 w-4" />
          Export Data
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="stock-movements" className="flex items-center gap-2">
            <RefreshCwIcon className="h-4 w-4" />
            Stock Movements
          </TabsTrigger>
          <TabsTrigger value="product-value" className="flex items-center gap-2">
            <BarChart3Icon className="h-4 w-4" />
            Product Value
          </TabsTrigger>
          <TabsTrigger value="location-distribution" className="flex items-center gap-2">
            <BarChart3Icon className="h-4 w-4" />
            Location Distribution
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stock-movements">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement History</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={stockMovementColumns}
                data={stockMovements || []}
                isLoading={isStockMovementsLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="product-value">
          <Card>
            <CardHeader>
              <CardTitle>Product Value by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {isProductsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Loading chart data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productValueData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {productValueData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Value Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productValueData.map((item: any, index: number) => {
                        const totalValue = productValueData.reduce((sum: number, i: any) => sum + i.value, 0);
                        const percentage = totalValue > 0 ? (item.value / totalValue * 100).toFixed(1) : '0';
                        
                        return (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                {item.name}
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-right">{formatCurrency(item.value)}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-right">{percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="location-distribution">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Distribution by Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {isInventoryLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Loading chart data...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={locationData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Item Count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
