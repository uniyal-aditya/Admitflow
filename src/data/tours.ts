/**
 * Guided-tour definitions. A step with no `selectors` is shown centred (welcome / finish).
 * A step with selectors points at the first matching element that is actually visible;
 * if none is visible (for example desktop-only links on a phone) the step is skipped.
 * Add `data-tour="..."` to any element to make it a target.
 */

export interface TourStep {
  id: string;
  title: string;
  text: string;
  selectors?: string[];
}

export interface Tour {
  id: string;
  /** localStorage key that remembers the tour was finished or skipped. */
  storageKey: string;
  /** Start automatically on a visitor's first visit to a matching page. */
  auto: boolean;
  steps: TourStep[];
}

export const siteTour: Tour = {
  id: "site",
  storageKey: "af_tour_site_v1",
  auto: true,
  steps: [
    {
      id: "welcome",
      title: "Welcome to AdmitFlow",
      text: "This short tour shows you where everything is. You can skip it at any time and start it again later from the Guide button at the top of the page.",
    },
    {
      id: "search",
      title: "Search",
      text: "Type a college name, a course or a notice here and press Enter to see the results.",
      selectors: ['[data-tour="search"]'],
    },
    {
      id: "menu",
      title: "Menu",
      text: "Open the menu to reach Colleges, Notices, Calendar, Community and Search.",
      selectors: ['[data-tour="menu"]'],
    },
    {
      id: "nav-colleges",
      title: "Colleges",
      text: "Browse every listed college. Filter by type, ownership or district, then open a college for its courses, seats, fees and official website.",
      selectors: ['[data-tour="nav-colleges"]'],
    },
    {
      id: "nav-notices",
      title: "Notices",
      text: "Read the latest admission notices, such as registration, merit lists and counselling rounds.",
      selectors: ['[data-tour="nav-notices"]'],
    },
    {
      id: "nav-calendar",
      title: "Calendar",
      text: "See last dates and important dates for all notices on one calendar.",
      selectors: ['[data-tour="nav-calendar"]'],
    },
    {
      id: "account",
      title: "Your account",
      text: "Sign in with Google to follow colleges, keep a watchlist and see alerts on your dashboard.",
      selectors: ['[data-tour="account"]'],
    },
    {
      id: "accessibility",
      title: "Text size and theme",
      text: "Make the text smaller or larger here. The button next to it switches between the light and dark theme.",
      selectors: ['[data-tour="accessibility"]'],
    },
    {
      id: "install",
      title: "Get the app",
      text: "Install AdmitFlow on your phone or computer so it opens like an app.",
      selectors: ['[data-tour="install"]'],
    },
    {
      id: "finish",
      title: "You are all set",
      text: "Tip: on any college page, select the star to follow that college. You can replay this tour any time with the Guide button.",
    },
  ],
};

export const collegeTour: Tour = {
  id: "college",
  storageKey: "af_tour_college_v1",
  auto: true,
  steps: [
    {
      id: "official-site",
      title: "Official website",
      text: "Always confirm dates, fees and eligibility on the college's own website before you apply.",
      selectors: ['[data-tour="official-site"]'],
    },
    {
      id: "watch-star",
      title: "Follow this college",
      text: "Select the star to add this college to your watchlist. Its notices and deadlines will then appear on your dashboard.",
      selectors: ['[data-tour="watch-star"]'],
    },
    {
      id: "courses",
      title: "Courses",
      text: "Seats, yearly fees and eligibility for each course are listed in this table.",
      selectors: ['[data-tour="courses"]'],
    },
    {
      id: "timeline",
      title: "Admission timeline",
      text: "Each stage shows its date and whether it is completed, ongoing or upcoming.",
      selectors: ['[data-tour="timeline"]'],
    },
  ],
};

export function tourForPath(pathname: string): Tour | null {
  if (pathname === "/" || pathname === "/dashboard") return siteTour;
  if (/^\/colleges\/[^/]+$/.test(pathname)) return collegeTour;
  return null;
}
