import { Application } from "pixi.js";
import { Player } from "../entities/Player";

export class GameApp {
    private app: Application;
    private player: Player;
    private keys: { [key: string]: boolean } = {};

    constructor() {
        this.app = new Application();
        this.player = new Player();
    }

    public async init(container: HTMLDivElement) {
        // Initialize PixiJS Application
        await this.app.init({
            resizeTo: window,
            backgroundColor: 0x1099bb,
        });

        if (container) {
            container.appendChild(this.app.canvas);
        }

        // Setup Player
        this.player.x = this.app.screen.width / 2;
        this.player.y = this.app.screen.height / 2;
        this.app.stage.addChild(this.player);

        // Setup Input
        this.setupInput();

        // Start Game Loop
        this.app.ticker.add(() => {
            this.player.update(this.keys, this.app.screen.width, this.app.screen.height);
        });
    }

    private setupInput() {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }

    private onKeyDown = (e: KeyboardEvent) => {
        this.keys[e.code] = true;
    };

    private onKeyUp = (e: KeyboardEvent) => {
        this.keys[e.code] = false;
    };

    public destroy() {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
        this.app.destroy({ removeView: true }, { children: true });
    }
}
