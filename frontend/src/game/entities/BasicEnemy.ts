import { Enemy } from "./Enemy";

/**
 * 基本的な敵
 * 
 * 低速でプレイヤーに向かって直進する。
 * 最もシンプルな敵タイプで、他の敵の参考実装にもなる。
 */
export class BasicEnemy extends Enemy {
    constructor() {
        super({
            hp: 3,
            speed: 50, // px/sec
            attackPower: 10,
            color: 0x9b59b6,
            textureKey: "/assets/images/basic_enemy.png",
            radius: 40,
            dropTable: {
                exp: { min: 1, max: 3, chance: 1.0 },
                coinChance: 0.3,
                healChance: 0.05,
            },
        });
    }
}
