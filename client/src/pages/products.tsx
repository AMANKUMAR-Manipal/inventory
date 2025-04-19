import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { 
  DownloadIcon, 
  PlusIcon, 
  Pencil, 
  Trash, 
  PackageIcon,
  AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import ProductForm from "@/components/ProductForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, calculateStockStatus, getStockStatusColor, convertToCSV, downloadCSV } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { ProductWithDetails } from "@shared/schema";

export default function ProductsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  
  const { data: products, isLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ['/api/products'],
  });
  
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductFormOpen(true);
  };
  
  const handleEditProduct = (id: number) => {
    setEditingProduct(id);
    setProductFormOpen(true);
  };
  
  const handleDeleteProduct = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/products/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Success",
        description: "Product has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product. It may be in use by inventory items.",
        variant: "destructive",
      });
    }
  };
  
  const handleExport = async () => {
    try {
      const response = await apiRequest('GET', '/api/export/products');
      const data = await response.json();
      
      // Convert to CSV and download
      const csvData = convertToCSV(data);
      downloadCSV(csvData, 'products-export.csv');
      
      toast({
        title: "Export Successful",
        description: "Products data has been exported to CSV.",
      });
      
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export products data. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const columns: ColumnDef<ProductWithDetails>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center">
            <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
              <PackageIcon className="h-5 w-5" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-500">
                {product.description?.substring(0, 30)}
                {product.description && product.description.length > 30 ? '...' : ''}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "sku",
      header: "SKU",
    },
    {
      accessorKey: "categoryName",
      header: "Category",
    },
    {
      accessorKey: "stockQuantity",
      header: "Stock",
      cell: ({ row }) => {
        const product = row.original;
        const status = calculateStockStatus(
          product.stockQuantity || 0, 
          product.minStockLevel
        );
        const { bg, text } = getStockStatusColor(status);
        
        return (
          <Badge variant="outline" className={`${bg} ${text}`}>
            {product.stockQuantity || 0} in stock
          </Badge>
        );
      },
    },
    {
      accessorKey: "unitCost",
      header: "Unit Cost",
      cell: ({ row }) => {
        return formatCurrency(row.original.unitCost);
      },
    },
    {
      accessorKey: "minStockLevel",
      header: "Min. Level",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleEditProduct(row.original.id)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive"
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this product? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteProduct(row.original.id)}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    },
  ];
  
  // Filter products based on search and filters
  const filteredProducts = (products || []).filter((product) => {
    // Apply search filter
    if (search && !(
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(search.toLowerCase())) ||
      (product.categoryName && product.categoryName.toLowerCase().includes(search.toLowerCase()))
    )) {
      return false;
    }
    
    // Apply category filter
    if (categoryFilter && categoryFilter !== "all" && product.categoryName !== categoryFilter) {
      return false;
    }
    
    // Apply stock status filter
    if (stockStatusFilter && stockStatusFilter !== "all") {
      const status = calculateStockStatus(product.stockQuantity || 0, product.minStockLevel);
      if (status !== stockStatusFilter) {
        return false;
      }
    }
    
    return true;
  });
  
  // Get the product being edited
  const productToEdit = editingProduct 
    ? products?.find(p => p.id === editingProduct) 
    : null;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your product catalog</p>
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
            onClick={handleAddProduct}
          >
            <PlusIcon className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
      
      <Card className="border-gray-200 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="sm:w-1/3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {(categories || []).map((category: any) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-1/3">
              <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock Status</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <DataTable
        columns={columns}
        data={filteredProducts || []}
        searchColumn="name"
        isLoading={isLoading}
      />
      
      <ProductForm
        open={productFormOpen}
        onOpenChange={setProductFormOpen}
        productId={editingProduct || undefined}
      />
    </div>
  );
}
