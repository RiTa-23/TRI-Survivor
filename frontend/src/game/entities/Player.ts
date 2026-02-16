import { Container, Sprite } from "pixi.js";
import { HPBar } from "./HPBar";
import { SkillType, SKILL_DEFINITIONS } from "../types";
import { Weapon } from "../weapons/Weapon";
import { Enemy } from "./Enemy";

const DAMAGE_FLASH_DURATION = 0.1; // seconds
const BASE_ATTACK_POWER = 10;

export class Player extends Container {
    private sprite: Sprite;
    private hpBar: HPBar;

    // --- Stats ---
    private _hp: number;
    private _maxHp: number;
    private _speed: number;
    private _attackPower: number;
    /** 攻撃間隔 (ms) — 値が小さいほど速く撃つ */
    // Removed unused field

    /** Dirty flag for UI updates */
    public dirty: boolean = true;


    /** General speed multiplier */
    private _speedMultiplier: number = 1.0;
    /** Damage reduction percentage (0-100) */
    private _defense: number = 0;
    /** Number of projectiles fired at once */
    private _projectileCount: number = 1;
    /** Experience gain multiplier */
    private _expMultiplier: number = 1.0;
    /** Magnet range multiplier */
    private _magnetMultiplier: number = 1.0;

    // --- Resources ---
    private _coins: number = 0;
    private _exp: number = 0;

    /** マグネット吸い寄せ半径 (base) */
    private _baseMagnetRadius: number = 100;
    /** マグネット移動速度 */
    private _magnetSpeed: number = 300;

    // --- Level ---
    private _level: number = 1;
    private _nextLevelExp: number;

    // --- Skills ---
    private skills: Map<SkillType, number> = new Map();

    /** ダメージ演出用のタイマー */
    private damageFlashTimer: number = 0;

    /** 当たり判定の半径 */
    public readonly radius: number = 40;

    constructor() {
        super();

        // Default stats
        this._maxHp = 100;
        this._hp = this._maxHp;
        this._speed = 150; // px/sec
        this._attackPower = 10; // Initial attack power


        // Initial Level Exp
        this._nextLevelExp = this.calculateNextLevelExp();

        // Create Player Sprite
        this.sprite = Sprite.from("/assets/images/player.png");
        this.sprite.anchor.set(0.5);

        // アスペクト比を維持してリサイズ
        const scale = (this.radius * 2) / Math.max(this.sprite.texture.width, this.sprite.texture.height);
        this.sprite.scale.set(scale);

        this.addChild(this.sprite);

        // HP Bar (above player)
        this.hpBar = new HPBar({ width: 45, height: 4, offsetY: -(this.radius + 12) });
        this.addChild(this.hpBar);
    }

    public move(dx: number, dy: number, dt: number): void {
        this.x += dx * this._speed * this._speedMultiplier * dt;
        this.y += dy * this._speed * this._speedMultiplier * dt;
    }

    /** ダメージを受ける */
    public takeDamage(amount: number): void {
        // Apply defense (percentage reduction)
        // max defense 80% to avoid invincibility
        const def = Math.min(80, this._defense);
        const multiplier = 1 - (def / 100);
        const actualDamage = Math.max(0, amount * multiplier);

        this._hp = Math.max(0, this._hp - actualDamage);
        this.hpBar.update(this._hp / this._maxHp);
        // Flash red
        this.damageFlashTimer = DAMAGE_FLASH_DURATION;
        this.sprite.tint = 0xff4444;
        this.dirty = true;
    }

    /** HPを回復する */
    public heal(amount: number): void {
        this._hp = Math.min(this._maxHp, this._hp + amount);
        this.hpBar.update(this._hp / this._maxHp);
        this.dirty = true;
    }

    /** 毎フレーム呼び出してフラッシュを更新 */
    public update(dt: number): void {
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= dt;
            if (this.damageFlashTimer <= 0) {
                this.damageFlashTimer = 0;
                this.sprite.tint = 0xffffff;
            }
        }
    }

    // --- Resource methods ---

    /** コインを追加 */
    public addCoins(amount: number): void {
        this._coins += amount;
        this.dirty = true;
    }

    public onLevelUp?: (level: number) => void;

    /** 経験値を追加 */
    public addExp(amount: number): void {
        this._exp += Math.ceil(amount * this._expMultiplier);

        // Check for Level Up
        while (this._exp >= this._nextLevelExp) {
            this.levelUp();
        }
    }

    private levelUp(): void {
        this._exp -= this._nextLevelExp;
        this._level++;
        this._nextLevelExp = this.calculateNextLevelExp();
        this.dirty = true;

        console.log(`Level Up! Lv.${this._level}`);
        if (this.onLevelUp) {
            this.onLevelUp(this._level);
        }
    }

    /** スキルを追加・強化する */
    public addSkill(type: SkillType): void {
        const def = SKILL_DEFINITIONS[type];

        // Instant effects (do not store in skills map)
        if (type === SkillType.HEAL) {
            this.heal(def.value || 30);
            console.log(`Resource acquired: ${type} (Instant)`);
            return;
        }
        if (type === SkillType.GET_COIN) {
            this.addCoins(def.value || 50);
            console.log(`Resource acquired: ${type} (Instant)`);
            return;
        }

        const currentLevel = this.skills.get(type) || 0;
        this.skills.set(type, currentLevel + 1);

        console.log(`Resource acquired: ${type} (Lv.${currentLevel + 1})`);

        // Apply stats based on skill type
        switch (type) {
            case SkillType.ATTACK_UP:
                // Base attack + 20% per level
                this._attackPower += 2;
                break;
            case SkillType.DEFENSE_UP:
                // +10 Defense (10% reduction)
                this._defense += 10;
                break;
            case SkillType.SPEED_UP:
                // +10% Speed
                this._speedMultiplier += 0.1;
                break;
            case SkillType.COOLDOWN_DOWN:
                // Reduce cooldown by 10%
                this._cooldownMultiplier *= 0.9;
                break;
            case SkillType.MULTI_SHOT:
                // +1 Projectile
                this._projectileCount += 1;
                break;
            case SkillType.MAGNET_UP:
                // +25% Range
                this._magnetMultiplier += 0.25;
                break;
            case SkillType.EXP_UP:
                // +10% EXP
                this._expMultiplier += 0.1;
                break;
            default:
                break;
        }
        this.dirty = true;
    }

    public getSkillLevel(type: SkillType): number {
        return this.skills.get(type) || 0;
    }

    public getSkills(): Map<SkillType, number> {
        return new Map(this.skills); // Defensive copy
    }

    private calculateNextLevelExp(): number {
        return Math.floor(10 * Math.pow(1.3, this._level - 1));
    }

    // --- Weapons ---
    private weapons: Weapon[] = [];

    // --- Cooldowns ---
    private _cooldownMultiplier: number = 1.0;

    /** 武器を追加・強化する */
    public addWeapon(weapon: Weapon): void {
        const existing = this.weapons.find(w => w.type === weapon.type);
        if (existing) {
            existing.upgrade();
            // Destroy the new instance since we updated the existing one
            weapon.destroy();
        } else {
            this.weapons.push(weapon);
            this.addChild(weapon); // Add visual container (for Sword etc)
        }
        this.dirty = true;
    }

    public hasWeapon(type: SkillType): boolean {
        return this.weapons.some(w => w.type === type);
    }

    public getWeapon(type: SkillType): Weapon | undefined {
        return this.weapons.find(w => w.type === type);
    }

    public get activeWeapons(): Weapon[] {
        return [...this.weapons]; // Defensive copy
    }

    public updateWeapons(dt: number, enemies: Enemy[]): void {
        // Calculate functionality-based multiplier
        // Treating (this._attackPower / BASE_ATTACK_POWER) as the multiplier.
        const damageMultiplier = this._attackPower / BASE_ATTACK_POWER;

        for (const weapon of this.weapons) {
            weapon.update(dt, enemies, this.x, this.y, damageMultiplier, this._cooldownMultiplier, this._projectileCount);
        }
    }

    // --- Getters ---
    public get hp(): number { return this._hp; }
    public get maxHp(): number { return this._maxHp; }
    public get speed(): number { return this._speed; }
    public get attackPower(): number { return this._attackPower; }
    // public get attackInterval(): number { return this._attackInterval; } // Deprecated
    public get coins(): number { return this._coins; }
    public get exp(): number { return this._exp; }
    public get level(): number { return this._level; }
    public get nextLevelExp(): number { return this._nextLevelExp; }
    public get magnetRadius(): number { return this._baseMagnetRadius * this._magnetMultiplier; }
    public get magnetSpeed(): number { return this._magnetSpeed; }
    public get alive(): boolean { return this._hp > 0; }
    public get projectileCount(): number { return this._projectileCount; }
    public get defense(): number { return this._defense; }
}
