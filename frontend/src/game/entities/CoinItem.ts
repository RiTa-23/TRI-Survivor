
import { Item } from "./Item";
import type { Player } from "./Player";

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
            textureKey: "/assets/images/coin.png",
        });
        this._value = value;
    }

    protected onCollect(player: Player): void {
        player.addCoins(this._value);
    }

    public get value(): number { return this._value; }
}
