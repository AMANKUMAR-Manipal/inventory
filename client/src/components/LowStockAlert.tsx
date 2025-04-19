import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { getStockStatusColor } from "@/lib/utils";
import { 
  ComputerIcon, 
  HeadphonesIcon, 
  SmartphoneIcon, 
  MonitorIcon
} from "lucide-react";
import type { InventoryWithDetails } from "@shared/schema";

const PRODUCT_ICONS: Record<string, JSX.Element> = {
  "Electronics": <ComputerIcon className="h-5 w-5" />,
  "Headphones": <HeadphonesIcon className="h-5 w-5" />,
  "Phone": <SmartphoneIcon className="h-5 w-5" />,
  "TV": <MonitorIcon className="h-5 w-5" />,
};

function getProductIcon(productName: string, categoryName?: string): JSX.Element {
  const lowerName = productName.toLowerCase();
  
  if (lowerName.includes('phone') || lowerName.includes('iphone')) {
    return <SmartphoneIcon className="h-5 w-5" />;
  }
  
  if (lowerName.includes('headphone') || lowerName.includes('earphone')) {
    return <HeadphonesIcon className="h-5 w-5" />;
  }
  
  if (lowerName.includes('tv') || lowerName.includes('monitor')) {
    return <MonitorIcon className="h-5 w-5" />;
  }
  
  if (categoryName && PRODUCT_ICONS[categoryName]) {
    return PRODUCT_ICONS[categoryName];
  }
  
  return <ComputerIcon className="h-5 w-5" />;
}

export default function LowStockAlert() {
  const { data: lowStockItems, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    select: (data) => data.lowStockItems.slice(0, 3)
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alert</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-36 ml-auto" />
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="border-b border-gray-200 px-6 py-4">
        <CardTitle>Low Stock Alert</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-3 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</TableHead>
                <TableHead className="px-3 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</TableHead>
                <TableHead className="px-3 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</TableHead>
                <TableHead className="px-3 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">Min. Level</TableHead>
                <TableHead className="px-3 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">Location</TableHead>
                <TableHead className="px-3 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockItems?.map((item: InventoryWithDetails) => {
                const status = item.quantity === 0 ? 'Out of Stock' : 'Low Stock';
                const { bg, text } = getStockStatusColor(status);
                
                return (
                  <TableRow key={item.id}>
                    <TableCell className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                          {getProductIcon(item.productName || '', item.categoryName)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{item.productSku}</div>
                    </TableCell>
                    <TableCell className="px-3 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium ${bg} ${text} rounded-full`}>
                        {item.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{item.minStockLevel}</div>
                    </TableCell>
                    <TableCell className="px-3 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{item.locationName}</div>
                    </TableCell>
                    <TableCell className="px-3 py-3 whitespace-nowrap">
                      <Button variant="ghost" size="sm" className="text-xs bg-blue-50 text-primary hover:bg-blue-100">
                        Restock
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {(!lowStockItems || lowStockItems.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No low stock items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-200 px-6 py-4">
        <Link href="/inventory">
          <a className="text-sm font-medium text-primary hover:text-blue-700 ml-auto">
            View all low stock items →
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}
