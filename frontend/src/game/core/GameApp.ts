import { Application, Container, Graphics, TilingSprite } from "pixi.js";
import { Player } from "../entities/Player";
import { HandTrackingManager } from "@/lib/handTracking";
import type { Vector2D } from "@/lib/handTracking";

/** Grid tile size (one cell) */
const GRID_SIZE = 80;
const GRID_LINE_COLOR = 0x0d7fa3;
const GRID_BG_COLOR = 0x0e8aaa;

export class GameApp {
    private app: Application;
    private player: Player;
    private world: Container;
    private tilingBg!: TilingSprite;
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

    /** Create a single grid cell texture for infinite tiling */
    private createGridTile(): TilingSprite {
        const cell = new Graphics();

        // Fill one grid cell
        cell.rect(0, 0, GRID_SIZE, GRID_SIZE);
        cell.fill({ color: GRID_BG_COLOR });

        // Draw right and bottom edges (left and top are shared with neighbor)
        cell.setStrokeStyle({ width: 1, color: GRID_LINE_COLOR });
        cell.moveTo(GRID_SIZE, 0);
        cell.lineTo(GRID_SIZE, GRID_SIZE);
        cell.moveTo(0, GRID_SIZE);
        cell.lineTo(GRID_SIZE, GRID_SIZE);
        cell.stroke();

        // Generate a repeatable texture from the cell
        const texture = this.app.renderer.generateTexture(cell);
        cell.destroy();

        const tiling = new TilingSprite({
            texture,
            width: this.app.screen.width,
            height: this.app.screen.height,
        });

        return tiling;
    }

    public async init(container: HTMLDivElement) {
        // Initialize PixiJS Application
        await this.app.init({
            resizeTo: window,
            backgroundColor: GRID_BG_COLOR,
        });

        if (this.isDestroyed) {
            this.destroyApp();
            return;
        }

        if (container) {
            container.appendChild(this.app.canvas);
        }

        // Setup infinite tiling background (added to stage directly, not world)
        this.tilingBg = this.createGridTile();
        this.app.stage.addChild(this.tilingBg);

        // Setup Player at origin (world coordinates)
        this.player.x = 0;
        this.player.y = 0;
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
            const cx = this.app.screen.width / 2;
            const cy = this.app.screen.height / 2;
            this.world.x = cx - this.player.x;
            this.world.y = cy - this.player.y;

            // Scroll tiling background to match world offset
            this.tilingBg.tilePosition.x = this.world.x;
            this.tilingBg.tilePosition.y = this.world.y;

            // Resize tiling sprite if window size changed
            this.tilingBg.width = this.app.screen.width;
            this.tilingBg.height = this.app.screen.height;
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
