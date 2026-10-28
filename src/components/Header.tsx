import React, { useState } from 'react';
import { 
  Calendar, PlusCircle, Settings, Download, 
  ChevronLeft, ChevronRight, Cloud, CloudCheck, 
  LogIn, LogOut, User as UserIcon, CalendarDays, RefreshCw 
} from 'lucide-react';
import { User } from 'firebase/auth';
import { getTranslation } from '../utils/translations';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenQuotaModal: () => void;
  onOpenExportModal: () => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
  currentUser: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isSyncing: boolean;
  onSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddModal,
  onOpenQuotaModal,
  onOpenExportModal,
  selectedYear,
  onYearChange,
  currentUser,
  onSignIn,
  onSignOut,
  isSyncing,
  onSync,
}) => {
  const t = getTranslation('en');
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Quick years generator (e.g. 2023 to 2030)
  const currentActualYear = new Date().getFullYear();
  const availableYears = [
    currentActualYear - 2,
    currentActualYear - 1,
    currentActualYear,
    currentActualYear + 1,
    currentActualYear + 2,
    currentActualYear + 3
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          
          {/* Logo, Brand & Cloud Sync Indicator */}
          <div className="flex items-center justify-between sm:justify-start space-x-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-50">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
                    {t.appName}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                    <Cloud className="w-3 h-3 text-emerald-600" />
                    Firestore
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {t.appSubtitle} &bull; <span className="font-semibold text-indigo-600">Year {selectedYear}</span>
                </p>
              </div>
            </div>

            {/* Mobile Auth button */}
            <div className="sm:hidden">
              {currentUser && !currentUser.isAnonymous ? (
                <button
                  onClick={onSignOut}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onSignIn}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Action buttons & Multi-Year Controller */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Multi-Year Stepper & Dropdown */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-semibold shadow-2xs">
              <button
                onClick={() => onYearChange(selectedYear - 1)}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Previous Year"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowYearPicker(!showYearPicker)}
                  className="px-2.5 py-1 text-xs font-bold text-indigo-900 hover:bg-white rounded-md transition-all flex items-center gap-1 cursor-pointer"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{selectedYear}</span>
                  {selectedYear === currentActualYear && (
                    <span className="text-[10px] text-indigo-500 font-medium">(Now)</span>
                  )}
                </button>

                {showYearPicker && (
                  <div className="absolute top-full left-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 p-1.5 z-40 animate-in fade-in zoom-in-95">
                    <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">
                      Select Year
                    </div>
                    {availableYears.map((yr) => (
                      <button
                        key={yr}
                        onClick={() => {
                          onYearChange(yr);
                          setShowYearPicker(false);
                        }}
                        className={`w-full text-left px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                          selectedYear === yr
                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {yr} {yr === currentActualYear ? '• Current' : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => onYearChange(selectedYear + 1)}
                className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Next Year"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Realtime Sync Button */}
            {onSync && (
              <button
                onClick={onSync}
                disabled={isSyncing}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer shadow-2xs ${
                  isSyncing
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-600 cursor-not-allowed'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
                }`}
                title="Sync with Firebase Cloud Database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
              </button>
            )}

            {/* Quota Settings Button */}
            <button
              onClick={onOpenQuotaModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-all shadow-2xs cursor-pointer"
              title={`${selectedYear} Quotas`}
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Quotas</span>
            </button>

            {/* Export Report Button */}
            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-all shadow-2xs cursor-pointer"
              title={t.exportReport}
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">{t.exportReport}</span>
            </button>

            {/* User Account / Google Sign-in */}
            <div className="hidden sm:block">
              {currentUser && !currentUser.isAnonymous ? (
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                    {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="font-medium text-slate-700 max-w-[90px] truncate" title={currentUser.email || ''}>
                    {currentUser.displayName?.split(' ')[0] || 'User'}
                  </span>
                  <button
                    onClick={onSignOut}
                    className="ml-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onSignIn}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-all shadow-2xs cursor-pointer"
                  title="Sign in with Google to sync across all devices"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Log Leave Primary Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-200 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.logLeave}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
