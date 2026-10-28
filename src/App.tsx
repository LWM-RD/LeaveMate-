import React, { useState, useEffect } from 'react';
import { 
  testConnection, auth, signInWithGoogle, logoutUser,
  subscribeFirestoreLeaves, saveFirestoreLeave, deleteFirestoreLeave,
  subscribeFirestoreQuota, saveFirestoreQuota, fetchFirestoreLeavesOnce
} from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LeaveRecord, LeaveQuota } from './types/leave';
import { calculateLeaveSummary, getStoredLeaves, getStoredQuota, saveLeaves, saveQuota, getInitialSampleLeaves } from './utils/storage';
import { getTranslation } from './utils/translations';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { LeaveCalendar } from './components/LeaveCalendar';
import { LeaveHistoryTable } from './components/LeaveHistoryTable';
import { AddLeaveModal } from './components/AddLeaveModal';
import { QuotaSettingsModal } from './components/QuotaSettingsModal';
import { ExportModal } from './components/ExportModal';
import { ListFilter, Calendar as CalendarIcon, PlusCircle, CheckCircle2, Cloud, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [leaves, setLeaves] = useState<LeaveRecord[]>(getStoredLeaves());
  const [quota, setQuota] = useState<LeaveQuota>(getStoredQuota());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [syncSuccessToast, setSyncSuccessToast] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // 1. Connection test & Auth Tracking
  useEffect(() => {
    testConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Realtime sync with Firestore for selectedYear
  useEffect(() => {
    setIsSyncing(true);
    setFirebaseError(null);

    // Subscribe directly to Firestore leaves
    const unsubLeaves = subscribeFirestoreLeaves(
      selectedYear,
      async (fetchedLeaves, isFirstFetch) => {
        // Auto-migration: If Firestore is currently empty for this year,
        // and localStorage has existing custom records that the user previously added,
        // upload those local records into Firestore so user's data is never lost!
        const localLeaves = getStoredLeaves();
        if (isFirstFetch && fetchedLeaves.length === 0 && localLeaves.length > 0) {
          const yearLocalLeaves = localLeaves.filter(
            (l) => new Date(l.startDate).getFullYear() === selectedYear
          );
          if (yearLocalLeaves.length > 0) {
            console.log('Migrating local leaves to Firestore:', yearLocalLeaves.length);
            for (const item of yearLocalLeaves) {
              await saveFirestoreLeave(item);
            }
            return; // onSnapshot will trigger automatically with the migrated leaves
          }
        }

        setLeaves(fetchedLeaves);
        saveLeaves(fetchedLeaves);
        setIsSyncing(false);
      },
      (err) => {
        console.error('Error fetching leaves from Firestore:', err);
        setFirebaseError('Could not sync with Firestore. Using offline cache.');
        setIsSyncing(false);
      }
    );

    // Subscribe to quotas for this specific year in Firestore
    const unsubQuota = subscribeFirestoreQuota(
      selectedYear,
      (fetchedQuota) => {
        setQuota(fetchedQuota);
        saveQuota(fetchedQuota);
      },
      (err) => {
        console.error('Error fetching quota from Firestore:', err);
      }
    );

    return () => {
      unsubLeaves();
      unsubQuota();
    };
  }, [selectedYear]);

  // Actions
  const handleAddLeave = async (newLeaveData: Omit<LeaveRecord, 'id' | 'appliedDate' | 'status'>) => {
    const newRecord: LeaveRecord = {
      ...newLeaveData,
      id: `leave-${Date.now()}`,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'taken'
    };

    // Optimistic UI update
    const updated = [newRecord, ...leaves];
    setLeaves(updated);
    saveLeaves(updated);

    // Direct write to Firestore!
    try {
      await saveFirestoreLeave(newRecord);
    } catch (err) {
      console.error('Failed to save leave to Firestore:', err);
    }
  };

  const handleDeleteLeave = async (id: string) => {
    // Optimistic update
    const updated = leaves.filter((l) => l.id !== id);
    setLeaves(updated);
    saveLeaves(updated);

    // Direct delete in Firestore!
    try {
      await deleteFirestoreLeave(id);
    } catch (err) {
      console.error('Failed to delete leave from Firestore:', err);
    }
  };

  const handleSaveQuota = async (newQuota: LeaveQuota) => {
    setQuota(newQuota);
    saveQuota(newQuota);

    // Direct save in Firestore!
    try {
      await saveFirestoreQuota(newQuota);
    } catch (err) {
      console.error('Failed to save quota to Firestore:', err);
    }
  };

  const handleSignInGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-in error:', err);
    }
  };

  const handleSignOutUser = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setFirebaseError(null);
    try {
      const freshLeaves = await fetchFirestoreLeavesOnce(selectedYear);
      setLeaves(freshLeaves);
      saveLeaves(freshLeaves);
      setSyncSuccessToast('Cloud Sync Successful! All records are up to date.');
      setTimeout(() => setSyncSuccessToast(null), 3500);
    } catch (err) {
      console.error('Manual sync failed:', err);
      setFirebaseError('Manual sync failed. Using local cached records.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetData = async () => {
    const samples = getInitialSampleLeaves();
    for (const s of samples) {
      await saveFirestoreLeave(s);
    }
    setSyncSuccessToast('Sample leaves reloaded into database!');
    setTimeout(() => setSyncSuccessToast(null), 3000);
  };

  const summary = calculateLeaveSummary(leaves, quota, selectedYear);
  const t = getTranslation('en');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Header with multi-year and Firebase Auth */}
      <Header
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenQuotaModal={() => setIsQuotaModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        currentUser={currentUser}
        onSignIn={handleSignInGoogle}
        onSignOut={handleSignOutUser}
        isSyncing={isSyncing}
        onSync={handleManualSync}
      />

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        
        {/* Sync success toast */}
        {syncSuccessToast && (
          <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{syncSuccessToast}</span>
            </div>
            <button
              onClick={() => setSyncSuccessToast(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Firebase connection notification if any error occurs */}
        {firebaseError && (
          <div className="p-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>{firebaseError}</span>
            </div>
            <button
              onClick={handleManualSync}
              className="text-amber-900 font-semibold underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. Leave Balances Summary for Selected Year */}
        <DashboardStats
          summary={summary}
          lang="en"
          selectedCategory={categoryFilter}
          onFilterByCategory={(cat) => setCategoryFilter(cat)}
        />

        {/* View Toggle Bar (List View vs Calendar View) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold w-fit">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Leaves List ({selectedYear})</span>
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar View</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-200 transition-all cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t.logLeave} ({selectedYear})</span>
            </button>
          </div>
        </div>

        {/* 2. Main View Mode: List View or Calendar View */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            <LeaveHistoryTable
              leaves={leaves}
              lang="en"
              onDeleteLeave={handleDeleteLeave}
              selectedCategoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              onSync={handleManualSync}
              isSyncing={isSyncing}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <LeaveCalendar
              leaves={leaves}
              lang="en"
              selectedYear={selectedYear}
            />
            <LeaveHistoryTable
              leaves={leaves}
              lang="en"
              onDeleteLeave={handleDeleteLeave}
              selectedCategoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              onSync={handleManualSync}
              isSyncing={isSyncing}
            />
          </div>
        )}

      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{t.appName}</span>
            <span>&bull;</span>
            <span>Year {selectedYear}</span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <Cloud className="w-3 h-3" />
              Realtime Firebase Database Connected
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Cloud synced across all devices and incognito windows</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddLeaveModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddLeave={handleAddLeave}
        summary={summary}
        lang="en"
        selectedYear={selectedYear}
      />

      <QuotaSettingsModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        quota={quota}
        onSaveQuota={handleSaveQuota}
        lang="en"
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        leaves={leaves}
        summary={summary}
        quota={quota}
        lang="en"
        onResetData={handleResetData}
      />
    </div>
  );
}
