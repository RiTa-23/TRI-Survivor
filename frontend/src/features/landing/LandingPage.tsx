import { useEffect, useMemo } from "react";
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

    const embers = useMemo<{
        id: number;
        left: string;
        animationDuration: string;
        animationDelay: string;
        opacity: number;
        scale: number;
    }[]>(() => {
        return [...Array(20)].map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            animationDuration: `${3 + Math.random() * 4}s`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.3 + Math.random() * 0.7,
            scale: 0.5 + Math.random(),
        }));
    }, []);

    return (
        <div className="min-h-screen forest-bg text-white relative overflow-hidden flex flex-col md:flex-row items-center">
            {/* バトル演出: 火の粉 (Embers) */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {embers.map((ember) => (
                    <div
                        key={ember.id}
                        className="ember"
                        style={{
                            left: ember.left,
                            animationDuration: ember.animationDuration,
                            animationDelay: ember.animationDelay,
                            '--ember-opacity': ember.opacity,
                            '--ember-scale': ember.scale,
                        } as React.CSSProperties}
                    />
                ))}
            </div>

            {/* バトル演出: ヴィネット & 斜め背景エフェクト */}
            <div className="absolute inset-0 battle-vignette z-0" />
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/60 via-transparent to-red-900/30 pointer-events-none mix-blend-overlay" />

            {/* --- 左側: タイトル & アクション --- */}
            <div className="flex-1 w-full h-full flex flex-col justify-center items-center md:items-start p-8 md:pl-20 relative z-20 space-y-8 md:space-y-12">

                {/* タイトルロゴ */}
                <div className="text-center md:text-left relative">
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-red-600/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

                    <h1 className="font-black tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] leading-none flex flex-col md:block">
                        <span className="text-4xl md:text-6xl lg:text-7xl fantasy-title text-transparent bg-clip-text bg-gradient-to-br from-red-400 via-red-600 to-red-800 filter drop-shadow-[0_0_10px_rgba(255,100,100,0.5)] block md:inline-block md:mr-4 brightness-125">
                            TRI-
                        </span>
                        <br className="hidden md:block" />
                        <span className="text-5xl md:text-7xl lg:text-8xl fantasy-title text-transparent bg-clip-text bg-gradient-to-b from-slate-100 via-slate-300 to-slate-500 filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)] block md:inline-block">
                            SURVIVOR
                        </span>
                    </h1>

                    <div className="relative mt-6 inline-block">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent h-[1px] w-full top-0" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent h-[1px] w-full bottom-0" />
                        <p className="text-lg md:text-2xl text-amber-100 font-serif tracking-[0.3em] uppercase font-bold drop-shadow-md opacity-90 py-2 px-8">
                            Survival RPG
                        </p>
                    </div>
                </div>

                {/* キャッチコピー */}
                <p className="text-amber-100 font-serif text-lg md:text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] opacity-90 tracking-wider font-bold max-w-lg leading-relaxed text-center md:text-left border-t border-b border-white/10 py-4">
                    装備を強化し、<br className="md:hidden" />敵を殲滅して生き延びろ。
                </p>

                {/* GAME START ボタン */}
                <div className="w-full md:w-auto">
                    <Button asChild className="w-full md:w-auto px-12 py-8 md:px-16 md:py-10 text-3xl md:text-4xl font-black btn-fantasy-red rounded-xl shadow-[0_0_40px_rgba(220,38,38,0.7)] hover:scale-105 transition-transform border-4 border-amber-200/80 group">
                        <Link to="/auth" className="flex items-center justify-center">
                            <span className="font-serif tracking-[0.15em] text-white drop-shadow-[0_4px_2px_rgba(0,0,0,0.8)]">
                                GAME START
                            </span>
                        </Link>
                    </Button>
                </div>
            </div>

            {/* --- 右側: バトルビジュアル --- */}
            <div className="flex-1 w-full h-[50vh] md:h-full relative z-10 flex items-center justify-center overflow-visible">

                {/* 斜めの背景装飾 (PCのみ) */}
                <div className="hidden md:block absolute inset-y-0 -left-20 right-0 bg-gradient-to-r from-transparent via-black/20 to-black/60 transform -skew-x-12 z-0" />

                {/* 装飾: 魔法陣風の回転する円 (背景) */}
                <div className="absolute w-[600px] h-[600px] border-2 border-red-500/10 rounded-full animate-[spin-slow_20s_linear_infinite] pointer-events-none hidden md:block" />
                <div className="absolute w-[400px] h-[400px] border border-amber-500/10 rounded-full animate-[spin-slow_15s_linear_infinite_reverse] pointer-events-none hidden md:block" />

                <div className="relative w-full h-full flex items-center justify-center [perspective:1000px]">
                    {/* Enemy Group */}
                    <div className="absolute top-[5%] right-[2%] md:top-[12%] md:right-[10%] w-[35%] md:w-[50%] max-w-md z-10 flex flex-col items-center">
                        {/* Aura */}
                        <div className="character-aura w-[150%] h-[150%] bg-purple-900/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        {/* Image */}
                        <img src="/assets/images/enemy/enemy_1.png"
                            className="w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] filter brightness-90 saturate-[1.2] animate-[float-breathing_6s_ease-in-out_infinite]"
                            style={{ animationDelay: '1s' }}
                            alt="Enemy"
                        />
                    </div>

                    {/* VS Effect (中央) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 vs-container scale-75 md:scale-150 pointer-events-none flex items-center justify-center">
                        {/* 雷エフェクト風の装飾線 */}
                        <div className="absolute w-[120%] h-[2px] bg-red-500/50 rotate-45 blur-[1px]" />
                        <div className="absolute w-[120%] h-[2px] bg-red-500/50 -rotate-45 blur-[1px]" />
                        <span className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-red-500 via-red-600 to-red-900 drop-shadow-[0_0_30px_rgba(255,0,0,0.8)] font-serif italic pr-4 relative z-10">
                            VS
                        </span>
                    </div>

                    {/* Player Group */}
                    <div className="absolute bottom-[5%] left-[2%] md:bottom-[12%] md:left-[10%] w-[30%] md:w-[45%] max-w-md z-10 flex flex-col items-center">
                        {/* Aura */}
                        <div className="character-aura w-[150%] h-[150%] bg-blue-900/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        {/* Image */}
                        <img src="/assets/images/Player_1.png"
                            className="w-full object-contain transform -scale-x-100 animate-[float-breathing_5s_ease-in-out_infinite]"
                            style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.8)) brightness(1.1) drop-shadow(0 0 15px rgba(255,255,255,0.3))" }}
                            alt="Hero"
                        />
                    </div>
                </div>
            </div>

            <footer className="absolute bottom-2 text-slate-400/30 text-xs w-full text-center z-10 font-serif pointer-events-none">
                © 2026 TRI-Survivor Project
            </footer>
        </div>
    );
}
