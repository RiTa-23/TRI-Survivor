import { Enemy } from "./Enemy";
export class BasicEnemy extends Enemy {
    constructor(config?: { textureKey?: string }) {
        super({
            hp: 200,
            speed: 50,
            attackPower: 50,
            color: 0x9b59b6,
            textureKey: config?.textureKey || "/assets/images/enemy/enemy_1.png",
            radius: 40,
            dropTable: {
                exp: { min: 25, max: 50, chance: 1.0 },
                coinChance: 0.3,
                healChance: 0.05,
            },
        });
    }
}
