import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GameApp, type PlayerStats } from "@/game/core/GameApp";
import { Button } from "@/components/ui/button";
import { ArrowUp, Coins, Zap, Heart } from "lucide-react";

export default function GameScreen() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameAppRef = useRef<GameApp | null>(null);

    const [status, setStatus] = useState<string>("Initializing...");
    const [specialMove, setSpecialMove] = useState<string | null>(null);
    const [stats, setStats] = useState<PlayerStats>({ coins: 0, exp: 0, hp: 100, maxHp: 100 });
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastStatusRef = useRef<string>("");
    const lastUpdateTsRef = useRef<number>(0);
    const lastStatsRef = useRef<string>("");

    useEffect(() => {
        if (!containerRef.current || !videoRef.current || !canvasRef.current) return;

        // Initialize GameApp
        const initGame = async () => {
            // Destroy previous instance if it exists (e.g. React Strict Mode double-mount)
            if (gameAppRef.current) {
                gameAppRef.current.destroy();
                gameAppRef.current = null;
            }

            const gameApp = new GameApp(
                videoRef.current!,
                canvasRef.current!,
                (msg) => {
                    // Urgent per-frame side effects (always run)
                    if (msg.startsWith("Active:")) {
                        setSpecialMove(null);
                        if (timerRef.current) {
                            clearTimeout(timerRef.current);
                            timerRef.current = null;
                        }
                    }

                    // Throttle setStatus: only update if value changed or 200ms elapsed
                    const now = performance.now();
                    if (msg !== lastStatusRef.current || now - lastUpdateTsRef.current > 200) {
                        lastStatusRef.current = msg;
                        lastUpdateTsRef.current = now;
                        setStatus(msg);
                    }
                },
                (move) => {
                    setSpecialMove(move);

                    // Clear existing timer if any (debounce)
                    if (timerRef.current) {
                        clearTimeout(timerRef.current);
                    }

                    // Set timeout to clear message after 1 second of inactivity
                    timerRef.current = setTimeout(() => {
                        setSpecialMove(null);
                        timerRef.current = null;
                    }, 1000);
                },
                (s: PlayerStats) => {
                    // Throttle stats update
                    const key = `${s.coins},${s.exp},${Math.round(s.hp)}`;
                    if (key !== lastStatsRef.current) {
                        lastStatsRef.current = key;
                        setStats(s);
                    }
                }
            );

            // Set ref immediately to handle unmount during await
            gameAppRef.current = gameApp;

            try {
                await gameApp.init(containerRef.current!);
            } catch (e) {
                console.error("Game init failed", e);
            }
        };

        initGame();

        return () => {
            // Cleanup on unmount
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            if (gameAppRef.current) {
                gameAppRef.current.destroy();
                gameAppRef.current = null;
            }
        };
    }, []);

    return (
        <div className="w-full h-screen relative flex">
            {/* Game Container */}
            <div ref={containerRef} className="w-full h-full overflow-hidden relative" />

            {/* Special Move Overlay */}
            {specialMove && (
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 pointer-events-none z-50 text-center w-full">
                    <div className="text-5xl font-black text-yellow-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] animate-bounce tracking-wider uppercase">
                        {specialMove}!!
                    </div>
                    <div className="text-2xl text-white font-bold mt-2 drop-shadow-md tracking-widest bg-black/50 inline-block px-4 py-1 rounded uppercase">
                        {specialMove === "Muryo Kusho" ? "DOMAIN EXPANSION" : "FOX DEVIL"}
                    </div>
                </div>
            )}

            {/* Status Overlay */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full pointer-events-none z-50 flex items-center gap-2">
                {status.startsWith("Active:") ? (
                    <>
                        <span>Active</span>
                        <ArrowUp
                            className="w-5 h-5 text-green-400 transition-transform duration-100"
                            style={{
                                transform: (() => {
                                    const match = status.match(/Active: ([-\d.]+), ([-\d.]+)/);
                                    if (match) {
                                        const x = parseFloat(match[1]);
                                        const y = parseFloat(match[2]);
                                        const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
                                        return `rotate(${angle}deg)`;
                                    }
                                    return "rotate(0deg)";
                                })()
                            }}
                        />
                    </>
                ) : (
                    status
                )}
            </div>

            {/* Camera Preview overlay (bottom right) */}
            <div className="absolute bottom-4 right-4 w-64 h-48 bg-black border-2 border-white/50 rounded-lg overflow-hidden flex flex-col items-center justify-center">
                <video
                    ref={videoRef}
                    className="absolute w-full h-full object-cover transform scale-x-[-1]"
                    playsInline
                    muted
                />
                <canvas
                    ref={canvasRef}
                    className="absolute w-full h-full object-cover transform scale-x-[-1]"
                    width={640}
                    height={480}
                />
            </div>

            {/* UI Overlay (top-left) */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Button asChild variant="secondary" className="bg-slate-800/80 hover:bg-slate-700 text-white border-none">
                    <Link to="/home">
                        Back to Home
                    </Link>
                </Button>

                {/* Stats HUD */}
                <div className="bg-black/70 text-white px-4 py-3 rounded-xl flex flex-col gap-1.5 text-sm font-mono pointer-events-none select-none">
                    <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-400" />
                        <span className="text-red-300">
                            {Math.ceil(stats.hp)} / {stats.maxHp}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300">{stats.coins}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-green-400" />
                        <span className="text-green-300">{stats.exp}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
