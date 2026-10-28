import React, { useState } from 'react';
import { 
  Calendar, Search, Filter, Trash2, Edit2, AlertCircle, 
  CheckCircle2, Clock, Coffee, HeartPulse, Palmtree, ArrowUpDown,
  RefreshCw, AlertTriangle, X
} from 'lucide-react';
import { LeaveRecord, Language, LeaveCategory, LeaveDuration } from '../types/leave';
import { getTranslation } from '../utils/translations';

interface LeaveHistoryTableProps {
  leaves: LeaveRecord[];
  lang: Language;
  onDeleteLeave: (id: string) => Promise<void> | void;
  onEditLeave?: (record: LeaveRecord) => void;
  selectedCategoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const LeaveHistoryTable: React.FC<LeaveHistoryTableProps> = ({
  leaves,
  lang,
  onDeleteLeave,
  onEditLeave,
  selectedCategoryFilter,
  onCategoryFilterChange,
  onSync,
  isSyncing = false,
}) => {
  const t = getTranslation(lang);
  const [searchQuery, setSearchQuery] = useState('');
  const [durationFilter, setDurationFilter] = useState<'all' | 'full' | 'half'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [recordToDelete, setRecordToDelete] = useState<LeaveRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Filter leaves
  const filteredLeaves = leaves.filter((item) => {
    // Category match
    if (selectedCategoryFilter !== 'all' && item.category !== selectedCategoryFilter) {
      return false;
    }

    // Duration match (full vs half)
    if (durationFilter === 'full' && item.duration !== 'full' && item.duration !== 'multiple') {
      return false;
    }
    if (durationFilter === 'half' && item.duration !== 'half_morning' && item.duration !== 'half_evening') {
      return false;
    }

    // Search query match (date or reason)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const inReason = item.reason.toLowerCase().includes(q);
      const inDate = item.startDate.includes(q) || (item.endDate && item.endDate.includes(q));
      if (!inReason && !inDate) return false;
    }

    return true;
  });

  // Sort by date
  const sortedLeaves = [...filteredLeaves].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const getCategoryBadge = (category: LeaveCategory) => {
    switch (category) {
      case 'casual':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Coffee className="w-3.5 h-3.5 text-blue-600" />
            {t.casualLeave}
          </span>
        );
      case 'sick':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
            {t.sickLeave}
          </span>
        );
      case 'annual':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Palmtree className="w-3.5 h-3.5 text-emerald-600" />
            {t.annualLeave}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <AlertCircle className="w-3.5 h-3.5 text-purple-600" />
            {t.specialLeave}
          </span>
        );
    }
  };

  const getDurationBadge = (duration: LeaveDuration, daysCount: number) => {
    if (duration === 'full') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-slate-700" />
          {t.fullDay}
        </span>
      );
    }
    if (duration === 'half_morning') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          {t.morningHalf}
        </span>
      );
    }
    if (duration === 'half_evening') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          {t.eveningHalf}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200">
        <Calendar className="w-3 h-3 text-indigo-600" />
        {daysCount} {t.days} ({t.multiDay})
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{t.leavesList}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              {filteredLeaves.length} {t.days}
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            {lang === 'si'
              ? 'ඔබ ලබාගත් සියලුම නිවාඩු දින, වර්ගය (Full day / Half day) සහ හේතු විස්තර මෙහි දැක්වේ.'
              : 'Detailed breakdown of all leave dates, types (Full day / Half day), and reasons.'}
          </p>
        </div>

        {/* Filter Badges / Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Duration Selector: All / Full Day / Half Day */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setDurationFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                durationFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'si' ? 'සියල්ල' : 'All'}
            </button>
            <button
              onClick={() => setDurationFilter('full')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                durationFilter === 'full' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'si' ? 'පූර්ණ දින' : 'Full Day'}
            </button>
            <button
              onClick={() => setDurationFilter('half')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                durationFilter === 'half' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'si' ? 'අර්ධ දින (Half)' : 'Half Day'}
            </button>
          </div>

          {/* Sort button */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer"
            title={lang === 'si' ? 'දිනය අනුව පෙළගස්වන්න' : 'Sort by date'}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {sortOrder === 'desc'
                ? (lang === 'si' ? 'අලුත්ම' : 'Newest')
                : (lang === 'si' ? 'පැරණිම' : 'Oldest')}
            </span>
          </button>

          {/* Sync Button */}
          {onSync && (
            <button
              onClick={onSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isSyncing
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-500 cursor-not-allowed'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 shadow-2xs'
              }`}
              title="Sync data with Firebase Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-500 font-semibold shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          {lang === 'si' ? 'වර්ගය අනුව:' : 'Filter:'}
        </span>
        {[
          { id: 'all', label: t.filterAll },
          { id: 'casual', label: t.casualLeave },
          { id: 'sick', label: t.sickLeave },
          { id: 'annual', label: t.annualLeave },
          { id: 'special', label: t.specialLeave }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategoryFilterChange(cat.id)}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
              selectedCategoryFilter === cat.id
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
            <tr>
              <th className="px-5 py-3">{t.date}</th>
              <th className="px-5 py-3">{t.category}</th>
              <th className="px-5 py-3">{t.duration}</th>
              <th className="px-5 py-3 text-center">{t.daysCount}</th>
              <th className="px-5 py-3">{t.reason}</th>
              <th className="px-5 py-3">{t.status}</th>
              <th className="px-5 py-3 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedLeaves.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-2">
                    <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-700">{t.noLeavesFound}</p>
                    <p className="text-[11px] text-slate-400">
                      {lang === 'si'
                        ? 'ඔබට ඉහළ ඇති "+ Apply Leave" බොත්තම මඟින් නව නිවාඩුවක් එක් කළ හැක.'
                        : 'Use the "+ Apply Leave" button above to log your first leave.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedLeaves.map((record) => {
                const isSingleDay = record.startDate === record.endDate;
                return (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Date */}
                    <td className="px-5 py-3.5 whitespace-nowrap font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <span className="font-bold">{record.startDate}</span>
                          {!isSingleDay && (
                            <span className="text-slate-500"> → {record.endDate}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getCategoryBadge(record.category)}
                    </td>

                    {/* Duration: Full Day / Half Day */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {getDurationBadge(record.duration, record.daysCount)}
                    </td>

                    {/* Days Count */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <span className="font-extrabold text-slate-800 text-sm bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        {record.daysCount}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="px-5 py-3.5 max-w-xs text-slate-700">
                      <p className="font-medium truncate" title={record.reason}>
                        {record.reason}
                      </p>
                      {record.appliedDate && (
                        <p className="text-[10px] text-slate-400">
                          {lang === 'si' ? 'ඉල්ලුම් කළේ:' : 'Applied:'} {record.appliedDate}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {record.status === 'taken' ? t.statusTaken : t.statusApproved}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setRecordToDelete(record)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* In-App Delete Confirmation Modal (solves iframe popup restrictions) */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 pb-3 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'si' ? 'නිවාඩු වාර්තාව ඉවත් කරන්නද?' : 'Delete Leave Record?'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'si'
                    ? 'මෙම වාර්තාව ඔබගේ දත්ත ගබඩාවෙන් (Firebase Cloud) ස්ථිරවම ඉවත් කරනු ඇත.'
                    : 'This record will be permanently deleted from your Firebase Cloud Database.'}
                </p>
              </div>
              <button
                onClick={() => setRecordToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Record details */}
            <div className="mx-5 my-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t.date}:</span>
                <span className="font-bold text-slate-800">
                  {recordToDelete.startDate}
                  {recordToDelete.endDate && recordToDelete.endDate !== recordToDelete.startDate ? ` → ${recordToDelete.endDate}` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t.category}:</span>
                <span className="capitalize font-semibold text-slate-700">{recordToDelete.category} Leave</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t.daysCount}:</span>
                <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {recordToDelete.daysCount} {t.days}
                </span>
              </div>
              {recordToDelete.reason && (
                <div className="flex items-start justify-between gap-3 pt-1 border-t border-slate-200">
                  <span className="text-slate-500 shrink-0">{t.reason}:</span>
                  <span className="text-slate-700 text-right truncate">{recordToDelete.reason}</span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await onDeleteLeave(recordToDelete.id);
                    setRecordToDelete(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-all shadow-sm shadow-rose-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{lang === 'si' ? 'ඉවත් කරමින්...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'si' ? 'වාර්තාව ඉවත් කරන්න' : 'Delete Record'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
