import { Item } from "./Item";
import type { Player } from "./Player";

const EXP_COLOR = 0x2ecc71;
const EXP_RADIUS = 6;
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
            color: EXP_COLOR,
            radius: EXP_RADIUS,
        });
        this._value = value;
    }

    /** 緑の光るドットとして描画 */
    protected override draw(color: number): void {
        // 外側の光彩
        this.graphics.circle(0, 0, this._radius * 1.5);
        this.graphics.fill({ color, alpha: 0.3 });
        // 内側のコア
        this.graphics.circle(0, 0, this._radius);
        this.graphics.fill({ color });
    }

    protected onCollect(player: Player): void {
        player.addExp(this._value);
    }

    public get value(): number { return this._value; }
}
