import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { 
  PlusIcon, 
  MinusIcon, 
  EditIcon, 
  MoveIcon
} from "lucide-react";
import type { StockMovementWithDetails } from "@shared/schema";

function getActivityIcon(quantity: number, note?: string) {
  if (quantity > 0) {
    return (
      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
        <PlusIcon className="h-4 w-4 text-primary" />
      </div>
    );
  } else if (quantity < 0) {
    return (
      <div className="flex-shrink-0 h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
        <MinusIcon className="h-4 w-4 text-danger" />
      </div>
    );
  } else if (note && note.toLowerCase().includes('edit')) {
    return (
      <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
        <EditIcon className="h-4 w-4 text-success" />
      </div>
    );
  } else {
    return (
      <div className="flex-shrink-0 h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
        <MoveIcon className="h-4 w-4 text-warning" />
      </div>
    );
  }
}

function getActivityDescription(movement: StockMovementWithDetails) {
  const { quantity, productName, locationName, note } = movement;
  
  if (quantity > 0) {
    return `Added ${quantity} units of ${productName}${locationName ? ` to ${locationName}` : ''}`;
  } else if (quantity < 0) {
    return `Removed ${Math.abs(quantity)} units of ${productName}${locationName ? ` from ${locationName}` : ''}`;
  } else if (note && note.toLowerCase().includes('edit')) {
    return `Updated product information for ${productName}`;
  } else {
    return note || `Stock movement for ${productName}`;
  }
}

export default function RecentActivity() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
  });
  
  const recentMovements = dashboardData?.recentMovements;
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle><Skeleton className="h-6 w-36" /></CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="py-3">
                <div className="flex items-start space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-4 w-36 ml-auto" />
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="divide-y divide-gray-200">
          {recentMovements?.map((movement: StockMovementWithDetails) => (
            <li key={movement.id} className="py-3">
              <div className="flex items-start space-x-3">
                {getActivityIcon(movement.quantity, movement.note)}
                <div>
                  <p className="text-sm text-gray-900">
                    {getActivityDescription(movement)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(movement.timestamp)}
                  </p>
                </div>
              </div>
            </li>
          ))}
          
          {(!recentMovements || recentMovements.length === 0) && (
            <li className="py-3 text-center text-gray-500">
              No recent activity
            </li>
          )}
        </ul>
      </CardContent>
      <CardFooter className="border-t border-gray-200 px-6 py-4">
        <Link href="/reports">
          <a className="text-sm font-medium text-primary hover:text-blue-700 ml-auto">
            View all activity →
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}
