import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isTOTPVerified: boolean;
  isPINVerified: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setTOTPVerified: (verified: boolean) => void;
  setPINVerified: (verified: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  isTOTPVerified: false,
  isPINVerified: false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({
          session,
          user: session.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          set({
            session,
            user: session.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          set({
            session: null,
            user: null,
            isAuthenticated: false,
            isTOTPVerified: false,
            isPINVerified: false,
            isLoading: false,
          });
        }
      });
    } catch {
      set({ isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ isLoading: false });
        return { error: error.message };
      }

      if (data.session) {
        set({
          session: data.session,
          user: data.session.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return { error: null };
      }

      set({ isLoading: false });
      return { error: "No session returned" };
    } catch (err: any) {
      set({ isLoading: false });
      return { error: err?.message || "An unexpected error occurred" };
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isTOTPVerified: false,
      isPINVerified: false,
      isLoading: false,
    });
  },

  refreshSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      set({
        session,
        user: session.user,
        isAuthenticated: true,
      });
    } else {
      set({
        session: null,
        user: null,
        isAuthenticated: false,
      });
    }
  },

  setTOTPVerified: (verified: boolean) => set({ isTOTPVerified: verified }),
  setPINVerified: (verified: boolean) => set({ isPINVerified: verified }),
}));
