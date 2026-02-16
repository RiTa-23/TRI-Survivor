import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { FcGoogle } from "react-icons/fc";

export default function AuthScreen() {
    const navigate = useNavigate();
    const { signInWithGoogle, user } = useAuthStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            navigate("/home");
        }
    }, [user, navigate]);

    const handleGoogleLogin = async () => {
        setError(null);
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error("Login failed:", err);
            setError("Googleログインに失敗しました。もう一度お試しください。");
        }
    };

    return (
        <div className="min-h-screen forest-bg flex flex-col items-center justify-center relative overflow-hidden p-4">
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />

            {/* ホームへ戻るボタン（左上） */}
            <div className="absolute top-6 left-6 z-20">
                <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/10"
                    onClick={() => navigate("/")}
                >
                    ← 戻る
                </Button>
            </div>

            <div className="w-full max-w-md parchment-realistic p-10 relative z-10 shadow-2xl transform rotate-1">
                {/* 羊皮紙の質感オーバーレイ */}
                <div className="fibers" aria-hidden />
                <div className="wrinkles" aria-hidden />
                <div className="corner-wear" aria-hidden />
                <div className="ink-bleed one" aria-hidden />
                <div className="inner-band" />

                <div className="relative z-10 content text-center space-y-8">
                    <div>
                        <h2 className="text-3xl font-black fantasy-title mb-2 tracking-tight">冒険の記録</h2>
                        <p className="parchment-text opacity-70 font-serif">ログインして冒険の旅を続けよう</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-900/10 border border-red-900/20 rounded-lg text-red-700 text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4 pt-4">
                        <Button
                            onClick={handleGoogleLogin}
                            className="w-full py-6 bg-white hover:bg-slate-50 text-slate-800 border-2 border-[#c7a16f] shadow-md font-bold text-lg flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <FcGoogle className="w-6 h-6" />
                            Googleで再開
                        </Button>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
//ログイン画面