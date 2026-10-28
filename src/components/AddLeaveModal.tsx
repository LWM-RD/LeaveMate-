import React, { useState } from 'react';
import { 
  X, Calendar, Clock, HeartPulse, Coffee, Palmtree, 
  AlertCircle, CheckCircle2, Sparkles 
} from 'lucide-react';
import { LeaveRecord, LeaveCategory, LeaveDuration, Language } from '../types/leave';
import { LeaveSummary } from '../utils/storage';
import { getTranslation } from '../utils/translations';

interface AddLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLeave: (leave: Omit<LeaveRecord, 'id' | 'appliedDate' | 'status'>) => void;
  summary: Record<string, LeaveSummary>;
  lang: Language;
  selectedYear?: number;
}

export const AddLeaveModal: React.FC<AddLeaveModalProps> = ({
  isOpen,
  onClose,
  onAddLeave,
  summary,
  lang,
  selectedYear,
}) => {
  const t = getTranslation(lang);

  const defaultYear = selectedYear || new Date().getFullYear();
  const currentActualYear = new Date().getFullYear();
  const initialDateStr = defaultYear === currentActualYear 
    ? new Date().toISOString().split('T')[0] 
    : `${defaultYear}-01-15`;

  const [category, setCategory] = useState<LeaveCategory>('annual');
  const [duration, setDuration] = useState<LeaveDuration>('full');
  const [startDate, setStartDate] = useState<string>(initialDateStr);
  const [endDate, setEndDate] = useState<string>(initialDateStr);
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Calculate days count
  const calculateDays = (): number => {
    if (duration === 'half_morning' || duration === 'half_evening') {
      return 0.5;
    }
    if (duration === 'full') {
      return 1;
    }
    if (duration === 'multiple') {
      if (!startDate || !endDate) return 1;
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) return 0;
      
      // Calculate working days (excluding weekends)
      let count = 0;
      const cur = new Date(start);
      while (cur <= end) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6) {
          count++;
        }
        cur.setDate(cur.getDate() + 1);
      }
      return count === 0 ? 1 : count;
    }
    return 1;
  };

  const daysCount = calculateDays();
  const currentCategorySummary = summary[category] || { remaining: 0 };
  const isOverQuota = daysCount > currentCategorySummary.remaining;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg(lang === 'si' ? 'කරුණාකර නිවාඩුවට හේතුව ඇතුළත් කරන්න.' : 'Please enter the reason for leave.');
      return;
    }

    if (duration === 'multiple' && new Date(endDate) < new Date(startDate)) {
      setErrorMsg(lang === 'si' ? 'අවසාන දිනය ආරම්භක දිනයට පසුව විය යුතුය.' : 'End date must be after start date.');
      return;
    }

    onAddLeave({
      category,
      duration,
      startDate,
      endDate: duration === 'multiple' ? endDate : startDate,
      daysCount,
      reason: reason.trim(),
      notes: notes.trim()
    });

    onClose();
  };

  const quickReasons = lang === 'si' ? [
    'පෞද්ගලික හදිසි අවශ්‍යතාවයක් සඳහා',
    'වෛද්‍ය පරීක්ෂණයක් සඳහා (Hospital checkup)',
    'උණ සහ හිසරදය නිසා විවේක ගැනීම',
    'බැංකු සහ රජයේ කාර්යාල අවශ්‍යතාවයකට',
    'පවුලේ සාමාජිකයෙකුගේ විවාහ මංගල්‍යයක් සඳහා',
    'වාර්ෂික නිවාඩු සංචාරය'
  ] : [
    'Personal & family emergency errand',
    'Hospital & doctor checkup',
    'Fever & health rest recovery',
    'Banking and legal documentation',
    'Attending family wedding ceremony',
    'Annual vacation holiday'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              {t.modalTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'si' ? 'ඔබගේ නිවාඩු සටහන පහත විස්තර අනුව ඇතුළත් කරන්න' : 'Record your leave details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              1. {t.selectCategory}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'annual', label: t.annualLeave, icon: Palmtree, color: 'text-emerald-600' },
                { id: 'casual', label: t.casualLeave, icon: Coffee, color: 'text-blue-600' },
                { id: 'sick', label: t.sickLeave, icon: HeartPulse, color: 'text-rose-600' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = category === item.id;
                const rem = summary[item.id]?.remaining ?? 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCategory(item.id as LeaveCategory);
                      setErrorMsg('');
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-[11px] font-bold text-slate-800 leading-tight">
                      {item.label.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {lang === 'si' ? 'ඉතිරි' : 'Rem'}: <strong className="text-slate-800">{rem}</strong>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Duration: Full Day / Half Day / Multiple */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              2. {t.selectDuration}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDuration('full')}
                className={`p-2.5 text-xs font-semibold rounded-lg border text-left flex items-center justify-between cursor-pointer ${
                  duration === 'full'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span>{t.fullDay}</span>
                </div>
                <span className="text-[11px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                  1.0 {t.day}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDuration('half_morning')}
                className={`p-2.5 text-xs font-semibold rounded-lg border text-left flex items-center justify-between cursor-pointer ${
                  duration === 'half_morning'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.morningHalf}</span>
                </div>
                <span className="text-[11px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                  0.5 {t.day}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDuration('half_evening')}
                className={`p-2.5 text-xs font-semibold rounded-lg border text-left flex items-center justify-between cursor-pointer ${
                  duration === 'half_evening'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.eveningHalf}</span>
                </div>
                <span className="text-[11px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                  0.5 {t.day}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDuration('multiple')}
                className={`p-2.5 text-xs font-semibold rounded-lg border text-left flex items-center justify-between cursor-pointer ${
                  duration === 'multiple'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t.multiDay}</span>
                </div>
                <span className="text-[11px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                  Range
                </span>
              </button>
            </div>
          </div>

          {/* 3. Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {duration === 'multiple' ? t.startDate : t.date}
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (duration !== 'multiple') setEndDate(e.target.value);
                }}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {duration === 'multiple' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.endDate}
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Days Summary preview */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">
              {lang === 'si' ? 'අයවන නිවාඩු දින ගණන:' : 'Total Days Deducted:'}
            </span>
            <span className="font-extrabold text-indigo-700 text-sm bg-white px-3 py-1 rounded-md border border-indigo-200">
              {daysCount} {t.days}
            </span>
          </div>

          {isOverQuota && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                {t.balanceWarning.replace('{balance}', String(currentCategorySummary.remaining))}
              </span>
            </div>
          )}

          {/* 4. Reason & Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                {t.reasonLabel} <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {lang === 'si' ? 'කෙටි සටහනක්' : 'Brief explanation'}
              </span>
            </div>
            <input
              type="text"
              required
              placeholder={t.reasonPlaceholder}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />

            {/* Quick Suggestions */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickReasons.slice(0, 4).map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReason(q)}
                  className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-md transition-colors cursor-pointer"
                >
                  + {q}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-200 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.submitLeave}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
