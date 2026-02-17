
import { Item } from "./Item";
import type { Player } from "./Player";

const EXP_VALUE = 1;

/**
 * 経験値オーブ
 *
 * 敵を倒すと高確率でドロップする。
 * 回収するとプレイヤーの経験値が増加する。
 */
export class ExperienceOrb extends Item {
    private _value: number;

    constructor(value: number = EXP_VALUE) {
        let textureKey = "/assets/images/EXP_1.png";
        if (value >= 10) {
            textureKey = "/assets/images/EXP_3.png";
        } else if (value >= 5) {
            textureKey = "/assets/images/EXP_2.png";
        }

        super({
            textureKey: textureKey,
        });
        this._value = value;
    }

    protected onCollect(player: Player): void {
        player.addExp(this._value);
    }

    public get value(): number { return this._value; }
}
