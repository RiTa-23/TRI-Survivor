import { Enemy } from "./Enemy";

export class Enemy4 extends Enemy {
    constructor() {
        super({
            hp: 100,
            speed: 40,
            attackPower: 30,
            color: 0xf1c40f,
            textureKey: "/assets/images/enemy/enemy_4.png",
            radius: 60,
            dropTable: {
                exp: { min: 10, max: 25, chance: 1.0 },
                coinChance: 1.0, // Guaranteed coin
                healChance: 0.3,
            },
        });
    }
}
