import { Container } from "pixi.js";
import { SkillType } from "../types";
import { Enemy } from "../entities/Enemy";

export abstract class Weapon extends Container {
    protected _type: SkillType;
    protected _level: number = 0;
    protected _cooldown: number = 0;
    protected _baseCooldown: number = 0;
    protected _damage: number = 0;

    constructor(type: SkillType) {
        super();
        this._type = type;
    }

    public get type(): SkillType {
        return this._type;
    }

    public get level(): number {
        return this._level;
    }

    public upgrade(): void {
        this._level++;
        this.onUpgrade();
    }

    /**
     * Called every frame
     * @param dt Delta time in seconds
     * @param enemies List of enemies
     * @param playerX Player X position
     * @param playerY Player Y position
     * @param damageMultiplier Global damage multiplier from player stats
     */
    public abstract update(
        dt: number,
        enemies: Enemy[],
        playerX: number,
        playerY: number,
        damageMultiplier: number,
        cooldownMultiplier: number,
        projectileCount: number
    ): void;

    protected abstract onUpgrade(): void;
}
