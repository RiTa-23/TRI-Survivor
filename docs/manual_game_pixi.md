# ゲーム開発マニュアル (PixiJS & React 初心者向け)

Reactの中で「動くゲーム画面」を作るためのライブラリ、**PixiJS** の使い方を解説します。
「画面にキャラクターを出して、動かす」ところから始めましょう。

## 1. 仕組みの理解（React と PixiJS の関係）

ご存知の通り、React は「データの変更に合わせて画面を書き換える」のが得意です。
しかし、ゲームのように「毎秒60回画面を書き換える」処理は React だけだと重すぎてカクカクしてしまいます。

そこで **PixiJS** の出番です。

- **React**: HPバー、スコア、メニューボタンなどの「動かない UI」担当
- **PixiJS**: キャラクター、背景、エフェクトなどの「激しく動く描画」担当 (Canvas要素の中に描画)

この2つを重ねて表示することで、高性能なゲームを作ります。

---

## 2. 基本的な実装テンプレート

`src/features/game/GameScreen.tsx` がゲーム画面の基本ファイルです。
以下の形がベースになります。これをコピペして使い回してOKです。

```tsx
import { useEffect, useRef } from "react";
import { Application, Graphics, Sprite, Assets } from "pixi.js";

export default function GameScreen() {
    // 1. PixiJS のキャンバス入る「枠 (div)」への参照
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // initPixi関数の中にゲームの初期化処理を書きます
        const initPixi = async () => {
            // アプリケーションを作る (画用紙を用意するイメージ)
            const app = new Application();
            
            // 初期化設定 (画面サイズに合わせてリサイズ、背景色など)
            await app.init({
                resizeTo: window,
                backgroundColor: 0x1099bb, // 水色 (16進数)
            });

            // Reactのdivの中にPixiのキャンバスを入れる
            if (containerRef.current) {
                containerRef.current.appendChild(app.canvas);
            }

            // ★ ここから下にゲームのコードを書く！ ★
            
            // 例: 四角形を表示する
            const rect = new Graphics();
            rect.rect(0, 0, 100, 100); // x, y, width, height
            rect.fill(0xff0000); // 赤色で塗りつぶし
            rect.x = 200; // 配置場所 x
            rect.y = 200; // 配置場所 y
            app.stage.addChild(rect); // 画面に追加 (これを忘れると表示されない！)

            // 毎フレーム実行されるループ処理 (動きをつける)
            app.ticker.add((ticker) => {
                rect.rotation += 0.05 * ticker.deltaTime; // 回転させる
            });
        };

        // 実行！
        const cleanupPromise = initPixi();

        // 画面を閉じたときの後片付け (メモリリーク防止)
        return () => {
             cleanupPromise.then(cleanup => {
                // ここで destroy などを呼ぶ
             });
        };
    }, []);

    return (
        // PixiJSが入る枠。ReactのUIはこのdivの中に書くとCanvasの上に重なる
        <div ref={containerRef} className="w-full h-screen relative">
            {/* ここに書いたものが UI オーバーレイになる */}
            <div className="absolute top-4 left-4 text-white font-bold">
                SCORE: 0
            </div>
        </div>
    );
}

```

---

## 3. 具体的な開発手順

### 手順①：図形を表示する (Graphics)

簡単な図形なら画像なしで描画できます。

```ts
const circle = new Graphics();
circle.circle(0, 0, 50); // 半径50の円
circle.fill({ color: 0x00ff00 }); // 緑色
circle.x = 100;
circle.y = 100;
app.stage.addChild(circle);
```

### 手順②：画像を表示する (Sprite)

キャラクターなどの画像を表示する場合です。

> **Point:** PixiJSでは `public/` フォルダを使うのがおすすめです。
> - `src/assets/` だと `import chara1 from "..."` と全部書く必要があり大変です。
> - `public/` なら `"/images/chara1.png"` のように文字列だけで読み込めて便利です。

画像ファイルは `public/player.png` に置きます。

```ts
// 1. 画像を読み込む (publicフォルダにあるファイルは / でアクセスできます)
const texture = await Assets.load('/player.png');

// 2. スプライトを作る
const player = new Sprite(texture);

// 3. 位置や大きさを調整
player.anchor.set(0.5); //画像の中心を基準点にする (回転などが綺麗になる)
player.x = app.screen.width / 2;
player.y = app.screen.height / 2;
player.scale.set(0.5); // 半分の大きさにする

// 4. 表示
app.stage.addChild(player);
```

### 手順③：動かす (Ticker)

`app.ticker.add` の中に書いたコードは、1秒間に約60回実行され続けます。

```ts
app.ticker.add(() => {
    // x座標を増やす = 右へ移動
    player.x += 5;

    // 画面の端に行ったら戻す
    if (player.x > app.screen.width) {
        player.x = 0;
    }
});
```

---

## 4. クラスを使った整理（上級編）

全部 `useEffect` の中に書くとコードが長くなりすぎるので、役割ごとに **クラス (Class)** に分けるのがおすすめです。

例: `src/game/Player.ts` を作る

```ts
import { Container, Graphics } from "pixi.js";

export class Player extends Container {
    private graphics: Graphics;

    constructor() {
        super();
        
        // プレイヤーの見た目を作る
        this.graphics = new Graphics();
        this.graphics.moveTo(0, -20);
        this.graphics.lineTo(15, 20);
        this.graphics.lineTo(-15, 20);
        this.graphics.fill({ color: 0xffffff });
        
        this.addChild(this.graphics);
    }

    // 更新処理
    update() {
        // キー入力に応じて移動する処理などをここに書く
    }
}
```

こうしておけば、`GameScreen.tsx` では以下のように書くだけで済みます。

```ts
const player = new Player();
app.stage.addChild(player);

app.ticker.add(() => {
    player.update(); // 毎フレーム更新
});
```

## 困ったときは？

- **画面が真っ暗**: `app.stage.addChild(obj)` を忘れていませんか？
- **画像が出ない**: パスが間違っていませんか？ `public/` に置いて、`/画像名.png` で指定します。
- **エラーが出る**: `console.log` を使って変の中身を見てみましょう。
