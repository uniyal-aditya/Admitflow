/**
 * Static site content for the public pages (hero slides, quick links, featured colleges, footer).
 * Images live in /public/images — see docs/IMAGES.md for the exact files to add.
 * A missing image never breaks the page: SafeImage falls back to a navy panel.
 */

export interface HeroSlide {
  id: string;
  image: string;
  alt: string;
  title: string;
  text: string;
  cta: { label: string; href: string };
}

export const heroSlides: HeroSlide[] = [
  {
    id: "colleges",
    image: "/images/hero/hero-1.jpg",
    alt: "Snow-capped Himalayan peaks above a green valley in Uttarakhand",
    title: "Every Uttarakhand college admission notice, in one place",
    text: "Browse government and private colleges across all districts, with courses, seats and official links.",
    cta: { label: "Browse colleges", href: "/colleges" },
  },
  {
    id: "timeline",
    image: "/images/hero/hero-2.jpg",
    alt: "Students walking across a college campus",
    title: "See where each college stands in its admission process",
    text: "Registration, merit lists and counselling rounds are shown as a dated timeline for every college.",
    cta: { label: "View latest notices", href: "/notices" },
  },
  {
    id: "deadlines",
    image: "/images/hero/hero-3.jpg",
    alt: "Students filling out an admission form at a counselling desk",
    title: "Keep track of deadlines before they pass",
    text: "Add colleges to your watchlist and check the admission calendar for upcoming last dates.",
    cta: { label: "Open admission calendar", href: "/calendar" },
  },
  {
    id: "suggest",
    image: "/images/hero/hero-4.jpg",
    alt: "A heritage college building in Dehradun",
    title: "Is your college missing?",
    text: "Tell us about a college we have not listed yet and we will add it after checking its official sources.",
    cta: { label: "Suggest a college", href: "/suggest" },
  },
];

export const quickLinks = [
  { href: "/colleges", label: "College profiles", desc: "Courses, seats, fees and contacts", icon: "BookOpen" },
  { href: "/notices", label: "Notice center", desc: "Latest admission notices", icon: "Bell" },
  { href: "/calendar", label: "Admission calendar", desc: "Upcoming last dates", icon: "CalendarDays" },
  { href: "/search", label: "Search", desc: "Find a college or notice", icon: "Search" },
  { href: "/community", label: "Community", desc: "Ask and answer questions", icon: "MessageCircle" },
  { href: "/suggest", label: "Suggest a college", desc: "Help us list more colleges", icon: "Lightbulb" },
] as const;

/** Update when the seed data changes (counts are read from src/data in Phase 3). */
export const siteStats = [
  { value: "74", label: "Colleges listed" },
  { value: "13", label: "Districts covered" },
  { value: "Free", label: "No ads, no sign-up fee" },
];

export const featuredColleges = [
  { id: "doon-university", name: "Doon University", place: "Dehradun", kind: "State university" },
  { id: "gbpiet", name: "G.B. Pant Institute of Engineering and Technology", place: "Pauri Garhwal", kind: "Engineering college" },
  { id: "aiims-rishikesh", name: "AIIMS Rishikesh", place: "Rishikesh", kind: "Medical institute" },
  { id: "uktech", name: "Uttarakhand Technical University", place: "Dehradun", kind: "Technical university" },
  { id: "kumaun-university", name: "Kumaun University", place: "Nainital", kind: "State university" },
  { id: "uou-haldwani", name: "Uttarakhand Open University", place: "Haldwani", kind: "Open university" },
] as const;

export const howItWorks = [
  { title: "Find your college", text: "Search by name, district or type, or browse the full list of colleges." },
  { title: "Check notices and timeline", text: "Read the latest notices and see which admission stage is open." },
  { title: "Save and follow", text: "Add colleges to your watchlist so their updates are easy to find." },
];

export const navItems = [
  { href: "/colleges", label: "Colleges" },
  { href: "/notices", label: "Notices" },
  { href: "/calendar", label: "Calendar" },
  { href: "/community", label: "Community" },
  { href: "/search", label: "Search" },
];

export const mySpaceItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/analytics", label: "Analytics" },
  { href: "/suggest", label: "Suggest a college" },
  { href: "/settings", label: "Settings" },
  { href: "/profile", label: "Profile" },
];

export const SITE_DISCLAIMER =
  "AdmitFlow is an independent student information service. It is not an official government website and is not affiliated with any listed institution. Always confirm dates, fees and eligibility on the college's official website before applying.";
