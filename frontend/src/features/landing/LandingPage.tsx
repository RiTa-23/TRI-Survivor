import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

export default function LandingPage() {
    const navigate = useNavigate();
    const { user, loading } = useAuthStore();

    useEffect(() => {
        if (!loading && user) {
            navigate("/home");
        }
    }, [user, loading, navigate]);

    return (
        <div className="min-h-screen forest-bg text-white flex flex-col items-center justify-evenly pt-6 pb-12 md:pb-48 relative overflow-hidden">

            {/* メインエリア */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-7xl relative z-10 pt-8">
                
                {/* タイトルロゴ (上部) */}
                <div className="text-center mb-4 relative z-20">
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter fantasy-title drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] leading-tight">
                        TRI-Survivor
                    </h1>
                     <div className="wood-panel px-10 py-2 rounded-full inline-block transform -rotate-1 border-2 border-amber-900/50 shadow-xl mt-2">
                        <p className="text-xl md:text-3xl text-amber-100 font-serif tracking-widest uppercase font-bold drop-shadow-md">
                            Survival RPG
                        </p>
                    </div>
                </div>

                {/* キャラクター対決ビジュアル (中央・大きく) */}
                <div className="relative w-full flex-1 min-h-[150px] flex items-end justify-center gap-4 md:gap-16 pointer-events-none pb-8">
                    {/* Player */}
                    <img src="/assets/images/player.png" 
                         className="h-[80px] md:h-[160px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] transform -scale-x-100 z-10" 
                         alt="Hero"
                    />
                    
                    {/* VS Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl md:text-5xl font-black text-red-600 drop-shadow-[0_0_15px_rgba(255,0,0,0.6)] animate-pulse z-0 font-serif italic opacity-80">
                        VS
                    </div>

                    {/* Enemy */}
                    <img src="/assets/images/basic_enemy.png" 
                         className="h-[90px] md:h-[170px] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)] z-10"
                         alt="Enemy"
                    />
                </div>
            </div>

            {/* 下部エリア: スタートボタン & キャッチコピー */}
            <div className="z-20 text-center space-y-4 pb-0 w-full px-4 pt-4">
                {/* キャッチコピー */}
                <p className="text-amber-100 font-serif text-lg md:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-90 tracking-wider font-medium">
                    幾何学の混沌を生き延びろ。装備を強化し、虚無を支配せよ。
                </p>

                <div className="animate-pulse">
                    <Button asChild className="px-20 py-10 text-4xl font-black btn-fantasy-red rounded-2xl shadow-[0_0_40px_rgba(220,38,38,0.7)] hover:scale-105 transition-transform border-4 border-amber-200">
                        <Link to="/auth">GAME START</Link>
                    </Button>
                </div>
            </div>

            <footer className="absolute bottom-2 text-slate-400/50 text-xs w-full text-center z-10 font-serif">
                © 2026 TRI-Survivor Project
            </footer>
        </div>
    );
}
