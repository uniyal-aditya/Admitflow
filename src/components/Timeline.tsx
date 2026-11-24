"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Circle, Loader, FileText, CalendarCheck, Users,
  ListOrdered, MapPin, AlertTriangle, ChevronDown, Info,
} from "lucide-react";
import { TimelineData } from "@/types";
import { timelineLabels } from "@/lib/utils";

const stageIcons: Record<string, React.ElementType> = {
  registration: FileText,
  merit_list: ListOrdered,
  counselling_1: CalendarCheck,
  counselling_2: CalendarCheck,
  counselling_3: CalendarCheck,
  spot_round: MapPin,
  waiting_list: Users,
  closed: CheckCircle,
};

function StageIcon({ stage, status }: { stage: string; status: string }) {
  const Icon = stageIcons[stage] || Circle;
  if (status === "completed") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
      </div>
    );
  }
  if (status === "current") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 ring-2 ring-indigo-500 ring-offset-2 dark:bg-indigo-900/30 dark:ring-offset-gray-900">
        <Loader className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
      <Icon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
    </div>
  );
}

const statusText: Record<string, string> = {
  completed: "Completed",
  current: "Ongoing",
  upcoming: "Upcoming",
};

/**
 * Admission timeline. Always vertical: it lives in a ~380px side card, where
 * the old 5-column horizontal layout overlapped labels and overflowed.
 * Status is taken from each stage's own (derived) status, never inferred from
 * array position, so a stage can't look "completed" after the current one.
 */
export function Timeline({ data }: { data: TimelineData }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const cycleEnded = data.stages.length > 0 && data.stages.every((s) => s.status === "completed");

  const hasDateIssues = data.stages.some((s, i) => {
    if (i === 0 || !s.date) return false;
    const prev = data.stages[i - 1]?.date;
    return prev ? new Date(s.date) < new Date(prev) : false;
  });

  return (
    <div>
      {cycleEnded && (
        <div className="mb-4 flex gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            This admission cycle has ended. Dates for the next session will appear here once the
            college announces them. Check the official website for the latest information.
          </span>
        </div>
      )}
      {hasDateIssues && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Timeline dates may be out of order
        </div>
      )}

      <ol className="relative space-y-5">
        <span className="absolute left-[17px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700" aria-hidden />
        {data.stages.map((stage, i) => {
          const isOpen = expanded === stage.stage;
          return (
            <motion.li
              key={`${stage.stage}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative flex items-start gap-3"
            >
              <div className="relative z-10 bg-white dark:bg-gray-900">
                <StageIcon stage={stage.stage} status={stage.status} />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <button
                  type="button"
                  disabled={!stage.description}
                  onClick={() => setExpanded(isOpen ? null : stage.stage)}
                  className="flex w-full items-center gap-2 text-left"
                >
                  <span
                    className={`text-sm font-semibold ${
                      stage.status === "completed"
                        ? "text-green-700 dark:text-green-400"
                        : stage.status === "current"
                          ? "text-indigo-700 dark:text-indigo-400"
                          : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {timelineLabels[stage.stage] ?? stage.label}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {statusText[stage.status] ?? stage.status}
                  </span>
                  {stage.description && (
                    <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  )}
                </button>
                {stage.date && (
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(stage.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
                <AnimatePresence>
                  {isOpen && stage.description && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 overflow-hidden text-xs text-gray-600 dark:text-gray-300"
                    >
                      {stage.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
