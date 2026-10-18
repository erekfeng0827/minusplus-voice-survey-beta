import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  signOutUser,
  saveProjectToFirestore,
  loadUserProjectsFromFirestore,
} from '../lib/firebase';
import { RoomData } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncTime: string | null;
  error: string | null;
  syncCurrentProject: (rooms: RoomData[], projectName?: string) => Promise<boolean>;
  userProjects: any[];
  loadProjects: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        try {
          const projs = await loadUserProjectsFromFirestore(currentUser.uid);
          setUserProjects(projs);
        } catch (err) {
          console.warn('Initial projects load warning:', err);
        }
      } else {
        setUserProjects([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setError(null);
    try {
      setSyncStatus('syncing');
      await signInWithGoogle();
      setSyncStatus('synced');
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError(err?.message || '登入失敗');
      setSyncStatus('error');
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await signOutUser();
      setSyncStatus('idle');
      setUserProjects([]);
    } catch (err: any) {
      console.error('Sign-out error:', err);
      setError(err?.message || '登出失敗');
    }
  };

  const syncCurrentProject = async (rooms: RoomData[], projectName = '星玥灣-室內設計放樣專案'): Promise<boolean> => {
    if (!user) {
      setError('請先登入 Google 帳號以啟用 Firestore 雲端同步');
      return false;
    }

    setSyncStatus('syncing');
    setError(null);
    try {
      const projectId = `proj-${user.uid.slice(0, 8)}-current`;
      await saveProjectToFirestore(user.uid, projectId, {
        projectName,
        rooms,
        ceilingHeightCm: 280,
        beamBottomHeight: 265,
        droppedCeilingHeight: 230,
      });

      const now = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncTime(now);
      setSyncStatus('synced');

      // Refresh list
      const projs = await loadUserProjectsFromFirestore(user.uid);
      setUserProjects(projs);
      return true;
    } catch (err: any) {
      console.error('Project sync error:', err);
      setError(err?.message || '雲端儲存失敗');
      setSyncStatus('error');
      return false;
    }
  };

  const loadProjects = async () => {
    if (!user) return;
    try {
      const projs = await loadUserProjectsFromFirestore(user.uid);
      setUserProjects(projs);
    } catch (err: any) {
      console.error('Failed to load user projects:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        syncStatus,
        lastSyncTime,
        error,
        syncCurrentProject,
        userProjects,
        loadProjects,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
