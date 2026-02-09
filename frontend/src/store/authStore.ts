import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';
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

// ユーザー同期ロジック (共通化)
const syncUserWithBackend = async (user: User) => {
    try {
        const { email, user_metadata } = user;
        if (email) {
            await api.post('/users', {
                id: user.id,
                email: email,
                name: user_metadata.full_name || email,
                avatarUrl: user_metadata.avatar_url,
            });
            console.log('User synced with backend');
        }
    } catch (apiError) {
        console.error('Failed to sync user with backend:', apiError);
    }
};

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
            // 1. 初期セッション取得 & 同期
            const { data: { session } } = await supabase.auth.getSession();
            set({ session, user: session?.user ?? null, loading: false });

            if (session?.user) {
                await syncUserWithBackend(session.user);
            }

            // 2. イベントリスナー設定
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
                set({ session, user: session?.user ?? null, loading: false });

                // 必要であればここでログ出力などを行う
                // バックエンド同期は initialize の初期処理で行うため、ここでは行わない
                // ただし、SPA遷移でのログインなどが将来発生する場合は SIGNED_IN での同期を検討する
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
