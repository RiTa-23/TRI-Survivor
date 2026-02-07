# ゲーム開発マニュアル (PixiJS & React)

Reactの中で「動くゲーム画面」を作るためのライブラリ、**PixiJS** の使い方を解説します。
プロジェクトでは **GameApp クラス** を使って、ReactのUIロジックとゲームロジックを分離しています。

## 1. 仕組みの理解（React と PixiJS の分業）

- **PixiJS (Canvas)**: 背景、プレイヤー、敵、弾幕、エフェクトなどの「ゲーム内オブジェクト」。高速描画が必要な部分。
- **React (DOM)**: HPバー、スコア表示、ポーズボタン、メニューなどの「UIレイヤー」。Canvasの上にオーバーレイ表示します。

この2つを重ねて表示します。

---

## 2. ディレクトリ構成

ゲームのコアロジックは `src/game/` ディレクトリに置きます。

```text
src/
├── features/game/
│   └── GameScreen.tsx  # Reactコンポーネント (UIとGameAppのつなぎ役)
└── game/               # ゲームロジック本体
    ├── core/           # ゲームのコアシステム
    │   └── GameApp.ts  # ゲーム全体の管理クラス
    └── entities/       # ゲームオブジェクト
        └── Player.ts   # プレイヤーなどのクラス
```

---

## 3. 実装テンプレート

### ① GameApp.ts (ゲーム全体の管理)

`src/game/core/GameApp.ts`

このクラスが PixiJS の `Application` を持ち、ゲーム全体をコントロールします。

```ts
import { Application } from "pixi.js";
import { Player } from "../entities/Player"; // 相対パスが変わります

export class GameApp {
    private app: Application;
    private player: Player;

    constructor() {
        this.app = new Application();
        this.player = new Player();
    }

    // 初期化処理
    public async init(container: HTMLDivElement) {
        // PixiJSアプリの作成
        await this.app.init({
            resizeTo: window,
            backgroundColor: 0x1099bb,
        });

        // HTML要素に追加
        container.appendChild(this.app.canvas);

        // プレイヤーの追加
        this.player.x = this.app.screen.width / 2;
        this.player.y = this.app.screen.height / 2;
        this.app.stage.addChild(this.player);

        // ゲームループ (毎フレーム実行)
        this.app.ticker.add(() => {
            this.player.update();
        });
    }

    // 終了処理
    public destroy() {
        this.app.destroy({ removeView: true }, { children: true });
    }
}
```

### ② Player.ts (ゲームオブジェクト)

`src/game/entities/Player.ts`

キャラクターや敵は `Container` クラスを継承して作ります。

```ts
import { Container, Graphics, Sprite, Assets } from "pixi.js";

export class Player extends Container {
    constructor() {
        super();
        this.setup();
    }

    private setup() {
        // 図形の場合
        const graphics = new Graphics();
        graphics.fill({ color: 0xffffff });
        graphics.rect(-10, -10, 20, 20);
        this.addChild(graphics);

        // 画像の場合 (非同期になるので注意)
        // Assets.load('/player.png').then(texture => {
        //     const sprite = new Sprite(texture);
        //     this.addChild(sprite);
        // });
    }

    // 更新処理 (移動など)
    public update() {
        this.x += 1; // 右へ移動
    }
}
```

### ③ GameScreen.tsx (Reactとの連携)

`src/features/game/GameScreen.tsx`

React側は `GameApp` を `useEffect` で起動するだけです。

```tsx
import { useEffect, useRef } from "react";
import { GameApp } from "@/game/core/GameApp";

export default function GameScreen() {
    const containerRef = useRef<HTMLDivElement>(null);
    // GameAppのインスタンスを保持
    const gameAppRef = useRef<GameApp | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const initGame = async () => {
            // ゲーム開始
            const gameApp = new GameApp();
            await gameApp.init(containerRef.current!);
            gameAppRef.current = gameApp;
        };

        const initPromise = initGame();

        return () => {
            // アンマウント時に破棄
            initPromise.then(() => {
                gameAppRef.current?.destroy();
                gameAppRef.current = null;
            });
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-screen relative">
            {/* UIオーバーレイ */}
            <div className="absolute top-4 left-4 text-white">
                SCORE: 100
            </div>
        </div>
    );
}
```

---

## 4. 素材（画像・音声）の使い方

PixiJS で画像を使う場合は `public/` フォルダを使います。

1. 画像を `public/monster.png` に置く
2. コード内では `'/monster.png'` として読み込む

```ts
// クラス内での使用例
export class Monster extends Container {
    constructor() {
        super();
        this.loadTexture();
    }

    async loadTexture() {
        // public/monster.png を読み込む
        const texture = await Assets.load('/monster.png');
        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5); // 中心を基準に
        this.addChild(sprite);
    }
}
```

## 5. React との状態共有

ゲーム内の値（スコアやHP）を React の UI に反映させるには **Zustand** を使います。

1. `useGameStore` を作る (HPなどを管理)
2. **GameApp (Pixi)**: `useGameStore.getState().setHp(newHp)` で値を更新
3. **GameScreen (React)**: `const hp = useGameStore(s => s.hp)` で値を表示

これで高速なゲームループと React UI を連携させることができます。
