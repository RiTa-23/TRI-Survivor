import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { GameApp } from "@/game/core/GameApp";

export default function GameScreen() {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameAppRef = useRef<GameApp | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize GameApp
        const initGame = async () => {
            const gameApp = new GameApp();
            await gameApp.init(containerRef.current!);
            gameAppRef.current = gameApp;
        };

        const initPromise = initGame();

        return () => {
            // Cleanup on unmount
            initPromise.then(() => {
                if (gameAppRef.current) {
                    gameAppRef.current.destroy();
                    gameAppRef.current = null;
                }
            });
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-screen overflow-hidden relative">
            {/* UI Overlay */}
            <div className="absolute top-4 left-4 text-white">
                <Link
                    to="/home"
                    className="px-4 py-2 bg-slate-800/80 rounded hover:bg-slate-700 transition-colors inline-block"
                >
                    Back to Home
                </Link>
            </div>
            <div className="absolute bottom-4 left-4 text-white/50 pointer-events-none">
                Use WASD or Arrow Keys to move
            </div>
        </div>
    );
}
