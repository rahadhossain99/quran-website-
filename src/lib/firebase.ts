import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

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
  }
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

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

// Test connection and sign in
export async function initFirebase(): Promise<string | null> {
  try {
    const user = await signInAnonymously(auth);
    console.log('Connected to Firebase as:', user.user.uid);
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'test/connection');
    }
    return null;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration (client is offline).");
      return "offline";
    }
    
    // Check if anonymous auth is restricted/disabled (auth/admin-restricted-operation)
    if (error && (error.code === 'auth/admin-restricted-operation' || String(error).includes('admin-restricted-operation'))) {
      const projectId = firebaseConfig?.projectId || 'your-project-id';
      console.warn(
        `[Firebase Auth Warning] Anonymous Auth is disabled on your Firebase project (${projectId}).\n` +
        `To enable settings syncing:\n` +
        `1. Open Firebase Console: https://console.firebase.google.com/project/${projectId}/authentication/providers\n` +
        `2. Enable "Anonymous" sign-in provider.\n` +
        `3. Save. App settings will sync to cloud.`
      );
      return "admin-restricted-operation";
    }
    
    console.warn("Authentication init completed gracefully (offline/not configured mode)", error);
    return error instanceof Error ? error.message : String(error);
  }
}
