/**
 * TeslaPrimeCapital — Zustand UI & Session Client Store (`session.store.ts`)
 * Manages non-sensitive UI preferences and ephemeral client-side user metadata.
 */

import { create } from 'zustand';

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

export const useSessionStore = create<ISessionStore>((set) => ({
  user: null,
  accessToken: null,
  isSidebarOpen: true,
  selectedCurrency: 'USD',
  setUserAndToken: (user, accessToken) => set({ user, accessToken }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSelectedCurrency: (curr) => set({ selectedCurrency: curr }),
  clearSession: () => set({ user: null, accessToken: null }),
}));
