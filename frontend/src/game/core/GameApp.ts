import { Application, Container, Graphics, TilingSprite } from "pixi.js";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { BasicEnemy } from "../entities/BasicEnemy";
import { Bullet } from "../entities/Bullet";
import { HandTrackingManager } from "@/lib/handTracking";
import type { Vector2D } from "@/lib/handTracking";

/** Grid tile size (one cell) */
const GRID_SIZE = 80;
const GRID_LINE_COLOR = 0x0d7fa3;
const GRID_BG_COLOR = 0x0e8aaa;

/** Enemy spawn settings */
const SPAWN_INTERVAL_MS = 500;
const SPAWN_DISTANCE = 1000;
const MAX_ENEMIES = 100;

export class GameApp {
    private app: Application;
    private player: Player;
    private world: Container;
    private tilingBg!: TilingSprite;
    private enemies: Enemy[] = [];
    private bullets: Bullet[] = [];
    private spawnTimer: number = 0;
    private attackTimer: number = 0;
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

        this.app.ticker.add((ticker) => {
            const dt = ticker.deltaMS;

            // Player movement
            if (this.currentDirection) {
                this.player.move(this.currentDirection.x, this.currentDirection.y);
            }

            // Spawn enemies periodically
            this.spawnTimer += dt;
            if (this.spawnTimer >= SPAWN_INTERVAL_MS && this.enemies.length < MAX_ENEMIES) {
                this.spawnTimer = 0;
                this.spawnEnemy();
            }

            // Update enemies (movement + contact damage)
            this.updateEnemies(dt);

            // Auto-attack: shoot at nearest enemy
            this.attackTimer += dt;
            if (this.attackTimer >= this.player.attackInterval) {
                this.attackTimer = 0;
                this.shootNearestEnemy();
            }

            // Update bullets
            this.updateBullets();

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

    /** Spawn a new enemy at a random position around the player */
    private spawnEnemy(): void {
        const enemy = new BasicEnemy();

        // Random angle around the player
        const angle = Math.random() * Math.PI * 2;
        enemy.x = this.player.x + Math.cos(angle) * SPAWN_DISTANCE;
        enemy.y = this.player.y + Math.sin(angle) * SPAWN_DISTANCE;

        this.enemies.push(enemy);
        this.world.addChild(enemy);
    }

    /** Update all enemies: move toward player, apply continuous contact damage */
    private updateEnemies(dt: number): void {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (!enemy.alive) {
                this.world.removeChild(enemy);
                enemy.destroy();
                this.enemies.splice(i, 1);
                continue;
            }

            // Move toward player
            enemy.moveToward(this.player.x, this.player.y);

            // Continuous contact damage (per-second rate scaled by dt)
            if (enemy.isCollidingWith(this.player.x, this.player.y, this.player.radius)) {
                const damageThisFrame = enemy.attackPower * (dt / 1000);
                this.player.takeDamage(damageThisFrame);
            }
        }
    }

    /** Find and shoot the nearest enemy */
    private shootNearestEnemy(): void {
        if (this.enemies.length === 0) return;

        let nearest: Enemy | null = null;
        let nearestDist = Infinity;

        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = enemy;
            }
        }

        if (!nearest || nearestDist > 600) return; // Max attack range

        const bullet = new Bullet(
            this.player.x,
            this.player.y,
            nearest.x,
            nearest.y,
            this.player.attackPower
        );
        this.bullets.push(bullet);
        this.world.addChild(bullet);
    }

    /** Update bullets: move, check collisions, remove dead */
    private updateBullets(): void {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update();

            if (!bullet.alive) {
                this.world.removeChild(bullet);
                bullet.destroy();
                this.bullets.splice(i, 1);
                continue;
            }

            // Check collision with enemies
            for (const enemy of this.enemies) {
                if (!enemy.alive) continue;
                if (bullet.isCollidingWith(enemy.x, enemy.y, enemy.radius)) {
                    enemy.takeDamage(bullet.damage);
                    bullet.kill();
                    this.world.removeChild(bullet);
                    bullet.destroy();
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }
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
