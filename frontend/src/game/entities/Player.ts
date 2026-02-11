import { Container, Graphics } from "pixi.js";

export class Player extends Container {
    private graphics: Graphics;
    private speed: number = 5;

    constructor() {
        super();

        // Create Player (Triangle)
        this.graphics = new Graphics();
        this.graphics.context.beginPath();
        this.graphics.context.moveTo(0, -20);
        this.graphics.context.lineTo(15, 20);
        this.graphics.context.lineTo(-15, 20);
        this.graphics.context.closePath();
        this.graphics.context.fill({ color: 0xffffff });

        this.addChild(this.graphics);
    }

    public move(dx: number, dy: number) {
        this.x += dx * this.speed;
        this.y += dy * this.speed;
    }
}
