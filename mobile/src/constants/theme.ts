export const Colors = {
  light: {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    secondary: '#7c3aed',
    accent: '#06b6d4',
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceVariant: '#f1f5f9',
    card: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    tabActive: '#2563eb',
    tabInactive: '#94a3b8',
    statusBar: 'dark-content' as const,
  },
  dark: {
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#2563eb',
    secondary: '#8b5cf6',
    accent: '#22d3ee',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceVariant: '#334155',
    card: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    border: '#334155',
    borderLight: '#1e293b',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#60a5fa',
    tabActive: '#3b82f6',
    tabInactive: '#64748b',
    statusBar: 'light-content' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const API_BASE_URL = 'https://admitflowin.vercel.app';

export const NoticeTypeLabels: Record<string, string> = {
  admission: 'Admission',
  registration: 'Registration',
  counselling: 'Counselling',
  spot_round: 'Spot Round',
  vacant_seat: 'Vacant Seat',
  merit_list: 'Merit List',
  waiting_list: 'Waiting List',
  fee_payment: 'Fee Payment',
  reporting: 'Reporting',
  extension: 'Extension',
  general: 'General',
};

export const NoticeTypeColors: Record<string, string> = {
  admission: '#2563eb',
  registration: '#7c3aed',
  counselling: '#06b6d4',
  spot_round: '#f59e0b',
  vacant_seat: '#ef4444',
  merit_list: '#10b981',
  waiting_list: '#8b5cf6',
  fee_payment: '#ec4899',
  reporting: '#14b8a6',
  extension: '#f97316',
  general: '#64748b',
};

export const CollegeTypeLabels: Record<string, string> = {
  university: 'University',
  engineering: 'Engineering',
  polytechnic: 'Polytechnic',
  degree: 'Degree',
  diploma: 'Diploma',
  medical: 'Medical',
  management: 'Management',
  pharmacy: 'Pharmacy',
  law: 'Law',
  other: 'Other',
};
