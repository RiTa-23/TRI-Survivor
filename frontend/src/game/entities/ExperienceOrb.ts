
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
        super({
            textureKey: "/assets/images/experience.png",
        });
        this._value = value;
    }

    protected onCollect(player: Player): void {
        player.addExp(this._value);
    }

    public get value(): number { return this._value; }
}
