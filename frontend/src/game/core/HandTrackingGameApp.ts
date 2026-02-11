import { Application } from "pixi.js";
import { HandTrackingPlayer } from "../entities/HandTrackingPlayer";
import { HandTrackingManager } from "@/lib/handTracking";
import type { Vector2D } from "@/lib/handTracking";

export class HandTrackingGameApp {
    private app: Application;
    private player: HandTrackingPlayer;
    private handTrackingManager: HandTrackingManager;
    private currentDirection: Vector2D | null = null;
    private videoElement: HTMLVideoElement;
    private canvasElement: HTMLCanvasElement;
    private isDestroyed = false;

    constructor(
        videoElement: HTMLVideoElement,
        canvasElement: HTMLCanvasElement,
        onStatusChange?: (status: string) => void,
        onSpecialMove?: (moveName: string) => void
    ) {
        this.app = new Application();
        this.player = new HandTrackingPlayer();
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;

        this.handTrackingManager = new HandTrackingManager((vector) => {
            this.currentDirection = vector;
        }, onStatusChange, onSpecialMove);
    }

    public async init(container: HTMLDivElement) {
        // Initialize PixiJS Application
        await this.app.init({
            resizeTo: window,
            backgroundColor: 0x1099bb,
        });

        if (this.isDestroyed) {
            try { this.app.destroy({ removeView: true, texture: true, context: true } as any); } catch (e) { }
            return;
        }

        if (container) {
            container.appendChild(this.app.canvas);
        }

        // Setup Player
        this.player.x = this.app.screen.width / 2;
        this.player.y = this.app.screen.height / 2;
        this.app.stage.addChild(this.player);

        // Initialize Hand Tracking
        await this.handTrackingManager.init(this.videoElement, this.canvasElement);

        if (this.isDestroyed) {
            this.handTrackingManager.stop();
            try { this.app.destroy({ removeView: true, texture: true, context: true } as any); } catch (e) { }
            return;
        }

        // Start Game Loop
        this.app.start();
        let tickCount = 0;

        this.app.ticker.add(() => {
            tickCount++;
            if (tickCount % 60 === 0) {
                console.log("[HandTrackingGameApp] Tick:", tickCount);
            }

            if (this.currentDirection) {
                this.player.move(this.currentDirection.x, this.currentDirection.y);
                this.player.x = Math.max(0, Math.min(this.app.screen.width, this.player.x));
                this.player.y = Math.max(0, Math.min(this.app.screen.height, this.player.y));
            }
        });
    }

    public destroy() {
        this.isDestroyed = true;
        this.handTrackingManager.stop();

        // Only destroy app if renderer is ready (init completed or at least started)
        // If init is pending, the flag will trigger destruction there.
        if (this.app.renderer) {
            try {
                // Use 'as any' to bypass the strict type check on texture/context if needed for v8 compat
                // or just stick to removeView/children if texture/context are invalid
                this.app.destroy({ removeView: true, texture: true, context: true } as any);
            } catch (e) {
                console.error("Error destroying PixiJS app:", e);
            }
        }
    }
}
