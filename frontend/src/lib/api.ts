import axios from 'axios';
import { supabase } from './supabase';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// リクエストインターセプターの設定
// すべてのリクエストに自動的にBearerトークンを付与する
api.interceptors.request.use(async (config) => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
    } catch (error) {
        console.warn('Failed to get session for API request:', error);
    }
    return config;
});
