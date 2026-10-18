import React, { useState } from 'react';
import {
  X,
  LogIn,
  LogOut,
  Database,
  Cloud,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  User as UserIcon,
  Sparkles,
  Layers,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoomData } from '../types';

interface FirebaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: RoomData;
  rooms?: RoomData[];
  onNotify?: (msg: string) => void;
}

export const FirebaseAuthModal: React.FC<FirebaseAuthModalProps> = ({
  isOpen,
  onClose,
  room,
  rooms = [],
  onNotify,
}) => {
  const { user, loading, signIn, signOut, syncStatus, lastSyncTime, error, syncCurrentProject, userProjects } =
    useAuth();
  const [syncing, setSyncing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      await signIn();
      onNotify?.('🎉 成功以 Google 帳號登入！Firestore 雲端持久化已啟用');
    } catch (err) {
      // Error handled in context
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onNotify?.('已安全登出 Google 帳號');
    } catch (err) {
      // Error handled in context
    }
  };

  const handleManualSync = async () => {
    if (!user) return;
    setSyncing(true);
    const targetRooms = rooms.length > 0 ? rooms : room ? [room] : [];
    const ok = await syncCurrentProject(targetRooms, '星玥灣-室內設計放樣專案');
    setSyncing(false);
    if (ok) {
      onNotify?.('☁️ 已將目前全室空間放樣與施工圖資料成功儲存至 Firestore！');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-slate-950 border border-purple-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 border-b border-purple-500/30 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Firebase 雲端資料庫與帳號驗證
                </h3>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-500/50 px-2 py-0.5 rounded-full font-mono font-bold">
                  Firestore + Auth
                </span>
              </div>
              <p className="text-xs text-slate-300">
                以 Google Sign-in 安全身分識別 · 跨裝置同步專案、圖塊與個人 CAD 規格庫
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-xs text-rose-300">
              ⚠️ {error}
            </div>
          )}

          {user ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center gap-3.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-12 h-12 rounded-full border-2 border-purple-400 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-900/80 border border-purple-500/50 flex items-center justify-center text-purple-200">
                    <UserIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-white text-sm truncate">
                      {user.displayName || '室內設計師'}
                    </h4>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">
                      已驗證
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">UID: {user.uid.slice(0, 14)}...</p>
                </div>
              </div>

              {/* Firestore Status Card */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-purple-400" />
                    <span>Firestore 雲端同步狀態：</span>
                  </span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                      syncStatus === 'synced'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : syncStatus === 'syncing'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {syncStatus === 'synced'
                      ? '● 已同步'
                      : syncStatus === 'syncing'
                      ? '◐ 同步中...'
                      : '○ 閒置'}
                  </span>
                </div>

                {lastSyncTime && (
                  <div className="text-[11px] text-slate-400 font-mono">
                    最後同步時間：<span className="text-slate-200">{lastSyncTime}</span>
                  </div>
                )}

                <div className="text-[11px] text-slate-400">
                  雲端已存專案數：
                  <span className="text-purple-300 font-bold ml-1 font-mono">
                    {userProjects.length > 0 ? userProjects.length : 1} 個專案
                  </span>
                </div>

                <button
                  onClick={handleManualSync}
                  disabled={syncing}
                  className="w-full py-2 bg-purple-700 hover:bg-purple-600 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-purple-900/40 transition active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? '正同步至 Firestore...' : '立即將目前專案落盤同步至 Firestore'}</span>
                </button>
              </div>

              {/* Sign out */}
              <button
                onClick={handleSignOut}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>登出 Google 帳號</span>
              </button>
            </div>
          ) : (
            /* Not logged in state */
            <div className="space-y-4 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-purple-950/60 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-300">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white text-base">使用 Google 帳號安全登入</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  登入後自動啟用 Firebase Firestore 資料持久化，為您安全保存室內設計專案、客製化圖塊、.pat
                  剖面填充與 CAD 個人規範。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left text-xs bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>雲端案場即時保存</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>自訂圖塊跨裝置漫遊</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>專屬 CAD 規範同步</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Google 檢索記錄留存</span>
                </div>
              </div>

              <button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full py-3 bg-white hover:bg-slate-100 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-purple-500/20 transition active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>以 Google 帳號登入 (Google Sign-In)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
