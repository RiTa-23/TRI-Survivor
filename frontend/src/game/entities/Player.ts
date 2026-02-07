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

    public update(keys: { [key: string]: boolean }, screenWidth: number, screenHeight: number) {
        if (keys["KeyW"] || keys["ArrowUp"]) this.y -= this.speed;
        if (keys["KeyS"] || keys["ArrowDown"]) this.y += this.speed;
        if (keys["KeyA"] || keys["ArrowLeft"]) this.x -= this.speed;
        if (keys["KeyD"] || keys["ArrowRight"]) this.x += this.speed;

        // Simple boundary check
        this.x = Math.max(0, Math.min(screenWidth, this.x));
        this.y = Math.max(0, Math.min(screenHeight, this.y));
    }
}
