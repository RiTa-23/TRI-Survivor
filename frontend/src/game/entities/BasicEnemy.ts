import { Enemy } from "./Enemy";

/**
 * 基本的な敵 — 赤い丸
 * 
 * 低速でプレイヤーに向かって直進する。
 * 最もシンプルな敵タイプで、他の敵の参考実装にもなる。
 */
export class BasicEnemy extends Enemy {
    constructor() {
        super({
            hp: 3,
            speed: 1.5,
            attackPower: 10,
            color: 0xe74c3c,
            radius: 12,
        });
    }
}
