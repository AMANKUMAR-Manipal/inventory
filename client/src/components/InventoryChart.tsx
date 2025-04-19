import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProductWithDetails } from "@shared/schema";

interface CategoryData {
  name: string;
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export default function InventoryChart() {
  const [timeframe, setTimeframe] = useState("30");

  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const chartData = prepareChartData(products);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
          <Skeleton className="h-9 w-32" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <CardTitle>Inventory Overview by Category</CardTitle>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Last 30 days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
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
              <Bar
                dataKey="inStock"
                name="In Stock"
                stackId="a"
                fill="var(--chart-1, #10B981)"
              />
              <Bar
                dataKey="lowStock"
                name="Low Stock"
                stackId="a"
                fill="var(--chart-2, #F59E0B)"
              />
              <Bar
                dataKey="outOfStock"
                name="Out of Stock"
                stackId="a"
                fill="var(--chart-3, #EF4444)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function prepareChartData(products: ProductWithDetails[] = []): CategoryData[] {
  const categoriesMap = new Map<string, CategoryData>();

  // Group products by category and count stock status
  products.forEach((product) => {
    const categoryName = product.categoryName || "Uncategorized";
    
    if (!categoriesMap.has(categoryName)) {
      categoriesMap.set(categoryName, {
        name: categoryName,
        total: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
      });
    }
    
    const category = categoriesMap.get(categoryName)!;
    category.total++;
    
    const stockQuantity = product.stockQuantity || 0;
    const minStockLevel = product.minStockLevel || 0;
    
    if (stockQuantity === 0) {
      category.outOfStock++;
    } else if (stockQuantity <= minStockLevel) {
      category.lowStock++;
    } else {
      category.inStock++;
    }
  });

  return Array.from(categoriesMap.values());
}
