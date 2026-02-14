import { Container, Graphics } from "pixi.js";

/** 障害物の設定 */
export interface ObstacleConfig {
    /** 半径 */
    radius: number;
    /** 色 (0xRRGGBB) */
    color?: number;
}

/**
 * 障害物クラス
 * 
 * プレイヤーや敵が通過できないオブジェクト。
 * 破壊不可能で、動かない。
 */
export class Obstacle extends Container {
    private graphics: Graphics;
    private _radius: number;

    constructor(config: ObstacleConfig) {
        super();
        this._radius = config.radius;
        const color = config.color ?? 0x666666; // デフォルトはグレー

        this.graphics = new Graphics();
        this.addChild(this.graphics);

        this.draw(color);
    }

    private draw(color: number): void {
        this.graphics.clear();

        // 岩のような表現（単純な円に枠線をつける）
        this.graphics.circle(0, 0, this._radius);
        this.graphics.fill({ color });
        this.graphics.stroke({ width: 2, color: 0x333333 });
    }

    public get radius(): number { return this._radius; }
}
