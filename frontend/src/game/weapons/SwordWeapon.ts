import { Weapon } from "./Weapon";
import { SkillType } from "../types";
import { BasicEnemy } from "../entities/BasicEnemy";
import { Sprite } from "pixi.js";

export class SwordWeapon extends Weapon {
    private _range: number = 150;
    private _arc: number = Math.PI * 0.75; // 135 degrees swing
    private _slashDuration: number = 0.15; // Fast swing
    private _swordSprite: Sprite;
    private _slashTimer: number = 0;
    private _targetAngle: number = 0;
    private _swinging: boolean = false;

    constructor() {
        super(SkillType.SWORD);
        this._baseCooldown = 1.0;
        this._cooldown = 0;
        this._damage = 20;
        this._level = 1;

        // Initialize Sprite (texture might need to be loaded, but we'll assume preloaded or handle async)
        // Note: Assets.get check isn't strictly necessary if GameApp loads it, but good practice.
        // Assuming GameApp loaded "/assets/images/skills/sword.png" or we just use Sprite.from
        this._swordSprite = Sprite.from("/assets/images/skills/sword.png");
        this._swordSprite.anchor.set(0.5, 1.0); // Handle at bottom center
        this._swordSprite.width = 100; // Adjust size
        this._swordSprite.height = 100;
        this._swordSprite.visible = false;

        // Offset sword from player center
        this._swordSprite.y = 10;

        this.addChild(this._swordSprite);
    }

    public update(dt: number, enemies: BasicEnemy[], playerX: number, playerY: number, damageMultiplier: number): void {
        // Handle slash animation
        if (this._swinging) {
            this._slashTimer -= dt;

            if (this._slashTimer <= 0) {
                this._swinging = false;
                this._swordSprite.visible = false;
            } else {
                // Calculate swing progress (0.0 to 1.0)
                const progress = 1 - (this._slashTimer / this._slashDuration);

                // Swing from right to left (relative to target direction) or vice versa?
                // Let's swing across the target angle.
                // Start: targetAngle - arc/2
                // End: targetAngle + arc/2

                // Ease out for "hack" feel
                const t = Math.sin(progress * Math.PI / 2);

                const startAngle = this._targetAngle - this._arc / 2;
                const totalSwing = this._arc;

                // Rotate sprite. Note: Sprite art points UP (usually). 
                // We add PI/2 or something if art points right. 
                // Assuming vertical sword art:
                this._swordSprite.rotation = startAngle + (totalSwing * t) + Math.PI / 2;
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
        this._swordSprite.visible = true;
        this._cooldown = this._baseCooldown;

        // Damage Logic (Instant for now, matching the area)
        this.dealAreaDamage(targetAngle, enemies, playerX, playerY, damageMultiplier);
    }

    private dealAreaDamage(angle: number, enemies: BasicEnemy[], px: number, py: number, multiplier: number): void {
        const damage = this._damage * multiplier;
        const rangeSq = this._range * this._range;
        const halfArc = this._arc / 2; // Damage arc matches visual swing arc approximately

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
        this._swordSprite.height = Math.min(200, this._swordSprite.height + 20); // Longer sword
        this._swordSprite.width = this._swordSprite.height; // Keep aspect ratio roughly
        console.log(`Sword upgraded to Lv.${this._level}: Dmg=${this._damage}`);
    }
}
