import { Weapon } from "./Weapon";
import { SkillType } from "../types";
import { BasicEnemy } from "../entities/BasicEnemy";
import { Graphics } from "pixi.js";

export class SwordWeapon extends Weapon {
    private _range: number = 150;
    private _arc: number = Math.PI * 0.75; // 135 degrees swing
    private _slashDuration: number = 0.15; // Fast swing
    private _swordGraphics: Graphics;
    private _slashTimer: number = 0;
    private _targetAngle: number = 0;
    private _swinging: boolean = false;

    constructor() {
        super(SkillType.SWORD);
        this._baseCooldown = 1.0;
        this._cooldown = 0;
        this._damage = 20;
        this._level = 1;

        // Initialize Graphics for the sword (simple stick)
        this._swordGraphics = new Graphics();

        // Draw the sword shape
        const bladeWidth = 10;
        const bladeLength = 100;

        this._swordGraphics.beginFill(0xDDDDDD); // Silver blade
        this._swordGraphics.lineStyle(2, 0x888888); // Darker outline
        // Pivot is at (0,0), drawing upwards (negative Y)
        this._swordGraphics.drawRect(-bladeWidth / 2, -bladeLength, bladeWidth, bladeLength);
        this._swordGraphics.endFill();

        // Handle
        this._swordGraphics.beginFill(0x8B4513); // Brown handle
        this._swordGraphics.drawRect(-5, 0, 10, 20); // Handle
        this._swordGraphics.drawRect(-12, -5, 24, 5); // Guard
        this._swordGraphics.endFill();

        this._swordGraphics.visible = false;

        // Offset sword from player center
        this._swordGraphics.y = 10;

        this.addChild(this._swordGraphics);
    }

    public update(dt: number, enemies: BasicEnemy[], playerX: number, playerY: number, damageMultiplier: number): void {
        // Handle slash animation
        if (this._swinging) {
            this._slashTimer -= dt;

            if (this._slashTimer <= 0) {
                this._swinging = false;
                this._swordGraphics.visible = false;
            } else {
                // Calculate swing progress (0.0 to 1.0)
                const progress = 1 - (this._slashTimer / this._slashDuration);

                // Swing logic
                const t = Math.sin(progress * Math.PI / 2);

                const startAngle = this._targetAngle - this._arc / 2;
                const totalSwing = this._arc;

                // Rotate graphics.
                // Up (-Y) needs +PI/2 to align with 0 rad (Right)
                this._swordGraphics.rotation = startAngle + (totalSwing * t) + Math.PI / 2;
            }
        }

        if (this._cooldown > 0) {
            this._cooldown -= dt;
            return;
        }

        // Find nearest enemy
        let nearestDistSqr = Infinity;
        let targetAngle = 0;
        let foundTarget = false;

        for (const e of enemies) {
            if (!e.alive) continue;
            const dx = e.x - playerX;
            const dy = e.y - playerY;
            const d2 = dx * dx + dy * dy;
            if (d2 < nearestDistSqr && d2 < 400 * 400) {
                nearestDistSqr = d2;
                targetAngle = Math.atan2(dy, dx);
                foundTarget = true;
            }
        }

        if (!foundTarget) return;

        // Start Slash
        console.log("Sword Slash Triggered!");
        this._targetAngle = targetAngle;
        this._swinging = true;
        this._slashTimer = this._slashDuration;
        this._swordGraphics.visible = true;
        this._cooldown = this._baseCooldown;

        // Damage Logic (Instant for now, matching the area)
        this.dealAreaDamage(targetAngle, enemies, playerX, playerY, damageMultiplier);
    }

    private dealAreaDamage(angle: number, enemies: BasicEnemy[], px: number, py: number, multiplier: number): void {
        const damage = this._damage * multiplier;
        const rangeSq = this._range * this._range;
        const halfArc = this._arc / 2;

        for (const e of enemies) {
            if (!e.alive) continue;
            const dx = e.x - px;
            const dy = e.y - py;
            const distSq = dx * dx + dy * dy;

            if (distSq <= rangeSq) {
                const enemyAngle = Math.atan2(dy, dx);
                let diff = enemyAngle - angle;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;

                if (Math.abs(diff) <= halfArc) {
                    e.takeDamage(damage);
                }
            }
        }
    }

    protected onUpgrade(): void {
        this._damage += 10;
        this._baseCooldown *= 0.9;
        this._range += 20;

        // Redraw longer sword
        this._swordGraphics.clear();

        const bladeWidth = 10;
        const bladeLength = 100 + (this._level - 1) * 20;

        this._swordGraphics.beginFill(0xDDDDDD);
        this._swordGraphics.lineStyle(2, 0x888888);
        this._swordGraphics.drawRect(-bladeWidth / 2, -bladeLength, bladeWidth, bladeLength);
        this._swordGraphics.endFill();

        // Handle
        this._swordGraphics.beginFill(0x8B4513);
        this._swordGraphics.drawRect(-5, 0, 10, 20);
        this._swordGraphics.drawRect(-12, -5, 24, 5);
        this._swordGraphics.endFill();

        console.log(`Sword upgraded to Lv.${this._level}: Dmg=${this._damage}`);
    }
}
