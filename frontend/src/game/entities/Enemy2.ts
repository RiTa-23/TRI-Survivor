import { Enemy } from "./Enemy";

export class Enemy2 extends Enemy {
    constructor() {
        super({
            hp: 20,
            speed: 100,
            attackPower: 15,
            color: 0xe74c3c,
            textureKey: "/assets/images/enemy/enemy_2.png",
            radius: 35,
            dropTable: {
                exp: { min: 1, max: 3, chance: 1.0 },
                coinChance: 0.4,
                healChance: 0.08,
            },
        });
    }
}
