import { Application } from "pixi.js";
import { Player } from "../entities/Player";
import { HandTrackingManager } from "@/lib/handTracking";
import type { Vector2D } from "@/lib/handTracking";

export class GameApp {
    private app: Application;
    private player: Player;
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
        this.player = new Player();
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
            this.destroyApp();
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
        try {
            await this.handTrackingManager.init(this.videoElement, this.canvasElement);
        } catch (e) {
            console.error("Hand tracking init failed:", e);
            this.handTrackingManager.stop();
            this.destroyApp();
            throw e;
        }

        if (this.isDestroyed) {
            this.handTrackingManager.stop();
            this.destroyApp();
            return;
        }

        // Start Game Loop
        this.app.start();

        this.app.ticker.add(() => {
            if (this.currentDirection) {
                this.player.move(this.currentDirection.x, this.currentDirection.y);
                this.player.x = Math.max(0, Math.min(this.app.screen.width, this.player.x));
                this.player.y = Math.max(0, Math.min(this.app.screen.height, this.player.y));
            }
        });
    }

    /** PixiJS v8 destroy options (shared to avoid duplication) */
    private static readonly RENDERER_DESTROY_OPTIONS = { removeView: true };
    private static readonly STAGE_DESTROY_OPTIONS = { texture: true, context: true };

    /** Safely destroy the PixiJS application and stop the ticker */
    private destroyApp() {
        try {
            this.app.ticker.stop();
            this.app.destroy(
                GameApp.RENDERER_DESTROY_OPTIONS,
                GameApp.STAGE_DESTROY_OPTIONS
            );
        } catch (e) {
            console.error("Error destroying PixiJS app:", e);
        }
    }

    public destroy() {
        this.isDestroyed = true;
        this.handTrackingManager.stop();
        this.destroyApp();
    }
}
