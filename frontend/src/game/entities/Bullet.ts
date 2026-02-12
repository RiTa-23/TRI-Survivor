import { Container, Graphics } from "pixi.js";

const BULLET_RADIUS = 4;
const BULLET_COLOR = 0xf1c40f;

/**
 * 弾エンティティ
 *
 * プレイヤーから敵に向かって直進する。
 * 敵に当たるとダメージを与えて消滅する。
 */
export class Bullet extends Container {
    private graphics: Graphics;
    private vx: number;
    private vy: number;
    private _damage: number;
    private _alive: boolean = true;
    private distanceTraveled: number = 0;
    private maxDistance: number;

    /** 当たり判定の半径 */
    public readonly radius: number = BULLET_RADIUS;

    constructor(
        startX: number,
        startY: number,
        targetX: number,
        targetY: number,
        damage: number,
        speed: number = 8,
        maxDistance: number = 600
    ) {
        super();

        this._damage = damage;
        this.maxDistance = maxDistance;
        this.x = startX;
        this.y = startY;

        // Calculate direction toward target
        const dx = targetX - startX;
        const dy = targetY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length > 0) {
            this.vx = (dx / length) * speed;
            this.vy = (dy / length) * speed;
        } else {
            this.vx = 0;
            this.vy = -speed;
        }

        // Draw bullet
        this.graphics = new Graphics();
        this.graphics.circle(0, 0, BULLET_RADIUS);
        this.graphics.fill({ color: BULLET_COLOR });
        this.addChild(this.graphics);
    }

    /** 毎フレームの更新 */
    public update(): void {
        if (!this._alive) return;

        this.x += this.vx;
        this.y += this.vy;
        this.distanceTraveled += Math.sqrt(this.vx * this.vx + this.vy * this.vy);

        // Despawn if traveled too far
        if (this.distanceTraveled >= this.maxDistance) {
            this._alive = false;
        }
    }

    /** 対象との当たり判定 */
    public isCollidingWith(targetX: number, targetY: number, targetRadius: number): boolean {
        const dx = this.x - targetX;
        const dy = this.y - targetY;
        return Math.sqrt(dx * dx + dy * dy) < this.radius + targetRadius;
    }

    public get damage(): number { return this._damage; }
    public get alive(): boolean { return this._alive; }

    public kill(): void {
        this._alive = false;
    }
}
