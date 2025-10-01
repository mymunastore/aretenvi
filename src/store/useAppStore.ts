import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

interface AppState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;

  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  isChatMinimized: boolean;
  setChatMinimized: (minimized: boolean) => void;

  isLoading: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: crypto.randomUUID(),
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ].slice(0, 50),
        })),
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      clearNotifications: () => set({ notifications: [] }),
      get unreadCount() {
        return get().notifications.filter((n) => !n.read).length;
      },

      isOnline: navigator.onLine,
      setIsOnline: (isOnline) => set({ isOnline }),

      isChatOpen: false,
      setChatOpen: (isChatOpen) => set({ isChatOpen }),
      isChatMinimized: false,
      setChatMinimized: (isChatMinimized) => set({ isChatMinimized }),

      isLoading: {},
      setLoading: (key, loading) =>
        set((state) => ({
          isLoading: { ...state.isLoading, [key]: loading },
        })),
    }),
    {
      name: 'aret-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        notifications: state.notifications,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => useAppStore.getState().setIsOnline(true));
  window.addEventListener('offline', () => useAppStore.getState().setIsOnline(false));
}