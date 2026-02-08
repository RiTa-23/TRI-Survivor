import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    initializing: boolean; // 初期化処理の重複を防ぐガードフラグ
    initialized: boolean;
    initialize: () => Promise<(() => void) | void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    loading: true,
    initializing: false,
    initialized: false,
    initialize: async () => {
        if (get().initialized || get().initializing) return;
        set({ initializing: true });

        try {
            const { data: { session } } = await supabase.auth.getSession();
            set({ session, user: session?.user ?? null, loading: false });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                set({ session, user: session?.user ?? null, loading: false });
            });

            set({ initialized: true });

            return () => subscription.unsubscribe();
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ loading: false });
        } finally {
            set({ initializing: false });
        }
    },
    signInWithGoogle: async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error('Google Sign-In error:', error);
            throw error;
        }
    },
    signOut: async () => {
        try {
            await supabase.auth.signOut();
            set({ session: null, user: null });
        } catch (error) {
            console.error('Sign-Out error:', error);
            throw error;
        }
    },
}));
