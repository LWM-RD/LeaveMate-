import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithPopup, GoogleAuthProvider, 
  onAuthStateChanged, signOut, User 
} from 'firebase/auth';
import { 
  getFirestore, doc, getDocFromServer, getDocs, collection, 
  onSnapshot, setDoc, deleteDoc, Unsubscribe 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { LeaveRecord, LeaveQuota } from '../types/leave';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting...');
    }
  }
}

// Auth Helpers
export const signInWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const logoutUser = async () => {
  return await signOut(auth);
};

// Firestore Leave Services - Direct Realtime Sync
export const subscribeFirestoreLeaves = (
  year: number,
  onData: (leaves: LeaveRecord[], isFirstFetch: boolean) => void,
  onError?: (err: unknown) => void
): Unsubscribe => {
  const leavesRef = collection(db, 'leaves');
  const pathForSnapshot = 'leaves';
  let isFirst = true;

  return onSnapshot(
    leavesRef,
    (snapshot) => {
      const records: LeaveRecord[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.year === year) {
          records.push({
            id: docSnap.id,
            category: data.category,
            duration: data.duration,
            startDate: data.startDate,
            endDate: data.endDate,
            daysCount: Number(data.daysCount) || 1,
            reason: data.reason || '',
            appliedDate: data.appliedDate || data.startDate,
            status: data.status || 'taken',
            notes: data.notes || ''
          });
        }
      });
      // Sort newest date first
      records.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      onData(records, isFirst);
      isFirst = false;
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, pathForSnapshot);
      onError?.(error);
    }
  );
};

export const saveFirestoreLeave = async (leave: LeaveRecord): Promise<void> => {
  const path = `leaves/${leave.id}`;
  try {
    const docRef = doc(db, 'leaves', leave.id);
    const leaveYear = new Date(leave.startDate).getFullYear();
    await setDoc(docRef, {
      id: leave.id,
      year: leaveYear,
      category: leave.category,
      duration: leave.duration,
      startDate: leave.startDate,
      endDate: leave.endDate,
      daysCount: leave.daysCount,
      reason: leave.reason,
      status: leave.status,
      appliedDate: leave.appliedDate || leave.startDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteFirestoreLeave = async (leaveId: string): Promise<void> => {
  const path = `leaves/${leaveId}`;
  try {
    const docRef = doc(db, 'leaves', leaveId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// Firestore Quota Services for multi-year
export const subscribeFirestoreQuota = (
  year: number,
  onData: (quota: LeaveQuota) => void,
  onError?: (err: unknown) => void
): Unsubscribe => {
  const docRef = doc(db, 'quotas', String(year));
  const path = `quotas/${year}`;

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onData({
          year,
          annual: Number(data.annual) ?? 14,
          casual: Number(data.casual) ?? 7,
          sick: Number(data.sick) ?? 7,
          special: Number(data.special) ?? 5
        });
      } else {
        const defaultQuota: LeaveQuota = {
          year,
          annual: 14,
          casual: 7,
          sick: 7,
          special: 5
        };
        // Auto-save default quota to Firestore for this year
        saveFirestoreQuota(defaultQuota).catch((e) => console.warn('Init quota write error:', e));
        onData(defaultQuota);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      onError?.(error);
    }
  );
};

export const saveFirestoreQuota = async (quota: LeaveQuota): Promise<void> => {
  const path = `quotas/${quota.year}`;
  try {
    const docRef = doc(db, 'quotas', String(quota.year));
    await setDoc(docRef, {
      year: quota.year,
      annual: quota.annual,
      casual: quota.casual,
      sick: quota.sick,
      special: quota.special,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// One-time fetch for manual Sync action
export const fetchFirestoreLeavesOnce = async (year: number): Promise<LeaveRecord[]> => {
  const path = 'leaves';
  try {
    const leavesRef = collection(db, 'leaves');
    const snapshot = await getDocs(leavesRef);
    const records: LeaveRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.year === year) {
        records.push({
          id: docSnap.id,
          category: data.category,
          duration: data.duration,
          startDate: data.startDate,
          endDate: data.endDate,
          daysCount: Number(data.daysCount) || 1,
          reason: data.reason || '',
          appliedDate: data.appliedDate || data.startDate,
          status: data.status || 'taken',
          notes: data.notes || ''
        });
      }
    });
    records.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
};

