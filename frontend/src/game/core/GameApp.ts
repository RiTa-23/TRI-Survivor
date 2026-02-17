import { Application, Container, Graphics, TilingSprite, Assets } from "pixi.js";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { BasicEnemy } from "../entities/BasicEnemy";
import { Bullet } from "../entities/Bullet";
import { Item } from "../entities/Item";
import { Obstacle } from "../entities/Obstacle";
import { HandTrackingManager } from "@/lib/handTracking";
import type { Vector2D } from "@/lib/handTracking";
import { SkillType, SKILL_DEFINITIONS, WEAPON_TYPES } from "../types";
import type { SkillOption, PlayerStats } from "../types";
import { GunWeapon } from "../weapons/GunWeapon";
import { SwordWeapon } from "../weapons/SwordWeapon";
import { SpecialSkillType } from "../types";

/** Grid tile size (one cell) - Deprecated/Unused */
// const GRID_SIZE = 80;
// const GRID_LINE_COLOR = 0x0d7fa3;
const GRID_BG_COLOR = 0x0e8aaa;

/** Enemy spawn settings */
const SPAWN_INTERVAL_MS = 500;
const SPAWN_DISTANCE = 1000;
const MAX_ENEMIES = 100;
const DESPAWN_DISTANCE = SPAWN_DISTANCE * 1.5;
const SPECIAL_EFFECT_DURATION = 10.0;
const GAME_CLEAR_TIME = 333; // 5 minutes 33 seconds

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
    private handTrackingManager: HandTrackingManager;
    private currentDirection: Vector2D | null = null;
    private videoElement: HTMLVideoElement;
    private canvasElement: HTMLCanvasElement;
    private isDestroyed = false;

    // --- State ---
    private isPaused = false;
    private onStatsUpdate?: (stats: PlayerStats) => void;
    private onLevelUpCallback?: (options: SkillOption[]) => void;
    private onGameEndCallback?: (stats: PlayerStats, isClear: boolean) => void;
    private elapsedTime: number = 0;
    private killCount: number = 0;
    private lastEmittedTime: number = 0;

    // --- Debug Properties ---
    private debugMode: boolean = false;
    private keysPressed: Set<string> = new Set();

    // --- Special Skill State ---
    private specialGauge: number = 0;
    private specialMaxCooldown: number = 20; // Initial cooldown 20s
    private activeSpecialType: SpecialSkillType = SpecialSkillType.MURYO_KUSHO;
    private specialEffectTimer: number = 0;
    private isSpecialEffectActive: boolean = false;
    private domainOverlayWithFade: Graphics | null = null;
    private domainExpansionMaxRadius: number = 0;
    private domainExpansionCurrentRadius: number = 0;

    // --- Kon Special Skill State ---
    private konGraphics: Container | null = null;
    private isKonActive: boolean = false;
    private konVelocity: number = 1500; // Faster
    private konHitboxRadius: number = 800; // Smaller than visual length to better match shape
    private static readonly KON_VISUAL_SCALE = 4.0;
    private static readonly KON_HITBOX_OFFSET_X = 200; // Based on shape
    private static readonly INSTANT_KILL_DAMAGE = Number.MAX_SAFE_INTEGER;

    constructor(
        videoElement: HTMLVideoElement,
        canvasElement: HTMLCanvasElement,
        onStatusChange?: (status: string) => void,
        onSpecialMove?: (moveName: string) => void,
        onStatsUpdate?: (stats: PlayerStats) => void,
        onLevelUp?: (options: SkillOption[]) => void,
        onGameEnd?: (stats: PlayerStats, isClear: boolean) => void
    ) {
        this.app = new Application();
        // this.player will be initialized in init()
        this.world = new Container();
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;

        this.onStatsUpdate = onStatsUpdate;
        this.onLevelUpCallback = onLevelUp;
        this.onGameEndCallback = onGameEnd;

        this.handTrackingManager = new HandTrackingManager((vector) => {
            this.currentDirection = vector;
        }, onStatusChange, (move) => {
            if (onSpecialMove) onSpecialMove(move);
            this.handleSpecialMove(move);
        });
    }

    /** Create a single grid cell texture for infinite tiling */
    // private createGridTile(): TilingSprite { ... } // Removed

    public async init(container: HTMLDivElement) {
        // Initialize PixiJS Application
        await this.app.init({
            resizeTo: window,
            backgroundColor: GRID_BG_COLOR,
        });

        // Debug Mode Check
        const params = new URLSearchParams(window.location.search);
        if (params.get("debug") === "true") {
            this.debugMode = true;
            console.log("DEBUG MODE ACTIVE: Keyboard controls enabled (WASD / Arrows)");
            window.addEventListener("keydown", this.handleKeyDown);
            window.addEventListener("keyup", this.handleKeyUp);
        }

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
                "/assets/images/Player_1.png",
                "/assets/images/enemy_1.png",
                "/assets/images/EXP_1.png",
                "/assets/images/EXP_2.png",
                "/assets/images/EXP_3.png",
                "/assets/images/coin.png",
                "/assets/images/potion.png",
                "/assets/images/damage.png",
                "/assets/images/skills/gun.png",
                "/assets/images/skills/sword.png",
                "/assets/images/field_grass.png",
            ]);
        } catch (e) {
            console.error("Failed to load assets:", e);
            this.destroyApp();
            return;
        }

        if (this.isDestroyed) return;

        // Setup infinite tiling background (added to stage directly, not world)
        // Use loaded texture
        const grassTexture = Assets.get("/assets/images/field_grass.png");
        this.tilingBg = new TilingSprite({
            texture: grassTexture,
            width: this.app.screen.width,
            height: this.app.screen.height,
        });

        if (!this.isDestroyed) {
            this.app.stage.addChild(this.tilingBg);
        }

        // Initialize Player AFTER assets are loaded
        if (!this.isDestroyed) {
            this.player = new Player();
            this.player.x = 0;
            this.player.y = 0;
            this.elapsedTime = 0;
            this.killCount = 0;
            this.lastEmittedTime = 0;
            this.specialGauge = 0;
            this.specialEffectTimer = 0;
            this.isSpecialEffectActive = false;

            // Handle Level Up
            this.player.onLevelUp = (level) => {
                this.handleLevelUp(level);
            };

            this.world.addChild(this.player);

            // Initial Weapon
            this.player.addWeapon(new SwordWeapon());


            // Initialize Domain Expansion Overlay (BEHIND world)
            this.domainOverlayWithFade = new Graphics();
            this.domainOverlayWithFade.visible = false;
            this.app.stage.addChild(this.domainOverlayWithFade);

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



        // Initialize Kon Visual Effect (Top Layer)
        if (!this.isDestroyed) {
            this.konGraphics = new Container();
            this.konGraphics.visible = false;

            const s = GameApp.KON_VISUAL_SCALE; // Scale factor
            const g = new Graphics();

            // Main Head (Orange Triangle)
            g.poly([-150 * s, 0, 150 * s, -100 * s, 150 * s, 100 * s]);
            g.fill({ color: 0xFF8800 });

            // Ears
            g.poly([50 * s, -100 * s, 100 * s, -200 * s, 150 * s, -100 * s]);
            g.poly([50 * s, 100 * s, 100 * s, 200 * s, 150 * s, 100 * s]);
            g.fill({ color: 0xCC6600 });

            // Eyes (White + Black)
            g.circle(0, -30 * s, 15 * s);
            g.circle(0, 30 * s, 15 * s);
            g.fill({ color: 0xFFFFFF });
            g.circle(-5 * s, -30 * s, 5 * s);
            g.circle(-5 * s, 30 * s, 5 * s);
            g.fill({ color: 0x000000 });

            this.konGraphics.addChild(g);

            // Add to stage (Top most)
            this.app.stage.addChild(this.konGraphics);
        }

        // Start Game Loop
        this.app.start();

        this.app.ticker.add((ticker) => {
            const dtMs = ticker.deltaMS;
            const dt = dtMs / 1000; // seconds

            if (this.isPaused) return;

            this.elapsedTime += dt;

            // Check Game Clear
            if (this.elapsedTime >= GAME_CLEAR_TIME && !this.isDestroyed) {
                this.handleGameEnd(true);
                return;
            }

            // Check Game Over
            if (this.player.hp <= 0 && !this.isDestroyed) {
                this.handleGameEnd(false);
                return;
            }

            // Player movement & animation update
            if (this.debugMode && this.keysPressed.size > 0) {
                const kbDir = this.getKeyboardDirection();
                if (kbDir) {
                    this.currentDirection = kbDir;
                }
            }

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

            // Auto-attack: Update weapons
            this.player.updateWeapons(dt, this.enemies);

            // Update bullets
            this.updateBullets(dt);

            // Manage obstacles (spawn/despawn)
            this.updateObstacles(dt);

            // Update items (magnet & collect)
            this.updateItems(dt);

            // --- Special Skill Update ---
            this.updateSpecialSkill(dt);

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

        // If special effect is active, freeze the new enemy immediately
        if (this.isSpecialEffectActive && this.activeSpecialType === SpecialSkillType.MURYO_KUSHO) {
            enemy.isFrozen = true;
        }

        this.enemies.push(enemy);
        this.world.addChild(enemy);
    }

    /** Update all enemies: move toward player, apply continuous contact damage */
    private updateEnemies(dt: number): void {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (!enemy.alive) {
                this.killCount++;
                this.player.dirty = true; // Force UI update on kill
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

    private spawnBullet(bullet: Bullet) {
        this.bullets.push(bullet);
        this.world.addChild(bullet);
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
        const currentIntTime = Math.floor(this.elapsedTime);
        const lastIntTime = Math.floor(this.lastEmittedTime);

        // Emit if dirty OR if integer time changed (for clock update)
        if (!this.player.dirty && currentIntTime === lastIntTime) return;


        this.onStatsUpdate?.({
            coins: this.player.coins,
            exp: this.player.exp,
            hp: this.player.hp,
            maxHp: this.player.maxHp,
            level: this.player.level,
            nextLevelExp: this.player.nextLevelExp,
            weapons: this.player.activeWeapons.map(w => ({ type: w.type, level: w.level })),
            passives: Array.from(this.player.getSkills().entries())
                .filter(([t]) => t !== SkillType.HEAL && t !== SkillType.GET_COIN)
                .map(([type, level]) => ({ type, level })),
            specialGauge: this.specialGauge,
            maxSpecialGauge: this.specialMaxCooldown,
            activeSpecialType: this.activeSpecialType,
            time: this.elapsedTime,
            killCount: this.killCount,
        });
        this.player.dirty = false;
        this.lastEmittedTime = this.elapsedTime;
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

            if (this.debugMode) {
                window.removeEventListener("keydown", this.handleKeyDown);
                window.removeEventListener("keyup", this.handleKeyUp);
            }
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
        if (skillType === SkillType.GUN) {
            // Pass private spawnBullet via arrow function
            this.player.addWeapon(new GunWeapon((b) => this.spawnBullet(b)));
        } else if (skillType === SkillType.SWORD) {
            this.player.addWeapon(new SwordWeapon());
        } else {
            this.player.addSkill(skillType);
        }

        this.resumeGame();
        this.emitStats(); // Immediately update UI
    }

    private handleLevelUp(_level: number) {
        this.pauseGame();

        // Generate 3 random skill options
        const options = this.generateSkillOptions();

        if (this.onLevelUpCallback) {
            this.onLevelUpCallback(options);
        } else {
            // If no callback is registered, we must resume immediately or the game freezes
            console.warn("No onLevelUpCallback registered, resuming game immediately.");
            this.resumeGame();
        }
    }

    private generateSkillOptions(): SkillOption[] {
        const options: SkillOption[] = [];

        // Identify current state
        const acquiredSkills = this.player.getSkills(); // Map<SkillType, level> - Passives are here
        const activeWeapons = this.player.activeWeapons; // Weapon[]

        const currentPassiveTypes = Array.from(acquiredSkills.keys())
            .filter(t => t !== SkillType.HEAL && t !== SkillType.GET_COIN);

        const currentWeaponTypes = activeWeapons.map(w => w.type);

        const canAddPassive = currentPassiveTypes.length < 3;
        const canAddWeapon = activeWeapons.length < 3;

        // Candidate Types
        const allTypes = Object.values(SkillType).filter(t => t !== SkillType.HEAL && t !== SkillType.GET_COIN);

        let candidates: SkillType[] = [];

        for (const type of allTypes) {
            // Check max level first
            const def = SKILL_DEFINITIONS[type];
            let level = 0;

            if (WEAPON_TYPES.has(type)) {
                const w = this.player.getWeapon(type);
                level = w ? w.level : 0;
            } else {
                level = this.player.getSkillLevel(type);
            }

            if (level >= def.maxLevel) continue;

            if (WEAPON_TYPES.has(type)) {
                const hasIt = currentWeaponTypes.includes(type);
                // Can pick if we have it (for upgrade) OR if we have space for new
                if (hasIt || canAddWeapon) {
                    candidates.push(type);
                }
            } else {
                // Passive
                const hasIt = currentPassiveTypes.includes(type);
                if (hasIt || canAddPassive) {
                    candidates.push(type);
                }
            }
        }

        // SPECIAL_COOLDOWN_CUT is treated as a normal passive skill and counts towards the 3-skill limit.

        // Shuffle (Fisher-Yates)
        for (let i = candidates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
        }

        // Pick top 3 valid options
        for (const type of candidates) {
            if (options.length >= 3) break;

            const def = SKILL_DEFINITIONS[type];
            let level = 0;

            if (WEAPON_TYPES.has(type)) {
                const w = this.player.getWeapon(type);
                level = w ? w.level : 0;
            } else {
                level = this.player.getSkillLevel(type);
            }

            options.push({
                type: type,
                name: def.name,
                description: def.description,
                icon: def.icon,
                level: level + 1
            });
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
                level: 1 // Treated as Lv.1 internally for consistency
            });
        }

        return options;
    }

    // --- Keyboard Handlers (Debug) ---
    private handleKeyDown = (e: KeyboardEvent) => {
        if (!this.debugMode) return;
        this.keysPressed.add(e.code);
    };

    private handleKeyUp = (e: KeyboardEvent) => {
        if (!this.debugMode) return;
        this.keysPressed.delete(e.code);
    };

    private getKeyboardDirection(): Vector2D | null {
        let x = 0;
        let y = 0;

        if (this.keysPressed.has("KeyW") || this.keysPressed.has("ArrowUp")) y -= 1;
        if (this.keysPressed.has("KeyS") || this.keysPressed.has("ArrowDown")) y += 1;
        if (this.keysPressed.has("KeyA") || this.keysPressed.has("ArrowLeft")) x -= 1;
        if (this.keysPressed.has("KeyD") || this.keysPressed.has("ArrowRight")) x += 1;

        if (x === 0 && y === 0) return null;

        const length = Math.sqrt(x * x + y * y);
        return { x: x / length, y: y / length };
    }

    // --- Special Skill Logic ---

    private updateSpecialSkill(dt: number) {
        // Handle Active Effect Duration
        if (this.isSpecialEffectActive) {
            this.specialEffectTimer -= dt;

            // --- Domain Expansion Visual Effect ---
            if (this.activeSpecialType === SpecialSkillType.MURYO_KUSHO && this.domainOverlayWithFade) {
                // Expansion Animation (First 0.5s)
                const expansionDuration = 0.5;
                const timeActive = SPECIAL_EFFECT_DURATION - this.specialEffectTimer;

                if (timeActive < expansionDuration) {
                    // Growing phase
                    const progress = timeActive / expansionDuration;
                    // Easing for impact (easeOutCubic)
                    const t = 1 - Math.pow(1 - progress, 3);
                    this.domainExpansionCurrentRadius = this.domainExpansionMaxRadius * t;
                } else {
                    // Fully expanded
                    this.domainExpansionCurrentRadius = this.domainExpansionMaxRadius;
                }

                // Draw Overlay
                this.domainOverlayWithFade.clear();

                // 1. Dark Overlay (Dim everything outside the domain or inside? The request: centers expands, covers screen, dimmer)
                // "Circular area expands ... covers the screen ... whole screen becomes dimmer"
                // Implementation: Draw a black circle with alpha 0.5

                const centerX = this.app.screen.width / 2;
                const centerY = this.app.screen.height / 2;

                this.domainOverlayWithFade.circle(centerX, centerY, this.domainExpansionCurrentRadius);
                this.domainOverlayWithFade.fill({ color: 0x000000, alpha: 0.6 }); // Darker dim
            }

            if (this.specialEffectTimer <= 0) {
                this.endSpecialSkill();
            }
            return; // Don't charge gauge while active
        }

        // --- Kon Update Logic ---
        if (this.isKonActive && this.konGraphics) {
            // Move Left
            this.konGraphics.x -= this.konVelocity * dt;

            // Collision Detection (Circle based for simplicity)
            // Kon position is in Screen Coordinates.
            // Enemy position is in World Coordinates.
            // Need to convert Enemy World -> Screen to check, or Kon Screen -> World.
            // Easier: Kon Screen -> World.
            const konWorldX = this.konGraphics.x - this.world.x;
            const konWorldY = this.konGraphics.y - this.world.y;

            // Check collisions
            this.enemies.forEach(enemy => {
                if (!enemy.alive) return;
                // Visual Tip is around (-600, 0).
                // Hitbox is slightly offset left from the visual center (tip of the head)
                const dx = enemy.x - konWorldX - GameApp.KON_HITBOX_OFFSET_X;
                const dy = enemy.y - konWorldY;
                const distSq = dx * dx + dy * dy;

                // Hitbox radius
                const r = this.konHitboxRadius;
                if (distSq < r * r) {
                    enemy.takeDamage(GameApp.INSTANT_KILL_DAMAGE, konWorldX, konWorldY);
                }
            });

            // End Condition (Off screen left)
            // Since it's huge, wait until it's far off
            if (this.konGraphics.x < -1000) {
                this.isKonActive = false;
                this.konGraphics.visible = false;
                if (this.debugMode) console.log("Kon Finished");
            }

            // Kon blocks gauge charge too? Yes, usually.
            return;
        }

        // Calculate Max Cooldown based on passive
        const cooldownCutLevel = this.player.getSkillLevel(SkillType.SPECIAL_COOLDOWN_CUT);
        // 10% per level (max 50%)
        const reductionRatio = Math.min(0.5, cooldownCutLevel * 0.1);
        this.specialMaxCooldown = 20 * (1.0 - reductionRatio);

        // Charge Gauge
        if (this.specialGauge < this.specialMaxCooldown) {
            this.specialGauge += dt;
            if (this.specialGauge > this.specialMaxCooldown) {
                this.specialGauge = this.specialMaxCooldown;
            }
        }

        // Toggle detection based on gauge
        const isReady = this.specialGauge >= this.specialMaxCooldown;
        this.handTrackingManager.setSpecialMoveDetection(isReady);
    }

    private handleGameEnd(isClear: boolean) {
        this.pauseGame();
        this.isDestroyed = true; // Prevent multiple calls
        // Emit final stats
        if (this.onGameEndCallback) {
            this.onGameEndCallback({
                coins: this.player.coins,
                exp: this.player.exp,
                hp: this.player.hp,
                maxHp: this.player.maxHp,
                level: this.player.level,
                nextLevelExp: this.player.nextLevelExp,
                weapons: this.player.activeWeapons.map(w => ({ type: w.type, level: w.level })),
                passives: Array.from(this.player.getSkills().entries())
                    .filter(([t]) => t !== SkillType.HEAL && t !== SkillType.GET_COIN)
                    .map(([type, level]) => ({ type, level })),
                specialGauge: this.specialGauge,
                maxSpecialGauge: this.specialMaxCooldown,
                activeSpecialType: this.activeSpecialType,
                time: this.elapsedTime,
                killCount: this.killCount,
            }, isClear);
        }
    }

    private handleSpecialMove(moveName: string) {
        // "Muryo Kusho" -> SpecialSkillType.MURYO_KUSHO (Exact match check)
        let type: SpecialSkillType | null = null;
        if (moveName === "Muryo Kusho") type = SpecialSkillType.MURYO_KUSHO;
        else if (moveName === "Kon") type = SpecialSkillType.KON;

        if (type && type === this.activeSpecialType) {
            if (this.specialGauge >= this.specialMaxCooldown && !this.isSpecialEffectActive) {
                this.executeSpecialSkill(type);
                this.specialGauge = 0; // Reset gauge
                this.handTrackingManager.setSpecialMoveDetection(false);
            }
        }
    }

    private executeSpecialSkill(type: SpecialSkillType) {
        if (type === SpecialSkillType.MURYO_KUSHO) {
            console.log("EXECUTING SPECIAL: MURYO KUSHO");
            this.isSpecialEffectActive = true;
            this.specialEffectTimer = SPECIAL_EFFECT_DURATION;

            // Apply Effects
            this.player.setSpecialMode(true);

            // Freeze all enemies
            this.enemies.forEach(enemy => {
                enemy.isFrozen = true;
            });

            // Visual feedback (optional log)
            if (this.debugMode) console.log("Domain Expansion: Infinite Void - Active for 10s");

            // Initialize Visual Effect
            if (this.domainOverlayWithFade) {
                this.domainOverlayWithFade.visible = true;
                // Determine max radius needed to cover the screen from center
                const w = this.app.screen.width;
                const h = this.app.screen.height;
                // Hypotenuse / 2 to cover corners
                this.domainExpansionMaxRadius = Math.sqrt(w * w + h * h) * 0.6; // Slightly larger to be safe
                this.domainExpansionCurrentRadius = 0;
            }
        } else if (type === SpecialSkillType.KON) {
            if (this.debugMode) console.log("EXECUTING SPECIAL: KON");

            if (this.konGraphics) {
                this.isKonActive = true;
                this.konGraphics.visible = true;
                // Start right side, vertically centered
                // Spawn further right because it's huge
                this.konGraphics.x = this.app.screen.width + 1200;
                this.konGraphics.y = this.app.screen.height / 2;

                if (this.debugMode) console.log("Kon visual started");
            }
        }
    }

    private endSpecialSkill() {
        if (this.debugMode) console.log("ENDING SPECIAL SKILL");
        this.isSpecialEffectActive = false;
        this.specialEffectTimer = 0;

        // Reset Effects
        this.player.setSpecialMode(false);

        // Unfreeze all enemies
        this.enemies.forEach(enemy => {
            enemy.isFrozen = false;
        });

        // Resume gauge charging (handled in next update)

        // Reset Visual Effect
        if (this.domainOverlayWithFade) {
            this.domainOverlayWithFade.visible = false;
            this.domainOverlayWithFade.clear();
        }
    }
}
