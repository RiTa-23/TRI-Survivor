import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { FcGoogle } from "react-icons/fc";
import { GiOpenBook, GiFeather } from "react-icons/gi";
import { Loader2 } from "lucide-react";

export default function AuthScreen() {
    const navigate = useNavigate();
    const { signInWithGoogle, user } = useAuthStore();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            navigate("/home");
        }
    }, [user, navigate]);

    const handleGoogleLogin = async () => {
        setError(null);
        setIsLoading(true);
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error("Login failed:", err);
            setError("Googleログインに失敗しました。もう一度お試しください。");
            setIsLoading(false);
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

            {/* タイトル＆サブタイトル（カードの外へ移動） */}
            <div className="relative z-20 text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-black fantasy-title mb-2 tracking-tight text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">戦いの記録</h2>
                <p className="text-amber-50/80 font-serif drop-shadow-md">ログインして再び戦場へ</p>
            </div>

            <div className="w-full max-w-md parchment-realistic p-10 relative z-10 shadow-2xl transform rotate-1">
                {/* 羊皮紙の質感オーバーレイ */}
                <div className="fibers" aria-hidden />
                <div className="wrinkles" aria-hidden />
                <div className="corner-wear" aria-hidden />
                <div className="ink-bleed one" aria-hidden />
                <div className="inner-band" />

                <div className="relative z-10 content text-center space-y-6 flex flex-col items-center justify-center min-h-[280px]">
                    
                    {/* イラストエリア（フローに乗せて重なりを防止） */}
                    <div className="flex items-center justify-center pointer-events-none">
                         <div className="relative">
                            <GiOpenBook className="w-32 h-32 text-[#a68d6d] opacity-100" />
                            <GiFeather className="w-16 h-16 text-[#5d4a37] absolute -bottom-2 -right-4 transform -rotate-12 drop-shadow-sm opacity-100" />
                         </div>
                    </div>

                    {error && (
                        <div className="w-full p-4 bg-red-900/10 border border-red-900/20 rounded-lg text-red-700 text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <div className="w-full space-y-4">
                        <Button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full py-6 bg-white hover:bg-slate-50 text-slate-800 border-2 border-[#c7a16f] shadow-md font-bold text-lg flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin text-[#c7a16f]" />
                                    <span className="text-slate-600">読み込み中...</span>
                                </>
                            ) : (
                                <>
                                    <FcGoogle className="w-6 h-6" />
                                    Googleでログイン
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
