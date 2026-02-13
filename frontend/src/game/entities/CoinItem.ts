import { Item } from "./Item";
import type { Player } from "./Player";

const COIN_COLOR = 0xf1c40f;
const COIN_RADIUS = 7;
const COIN_VALUE = 1;

/**
 * コインアイテム
 *
 * 敵を倒すと一定確率でドロップする。
 * 回収するとプレイヤーのコインが増加する。
 */
export class CoinItem extends Item {
    private _value: number;

    constructor(value: number = COIN_VALUE) {
        super({
            color: COIN_COLOR,
            radius: COIN_RADIUS,
        });
        this._value = value;
    }

    /** 金色の円として描画 */
    protected override draw(color: number): void {
        // 外枠
        this.graphics.circle(0, 0, this._radius);
        this.graphics.fill({ color });
        // 中心のハイライト
        this.graphics.circle(0, 0, this._radius * 0.4);
        this.graphics.fill({ color: 0xffeaa7, alpha: 0.6 });
    }

    protected onCollect(player: Player): void {
        player.addCoins(this._value);
    }

    public get value(): number { return this._value; }
}
