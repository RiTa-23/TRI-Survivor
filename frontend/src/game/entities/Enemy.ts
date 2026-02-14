import { Container, Sprite, Texture } from "pixi.js";
import { Item } from "./Item";
import { ExperienceOrb } from "./ExperienceOrb";
import { HPBar } from "./HPBar";
import { CoinItem } from "./CoinItem";
import { HealItem } from "./HealItem";

const DAMAGE_EFFECT_PATH = "/assets/images/damage.png";
const DAMAGE_EFFECT_SCALE = 0.08;
const DAMAGE_EFFECT_LIFE = 0.5;

class DamageEffect extends Sprite {
    public life: number = DAMAGE_EFFECT_LIFE;
    public velocityY: number = 0;

    constructor() {
        super(Texture.from(DAMAGE_EFFECT_PATH));
        this.anchor.set(0.5);
        this.scale.set(DAMAGE_EFFECT_SCALE);
    }
}

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
    private damageEffects: DamageEffect[] = [];

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
        // サイズを固定値にする (幅40px, 高さ4px)
        this.hpBar = new HPBar({ width: 40, height: 4, offsetY: -(config.radius + 10) });
        this.addChild(this.hpBar);
    }

    /**
     * Update method for enemy logic
     * @param dt Delta time in seconds
     * @param playerX Player X position
     * @param playerY Player Y position
     */
    public update(dt: number): void {
        // Move toward player logic is handled by specific enemy types usually,
        // but BasicEnemy uses simple tracking. Here we just update effects.

        // Update damage effects
        for (let i = this.damageEffects.length - 1; i >= 0; i--) {
            const effect = this.damageEffects[i];
            effect.life -= dt;
            effect.y += effect.velocityY * dt;
            effect.alpha = Math.max(0, effect.life * 2); // Fade out

            if (effect.life <= 0) {
                this.removeChild(effect);
                effect.destroy();
                this.damageEffects.splice(i, 1);
            }
        }
    }

    /** プレイヤー座標に向かって移動 */
    public moveToward(targetX: number, targetY: number, dt: number): void {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const moveX = (dx / distance) * this._speed * dt;
            const moveY = (dy / distance) * this._speed * dt;
            this.x += moveX;
            this.y += moveY;
        }
    }

    /** プレイヤーとの当たり判定 */
    public isCollidingWith(targetX: number, targetY: number, targetRadius: number): boolean {
        const dx = this.x - targetX;
        const dy = this.y - targetY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < (this._radius + targetRadius);
    }

    /** ダメージを受ける */
    public takeDamage(amount: number, sourceX?: number, sourceY?: number): void {
        this._hp -= amount;
        this.hpBar.update(this._hp / this._maxHp);

        // Show damage effect
        this.showDamageEffect(sourceX, sourceY);

        if (this._hp <= 0) {
            this._alive = false;
        }
    }

    private showDamageEffect(sourceX?: number, sourceY?: number): void {
        const effect = new DamageEffect();

        if (sourceX !== undefined && sourceY !== undefined) {
            // 攻撃された方向（敵の中心から攻撃元への方向）に表示
            // ローカル座標系なので、(0,0)が敵の中心
            // world座標での差分を計算
            const dx = sourceX - this.x;
            const dy = sourceY - this.y;
            const angle = Math.atan2(dy, dx);

            // 半径分だけずらした位置に表示
            const distance = this._radius;
            effect.x = Math.cos(angle) * distance;
            effect.y = Math.sin(angle) * distance;

            // エフェクトを攻撃方向に向ける
            effect.rotation = angle + Math.PI / 2;
        } else {
            // 指定がなければ頭上に表示 (デフォルト)
            effect.x = 0;
            effect.y = -(this._radius + 20);
        }

        this.damageEffects.push(effect);
        this.addChild(effect);
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
