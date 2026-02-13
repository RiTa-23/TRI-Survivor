import { Container, Sprite } from "pixi.js";
import { HPBar } from "./HPBar";
import { Item } from "./Item";
import { ExperienceOrb } from "./ExperienceOrb";
import { CoinItem } from "./CoinItem";
import { HealItem } from "./HealItem";

/** ドロップテーブル設定 */
export interface DropTable {
    /** 経験値 (個数の最小・最大) */
    exp: { min: number; max: number; chance: number };
    /** コイン (ドロップ率 0~1) */
    coinChance: number;
    /** 回復アイテム (ドロップ率 0~1) */
    healChance: number;
}

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
    /** テクスチャのパス */
    textureKey: string;
    /** 当たり判定の半径 */
    radius: number;
    /** ドロップテーブル */
    dropTable: DropTable;
}

/**
 * 敵の基底クラス
 * 
 * 全ての敵タイプはこのクラスを継承する。
 * プレイヤーに向かって移動し、接触するとダメージを与える。
 */
export abstract class Enemy extends Container {
    protected sprite: Sprite;
    protected hpBar: HPBar;
    protected _hp: number;
    protected _maxHp: number;
    protected _speed: number;
    protected _attackPower: number;
    protected _radius: number;
    protected _dropTable: DropTable;
    protected _alive: boolean = true;

    constructor(config: EnemyConfig) {
        super();
        this._hp = config.hp;
        this._maxHp = config.hp;
        this._speed = config.speed;
        this._attackPower = config.attackPower;
        this._radius = config.radius;
        this._dropTable = config.dropTable;

        this.sprite = Sprite.from(config.textureKey);
        this.sprite.anchor.set(0.5);

        // アスペクト比を維持してサイズ調整
        // 半径*2 に収まるようにスケールを設定
        const scale = (this._radius * 2) / Math.max(this.sprite.texture.width, this.sprite.texture.height);
        this.sprite.scale.set(scale);

        // this.sprite.tint = config.color; // If you want to tint the image

        this.addChild(this.sprite);

        // HP Bar (above enemy)
        // HP Bar (above enemy)
        // サイズを固定値にする (幅40px, 高さ4px)
        this.hpBar = new HPBar({ width: 40, height: 4, offsetY: -(config.radius + 10) });
        this.addChild(this.hpBar);
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

    /** 死亡時のドロップアイテムを生成 */
    public dropItems(): Item[] {
        const items: Item[] = [];
        const spread = 20; // 散らばり範囲

        // Helper to randomize position slightly
        const randomizePos = (item: Item) => {
            item.x = this.x + (Math.random() - 0.5) * spread * 2;
            item.y = this.y + (Math.random() - 0.5) * spread * 2;
        };

        // 経験値
        if (Math.random() < this._dropTable.exp.chance) {
            const count = this._dropTable.exp.min + Math.floor(Math.random() * (this._dropTable.exp.max - this._dropTable.exp.min + 1));
            for (let i = 0; i < count; i++) {
                const orb = new ExperienceOrb();
                randomizePos(orb);
                items.push(orb);
            }
        }

        // コイン
        if (Math.random() < this._dropTable.coinChance) {
            const coin = new CoinItem();
            randomizePos(coin);
            items.push(coin);
        }

        // 回復
        if (Math.random() < this._dropTable.healChance) {
            const heal = new HealItem();
            randomizePos(heal);
            items.push(heal);
        }

        return items;
    }

    // --- Getters ---

    public get hp(): number { return this._hp; }
    public get maxHp(): number { return this._maxHp; }
    public get speed(): number { return this._speed; }
    public get attackPower(): number { return this._attackPower; }
    public get radius(): number { return this._radius; }
    public get alive(): boolean { return this._alive; }
}
