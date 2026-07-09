"use client";

import { TimelineData } from "@/types";
import { timelineLabels } from "@/lib/utils";
import { CheckCircle, Circle, Loader } from "lucide-react";

export function Timeline({ data }: { data: TimelineData }) {
  return (
    <div className="relative">
      <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-6">
        {data.stages.map((stage, i) => {
          const isCurrent = stage.stage === data.currentStage;
          return (
            <div key={stage.stage} className="relative flex items-start gap-4">
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-gray-900">
                {stage.status === "completed" ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : isCurrent ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                    <Loader className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                  </div>
                ) : (
                  <Circle className="h-6 w-6 text-gray-300 dark:text-gray-600" />
                )}
              </div>
              <div className="pt-1.5">
                <p
                  className={`text-sm font-semibold ${
                    stage.status === "completed"
                      ? "text-green-700 dark:text-green-400"
                      : isCurrent
                        ? "text-indigo-700 dark:text-indigo-400"
                        : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {timelineLabels[stage.stage] ?? stage.label}
                  {isCurrent && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      Current
                    </span>
                  )}
                </p>
                {stage.date && (
                  <p className="text-xs text-gray-400">{new Date(stage.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
                )}
                {stage.description && (
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{stage.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
