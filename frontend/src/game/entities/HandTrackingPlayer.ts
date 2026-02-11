import { Container, Graphics } from "pixi.js";

export class HandTrackingPlayer extends Container {
    private graphics: Graphics;
    private speed: number = 5;

    constructor() {
        super();

        // Create Player (Triangle) - same visual as Player
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

    // Keep update for consistency if needed, but primarily driven by move()
    public update(keys: { [key: string]: boolean }, screenWidth: number, screenHeight: number) {
        // Optional: Hybrid control or fallback
        // For now, this class is specifically for the hand tracking test, so we might not use keys.
        // But keeping the method signature might be good if we swap interfaces.
        // Let's just implement the boundary check here or in move. 
        // In the previous implementation, boundary check was in update.

        // Simple boundary check
        this.x = Math.max(0, Math.min(screenWidth, this.x));
        this.y = Math.max(0, Math.min(screenHeight, this.y));
    }
}
