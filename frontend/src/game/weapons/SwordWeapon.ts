import { Weapon } from "./Weapon";
import { SkillType } from "../types";
import { BasicEnemy } from "../entities/BasicEnemy";
import { Graphics } from "pixi.js";

export class SwordWeapon extends Weapon {
    private _range: number = 150;
    private _arc: number = Math.PI / 2; // 90 degrees
    private _slashDuration: number = 0.2;
    private _slashGraphic: Graphics;
    private _slashTimer: number = 0;

    constructor() {
        super(SkillType.SWORD);
        this._baseCooldown = 1.0;
        this._cooldown = 0;
        this._damage = 20;
        this._level = 1;

        // Visual for slash
        this._slashGraphic = new Graphics();
        this.addChild(this._slashGraphic);
        this._slashGraphic.visible = false;
    }

    public update(dt: number, enemies: BasicEnemy[], playerX: number, playerY: number, damageMultiplier: number): void {
        // Handle slash visual timer
        if (this._slashTimer > 0) {
            this._slashTimer -= dt;
            if (this._slashTimer <= 0) {
                this._slashGraphic.visible = false;
                this._slashGraphic.clear();
            }
        }

        if (this._cooldown > 0) {
            this._cooldown -= dt;
            return;
        }

        // Find nearest enemy to determine direction
        let nearestDistSqr = Infinity;
        let targetAngle = 0;
        let foundTarget = false;

        for (const e of enemies) {
            if (!e.alive) continue;
            const dx = e.x - playerX;
            const dy = e.y - playerY;
            const d2 = dx * dx + dy * dy;
            if (d2 < nearestDistSqr && d2 < 400 * 400) { // Check within reasonable range
                nearestDistSqr = d2;
                targetAngle = Math.atan2(dy, dx);
                foundTarget = true;
            }
        }

        if (!foundTarget) return; // No enemies nearby to slash at

        // Perform Slash
        this.performSlash(targetAngle, enemies, playerX, playerY, damageMultiplier);
        this._cooldown = this._baseCooldown;
    }

    private performSlash(angle: number, enemies: BasicEnemy[], px: number, py: number, multiplier: number): void {
        const damage = this._damage * multiplier;
        const rangeSq = this._range * this._range;
        const halfArc = this._arc / 2;

        // Visual
        this._slashGraphic.clear();
        this._slashGraphic.lineStyle(2, 0xffffff);
        this._slashGraphic.beginFill(0xAAFFFF, 0.5);
        this._slashGraphic.arc(0, 0, this._range, -halfArc, halfArc);
        this._slashGraphic.endFill();
        this._slashGraphic.rotation = angle;
        this._slashGraphic.visible = true;
        this._slashTimer = this._slashDuration;

        // Damage Logic
        for (const e of enemies) {
            if (!e.alive) continue;
            const dx = e.x - px;
            const dy = e.y - py;
            const distSq = dx * dx + dy * dy;

            if (distSq <= rangeSq) {
                const enemyAngle = Math.atan2(dy, dx);
                let diff = enemyAngle - angle;
                // Normalize angle diff to -PI to PI
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
        this._range += 10;
        console.log(`Sword upgraded to Lv.${this._level}: Dmg=${this._damage}, CD=${this._baseCooldown}`);
    }
}
