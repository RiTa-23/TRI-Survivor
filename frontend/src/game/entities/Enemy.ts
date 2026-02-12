import { Container, Graphics } from "pixi.js";
import { HPBar } from "./HPBar";

/** 敵の初期化パラメータ */
export interface EnemyConfig {
    /** ヒットポイント */
    hp: number;
    /** 移動速度 (px/sec) */
    speed: number;
    /** 接触時の攻撃力 */
    attackPower: number;
    /** 描画色 */
    color: number;
    /** 当たり判定の半径 */
    radius: number;
}

/**
 * 敵の基底クラス
 * 
 * 全ての敵タイプはこのクラスを継承する。
 * プレイヤーに向かって移動し、接触するとダメージを与える。
 */
export abstract class Enemy extends Container {
    protected graphics: Graphics;
    protected hpBar: HPBar;
    protected _hp: number;
    protected _maxHp: number;
    protected _speed: number;
    protected _attackPower: number;
    protected _radius: number;
    protected _alive: boolean = true;

    constructor(config: EnemyConfig) {
        super();
        this._hp = config.hp;
        this._maxHp = config.hp;
        this._speed = config.speed;
        this._attackPower = config.attackPower;
        this._radius = config.radius;

        this.graphics = new Graphics();
        this.draw(config.color);
        this.addChild(this.graphics);

        // HP Bar (above enemy)
        this.hpBar = new HPBar({ width: config.radius * 2.5, height: 3, offsetY: -(config.radius + 8) });
        this.addChild(this.hpBar);
    }

    /** 敵の見た目を描画（サブクラスでオーバーライド可能） */
    protected draw(color: number): void {
        this.graphics.circle(0, 0, this._radius);
        this.graphics.fill({ color });
    }

    /** プレイヤー座標に向かって移動 */
    public moveToward(targetX: number, targetY: number, dt: number): void {
        if (!this._alive) return;

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.x += (dx / distance) * this._speed * dt;
            this.y += (dy / distance) * this._speed * dt;
        }
    }

    /** プレイヤーとの当たり判定 */
    public isCollidingWith(targetX: number, targetY: number, targetRadius: number): boolean {
        const dx = this.x - targetX;
        const dy = this.y - targetY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this._radius + targetRadius;
    }

    /** ダメージを受ける */
    public takeDamage(amount: number): void {
        this._hp = Math.max(0, this._hp - amount);
        this.hpBar.update(this._hp / this._maxHp);
        if (this._hp <= 0) {
            this._alive = false;
            this.visible = false;
        }
    }

    // --- Getters ---

    public get hp(): number { return this._hp; }
    public get maxHp(): number { return this._maxHp; }
    public get speed(): number { return this._speed; }
    public get attackPower(): number { return this._attackPower; }
    public get radius(): number { return this._radius; }
    public get alive(): boolean { return this._alive; }
}
