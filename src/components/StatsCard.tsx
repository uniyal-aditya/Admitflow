import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: { value: number; positive: boolean };
}

export function StatsCard({ title, value, icon, description, trend }: StatsCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      {(description || trend) && (
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span
              className={`text-xs font-medium ${
                trend.positive ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.positive ? "+" : ""}
              {trend.value}%
            </span>
          )}
          {description && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
