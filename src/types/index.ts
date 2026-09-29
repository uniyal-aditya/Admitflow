export type CollegeType = "university" | "engineering" | "polytechnic" | "degree" | "diploma" | "medical" | "management" | "pharmacy" | "law" | "other";
export type Ownership = "government" | "private" | "aided" | "deemed" | "autonomous";
export type NoticeType = "admission" | "registration" | "counselling" | "spot_round" | "vacant_seat" | "merit_list" | "waiting_list" | "fee_payment" | "reporting" | "extension" | "general";
export type NoticeStatus = "active" | "upcoming" | "expired";
export type TimelineStage = "registration" | "merit_list" | "counselling_1" | "counselling_2" | "counselling_3" | "spot_round" | "waiting_list" | "closed";

export interface College {
  id: string;
  name: string;
  shortName: string;
  type: CollegeType;
  ownership: Ownership;
  location: string;
  district: string;
  website: string;
  /** Legacy static-data field (pattern-generated); the canonical domain has no admission portal. */
  admissionPortal?: string;
  contact?: { phone: string; email: string };
  courses: Course[];
  imageUrl?: string;
  description: string;
  established: number;
  accreditation?: string;
  affiliation?: string;
  principal?: string;
  isSuggested?: boolean;
}

export interface Course {
  name: string;
  duration: string;
  seats: number;
  fees: number;
  eligibility: string;
  branches?: string[];
}

export interface Notice {
  id: string;
  collegeId: string;
  /** Short name resolved server-side from the DB; absent on legacy static data. */
  collegeShortName?: string;
  title: string;
  type: NoticeType;
  publishedDate: string;
  lastDate?: string;
  status: NoticeStatus;
  summary: string;
  highlights: string[];
  pdfUrl: string;
  sourceUrl: string;
  coursesAffected: string[];
  branchesAffected: string[];
  deadlines: { label: string; date: string }[];
  documentsRequired: string[];
  eligibility: string;
  importantDates: { label: string; date: string }[];
  /** Legacy static-data field; AI-generated content was removed in Phase 5 — never populated by the canonical pipeline. */
  aiSummary?: string;
  relatedNoticeIds: string[];
}

export interface TimelineData {
  collegeId?: string;
  currentStage: TimelineStage;
  stages: {
    stage: TimelineStage;
    label: string;
    date?: string;
    status: "completed" | "current" | "upcoming";
    description?: string;
  }[];
}

export interface UserSettings {
  favoriteColleges: string[];
  notificationTypes: NoticeType[];
  scanFrequency: number;
  downloadLocation: string;
  theme: "light" | "dark" | "system";
  language: "en" | "hi";
  startOnBoot: boolean;
  email?: string;
  emailNotifications: boolean;
  deviceNotifications: boolean;
}

export interface DownloadRecord {
  id: string;
  noticeId: string;
  noticeTitle: string;
  collegeName: string;
  downloadedAt: string;
}

export interface NotificationItem {
  id: string;
  type: NoticeType;
  title: string;
  collegeName: string;
  message: string;
  read: boolean;
  createdAt: string;
  noticeId?: string;
}

export interface DashboardStats {
  totalNotices: number;
  noticesThisWeek: number;
  mostActiveCollege: string;
  upcomingDeadlines: number;
  spotRoundsConducted: number;
  vacantSeatNotices: number;
  downloadCount: number;
  activeNotices: number;
  totalColleges: number;
}
