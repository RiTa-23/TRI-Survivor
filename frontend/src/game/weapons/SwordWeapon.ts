import { Weapon } from "./Weapon";
import { SkillType } from "../types";
import { Enemy } from "../entities/Enemy";
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

        // Draw the sword shape using PixiJS v8 API
        const bladeWidth = 10;
        const bladeLength = 100;

        // Blade
        this._swordGraphics.rect(-bladeWidth / 2, -bladeLength, bladeWidth, bladeLength);
        this._swordGraphics.fill({ color: 0xDDDDDD }); // Silver blade
        this._swordGraphics.stroke({ width: 2, color: 0x888888 }); // Darker outline

        // Handle (Guard/Hilt)
        // Guard
        this._swordGraphics.rect(-12, -20, 24, 5);
        this._swordGraphics.fill({ color: 0x8B4513 });

        // Grip
        this._swordGraphics.rect(-5, -15, 10, 20);
        this._swordGraphics.fill({ color: 0x8B4513 });

        this._swordGraphics.visible = false;

        // Offset sword from player center
        this._swordGraphics.y = 10;

        this.addChild(this._swordGraphics);
    }

    public update(dt: number, enemies: Enemy[], playerX: number, playerY: number, damageMultiplier: number, cooldownMultiplier: number): void {
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
        const rangeSq = this._range * this._range;

        for (const e of enemies) {
            if (!e.alive) continue;
            const dx = e.x - playerX;
            const dy = e.y - playerY;
            const d2 = dx * dx + dy * dy;
            if (d2 < nearestDistSqr && d2 <= rangeSq) {
                nearestDistSqr = d2;
                targetAngle = Math.atan2(dy, dx);
                foundTarget = true;
            }
        }

        if (!foundTarget) return;

        // Start Slash
        this._targetAngle = targetAngle;
        this._swinging = true;
        this._slashTimer = this._slashDuration;
        this._swordGraphics.visible = true;
        this._cooldown = this._baseCooldown * cooldownMultiplier;

        // Damage Logic (Instant for now, matching the area)
        this.dealAreaDamage(targetAngle, enemies, playerX, playerY, damageMultiplier);
    }

    private dealAreaDamage(angle: number, enemies: Enemy[], px: number, py: number, multiplier: number): void {
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

        // Redraw longer sword with v8 API
        this._swordGraphics.clear();

        const bladeWidth = 10;
        const bladeLength = 100 + (this._level - 1) * 20;

        // Blade
        this._swordGraphics.rect(-bladeWidth / 2, -bladeLength, bladeWidth, bladeLength);
        this._swordGraphics.fill({ color: 0xDDDDDD });
        this._swordGraphics.stroke({ width: 2, color: 0x888888 });

        // Handle
        // Guard
        this._swordGraphics.rect(-12, -20, 24, 5);
        this._swordGraphics.fill({ color: 0x8B4513 });

        // Grip
        this._swordGraphics.rect(-5, -15, 10, 20);
        this._swordGraphics.fill({ color: 0x8B4513 });
    }
}
