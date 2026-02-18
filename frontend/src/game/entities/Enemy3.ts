import { Enemy } from "./Enemy";

export class Enemy3 extends Enemy {
    constructor() {
        super({
            hp: 60,
            speed: 70,
            attackPower: 20,
            color: 0x2ecc71,
            textureKey: "/assets/images/enemy/enemy_3.png",
            radius: 50,
            dropTable: {
                exp: { min: 5, max: 10, chance: 1.0 },
                coinChance: 0.5,
                healChance: 0.1,
            },
        });
    }
}
