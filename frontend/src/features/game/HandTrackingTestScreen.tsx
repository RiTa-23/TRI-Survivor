import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HandTrackingGameApp } from "@/game/core/HandTrackingGameApp";
import { Button } from "@/components/ui/button";

export default function HandTrackingTestScreen() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameAppRef = useRef<HandTrackingGameApp | null>(null);

    const [status, setStatus] = useState<string>("Initializing...");

    useEffect(() => {
        if (!containerRef.current || !videoRef.current || !canvasRef.current) return;

        // Initialize GameApp
        const initGame = async () => {
            if (containerRef.current) containerRef.current.innerHTML = '';

            const gameApp = new HandTrackingGameApp(
                videoRef.current!,
                canvasRef.current!,
                (msg) => setStatus(msg)
            );

            // Set ref immediately to handle unmount during await
            gameAppRef.current = gameApp;

            try {
                await gameApp.init(containerRef.current!);
            } catch (e) {
                console.error("Game init failed", e);
            }
        };

        const initPromise = initGame();

        return () => {
            // Cleanup on unmount
            // If init is still running, gameAppRef.current is already set so we can destroy it.
            // However, destroy() might be called while init() is running.
            // Pixi v8 application.destroy() is likely safe to call or will be queued.
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

            {/* Status Overlay */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full pointer-events-none z-50">
                {status}
            </div>

            {/* Camera Preview overlay (bottom right) */}
            <div className="absolute bottom-4 right-4 w-64 h-48 bg-black border-2 border-white/50 rounded-lg overflow-hidden flex flex-col items-center justify-center">
                <video
                    ref={videoRef}
                    className="absolute w-full h-full object-cover opacity-50 transform scale-x-[-1]"
                    playsInline
                    muted
                />
                <canvas
                    ref={canvasRef}
                    className="absolute w-full h-full object-cover transform scale-x-[-1]"
                    width={640}
                    height={480}
                />
                <div className="z-10 text-white text-xs bg-black/50 px-2 py-1 rounded">
                    Camera Preview
                </div>
            </div>

            {/* UI Overlay */}
            <div className="absolute top-4 left-4 text-white">
                <Button asChild variant="secondary" className="bg-slate-800/80 hover:bg-slate-700 text-white border-none">
                    <Link to="/home">
                        Back to Home
                    </Link>
                </Button>
            </div>
            <div className="absolute top-4 right-4 bg-black/50 text-white p-4 rounded max-w-sm pointer-events-none">
                <p className="font-bold mb-2">Hand Tracking Test</p>
                <p className="text-sm">
                    Move your index finger to control the player.
                    <br />
                    - Point Up/Down/Left/Right
                    <br />
                    - The vector from index finger base to tip controls direction.
                </p>
            </div>
        </div>
    );
}
