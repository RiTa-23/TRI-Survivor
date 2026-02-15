import { Application, Container, Graphics, TilingSprite, Assets } from "pixi.js";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { BasicEnemy } from "../entities/BasicEnemy";
import { Bullet } from "../entities/Bullet";
import { Item } from "../entities/Item";
import { Obstacle } from "../entities/Obstacle";
import { HandTrackingManager } from "@/lib/handTracking";
import type { Vector2D } from "@/lib/handTracking";
import { SkillType, SKILL_DEFINITIONS } from "../types";
import type { SkillOption, PlayerStats } from "../types";

/** Grid tile size (one cell) */
const GRID_SIZE = 80;
const GRID_LINE_COLOR = 0x0d7fa3;
const GRID_BG_COLOR = 0x0e8aaa;

/** Enemy spawn settings */
const SPAWN_INTERVAL_MS = 500;
const SPAWN_DISTANCE = 1000;
const MAX_ENEMIES = 30;
const DESPAWN_DISTANCE = SPAWN_DISTANCE * 1.5;

/** Obstacle settings */
const MAX_OBSTACLES = 15;
const OBSTACLE_SPAWN_DISTANCE = 1000; // 画面外
const OBSTACLE_DESPAWN_DISTANCE = 1500;
const OBSTACLE_MIN_RADIUS = 30;
const OBSTACLE_MAX_RADIUS = 50;
const OBSTACLE_SPAWN_INTERVAL = 0.5; // 秒

/** Item drop settings */
const ITEM_DESPAWN_DISTANCE = 2000;

export class GameApp {
    private app: Application;
    private player!: Player; // Initialized in init() after assets load
    private world: Container;
    private tilingBg!: TilingSprite;
    private enemies: Enemy[] = [];
    private bullets: Bullet[] = [];
    private items: Item[] = [];
    private obstacles: Obstacle[] = [];
    private obstacleSpawnTimer: number = 0;
    private spawnTimer: number = 0;
    private attackTimer: number = 0;
    private handTrackingManager: HandTrackingManager;
    private currentDirection: Vector2D | null = null;
    private videoElement: HTMLVideoElement;
    private canvasElement: HTMLCanvasElement;
    private isDestroyed = false;

    // --- State ---
    private isPaused = false;
    private onStatsUpdate?: (stats: PlayerStats) => void;
    private onLevelUpCallback?: (options: SkillOption[]) => void;

    constructor(
        videoElement: HTMLVideoElement,
        canvasElement: HTMLCanvasElement,
        onStatusChange?: (status: string) => void,
        onSpecialMove?: (moveName: string) => void,
        onStatsUpdate?: (stats: PlayerStats) => void,
        onLevelUp?: (options: SkillOption[]) => void
    ) {
        this.app = new Application();
        // this.player will be initialized in init()
        this.world = new Container();
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;

        this.onStatsUpdate = onStatsUpdate;
        this.onLevelUpCallback = onLevelUp;

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

        // Preload Assets
        try {
            await Assets.load([
                "/assets/images/player.png",
                "/assets/images/basic_enemy.png",
                "/assets/images/experience.png",
                "/assets/images/coin.png",
                "/assets/images/heal.png",
                "/assets/images/damage.png",
            ]);
        } catch (e) {
            console.error("Failed to load assets:", e);
            this.destroyApp();
            return;
        }

        if (this.isDestroyed) return;

        // Setup infinite tiling background (added to stage directly, not world)
        this.tilingBg = this.createGridTile();
        if (!this.isDestroyed) {
            this.app.stage.addChild(this.tilingBg);
        }

        // Initialize Player AFTER assets are loaded
        if (!this.isDestroyed) {
            this.player = new Player();
            this.player.x = 0;
            this.player.y = 0;

            // Handle Level Up
            this.player.onLevelUp = (level) => {
                this.handleLevelUp(level);
            };

            this.world.addChild(this.player);

            this.app.stage.addChild(this.world);
        }

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
            const dtMs = ticker.deltaMS;
            const dt = dtMs / 1000; // seconds

            if (this.isPaused) return;

            // Player movement & animation update
            if (this.currentDirection) {
                this.player.move(this.currentDirection.x, this.currentDirection.y, dt);
            }
            this.player.update(dt);

            // Check player vs obstacles
            this.checkPlayerObstacleCollisions();

            // Spawn enemies periodically
            this.spawnTimer += dtMs;
            if (this.spawnTimer >= SPAWN_INTERVAL_MS && this.enemies.length < MAX_ENEMIES) {
                this.spawnTimer = 0;
                this.spawnEnemy();
            }

            // Update enemies (movement + contact damage)
            this.updateEnemies(dt);

            // Check enemies vs obstacles (after movement)
            this.checkEnemyObstacleCollisions();

            // Check enemies vs enemies (prevent overlap)
            this.checkEnemyCollisions();

            // Check player vs enemies (prevent overlap)
            this.checkPlayerEnemyCollisions();

            // Auto-attack: shoot at multiple enemies
            this.attackTimer += dtMs;
            if (this.attackTimer >= this.player.attackInterval) {
                this.attackTimer = 0;
                this.shootMultipleEnemies();
            }

            // Update bullets
            this.updateBullets(dt);

            // Manage obstacles (spawn/despawn)
            this.updateObstacles(dt);

            // Update items (magnet & collect)
            this.updateItems(dt);

            // Notify UI of player stats
            this.emitStats();

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
                // Drop items from enemy
                const droppedItems = enemy.dropItems();
                droppedItems.forEach(item => {
                    this.items.push(item);
                    this.world.addChild(item);
                });

                this.world.removeChild(enemy);
                enemy.destroy();
                this.enemies.splice(i, 1);
                continue;
            }

            // Despawn enemies too far from player
            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            if (dx * dx + dy * dy > DESPAWN_DISTANCE * DESPAWN_DISTANCE) {
                this.world.removeChild(enemy);
                enemy.destroy();
                this.enemies.splice(i, 1);
                continue;
            }

            // Move toward player
            enemy.moveToward(this.player.x, this.player.y, dt);

            // Update enemy effects (damage popup, etc.)
            enemy.update(dt);

            // Continuous contact damage (per-second rate scaled by dt)
            if (enemy.isCollidingWith(this.player.x, this.player.y, this.player.radius)) {
                const damageThisFrame = enemy.attackPower * dt;
                this.player.takeDamage(damageThisFrame);
            }
        }
    }

    /** Find and shoot the nearest enemies based on projectile count */
    private shootMultipleEnemies(): void {
        if (this.enemies.length === 0) return;

        // Calculate distances
        const targets = this.enemies
            .filter(e => e.alive)
            .map(e => {
                const dx = e.x - this.player.x;
                const dy = e.y - this.player.y;
                return {
                    enemy: e,
                    distSqr: dx * dx + dy * dy
                };
            })
            .filter(t => t.distSqr <= 600 * 600) // Max range check
            .sort((a, b) => a.distSqr - b.distSqr);

        // Shoot at N nearest enemies
        const count = Math.min(targets.length, this.player.projectileCount);

        for (let i = 0; i < count; i++) {
            const target = targets[i].enemy;
            const bullet = new Bullet(
                this.player.x,
                this.player.y,
                target.x,
                target.y,
                this.player.attackPower
            );
            this.bullets.push(bullet);
            this.world.addChild(bullet);
        }
    }

    /** Update bullets: move, check collisions, remove dead */
    private updateBullets(dt: number): void {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update(dt);

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
                    enemy.takeDamage(bullet.damage, bullet.x, bullet.y);
                    bullet.kill();
                    this.world.removeChild(bullet);
                    bullet.destroy();
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }
    }

    // ─── Item System ─────────────────────────────────────────────

    /** アイテム更新ループ: マグネット移動 & 回収判定 */
    private updateItems(dt: number): void {
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];

            if (item.collected) {
                this.world.removeChild(item);
                item.destroy();
                this.items.splice(i, 1);
                continue;
            }

            // Despawn items too far from player
            const dx = item.x - this.player.x;
            const dy = item.y - this.player.y;
            if (dx * dx + dy * dy > ITEM_DESPAWN_DISTANCE * ITEM_DESPAWN_DISTANCE) {
                this.world.removeChild(item);
                item.destroy();
                this.items.splice(i, 1);
                continue;
            }

            // Update (magnet movement)
            item.update(dt, this.player);

            // Collect on contact
            if (item.isCollidingWith(this.player.x, this.player.y, this.player.radius)) {
                item.collect(this.player);
            }
        }
    }

    /** プレイヤーステータスをUIに通知 */
    private emitStats(): void {
        this.onStatsUpdate?.({
            coins: this.player.coins,
            exp: this.player.exp,
            hp: this.player.hp,
            maxHp: this.player.maxHp,
            level: this.player.level,
            nextLevelExp: this.player.nextLevelExp,
        });
    }

    /** 障害物を生成して配置 */
    private spawnObstacle(): void {
        const radius = OBSTACLE_MIN_RADIUS + Math.random() * (OBSTACLE_MAX_RADIUS - OBSTACLE_MIN_RADIUS);
        const obstacle = new Obstacle({ radius });

        // プレイヤーの周囲のランダムな位置（画面外）に配置
        const angle = Math.random() * Math.PI * 2;
        const distance = OBSTACLE_SPAWN_DISTANCE + Math.random() * 200;

        obstacle.x = this.player.x + Math.cos(angle) * distance;
        obstacle.y = this.player.y + Math.sin(angle) * distance;

        this.obstacles.push(obstacle);
        this.world.addChild(obstacle);
    }

    /** 障害物の更新（削除と生成） */
    private updateObstacles(dt: number): void {
        const despawnDistSqr = OBSTACLE_DESPAWN_DISTANCE * OBSTACLE_DESPAWN_DISTANCE;

        // Despawn far obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            const dx = obs.x - this.player.x;
            const dy = obs.y - this.player.y;
            const distSqr = dx * dx + dy * dy;

            if (distSqr > despawnDistSqr) {
                this.world.removeChild(obs);
                obs.destroy();
                this.obstacles.splice(i, 1);
            }
        }

        // Spawn new obstacles if needed
        if (this.obstacles.length < MAX_OBSTACLES) {
            this.obstacleSpawnTimer += dt;
            if (this.obstacleSpawnTimer >= OBSTACLE_SPAWN_INTERVAL) {
                this.obstacleSpawnTimer = 0;
                this.spawnObstacle();
            }
        }
    }

    /**
     * 円同士の衝突判定と押し戻しベクトル計算
     */
    private resolveCircleOverlap(
        x1: number, y1: number, r1: number,
        x2: number, y2: number, r2: number,
        pushRatio1: number
    ): { x: number, y: number } | null {
        const dx = x1 - x2;
        const dy = y1 - y2;
        const distSqr = dx * dx + dy * dy;
        const radiusSum = r1 + r2;

        if (distSqr >= radiusSum * radiusSum) return null;

        const dist = Math.sqrt(distSqr);
        const overlap = radiusSum - dist;

        let pushX: number, pushY: number;

        if (dist > 0) {
            pushX = (dx / dist) * overlap * pushRatio1;
            pushY = (dy / dist) * overlap * pushRatio1;
        } else {
            // 完全重複時のフォールバック: ランダムな方向に押し出す
            const angle = Math.random() * Math.PI * 2;
            pushX = Math.cos(angle) * overlap * pushRatio1;
            pushY = Math.sin(angle) * overlap * pushRatio1;
        }

        return { x: pushX, y: pushY };
    }

    /** プレイヤーと障害物の衝突判定（押し戻し） */
    private checkPlayerObstacleCollisions(): void {
        for (const obs of this.obstacles) {
            const push = this.resolveCircleOverlap(
                this.player.x, this.player.y, this.player.radius,
                obs.x, obs.y, obs.radius,
                1.0 // プレイヤーのみ動く
            );

            if (push) {
                this.player.x += push.x;
                this.player.y += push.y;
            }
        }
    }

    /** 敵と障害物の衝突判定（押し戻し） */
    private checkEnemyObstacleCollisions(): void {
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            for (const obs of this.obstacles) {
                const push = this.resolveCircleOverlap(
                    enemy.x, enemy.y, enemy.radius,
                    obs.x, obs.y, obs.radius,
                    1.0 // 敵のみ動く
                );

                if (push) {
                    enemy.x += push.x;
                    enemy.y += push.y;
                }
            }
        }
    }

    /** 敵同士の衝突判定（押し戻し） */
    private checkEnemyCollisions(): void {
        const count = this.enemies.length;
        for (let i = 0; i < count; i++) {
            const e1 = this.enemies[i];
            if (!e1.alive) continue;

            for (let j = i + 1; j < count; j++) {
                const e2 = this.enemies[j];
                if (!e2.alive) continue;

                // お互いに0.5ずつ動く
                const push = this.resolveCircleOverlap(
                    e1.x, e1.y, e1.radius,
                    e2.x, e2.y, e2.radius,
                    0.5
                );

                if (push) {
                    e1.x += push.x;
                    e1.y += push.y;
                    // e2は逆方向に同じだけ動く
                    e2.x -= push.x;
                    e2.y -= push.y;
                }
            }
        }
    }

    /** プレイヤーと敵の衝突判定（押し戻し） */
    private checkPlayerEnemyCollisions(): void {
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;

            // お互いに0.5ずつ動く
            const push = this.resolveCircleOverlap(
                this.player.x, this.player.y, this.player.radius,
                enemy.x, enemy.y, enemy.radius,
                0.5
            );

            if (push) {
                this.player.x += push.x;
                this.player.y += push.y;
                enemy.x -= push.x;
                enemy.y -= push.y;
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

        for (const obs of this.obstacles) {
            this.world.removeChild(obs);
            obs.destroy();
        }
        this.obstacles.length = 0;

        this.destroyApp();
    }

    public pauseGame() {
        this.isPaused = true;
    }

    public resumeGame() {
        this.isPaused = false;
    }

    public applySkill(skillType: SkillType) {
        this.player.addSkill(skillType);
        this.resumeGame();
        this.emitStats(); // Immediately update UI
    }

    private handleLevelUp(_level: number) {
        this.pauseGame();

        // Generate 3 random skill options
        const options = this.generateSkillOptions();
        this.onLevelUpCallback?.(options);
    }

    private generateSkillOptions(): SkillOption[] {
        const options: SkillOption[] = [];

        const acquiredSkills = this.player.getSkills();
        // Count unique passive skills (exclude HEAL and GET_COIN as they are instant)
        let uniquePassives = 0;
        const currentPassiveTypes: SkillType[] = [];

        for (const [type, _level] of acquiredSkills.entries()) {
            if (type !== SkillType.HEAL && type !== SkillType.GET_COIN) {
                uniquePassives++;
                currentPassiveTypes.push(type);
            }
        }

        let availableTypes: SkillType[] = [];

        if (uniquePassives >= 3) {
            // Can only pick from currently owned passives
            availableTypes = [...currentPassiveTypes];
        } else {
            // Can pick any passive skill (exclude instant ones)
            const allTypes = Object.values(SkillType);
            availableTypes = allTypes.filter(t => t !== SkillType.HEAL && t !== SkillType.GET_COIN);
        }

        // Shuffle
        const shuffled = availableTypes.sort(() => 0.5 - Math.random());

        // Pick top 3 valid options
        for (const type of shuffled) {
            if (options.length >= 3) break;

            const def = SKILL_DEFINITIONS[type];
            const currentLevel = this.player.getSkillLevel(type);

            if (currentLevel < def.maxLevel) {
                options.push({
                    type: type,
                    name: def.name,
                    description: def.description,
                    icon: def.icon,
                    level: currentLevel + 1
                });
            }
        }

        // Fallback: If no options available, offer HEAL or GET_COIN
        if (options.length === 0) {
            const fallbackType = Math.random() < 0.5 ? SkillType.HEAL : SkillType.GET_COIN;
            const def = SKILL_DEFINITIONS[fallbackType];

            options.push({
                type: fallbackType,
                name: def.name,
                description: def.description,
                icon: def.icon,
                level: 0
            });
        }

        return options;
    }
}
