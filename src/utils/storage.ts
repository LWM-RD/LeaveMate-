import { LeaveRecord, LeaveQuota, Language } from '../types/leave';

const STORAGE_KEYS = {
  LEAVES: 'leavemate_my_leaves_v2',
  QUOTA: 'leavemate_my_quota_v2',
  LANG: 'leavemate_my_lang_v2'
};

const DEFAULT_QUOTA: LeaveQuota = {
  year: 2026,
  annual: 14,
  casual: 7,
  sick: 7,
  special: 5
};

const INITIAL_LEAVES: LeaveRecord[] = [
  {
    id: 'leave-1',
    category: 'annual',
    duration: 'full',
    startDate: '2026-04-10',
    endDate: '2026-04-11',
    daysCount: 2,
    reason: 'Family trip for Sinhala New Year',
    appliedDate: '2026-04-01',
    status: 'taken'
  },
  {
    id: 'leave-2',
    category: 'casual',
    duration: 'half_morning',
    startDate: '2026-03-06',
    endDate: '2026-03-06',
    daysCount: 0.5,
    reason: 'Bank & government paperwork',
    appliedDate: '2026-03-05',
    status: 'taken'
  },
  {
    id: 'leave-3',
    category: 'sick',
    duration: 'full',
    startDate: '2026-02-18',
    endDate: '2026-02-19',
    daysCount: 2,
    reason: 'Viral flu & doctor advice rest',
    appliedDate: '2026-02-18',
    status: 'taken'
  },
  {
    id: 'leave-4',
    category: 'casual',
    duration: 'full',
    startDate: '2026-01-12',
    endDate: '2026-01-12',
    daysCount: 1,
    reason: 'Personal urgent errand',
    appliedDate: '2026-01-10',
    status: 'taken'
  },
  {
    id: 'leave-5',
    category: 'sick',
    duration: 'half_evening',
    startDate: '2026-05-08',
    endDate: '2026-05-08',
    daysCount: 0.5,
    reason: 'Medical checkup appointment',
    appliedDate: '2026-05-07',
    status: 'taken'
  }
];

export const getStoredLeaves = (): LeaveRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEAVES);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading leaves:', err);
    return [];
  }
};

export const getInitialSampleLeaves = (): LeaveRecord[] => {
  return INITIAL_LEAVES;
};

export const saveLeaves = (leaves: LeaveRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
  } catch (err) {
    console.error('Error saving leaves:', err);
  }
};

export const getStoredQuota = (): LeaveQuota => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUOTA);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(DEFAULT_QUOTA));
      return DEFAULT_QUOTA;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading quota:', err);
    return DEFAULT_QUOTA;
  }
};

export const saveQuota = (quota: LeaveQuota): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.QUOTA, JSON.stringify(quota));
  } catch (err) {
    console.error('Error saving quota:', err);
  }
};

export const getStoredLanguage = (): Language => {
  try {
    const lang = localStorage.getItem(STORAGE_KEYS.LANG);
    return (lang === 'en' || lang === 'si') ? lang : 'en';
  } catch {
    return 'en';
  }
};

export const saveLanguage = (lang: Language): void => {
  localStorage.setItem(STORAGE_KEYS.LANG, lang);
};

export interface LeaveSummary {
  category: 'annual' | 'casual' | 'sick' | 'special';
  allowed: number;
  taken: number;
  remaining: number;
  percentage: number;
  halfDaysCount: number;
  fullDaysCount: number;
}

export const calculateLeaveSummary = (leaves: LeaveRecord[], quota: LeaveQuota, year: number): Record<string, LeaveSummary> => {
  const yearLeaves = leaves.filter(l => {
    const leaveYear = new Date(l.startDate).getFullYear();
    return leaveYear === year;
  });

  const categories: ('annual' | 'casual' | 'sick' | 'special')[] = ['annual', 'casual', 'sick', 'special'];
  const summary: Record<string, LeaveSummary> = {};

  categories.forEach(cat => {
    const catLeaves = yearLeaves.filter(l => l.category === cat);
    const taken = catLeaves.reduce((sum, l) => sum + (l.daysCount || 0), 0);
    const allowed = quota[cat] || 0;
    const remaining = Math.max(0, allowed - taken);
    const percentage = allowed > 0 ? Math.min(100, Math.round((taken / allowed) * 100)) : 0;
    const halfDaysCount = catLeaves.filter(l => l.duration === 'half_morning' || l.duration === 'half_evening').length;
    const fullDaysCount = catLeaves.filter(l => l.duration === 'full' || l.duration === 'multiple').length;

    summary[cat] = {
      category: cat,
      allowed,
      taken,
      remaining,
      percentage,
      halfDaysCount,
      fullDaysCount
    };
  });

  return summary;
};
