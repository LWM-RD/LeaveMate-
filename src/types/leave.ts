export type LeaveCategory = 'annual' | 'casual' | 'sick' | 'special';

export type LeaveDuration = 'full' | 'half_morning' | 'half_evening' | 'multiple';

export type LeaveStatus = 'taken' | 'planned';

export interface LeaveRecord {
  id: string;
  category: LeaveCategory;
  duration: LeaveDuration;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number; // e.g. 1, 0.5, 2
  reason: string;
  appliedDate: string;
  status: LeaveStatus;
  notes?: string;
}

export interface LeaveQuota {
  year: number;
  annual: number; // typically 14
  casual: number; // typically 7
  sick: number;   // typically 7
  special: number; // e.g. 3 or 5
}

export type Language = 'en' | 'si';

