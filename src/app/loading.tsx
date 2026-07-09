import { DashboardSkeleton } from "@/components/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <DashboardSkeleton />
    </div>
  );
}
