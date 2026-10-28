import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Info } from 'lucide-react';
import { LeaveRecord, Language } from '../types/leave';
import { getTranslation } from '../utils/translations';

interface LeaveCalendarProps {
  leaves: LeaveRecord[];
  lang: Language;
  onSelectDate?: (dateStr: string) => void;
  selectedYear?: number;
}

export const LeaveCalendar: React.FC<LeaveCalendarProps> = ({
  leaves,
  lang,
  onSelectDate,
  selectedYear
}) => {
  const t = getTranslation(lang);
  const initialYear = selectedYear || new Date().getFullYear();
  const [currentDate, setCurrentDate] = useState<Date>(new Date(initialYear, 0, 1));
  const [selectedDayRecord, setSelectedDayRecord] = useState<{ date: string; leaves: LeaveRecord[] } | null>(null);

  useEffect(() => {
    if (selectedYear) {
      setCurrentDate(new Date(selectedYear, currentDate.getMonth(), 1));
    }
  }, [selectedYear]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayRecord(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayRecord(null);
  };

  const monthNamesSi = [
    'ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි',
    'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'
  ];

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdaysSi = ['ඉරිදා', 'සඳුදා', 'අඟහ', 'බදාදා', 'බ්‍රහස්', 'සිකු', 'සෙන'];
  const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in month calculation
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Helper to check if a date string falls in leave record
  const getLeavesForDate = (dateStr: string): LeaveRecord[] => {
    return leaves.filter(l => {
      if (l.startDate === dateStr) return true;
      if (l.endDate && l.startDate <= dateStr && l.endDate >= dateStr) return true;
      return false;
    });
  };

  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'sick':
        return 'bg-rose-100 text-rose-700 border-rose-300';
      case 'casual':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'annual':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      default:
        return 'bg-purple-100 text-purple-700 border-purple-300';
    }
  };

  const getCategoryBadgeName = (cat: string) => {
    if (lang === 'si') {
      if (cat === 'sick') return 'ලෙඩ';
      if (cat === 'casual') return 'අනියම්';
      if (cat === 'annual') return 'වාර්ෂික';
      return 'විශේෂ';
    }
    return cat.toUpperCase();
  };

  const calendarDays = [];
  // Previous month trailing blanks
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ blank: true, key: `blank-${i}` });
  }
  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateStr(year, month, day);
    const dayLeaves = getLeavesForDate(dateStr);
    const dayOfWeek = new Date(year, month, day).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    calendarDays.push({
      blank: false,
      day,
      dateStr,
      leaves: dayLeaves,
      isWeekend,
      key: dateStr
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {lang === 'si' ? monthNamesSi[month] : monthNamesEn[month]} {year}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'si' ? 'නිවාඩු ලබාගත් දින දර්ශනය' : 'Monthly leave days breakdown'}
            </p>
          </div>
        </div>

        {/* Month Navigation & Legend */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            title="පසුගිය මාසය"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            {lang === 'si' ? 'අද' : 'Today'}
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            title="මීළඟ මාසය"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekdays Row */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center py-2 text-xs font-bold text-slate-500">
        {(lang === 'si' ? weekdaysSi : weekdaysEn).map((d, idx) => (
          <div key={idx} className={idx === 0 || idx === 6 ? 'text-rose-500' : ''}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-slate-100/40">
        {calendarDays.map((cell) => {
          if (cell.blank) {
            return <div key={cell.key} className="h-24 sm:h-28 bg-slate-50/60 p-1.5" />;
          }

          const hasLeave = cell.leaves && cell.leaves.length > 0;
          const isSelected = selectedDayRecord?.date === cell.dateStr;

          return (
            <div
              key={cell.key}
              onClick={() => {
                if (hasLeave && cell.dateStr && cell.leaves) {
                  setSelectedDayRecord({ date: cell.dateStr, leaves: cell.leaves });
                }
                if (cell.dateStr) {
                  onSelectDate?.(cell.dateStr);
                }
              }}
              className={`h-24 sm:h-28 p-1.5 transition-all relative flex flex-col justify-between ${
                cell.isWeekend ? 'bg-slate-50/70' : 'bg-white'
              } ${hasLeave ? 'hover:bg-indigo-50/40 cursor-pointer ring-inset' : ''} ${
                isSelected ? 'ring-2 ring-indigo-500 z-10 bg-indigo-50/60' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold inline-block px-1.5 py-0.5 rounded-md ${
                    cell.isWeekend
                      ? 'text-rose-500'
                      : hasLeave
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-700'
                  }`}
                >
                  {cell.day}
                </span>

                {hasLeave && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-indigo-100" />
                )}
              </div>

              {/* Leave Badges inside day */}
              <div className="mt-1 space-y-1 overflow-hidden">
                {cell.leaves?.map((l) => (
                  <div
                    key={l.id}
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate flex items-center justify-between gap-1 ${getCategoryColor(
                      l.category
                    )}`}
                    title={`${l.reason} (${l.duration === 'full' ? 'Full Day' : 'Half Day'})`}
                  >
                    <span className="truncate">{getCategoryBadgeName(l.category)}</span>
                    <span className="shrink-0 text-[9px] font-bold">
                      {l.duration === 'full' ? '1.0' : '0.5'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Weekend indicator if no leave */}
              {cell.isWeekend && !hasLeave && (
                <div className="text-[10px] text-slate-400 font-medium text-right self-end">
                  {lang === 'si' ? 'සති අන්ත' : 'Weekend'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Info Popup / Bar */}
      {selectedDayRecord && (
        <div className="p-4 bg-indigo-50/70 border-t border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900">
                {selectedDayRecord.date}:{' '}
              </span>
              <span className="text-slate-700">
                {selectedDayRecord.leaves.map(l => (
                  `${l.reason} [${l.category.toUpperCase()} - ${l.duration === 'full' ? 'පූර්ණ දින (1.0)' : 'අර්ධ දින (0.5)'}]`
                )).join(', ')}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedDayRecord(null)}
            className="text-slate-500 hover:text-slate-800 text-xs font-semibold self-end sm:self-auto cursor-pointer"
          >
            {lang === 'si' ? 'වසන්න (Close)' : 'Close'}
          </button>
        </div>
      )}

      {/* Legend Footer */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-semibold text-slate-700">{lang === 'si' ? 'වර්ගීකරණය:' : 'Legend:'}</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>{t.casualLeave}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span>{t.sickLeave}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>{t.annualLeave}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span>{t.specialLeave}</span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">
          💡 {lang === 'si' ? 'දිනක් මත ක්ලික් කර විස්තර බලන්න' : 'Click a date to view details'}
        </div>
      </div>
    </div>
  );
};
