import { Container, Graphics, ColorMatrixFilter } from "pixi.js";
import { HPBar } from "./HPBar";

const DAMAGE_FLASH_DURATION = 150;

export class Player extends Container {
    private graphics: Graphics;
    private hpBar: HPBar;
    private damageFlashTimer: number = 0;
    private readonly damageFilter: ColorMatrixFilter;

    // --- Stats ---
    private _hp: number;
    private _maxHp: number;
    private _speed: number;
    private _attackPower: number;
    /** 攻撃間隔 (ms) — 値が小さいほど速く撃つ */
    private _attackInterval: number;

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

        // Create Player (Circle)
        this.graphics = new Graphics();
        this.graphics.circle(0, 0, this.radius);
        this.graphics.fill({ color: 0xffffff });
        this.addChild(this.graphics);

        // Damage flash filter (red tint)
        this.damageFilter = new ColorMatrixFilter();
        this.damageFilter.enabled = false;
        this.graphics.filters = [this.damageFilter];

        // HP Bar (above player)
        this.hpBar = new HPBar({ width: 36, height: 4, offsetY: -(this.radius + 12) });
        this.addChild(this.hpBar);
    }

    public move(dx: number, dy: number, dt: number): void {
        this.x += dx * this._speed * dt;
        this.y += dy * this._speed * dt;
    }

    /** ダメージを受ける */
    public takeDamage(amount: number): void {
        this._hp = Math.max(0, this._hp - amount);
        this.hpBar.update(this._hp / this._maxHp);
        this.flashDamage();
    }

    /** HPを回復する */
    public heal(amount: number): void {
        this._hp = Math.min(this._maxHp, this._hp + amount);
        this.hpBar.update(this._hp / this._maxHp);
    }

    /** ダメージ時の赤フラッシュを開始 */
    private flashDamage(): void {
        this.damageFlashTimer = DAMAGE_FLASH_DURATION;
        this.damageFilter.enabled = true;
        // Red tint: boost red, suppress green/blue
        this.damageFilter.matrix = [
            2, 0, 0, 0, 0.3,
            0, 0.3, 0, 0, 0,
            0, 0, 0.3, 0, 0,
            0, 0, 0, 1, 0,
        ];
    }

    /** 毎フレーム呼び出してフラッシュアニメーションを更新 */
    public update(dt: number): void {
        if (this.damageFlashTimer > 0) {
            this.damageFlashTimer -= dt;
            if (this.damageFlashTimer <= 0) {
                this.damageFlashTimer = 0;
                this.damageFilter.enabled = false;
            }
        }
    }

    // --- Getters ---
    public get hp(): number { return this._hp; }
    public get maxHp(): number { return this._maxHp; }
    public get speed(): number { return this._speed; }
    public get attackPower(): number { return this._attackPower; }
    public get attackInterval(): number { return this._attackInterval; }
    public get alive(): boolean { return this._hp > 0; }
}
