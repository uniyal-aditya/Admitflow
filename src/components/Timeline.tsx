"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, Circle, Loader, Clock,
  FileText, CalendarCheck, Users, ListOrdered,
  UserCheck, MapPin, AlertTriangle, ChevronDown,
} from "lucide-react";
import { TimelineData, TimelineStage } from "@/types";
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

function StageIcon({ stage, status, isCurrent }: { stage: string; status: string; isCurrent: boolean }) {
  const Icon = stageIcons[stage] || Circle;
  if (status === "completed") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
      </div>
    );
  }
  if (isCurrent) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900">
        <Loader className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
      <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
    </div>
  );
}

export function Timeline({ data }: { data: TimelineData }) {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const currentIndex = data.stages.findIndex((s) => s.stage === data.currentStage);

  const hasDateIssues = data.stages.some((s, i) => {
    if (i === 0 || !s.date) return false;
    const prevDate = data.stages[i - 1]?.date;
    if (!prevDate) return false;
    return new Date(s.date) < new Date(prevDate);
  });

  return (
    <div className="relative">
      {hasDateIssues && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Timeline dates may be out of order
        </div>
      )}

      {/* Desktop horizontal */}
      <div className="hidden lg:block">
        <div className="relative flex justify-between">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${data.stages.length > 1 ? (currentIndex / (data.stages.length - 1)) * 100 : 0}%` }}
            />
          </div>
          {data.stages.map((stage, i) => {
            const isCurrent = stage.stage === data.currentStage;
            const isExpanded = expandedStage === stage.stage;
            return (
              <motion.button
                key={stage.stage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setExpandedStage(isExpanded ? null : stage.stage)}
                className="relative flex flex-col items-center gap-2 pt-1 group"
              >
                <StageIcon stage={stage.stage} status={stage.status} isCurrent={isCurrent} />
                <div className="text-center">
                  <span className={`block text-xs font-semibold whitespace-nowrap ${
                    stage.status === "completed" ? "text-green-600 dark:text-green-400" :
                    isCurrent ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500"
                  }`}>
                    {timelineLabels[stage.stage] ?? stage.label}
                  </span>
                  {stage.date && (
                    <span className="text-[10px] text-gray-400">{new Date(stage.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  )}
                </div>
                {isCurrent && (
                  <span className="absolute -top-1 right-0 inline-flex items-center rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    Now
                  </span>
                )}
                <AnimatePresence>
                  {isExpanded && stage.description && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="absolute top-16 z-20 w-56 rounded-xl border bg-white p-3 shadow-lg dark:bg-gray-900 dark:border-gray-700 text-left"
                    >
                      <p className="text-xs text-gray-600 dark:text-gray-300">{stage.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Mobile vertical */}
      <div className="lg:hidden relative">
        <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-4">
          {data.stages.map((stage, i) => {
            const isCurrent = stage.stage === data.currentStage;
            const isExpanded = expandedStage === stage.stage;
            return (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="relative flex items-start gap-3"
              >
                <div className="relative z-10">
                  <StageIcon stage={stage.stage} status={stage.status} isCurrent={isCurrent} />
                </div>
                <div className="flex-1 pt-1.5 min-w-0">
                  <button
                    onClick={() => setExpandedStage(isExpanded ? null : stage.stage)}
                    className="flex items-center gap-1.5 text-left"
                  >
                    <span className={`text-sm font-semibold ${
                      stage.status === "completed" ? "text-green-700 dark:text-green-400" :
                      isCurrent ? "text-indigo-700 dark:text-indigo-400" : "text-gray-500"
                    }`}>
                      {timelineLabels[stage.stage] ?? stage.label}
                    </span>
                    {stage.description && (
                      <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    )}
                    {isCurrent && (
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                        Current
                      </span>
                    )}
                  </button>
                  {stage.date && (
                    <p className="text-xs text-gray-400">{new Date(stage.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
                  )}
                  <AnimatePresence>
                    {isExpanded && stage.description && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1 text-xs text-gray-500 dark:text-gray-400 overflow-hidden"
                      >
                        {stage.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
