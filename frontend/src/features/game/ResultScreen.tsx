import { useLocation, useNavigate } from "react-router-dom";
import type { PlayerStats } from "../../game/types";
import { Button } from "@/components/ui/button";
import { Coins, Skull, Star, Clock, Home } from "lucide-react";
import { useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useGameStore } from "@/store/gameStore";

export default function ResultScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    const stats = location.state?.stats as PlayerStats | undefined;
    const isClear = location.state?.isClear as boolean | undefined;

    // API Call State
    const hasSavedRef = useRef(false);

    useEffect(() => {
        if (!stats || hasSavedRef.current) return;

        const saveCoins = async () => {
            try {
                if (stats.coins > 0) {
                    console.log("[ResultScreen] Saving coins:", stats.coins); // DEBUG
                    const response = await api.post('/users/me/coins', { amount: stats.coins });
                    console.log("[ResultScreen] API Response:", response.data); // DEBUG
                    // Update store with latest coin amount from backend
                    if (response.data && typeof response.data.coin === 'number') {
                        useGameStore.getState().setCoins(response.data.coin);
                        console.log("Coins saved:", response.data.coin);
                        hasSavedRef.current = true; // Mark as saved only on success
                    }
                }
            } catch (error) {
                console.error("Failed to save coins:", error);
                // hasSavedRef.current remains false, allowing retry on remount
            }
        };

        saveCoins();
    }, [stats]);

    if (!stats) {
        return (
            <div className="w-full h-screen bg-black text-white flex flex-col items-center justify-center">
                <p>No result data found.</p>
                <Button onClick={() => navigate("/")} className="mt-4">
                    Back to Title
                </Button>
            </div>
        );
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Style configuration based on result
    const bgGradient = isClear
        ? "bg-linear-to-br from-indigo-900 to-black"
        : "bg-linear-to-br from-red-900 to-black";

    const titleGradient = isClear
        ? "bg-linear-to-r from-yellow-300 via-orange-400 to-red-500"
        : "bg-linear-to-r from-gray-200 via-gray-400 to-gray-600";

    const titleText = isClear ? "GAME CLEAR!!" : "GAME OVER...";
    const subtitleText = isClear ? "MISSION ACCOMPLISHED" : "DON'T GIVE UP!";
    const shadowColor = isClear ? "rgba(255,165,0,0.5)" : "rgba(255,0,0,0.5)";

    return (
        <div className={`w-full h-screen ${bgGradient} text-white flex flex-col items-center justify-center p-8`}>
            <div className="max-w-2xl w-full bg-black/60 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
                <h1
                    className={`text-6xl font-black text-center mb-2 ${titleGradient} bg-clip-text text-transparent`}
                    style={{ filter: `drop-shadow(0 2px 10px ${shadowColor})` }}
                >
                    {titleText}
                </h1>
                <p className="text-center text-gray-400 mb-12 text-xl font-light tracking-widest">
                    {subtitleText}
                </p>

                <div className="grid grid-cols-2 gap-8 mb-12">
                    {/* Time */}
                    <div className="flex flex-col items-center bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                        <Clock className="w-10 h-10 text-blue-400 mb-2" />
                        <span className="text-sm text-gray-400 uppercase tracking-wider">Survival Time</span>
                        <span className="text-4xl font-bold font-mono text-blue-100">{formatTime(stats.time)}</span>
                    </div>

                    {/* Kills */}
                    <div className="flex flex-col items-center bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                        <Skull className="w-10 h-10 text-red-500 mb-2" />
                        <span className="text-sm text-gray-400 uppercase tracking-wider">Enemies Defeated</span>
                        <span className="text-4xl font-bold font-mono text-red-100">{stats.killCount}</span>
                    </div>

                    {/* Coins */}
                    <div className="flex flex-col items-center bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                        <Coins className="w-10 h-10 text-yellow-400 mb-2" />
                        <span className="text-sm text-gray-400 uppercase tracking-wider">Coins Earned</span>
                        <span className="text-4xl font-bold font-mono text-yellow-100">{stats.coins}</span>
                    </div>

                    {/* Level */}
                    <div className="flex flex-col items-center bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                        <Star className="w-10 h-10 text-purple-400 mb-2" />
                        <span className="text-sm text-gray-400 uppercase tracking-wider">Player Level</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold font-mono text-purple-100">{stats.level}</span>
                            <span className="text-sm text-gray-500">({Math.floor(stats.exp)} EXP)</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Button
                        onClick={() => navigate("/home")}
                        className="bg-white text-black hover:bg-gray-200 text-xl px-12 py-6 rounded-full font-bold tracking-widest transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                        <Home className="w-6 h-6 mr-3" />
                        BACK TO TITLE
                    </Button>
                </div>
            </div>
        </div>
    );
}
