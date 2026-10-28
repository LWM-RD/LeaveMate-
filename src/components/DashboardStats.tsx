import React from 'react';
import { Palmtree, Coffee, HeartPulse, PieChart, Clock, CalendarCheck } from 'lucide-react';
import { LeaveSummary } from '../utils/storage';
import { Language } from '../types/leave';
import { getTranslation } from '../utils/translations';

interface DashboardStatsProps {
  summary: Record<string, LeaveSummary>;
  lang: Language;
  onFilterByCategory?: (category: string) => void;
  selectedCategory?: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  summary,
  lang,
  onFilterByCategory,
  selectedCategory,
}) => {
  const t = getTranslation(lang);

  const annual = summary['annual'] || { allowed: 14, taken: 0, remaining: 14, percentage: 0, halfDaysCount: 0, fullDaysCount: 0 };
  const casual = summary['casual'] || { allowed: 7, taken: 0, remaining: 7, percentage: 0, halfDaysCount: 0, fullDaysCount: 0 };
  const sick = summary['sick'] || { allowed: 7, taken: 0, remaining: 7, percentage: 0, halfDaysCount: 0, fullDaysCount: 0 };

  const totalAllowed = annual.allowed + casual.allowed + sick.allowed;
  const totalTaken = annual.taken + casual.taken + sick.taken;
  const totalRemaining = Math.max(0, totalAllowed - totalTaken);
  const totalPercentage = totalAllowed > 0 ? Math.round((totalTaken / totalAllowed) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Overall Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 md:p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5" />
              {t.quickStatsTitle}
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              {lang === 'si'
                ? `ඉතිරිව ඇති මුළු නිවාඩු: දින ${totalRemaining}`
                : `Total Remaining Leaves: ${totalRemaining} Days`}
            </h2>
            <p className="text-xs text-slate-300">
              {lang === 'si'
                ? `ඔබට හිමි මුළු දින ${totalAllowed} න් මේ වන විට දින ${totalTaken} ක් ලබාගෙන ඇත.`
                : `You have taken ${totalTaken} days out of your total ${totalAllowed} annual quota.`}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 bg-white/10 p-3.5 rounded-xl border border-white/10 shrink-0">
            <div className="text-center">
              <span className="block text-2xl font-black text-emerald-400">
                {totalRemaining}
              </span>
              <span className="text-[11px] font-medium text-slate-300 uppercase">
                {t.remaining}
              </span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <span className="block text-2xl font-black text-amber-400">
                {totalTaken}
              </span>
              <span className="text-[11px] font-medium text-slate-300 uppercase">
                {t.taken}
              </span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <span className="block text-2xl font-black text-indigo-200">
                {totalAllowed}
              </span>
              <span className="text-[11px] font-medium text-slate-300 uppercase">
                {t.totalAllowed}
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="flex justify-between items-center text-xs text-slate-300 mb-1 font-medium">
            <span>{t.leaveUsageRate}</span>
            <span>{totalTaken} / {totalAllowed} {t.days} ({totalPercentage}%)</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                totalPercentage > 80 ? 'bg-rose-500' : totalPercentage > 50 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, totalPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Main Leave Cards: Annual, Casual, Sick */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Annual Leave Card */}
        <div 
          onClick={() => onFilterByCategory?.(selectedCategory === 'annual' ? 'all' : 'annual')}
          className={`bg-white rounded-xl border p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer relative group ${
            selectedCategory === 'annual' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Palmtree className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {t.annualLeave}
                </h3>
                <span className="text-[11px] text-slate-500">
                  {lang === 'si' ? 'වාර්ෂික නිවාඩු' : 'Vacation & Annual'}
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {annual.allowed} {t.days}
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900">
                {annual.remaining}{' '}
                <span className="text-xs font-semibold text-emerald-700">{t.remaining}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.taken}: <strong className="text-slate-800 font-bold">{annual.taken}</strong> {t.days}
              </p>
            </div>
            {annual.halfDaysCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                <Clock className="w-3 h-3" />
                {annual.halfDaysCount} {lang === 'si' ? 'අර්ධ දින' : 'half-day'}
              </span>
            )}
          </div>

          <div className="mt-3.5 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>{annual.taken} / {annual.allowed} {t.days}</span>
              <span>{annual.percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${annual.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Casual Leave Card */}
        <div 
          onClick={() => onFilterByCategory?.(selectedCategory === 'casual' ? 'all' : 'casual')}
          className={`bg-white rounded-xl border p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer relative group ${
            selectedCategory === 'casual' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-400'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {t.casualLeave}
                </h3>
                <span className="text-[11px] text-slate-500">
                  {lang === 'si' ? 'අනියම් කටයුතු' : 'Personal Errands'}
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {casual.allowed} {t.days}
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900">
                {casual.remaining}{' '}
                <span className="text-xs font-semibold text-blue-700">{t.remaining}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.taken}: <strong className="text-slate-800 font-bold">{casual.taken}</strong> {t.days}
              </p>
            </div>
            {casual.halfDaysCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                <Clock className="w-3 h-3" />
                {casual.halfDaysCount} {lang === 'si' ? 'අර්ධ දින' : 'half-day'}
              </span>
            )}
          </div>

          <div className="mt-3.5 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>{casual.taken} / {casual.allowed} {t.days}</span>
              <span>{casual.percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${casual.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. Sick Leave Card */}
        <div 
          onClick={() => onFilterByCategory?.(selectedCategory === 'sick' ? 'all' : 'sick')}
          className={`bg-white rounded-xl border p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer relative group ${
            selectedCategory === 'sick' ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200 hover:border-rose-400'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                  {t.sickLeave}
                </h3>
                <span className="text-[11px] text-slate-500">
                  {lang === 'si' ? 'වෛද්‍ය / සනීපාරක්ෂක' : 'Medical & Health'}
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              {sick.allowed} {t.days}
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900">
                {sick.remaining}{' '}
                <span className="text-xs font-semibold text-rose-700">{t.remaining}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.taken}: <strong className="text-slate-800 font-bold">{sick.taken}</strong> {t.days}
              </p>
            </div>
            {sick.halfDaysCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                <Clock className="w-3 h-3" />
                {sick.halfDaysCount} {lang === 'si' ? 'අර්ධ දින' : 'half-day'}
              </span>
            )}
          </div>

          <div className="mt-3.5 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span>{sick.taken} / {sick.allowed} {t.days}</span>
              <span>{sick.percentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${sick.percentage}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
