import { Container, Graphics } from "pixi.js";

/** HPバーの設定 */
interface HPBarConfig {
    /** バーの幅 */
    width?: number;
    /** バーの高さ */
    height?: number;
    /** エンティティの頭上からのオフセット */
    offsetY?: number;
}

const DEFAULT_WIDTH = 40;
const DEFAULT_HEIGHT = 4;
const DEFAULT_OFFSET_Y = -30;
const BG_COLOR = 0x333333;
const HP_COLOR = 0x39FF14; // Neon Green
const LOW_HP_COLOR = 0xe74c3c;
const LOW_HP_THRESHOLD = 0.3;

/**
 * 再利用可能なHPバーコンポーネント
 *
 * エンティティの頭上に表示され、HP割合に応じて色とサイズが変化する。
 */
export class HPBar extends Container {
    private bg: Graphics;
    private bar: Graphics;
    private barWidth: number;
    private barHeight: number;

    constructor(config?: HPBarConfig) {
        super();

        this.barWidth = config?.width ?? DEFAULT_WIDTH;
        this.barHeight = config?.height ?? DEFAULT_HEIGHT;
        this.y = config?.offsetY ?? DEFAULT_OFFSET_Y;

        // Background (gray)
        this.bg = new Graphics();
        this.bg.roundRect(-this.barWidth / 2, 0, this.barWidth, this.barHeight, 2);
        this.bg.fill({ color: BG_COLOR });
        this.addChild(this.bg);

        // Foreground (green/red)
        this.bar = new Graphics();
        this.addChild(this.bar);

        this.update(1);
    }

    /** HP割合 (0~1) に基づいてバーを更新 */
    public update(ratio: number): void {
        const clamped = Math.max(0, Math.min(1, ratio));
        const color = clamped <= LOW_HP_THRESHOLD ? LOW_HP_COLOR : HP_COLOR;
        const width = this.barWidth * clamped;

        this.bar.clear();
        if (width > 0) {
            this.bar.roundRect(-this.barWidth / 2, 0, width, this.barHeight, 2);
            this.bar.fill({ color });
        }
    }
}
