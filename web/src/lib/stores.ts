/**
 * Zustand Stores
 * Global state management for UI and app state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================================
// UI Store — sidebar, theme, notifications
// ============================================================================

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  notifications: Notification[];
  unreadCount: number;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  notifications: [],
  unreadCount: 0,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  addNotification: (notification) =>
    set((state) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      return {
        notifications: [newNotification, ...state.notifications].slice(0, 50),
        unreadCount: state.unreadCount + 1,
      };
    }),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));

// ============================================================================
// Application Draft Store — persisted form state
// ============================================================================

interface DraftApplicationData {
  type?: string;
  businessName?: string;
  businessType?: string;
  businessAddress?: string;
  businessBarangay?: string;
  businessCity?: string;
  businessProvince?: string;
  businessZipCode?: string;
  businessPhone?: string;
  businessEmail?: string;
  dtiSecRegistration?: string;
  tinNumber?: string;
  sssNumber?: string;
  businessArea?: number;
  numberOfEmployees?: number;
  capitalInvestment?: number;
  grossSales?: number;
  currentStep?: number;
}

interface DraftStore {
  draft: DraftApplicationData;
  lastSaved: string | null;

  updateDraft: (data: Partial<DraftApplicationData>) => void;
  setCurrentStep: (step: number) => void;
  clearDraft: () => void;
  hasDraft: () => boolean;
}

export const useDraftStore = create<DraftStore>()(
  persist(
    (set, get) => ({
      draft: {},
      lastSaved: null,

      updateDraft: (data) =>
        set((state) => ({
          draft: { ...state.draft, ...data },
          lastSaved: new Date().toISOString(),
        })),

      setCurrentStep: (step) =>
        set((state) => ({
          draft: { ...state.draft, currentStep: step },
        })),

      clearDraft: () => set({ draft: {}, lastSaved: null }),

      hasDraft: () => {
        const { draft } = get();
        return Object.keys(draft).length > 0 && !!draft.businessName;
      },
    }),
    {
      name: 'bp-application-draft',
    }
  )
);

// ============================================================================
// User Preferences Store
// ============================================================================

interface UserPreferences {
  locale: string;
  theme: 'light' | 'dark' | 'system';
  compactView: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;

  setLocale: (locale: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setCompactView: (compact: boolean) => void;
  setEmailNotifications: (enabled: boolean) => void;
  setSmsNotifications: (enabled: boolean) => void;
}

export const usePreferencesStore = create<UserPreferences>()(
  persist(
    (set) => ({
      locale: 'en',
      theme: 'light',
      compactView: false,
      emailNotifications: true,
      smsNotifications: true,

      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      setCompactView: (compactView) => set({ compactView }),
      setEmailNotifications: (emailNotifications) => set({ emailNotifications }),
      setSmsNotifications: (smsNotifications) => set({ smsNotifications }),
    }),
    {
      name: 'bp-user-preferences',
    }
  )
);
