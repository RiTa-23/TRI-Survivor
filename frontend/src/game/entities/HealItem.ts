
import { Item } from "./Item";
import type { Player } from "./Player";

const HEAL_COLOR = 0xe74c3c;
const HEAL_RADIUS = 8;
/** HP最大値の何%回復するか */
const HEAL_PERCENT = 0.20;

/**
 * 回復アイテム
 *
 * 敵を倒すと低確率でドロップする。
 * 回収するとプレイヤーのHPが最大HPの20%回復する。
 */
export class HealItem extends Item {
    private _healPercent: number;

    constructor(healPercent: number = HEAL_PERCENT) {
        super({
            color: HEAL_COLOR,
            radius: HEAL_RADIUS,
            textureKey: "/assets/images/heal.png",
        });
        this._healPercent = healPercent;
    }

    protected onCollect(player: Player): void {
        const healAmount = player.maxHp * this._healPercent;
        player.heal(healAmount);
    }

    public get healPercent(): number { return this._healPercent; }
}
