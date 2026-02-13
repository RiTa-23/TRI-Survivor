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
        });
        this._healPercent = healPercent;
    }

    /** 十字マークとして描画 */
    protected override draw(color: number): void {
        const r = this._radius;

        // 背景の円
        this.graphics.circle(0, 0, r);
        this.graphics.fill({ color, alpha: 0.4 });

        // 十字マーク（白）
        const thickness = r * 0.4;
        const length = r * 0.7;
        // 横棒
        this.graphics.rect(-length, -thickness / 2, length * 2, thickness);
        this.graphics.fill({ color: 0xffffff });
        // 縦棒
        this.graphics.rect(-thickness / 2, -length, thickness, length * 2);
        this.graphics.fill({ color: 0xffffff });
    }

    protected onCollect(player: Player): void {
        const healAmount = player.maxHp * this._healPercent;
        player.heal(healAmount);
    }

    public get healPercent(): number { return this._healPercent; }
}
