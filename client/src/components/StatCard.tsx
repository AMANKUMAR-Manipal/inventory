import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor: string;
  trend?: {
    value: string;
    direction: "up" | "down";
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  icon,
  iconBgColor,
  trend,
}: StatCardProps) {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              iconBgColor
            )}
          >
            {icon}
          </div>
        </div>
        {trend && (
          <div className="mt-4">
            <span
              className={cn(
                "text-xs inline-flex items-center font-medium",
                trend.isPositive ? "text-success" : "text-danger"
              )}
            >
              {trend.direction === "up" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3 mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.77 4.21a.75.75 0 01.02 1.06l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 011.08-1.04L10 8.168l3.71-3.938a.75.75 0 011.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-3 h-3 mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 15.79a.75.75 0 01-.02-1.06l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 11-1.08 1.04L10 11.832l-3.71 3.938a.75.75 0 01-1.06.02z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {trend.value}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
