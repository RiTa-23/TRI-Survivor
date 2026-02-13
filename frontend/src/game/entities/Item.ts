import { Container, Graphics } from "pixi.js";
import type { Player } from "./Player";

/** アイテムの初期化パラメータ */
export interface ItemConfig {
    /** 描画色 */
    color: number;
    /** 当たり判定の半径 */
    radius: number;
}

/**
 * アイテムの基底クラス
 *
 * 全てのアイテムタイプはこのクラスを継承する。
 * プレイヤーが近づくとマグネットのように吸い寄せられ、
 * 接触すると回収されて効果を発動する。
 */
export abstract class Item extends Container {
    protected graphics: Graphics;
    protected _radius: number;
    protected _collected: boolean = false;

    /** アイテム出現からの経過時間（アニメーション用） */
    protected age: number = 0;

    constructor(config: ItemConfig) {
        super();
        this._radius = config.radius;

        this.graphics = new Graphics();
        this.draw(config.color);
        this.addChild(this.graphics);
    }

    /** アイテムの見た目を描画（サブクラスでオーバーライド可能） */
    protected draw(color: number): void {
        this.graphics.circle(0, 0, this._radius);
        this.graphics.fill({ color });
    }

    /** 毎フレームの更新 */
    public update(dt: number, player: Player): void {
        if (this._collected) return;

        this.age += dt;

        // 浮遊アニメーション（上下に揺れる）
        this.graphics.y = Math.sin(this.age * 3) * 3;

        // マグネット範囲内ならプレイヤーに吸い寄せる
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0 && distance < player.magnetRadius) {
            // 近いほど速く吸い寄せる
            const factor = 1 - distance / player.magnetRadius;
            const speed = player.magnetSpeed * (0.5 + factor * 1.5);
            this.x += (dx / distance) * speed * dt;
            this.y += (dy / distance) * speed * dt;
        }
    }

    /** プレイヤーとの当たり判定（回収判定） */
    public isCollidingWith(targetX: number, targetY: number, targetRadius: number): boolean {
        const dx = this.x - targetX;
        const dy = this.y - targetY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this._radius + targetRadius;
    }

    /** アイテムを回収する */
    public collect(player: Player): void {
        if (this._collected) return;
        this._collected = true;
        this.visible = false;
        this.onCollect(player);
    }

    /** サブクラスで実装：回収時の効果 */
    protected abstract onCollect(player: Player): void;

    // --- Getters ---
    public get radius(): number { return this._radius; }
    public get collected(): boolean { return this._collected; }
}
