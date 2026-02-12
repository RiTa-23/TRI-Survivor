import { Container, Graphics } from "pixi.js";
import { HPBar } from "./HPBar";

export class Player extends Container {
    private graphics: Graphics;
    private hpBar: HPBar;

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
        this._speed = 3;
        this._attackPower = 1;
        this._attackInterval = 500; // 0.5秒ごとに発射

        // Create Player (Triangle)
        this.graphics = new Graphics();
        this.graphics.context.beginPath();
        this.graphics.context.moveTo(0, -20);
        this.graphics.context.lineTo(15, 20);
        this.graphics.context.lineTo(-15, 20);
        this.graphics.context.closePath();
        this.graphics.context.fill({ color: 0xffffff });
        this.addChild(this.graphics);

        // HP Bar (above player)
        this.hpBar = new HPBar({ width: 36, height: 4, offsetY: -32 });
        this.addChild(this.hpBar);
    }

    public move(dx: number, dy: number): void {
        this.x += dx * this._speed;
        this.y += dy * this._speed;
    }

    /** ダメージを受ける */
    public takeDamage(amount: number): void {
        this._hp = Math.max(0, this._hp - amount);
        this.hpBar.update(this._hp / this._maxHp);
    }

    /** HPを回復する */
    public heal(amount: number): void {
        this._hp = Math.min(this._maxHp, this._hp + amount);
        this.hpBar.update(this._hp / this._maxHp);
    }

    // --- Getters ---
    public get hp(): number { return this._hp; }
    public get maxHp(): number { return this._maxHp; }
    public get speed(): number { return this._speed; }
    public get attackPower(): number { return this._attackPower; }
    public get attackInterval(): number { return this._attackInterval; }
    public get alive(): boolean { return this._hp > 0; }
}
