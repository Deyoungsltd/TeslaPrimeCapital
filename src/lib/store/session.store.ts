/**
 * TeslaPrimeCapital — Zustand UI & Session Client Store (`session.store.ts`)
 * Manages non-sensitive UI preferences and persisted client-side user metadata.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface IClientUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  kycTier: string;
  twoFactorEnabled: boolean;
  referralCode: string;
}

export interface ISessionStore {
  user: IClientUser | null;
  accessToken: string | null;
  isSidebarOpen: boolean;
  selectedCurrency: string;
  setUserAndToken: (user: IClientUser | null, accessToken: string | null) => void;
  toggleSidebar: () => void;
  setSelectedCurrency: (curr: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<ISessionStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isSidebarOpen: true,
      selectedCurrency: 'USD',
      setUserAndToken: (user, accessToken) => set({ user, accessToken }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSelectedCurrency: (curr) => set({ selectedCurrency: curr }),
      clearSession: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'teslaprime_client_session',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        selectedCurrency: state.selectedCurrency,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
);
