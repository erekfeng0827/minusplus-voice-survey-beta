import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

export const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth instance
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Firestore instance (with designated custom databaseId)
const firestoreDbId = firebaseConfigData.firestoreDatabaseId || '(default)';
export const db = getFirestore(app, firestoreDbId);

// Google Sign-In helper
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Persist or update user profile doc in Firestore
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '室內設計師',
          photoURL: user.photoURL || '',
          lastLoginAt: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (fsErr) {
      console.warn('Firestore user doc sync non-blocking error:', fsErr);
    }

    return user;
  } catch (error: any) {
    console.error('Google Sign-In failed:', error);
    throw error;
  }
}

// Sign-Out helper
export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// Save Project Data to Firestore
export async function saveProjectToFirestore(
  userId: string,
  projectId: string,
  projectPayload: {
    projectName: string;
    rooms: any[];
    ceilingHeightCm?: number;
    beamBottomHeight?: number;
    droppedCeilingHeight?: number;
  }
) {
  if (!userId) throw new Error('使用者未登入');
  const projectRef = doc(db, 'projects', projectId);
  await setDoc(
    projectRef,
    {
      id: projectId,
      userId,
      ...projectPayload,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    },
    { merge: true }
  );
}

// Load User's Projects from Firestore
export async function loadUserProjectsFromFirestore(userId: string) {
  if (!userId) return [];
  const q = query(collection(db, 'projects'), where('userId', '==', userId));
  const snap = await getDocs(q);
  const projects: any[] = [];
  snap.forEach((docSnap) => {
    projects.push(docSnap.data());
  });
  return projects;
}

// Save Custom Block or Hatch to Firestore
export async function saveCustomBlockToFirestore(userId: string, blockItem: any) {
  if (!userId) return;
  const blockRef = doc(db, 'customBlocks', blockItem.id);
  await setDoc(
    blockRef,
    {
      ...blockItem,
      userId,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    },
    { merge: true }
  );
}

// Save CAD DNA Profile to Firestore
export async function saveCadDnaProfileToFirestore(userId: string, profile: any) {
  if (!userId) return;
  const profRef = doc(db, 'cadDnaProfiles', profile.id || 'learned-prof-master');
  await setDoc(
    profRef,
    {
      ...profile,
      userId,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    },
    { merge: true }
  );
}

// Save Search Grounding Query Record to Firestore
export async function saveSearchGroundingToFirestore(
  userId: string | null,
  queryData: {
    id: string;
    query: string;
    groundedAnswer: string;
    webSearchQueries?: string[];
    sources?: Array<{ title: string; url: string }>;
  }
) {
  try {
    const queryRef = doc(db, 'searchGroundingQueries', queryData.id);
    await setDoc(queryRef, {
      ...queryData,
      userId: userId || 'anonymous',
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Failed to save search grounding query to Firestore:', err);
  }
}
