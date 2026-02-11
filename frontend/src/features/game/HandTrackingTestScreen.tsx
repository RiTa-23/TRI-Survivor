import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HandTrackingGameApp } from "@/game/core/HandTrackingGameApp";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

export default function HandTrackingTestScreen() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameAppRef = useRef<HandTrackingGameApp | null>(null);

    const [status, setStatus] = useState<string>("Initializing...");
    const [specialMove, setSpecialMove] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!containerRef.current || !videoRef.current || !canvasRef.current) return;

        // Initialize GameApp
        const initGame = async () => {
            if (containerRef.current) containerRef.current.innerHTML = '';

            const gameApp = new HandTrackingGameApp(
                videoRef.current!,
                canvasRef.current!,
                (msg) => {
                    setStatus(msg);
                    if (msg.startsWith("Active:")) {
                        setSpecialMove(null);
                        if (timerRef.current) {
                            clearTimeout(timerRef.current);
                            timerRef.current = null;
                        }
                    }
                },
                (move) => {
                    setSpecialMove(move);

                    // Clear existing timer if any (debounce)
                    if (timerRef.current) {
                        clearTimeout(timerRef.current);
                    }

                    // Set timeout to clear message after 2 seconds of inactivity
                    timerRef.current = setTimeout(() => {
                        setSpecialMove(null);
                        timerRef.current = null;
                    }, 2000);
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
                                        // ArrowUp points UP (0, -1) by default
                                        // atan2(y, x) -> 0 is Right (1, 0)
                                        // To align UP (-Y) to 0 deg:
                                        // angle = atan2(y, x) * 180 / PI + 90
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

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 text-white">
                <Button asChild variant="secondary" className="bg-slate-800/80 hover:bg-slate-700 text-white border-none">
                    <Link to="/home">
                        Back to Home
                    </Link>
                </Button>
            </div>
        </div>
    );
}
