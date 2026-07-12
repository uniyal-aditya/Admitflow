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
  admissionPortal: string;
  contact?: { phone: string; email: string };
  courses: Course[];
  imageUrl?: string;
  description: string;
  established: number;
  accreditation?: string;
  affiliation?: string;
  principal?: string;
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
  aiSummary?: string;
  relatedNoticeIds: string[];
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: string;
  isBanned: boolean;
  createdAt: string;
  onboardingCompleted: boolean;
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

export interface Post {
  id: string;
  title: string | null;
  content: string;
  media: any;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: { id: string; name: string | null; avatar: string | null; role: string };
  _count: { comments: number };
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  media: any;
  isEdited: boolean;
  createdAt: string;
  user: { id: string; name: string | null; avatar: string | null; role: string };
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
