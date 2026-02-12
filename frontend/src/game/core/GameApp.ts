import { Application, Container, Graphics } from "pixi.js";
import { Player } from "../entities/Player";
import { HandTrackingManager } from "@/lib/handTracking";
import type { Vector2D } from "@/lib/handTracking";

/** Grid background settings */
const GRID_SIZE = 80;
const GRID_COLOR = 0x0d7fa3;
const GRID_LINE_WIDTH = 1;
const WORLD_SIZE = 4000;

export class GameApp {
    private app: Application;
    private player: Player;
    private world: Container;
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
        this.world = new Container();
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;

        this.handTrackingManager = new HandTrackingManager((vector) => {
            this.currentDirection = vector;
        }, onStatusChange, onSpecialMove);
    }

    /** Create a grid-patterned background */
    private createBackground(): Graphics {
        const bg = new Graphics();

        // Fill background
        bg.rect(0, 0, WORLD_SIZE, WORLD_SIZE);
        bg.fill({ color: 0x0e8aaa });

        // Draw grid lines
        bg.setStrokeStyle({ width: GRID_LINE_WIDTH, color: GRID_COLOR });

        for (let x = 0; x <= WORLD_SIZE; x += GRID_SIZE) {
            bg.moveTo(x, 0);
            bg.lineTo(x, WORLD_SIZE);
        }
        for (let y = 0; y <= WORLD_SIZE; y += GRID_SIZE) {
            bg.moveTo(0, y);
            bg.lineTo(WORLD_SIZE, y);
        }
        bg.stroke();

        // Draw center crosshair markers for orientation
        const cx = WORLD_SIZE / 2;
        const cy = WORLD_SIZE / 2;
        bg.setStrokeStyle({ width: 2, color: 0x40c0e0 });
        bg.circle(cx, cy, 40);
        bg.stroke();
        bg.moveTo(cx - 60, cy);
        bg.lineTo(cx + 60, cy);
        bg.moveTo(cx, cy - 60);
        bg.lineTo(cx, cy + 60);
        bg.stroke();

        return bg;
    }

    public async init(container: HTMLDivElement) {
        // Initialize PixiJS Application
        await this.app.init({
            resizeTo: window,
            backgroundColor: 0x0a6e8a,
        });

        if (this.isDestroyed) {
            this.destroyApp();
            return;
        }

        if (container) {
            container.appendChild(this.app.canvas);
        }

        // Setup world container with background
        const background = this.createBackground();
        this.world.addChild(background);

        // Setup Player at world center
        this.player.x = WORLD_SIZE / 2;
        this.player.y = WORLD_SIZE / 2;
        this.world.addChild(this.player);

        this.app.stage.addChild(this.world);

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
            }

            // Camera follow: offset world so player is always at screen center
            const screenCenterX = this.app.screen.width / 2;
            const screenCenterY = this.app.screen.height / 2;
            this.world.x = screenCenterX - this.player.x;
            this.world.y = screenCenterY - this.player.y;
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
