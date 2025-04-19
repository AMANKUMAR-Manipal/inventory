import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
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
  ArrowLeftRightIcon, 
  EditIcon, 
  DownloadIcon, 
  PlusIcon, 
  TrashIcon,
  SearchIcon
} from "lucide-react";
import { formatDate, calculateStockStatus, getStockStatusColor } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { InventoryWithDetails } from "@shared/schema";

export default function InventoryList() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("");
  
  const { data: inventory, isLoading } = useQuery({
    queryKey: ['/api/inventory'],
  });
  
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  const { data: locations } = useQuery({
    queryKey: ['/api/locations'],
  });
  
  const handleDeleteItem = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/inventory/${id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      toast({
        title: "Success",
        description: "Inventory item has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete inventory item.",
        variant: "destructive",
      });
    }
  };
  
  const columns: ColumnDef<InventoryWithDetails>[] = [
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center">
            <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
              <ComputerIcon className="text-lg" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">{product.productName}</div>
              <div className="text-sm text-gray-500">
                {product.categoryName}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "productSku",
      header: "SKU",
      cell: ({ row }) => {
        return <div className="text-sm text-gray-900">{row.original.productSku}</div>;
      },
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => {
        return <div className="text-sm text-gray-900">{row.original.categoryName}</div>;
      },
    },
    {
      accessorKey: "quantity",
      header: "Stock",
      cell: ({ row }) => {
        const item = row.original;
        const status = calculateStockStatus(item.quantity, item.minStockLevel || 0);
        const { bg, text } = getStockStatusColor(status);
        
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bg} ${text}`}>
            {item.quantity > 0 ? `${item.quantity} in stock` : 'Out of stock'}
          </span>
        );
      },
    },
    {
      accessorKey: "locationName",
      header: "Location",
      cell: ({ row }) => {
        return <div className="text-sm text-gray-900">{row.original.locationName}</div>;
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => {
        return <div className="text-sm text-gray-900">{formatDate(row.original.updatedAt)}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
              <EditIcon className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <ArrowLeftRightIcon className="h-4 w-4" />
              <span className="sr-only">Move</span>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-danger hover:text-red-700">
                  <TrashIcon className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this inventory item? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {}}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeleteItem(row.original.id)}>
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
  
  // Filter inventory based on search and filters
  const filteredInventory = inventory?.filter((item: InventoryWithDetails) => {
    // Apply search filter
    if (search && !(
      (item.productName && item.productName.toLowerCase().includes(search.toLowerCase())) ||
      (item.productSku && item.productSku.toLowerCase().includes(search.toLowerCase())) ||
      (item.categoryName && item.categoryName.toLowerCase().includes(search.toLowerCase())) ||
      (item.locationName && item.locationName.toLowerCase().includes(search.toLowerCase()))
    )) {
      return false;
    }
    
    // Apply category filter
    if (categoryFilter && item.categoryName !== categoryFilter) {
      return false;
    }
    
    // Apply location filter
    if (locationFilter && item.locationName !== locationFilter) {
      return false;
    }
    
    // Apply stock status filter
    if (stockStatusFilter) {
      const status = calculateStockStatus(item.quantity, item.minStockLevel || 0);
      if (status !== stockStatusFilter) {
        return false;
      }
    }
    
    return true;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">Manage your inventory items</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="flex items-center gap-2">
            <DownloadIcon className="h-4 w-4" />
            Export
          </Button>
          <Button className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>
      
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="sm:w-1/4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-1/4">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Locations</SelectItem>
                  {locations?.map((location: any) => (
                    <SelectItem key={location.id} value={location.name}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-1/4">
              <Select value={stockStatusFilter} onValueChange={setStockStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Stock Status</SelectItem>
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
        data={filteredInventory || []}
        searchColumn="productName"
        isLoading={isLoading}
      />
    </div>
  );
}

function ComputerIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="8" x="5" y="2" rx="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" />
      <path d="M6 18h2" />
      <path d="M12 18h6" />
    </svg>
  );
}
