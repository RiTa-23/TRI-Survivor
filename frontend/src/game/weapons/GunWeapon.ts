import { Weapon } from "./Weapon";
import { SkillType } from "../types";
import { BasicEnemy } from "../entities/BasicEnemy";
import { Bullet } from "../entities/Bullet";

export class GunWeapon extends Weapon {
    private onShoot: (bullet: Bullet) => void;
    private _range: number = 600;
    private _projectileCount: number = 1;

    constructor(onShoot: (bullet: Bullet) => void) {
        super(SkillType.GUN);
        this.onShoot = onShoot;
        this._baseCooldown = 0.8; // seconds
        this._cooldown = 0;
        this._damage = 10;
        this._level = 1;
    }

    public update(dt: number, enemies: BasicEnemy[], playerX: number, playerY: number, damageMultiplier: number): void {
        if (this._cooldown > 0) {
            this._cooldown -= dt;
            return;
        }

        if (enemies.length === 0) return;

        // Find targets
        const targets = enemies
            .filter(e => e.alive)
            .map(e => {
                const dx = e.x - playerX;
                const dy = e.y - playerY;
                return {
                    enemy: e,
                    distSqr: dx * dx + dy * dy
                };
            })
            .filter(t => t.distSqr <= this._range * this._range)
            .sort((a, b) => a.distSqr - b.distSqr);

        if (targets.length === 0) return;

        // Shoot at N nearest enemies
        const count = Math.min(targets.length, this._projectileCount);

        for (let i = 0; i < count; i++) {
            const target = targets[i].enemy;
            const bullet = new Bullet(
                playerX,
                playerY,
                target.x,
                target.y,
                this._damage * damageMultiplier
            );
            this.onShoot(bullet);
        }

        this._cooldown = this._baseCooldown;
    }

    protected onUpgrade(): void {
        // Upgrade logic
        this._damage += 5;
        this._baseCooldown *= 0.9;
        if (this._level % 3 === 0) {
            this._projectileCount++;
        }
        console.log(`Gun upgraded to Lv.${this._level}: Dmg=${this._damage}, CD=${this._baseCooldown}, Count=${this._projectileCount}`);
    }
}
