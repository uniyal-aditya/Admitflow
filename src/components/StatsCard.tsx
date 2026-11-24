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
    <div className="rounded-md border border-gray-200 border-t-4 border-t-indigo-800 bg-white p-4 dark:bg-gray-900 dark:border-gray-800 dark:border-t-indigo-500">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</p>
        <div className="rounded-full bg-indigo-100 p-2 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
          {icon}
        </div>
      </div>
      <p className="mt-2 font-serif text-3xl font-bold text-indigo-900 dark:text-white">{value}</p>
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
            <span className="text-xs text-gray-700 dark:text-gray-300">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
