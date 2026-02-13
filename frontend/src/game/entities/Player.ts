import { Container, Graphics } from "pixi.js";
import { HPBar } from "./HPBar";

const DAMAGE_FLASH_DURATION = 0.1; // seconds

export class Player extends Container {
    private graphics: Graphics;
    private hpBar: HPBar;
    private damageFlashTimer: number = 0;

    // --- Stats ---
    private _hp: number;
    private _maxHp: number;
    private _speed: number;
    private _attackPower: number;
    /** 攻撃間隔 (ms) — 値が小さいほど速く撃つ */
    private _attackInterval: number;

    // --- Resources ---
    private _coins: number = 0;
    private _exp: number = 0;

    /** マグネット吸い寄せ半径 */
    private _magnetRadius: number = 100;
    /** マグネット移動速度 */
    private _magnetSpeed: number = 300;

    // --- Level ---
    private _level: number = 1;
    private _nextLevelExp: number;

    /** 当たり判定の半径 */
    public readonly radius: number = 15;

    constructor() {
        super();

        // Default stats
        this._maxHp = 100;
        this._hp = this._maxHp;
        this._speed = 180; // px/sec
        this._attackPower = 1;
        this._attackInterval = 500; // 0.5秒ごとに発射

        // Initial Level Exp
        this._nextLevelExp = this.calculateNextLevelExp();

        // Create Player (Circle)
        this.graphics = new Graphics();
        this.drawCircle(0xffffff);
        this.addChild(this.graphics);

        // HP Bar (above player)
        this.hpBar = new HPBar({ width: 36, height: 4, offsetY: -(this.radius + 12) });
        this.addChild(this.hpBar);
    }

    private drawCircle(color: number): void {
        this.graphics.clear();
        this.graphics.circle(0, 0, this.radius);
        this.graphics.fill({ color });
    }

    public move(dx: number, dy: number, dt: number): void {
        this.x += dx * this._speed * dt;
        this.y += dy * this._speed * dt;
    }

    /** ダメージを受ける */
    public takeDamage(amount: number): void {
        this._hp = Math.max(0, this._hp - amount);
        this.hpBar.update(this._hp / this._maxHp);
        // Flash red
        this.damageFlashTimer = DAMAGE_FLASH_DURATION;
        this.drawCircle(0xff4444);
    }

    /** HPを回復する */
    public heal(amount: number): void {
        this._hp = Math.min(this._maxHp, this._hp + amount);
        this.hpBar.update(this._hp / this._maxHp);
    }

    /** 毎フレーム呼び出してフラッシュを更新 */
    public update(dt: number): void {
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= dt;
            if (this.damageFlashTimer <= 0) {
                this.damageFlashTimer = 0;
                this.drawCircle(0xffffff);
            }
        }
    }

    // --- Resource methods ---

    /** コインを追加 */
    public addCoins(amount: number): void {
        this._coins += amount;
    }

    /** 経験値を追加 */
    public addExp(amount: number): void {
        this._exp += amount;

        // Check for Level Up
        while (this._exp >= this._nextLevelExp) {
            this._exp -= this._nextLevelExp;
            this.levelUp();
        }
    }

    private levelUp(): void {
        this._level++;
        this._nextLevelExp = this.calculateNextLevelExp();

        // Full heal on level up
        this._hp = this._maxHp;
        this.hpBar.update(1);

        console.log(`Level Up! Lv.${this._level} (Next: ${this._nextLevelExp})`);
    }

    private calculateNextLevelExp(): number {
        // Linear increase: 5, 10, 15...
        return Math.floor(5 + (this._level) * 5);
    }

    // --- Getters ---
    public get hp(): number { return this._hp; }
    public get maxHp(): number { return this._maxHp; }
    public get speed(): number { return this._speed; }
    public get attackPower(): number { return this._attackPower; }
    public get attackInterval(): number { return this._attackInterval; }
    public get coins(): number { return this._coins; }
    public get exp(): number { return this._exp; }
    public get level(): number { return this._level; }
    public get nextLevelExp(): number { return this._nextLevelExp; }
    public get magnetRadius(): number { return this._magnetRadius; }
    public get magnetSpeed(): number { return this._magnetSpeed; }
    public get alive(): boolean { return this._hp > 0; }
}
