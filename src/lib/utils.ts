import { colleges } from "@/data/colleges";
import type { TimelineStage } from "@/types";

export function getCollegeName(id: string): string {
  return colleges.find((c) => c.id === id)?.name ?? id;
}

export function getCollegeShortName(id: string): string {
  return colleges.find((c) => c.id === id)?.shortName ?? id;
}

export function getCollege(id: string) {
  return colleges.find((c) => c.id === id);
}

export function getCollegeWebsite(id: string): string {
  return colleges.find((c) => c.id === id)?.website ?? "#";
}

export function getNoticeSourceUrl(notice: { collegeId: string; sourceUrl?: string }): string {
  return getCollegeWebsite(notice.collegeId) || notice.sourceUrl || "#";
}

export function getNoticePdfUrl(notice: { collegeId: string; pdfUrl?: string }): string {
  const college = getCollege(notice.collegeId);
  if (college?.admissionPortal) return college.admissionPortal;
  return college?.website ?? "#";
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function isDatePassed(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

export function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function noticeTypeColor(type: string): string {
  const colors: Record<string, string> = {
    admission: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    registration: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    counselling: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    spot_round: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    vacant_seat: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    merit_list: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
    waiting_list: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    fee_payment: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
    reporting: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
    extension: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
    general: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };
  return colors[type] ?? colors.general;
}

export function noticeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    admission: "Admission",
    registration: "Registration",
    counselling: "Counselling",
    spot_round: "Spot Round",
    vacant_seat: "Vacant Seat",
    merit_list: "Merit List",
    waiting_list: "Waiting List",
    fee_payment: "Fee Payment",
    reporting: "Reporting",
    extension: "Extension",
    general: "General",
  };
  return labels[type] ?? type;
}

export function collegeTypeLabel(type: string, ownership?: string): string {
  const typeMap: Record<string, string> = {
    university: "University",
    engineering: "Engineering College",
    polytechnic: "Polytechnic",
    degree: "Degree College",
    diploma: "Diploma",
    medical: "Medical College",
    management: "Management Institute",
    pharmacy: "Pharmacy College",
    law: "Law College",
    other: "College",
  };
  const ownMap: Record<string, string> = {
    government: "Govt.",
    private: "Private",
    deemed: "Deemed",
    aided: "Aided",
    autonomous: "Autonomous",
  };
  const typeLabel = typeMap[type] ?? "College";
  const ownLabel = ownership ? ownMap[ownership] : "";
  return ownLabel ? `${ownLabel} ${typeLabel}` : typeLabel;
}

export function ownershipColor(ownership: string): string {
  const colors: Record<string, string> = {
    government: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    private: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    deemed: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    aided: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    autonomous: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  };
  return colors[ownership] ?? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
}

export function ownershipLabel(ownership: string): string {
  const labels: Record<string, string> = {
    government: "Government",
    private: "Private",
    deemed: "Deemed University",
    aided: "Govt. Aided",
    autonomous: "Autonomous",
  };
  return labels[ownership] ?? ownership;
}

export function getComputedStatus(notice: { publishedDate: string; lastDate?: string; status: string }): "active" | "upcoming" | "expired" {
  const now = new Date();
  if (notice.lastDate && new Date(notice.lastDate) < now) return "expired";
  if (new Date(notice.publishedDate) > now) return "upcoming";
  return "active";
}

export function computeTimeline(timeline: {
  stages: { stage: string; label: string; date?: string; status: string; description?: string }[];
}) {
  const now = new Date();
  let foundCurrent = false;

  const stages = timeline.stages.map((s) => {
    if (!s.date) return { ...s, status: (foundCurrent ? "upcoming" : "current") as "completed" | "current" | "upcoming", stage: s.stage as TimelineStage };

    const stageDate = new Date(s.date);
    if (stageDate < now) {
      return { ...s, status: "completed" as const, stage: s.stage as TimelineStage };
    }
    if (!foundCurrent) {
      foundCurrent = true;
      return { ...s, status: "current" as const, stage: s.stage as TimelineStage };
    }
    return { ...s, status: "upcoming" as const, stage: s.stage as TimelineStage };
  });

  const currentStage = (stages.find((s) => s.status === "current")?.stage ?? stages[stages.length - 1]?.stage ?? "closed") as TimelineStage;

  return { currentStage, stages };
}

export const timelineLabels: Record<string, string> = {
  registration: "Registration",
  merit_list: "Merit List",
  counselling_1: "First Counselling",
  counselling_2: "Second Counselling",
  counselling_3: "Third Counselling",
  spot_round: "Spot Round",
  waiting_list: "Waiting List",
  closed: "Admission Closed",
};
