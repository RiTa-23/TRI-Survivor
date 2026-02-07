import { useEffect, useRef } from "react";
import { Application, Graphics } from "pixi.js";
import { useNavigate } from "react-router-dom";

export default function GameScreen() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<Application | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize PixiJS Application
        const initPixi = async () => {
            const app = new Application();
            await app.init({
                resizeTo: window,
                backgroundColor: 0x1099bb,
            });

            if (containerRef.current) {
                containerRef.current.appendChild(app.canvas);
            }
            appRef.current = app;

            // Create Player (Triangle)
            const player = new Graphics();
            player.context.beginPath();
            player.context.moveTo(0, -20);
            player.context.lineTo(15, 20);
            player.context.lineTo(-15, 20);
            player.context.closePath();
            player.context.fill({ color: 0xffffff });

            player.x = app.screen.width / 2;
            player.y = app.screen.height / 2;
            app.stage.addChild(player);

            // Movement State
            const keys: { [key: string]: boolean } = {};
            const speed = 5;

            // Input Handlers
            const onKeyDown = (e: KeyboardEvent) => {
                keys[e.code] = true;
            };
            const onKeyUp = (e: KeyboardEvent) => {
                keys[e.code] = false;
            };

            window.addEventListener("keydown", onKeyDown);
            window.addEventListener("keyup", onKeyUp);

            // Game Loop
            app.ticker.add(() => {
                if (keys["KeyW"] || keys["ArrowUp"]) player.y -= speed;
                if (keys["KeyS"] || keys["ArrowDown"]) player.y += speed;
                if (keys["KeyA"] || keys["ArrowLeft"]) player.x -= speed;
                if (keys["KeyD"] || keys["ArrowRight"]) player.x += speed;

                // Simple boundary check
                player.x = Math.max(0, Math.min(app.screen.width, player.x));
                player.y = Math.max(0, Math.min(app.screen.height, player.y));
            });

            // Cleanup function
            return () => {
                window.removeEventListener("keydown", onKeyDown);
                window.removeEventListener("keyup", onKeyUp);
                app.destroy({ removeView: true }, { children: true });
            };
        };

        const cleanupPromise = initPixi();

        return () => {
            cleanupPromise.then(cleanup => cleanup && cleanup());
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-screen overflow-hidden relative">
            {/* UI Overlay */}
            <div className="absolute top-4 left-4 text-white">
                <button
                    onClick={() => navigate("/home")}
                    className="px-4 py-2 bg-slate-800/80 rounded hover:bg-slate-700 transition-colors"
                >
                    Back to Home
                </button>
            </div>
            <div className="absolute bottom-4 left-4 text-white/50 pointer-events-none">
                Use WASD or Arrow Keys to move
            </div>
        </div>
    );
}
