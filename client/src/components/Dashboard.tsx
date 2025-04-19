import { useQuery } from "@tanstack/react-query";
import { 
  ArchiveIcon,
  AlertTriangleIcon,
  DollarSignIcon,
  RefreshCwIcon
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import LowStockAlert from "@/components/LowStockAlert";
import RecentActivity from "@/components/RecentActivity";
import InventoryChart from "@/components/InventoryChart";
import { formatCurrency } from "@/lib/utils";

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
  });
  
  const stats = dashboardData?.stats || {
    totalProducts: 0,
    lowStockItems: 0,
    inventoryValue: 0,
    stockMovements: 0
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your inventory system</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<ArchiveIcon className="h-5 w-5 text-primary" />}
          iconBgColor="bg-blue-100"
          trend={{
            value: "12% from last month",
            direction: "up",
            isPositive: true
          }}
        />
        
        <StatCard
          title="Low Stock Items"
          value={stats.lowStockItems}
          icon={<AlertTriangleIcon className="h-5 w-5 text-danger" />}
          iconBgColor="bg-red-100"
          trend={{
            value: "4 more than last week",
            direction: "up",
            isPositive: false
          }}
        />
        
        <StatCard
          title="Inventory Value"
          value={formatCurrency(stats.inventoryValue)}
          icon={<DollarSignIcon className="h-5 w-5 text-success" />}
          iconBgColor="bg-green-100"
          trend={{
            value: "8.2% from last month",
            direction: "up",
            isPositive: true
          }}
        />
        
        <StatCard
          title="Stock Movements"
          value={stats.stockMovements}
          icon={<RefreshCwIcon className="h-5 w-5 text-warning" />}
          iconBgColor="bg-amber-100"
          trend={{
            value: "24 more this week",
            direction: "up",
            isPositive: true
          }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alert */}
        <div className="lg:col-span-2">
          <LowStockAlert />
        </div>
        
        {/* Recent Activity */}
        <div>
          <RecentActivity />
        </div>
      </div>
      
      {/* Inventory Chart */}
      <div className="mt-6">
        <InventoryChart />
      </div>
    </div>
  );
}
