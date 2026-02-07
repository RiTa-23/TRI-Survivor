# フロントエンド開発マニュアル (初心者向け)

React未経験のチームメンバー用フロントエンド開発マニュアル
「新しい画面を作って、ボタンで移動する」までの一連の流れをマスターしよう。

## 📂 ディレクトリ構成（どこに何があるの？）

まず、`frontend/src/` の中身を理解しましょう。編集するのは主にここだけです。

```
src/
├── features/       # ★ここが一番重要！画面ごとのファイル置き場
│   ├── home/       # ホーム画面用
│   ├── auth/       # ログイン画面用
│   └── game/       # ゲーム画面用
├── components/     # 部品置き場 (ボタン、カードなど、どこでも使えるもの)
│   └── ui/         # shadcn/ui の部品 (ここはいじらない)
├── lib/            # 便利な関数置き場 (utils.ts など)
├── assets/         # 画像やアイコン置き場
├── App.tsx         # ★画面の「地図」 (ルーティング設定)
└── index.css       # 全体のスタイル設定 (Tailwind CSS)
```

---

## 📄 新しい画面を作る手順

例として「ショップ画面 (ShopScreen)」を新しく作ってみましょう。

### 手順①：画面コンポーネント（ファイル）を作成する

`src/features/shop/ShopScreen.tsx` というファイルを作成します。
(フォルダがない場合は `shop` フォルダも作成してください)

```tsx
// src/features/shop/ShopScreen.tsx

// 1. 必要な機能をインポートします
import { useNavigate } from "react-router-dom"; // 画面遷移に使う
import { cn } from "@/lib/utils"; // クラス名を合体させる便利なやつ

// 2. コンポーネント関数を定義します (ファイル名と同じにするのが基本)
export default function ShopScreen() {
    // 画面遷移のためのフックを使えるようにする
    const navigate = useNavigate();

    // 3. 画面の見た目 (HTMLっぽいJSX) を返します
    return (
        // Tailwind CSS でスタイリング (背景色: slate-950, 文字色: white, 画面いっぱい: min-h-screen)
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8">

            {/* タイトル */}
            <h1 className="text-4xl font-bold mb-6 text-yellow-400">
                Welcome to the Shop
            </h1>

            {/* 説明文 */}
            <p className="text-slate-300 mb-8">
                ここではアイテムを購入できます。
            </p>

            {/* ホームに戻るボタン */}
            <button
                // クリックされたら /home に移動する
                onClick={() => navigate("/home")}
                // ボタンの見た目
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-bold"
            >
                ホームに戻る
            </button>
        </div>
    );
}
```

### 手順②：ルーティングに追加する

作った画面をアプリに認識させるために、`src/App.tsx` を編集します。

1. **インポートを追加**
    
    ```tsx
    // App.tsx の上の方に追加
    import ShopScreen from "./features/shop/ShopScreen";
    ```
    
2. **ルートを追加**
    
    ```tsx
    // <Routes> の中に追加
    <Routes>
        {/* ...他のルート... */}
        <Route path="/home" element={<HomeScreen />} />
    
        {/* これを追加！ /shop にアクセスしたら ShopScreen を表示する */}
        <Route path="/shop" element={<ShopScreen />} />
    </Routes>
    ```
    

これで、ブラウザで `http://localhost:5173/shop` にアクセスすると、作成した画面が表示されます！

---

## 🔗 画面遷移の実装（ページを移動する）

### リンクによる遷移 (`<Link>`)

ボタンやテキストをクリックして**単にページを移動する場合**は、`<Link>` を使うのが基本です

shadcn/ui の `Button` をリンクとして使う場合は `asChild` プロパティを使うときれいに書けます。

```tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// 推奨: Buttonをリンク化する
<Button asChild>
  <Link to="/home">ホームへ戻る</Link>
</Button>
```

### プログラムによる遷移 (`useNavigate`)

**処理の完了後**などに自動で遷移させる場合に使います（例：フォーム送信後、ログアウト処理後など）。

```tsx
import { useNavigate } from 'react-router-dom';

const Component = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // 1. ログイン処理などをここで実行
    console.log("Logged in!");

    // 2. 処理が終わったら遷移
    navigate('/home');
  };

  return <Button onClick={handleLogin}>ログイン</Button>;
};

```

---

## 🎨 UIデザインの実装方法

### Tailwind CSSの使い方

HTMLの `class` 属性（Reactでは `className`）に、あらかじめ用意されたクラス名を書くだけでデザインできます。
CSSファイルを行ったり来たりする必要はありません。

- **色**: `bg-blue-500` (背景色赤), `text-white` (文字色白)
- **余白**: `p-4` (内側余白), `m-4` (外側余白), `gap-2` (要素の間隔)
- `rounded-md`: 角丸
- `hover:opacity-80`: ホバー時に透明度を変更

```tsx
<div className="bg-blue-500 text-white p-4 rounded-md hover:opacity-80">
  スタイリッシュなボックス
</div>
```

他にも配置やサイズの指定もできます

- **配置**: `flex` (横並び), `flex-col` (縦並び), `items-center` (中央揃え)
- **サイズ**: `w-full` (幅100%), `h-screen` (画面の高さ100%), `text-xl` (文字大きく)

**チートシート**: [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet) に一覧が載ってるよ！

### shadcn/ui (コンポーネント集)の使い方

ボタンや入力フォームなど、リッチなUI部品を使いたい場合は `shadcn/ui` を使います。
`src/components/ui` にあるコンポーネントをインポートして使います。

**shadcn/ui コンポーネントの追加**

必要なUIパーツを個別にインストールします。

```bash
npx shadcn@latest add [コンポーネント名]
# 例: npx shadcn@latest add button input

```

使用例（ボタンコンポーネント）：

```tsx
import { Button } from "@/components/ui/button"; // インポート

// 使用する
<Button variant="destructive" onClick={() => alert("削除！")}>
    削除する
</Button>
```

普通の `<button>` タグよりもデザインが整っており、`variant` プロパティで見た目を簡単に切り替えられます。

- **variant**: `default`, `destructive` (赤), `outline` (枠線のみ), `ghost` (背景なし) などが選べます。

### その他の shadcn/ui コンポーネント

Button 以外にも、さまざまなUIコンポーネントが用意されています。

- **Input**: テキスト入力欄
- **Card**: コンテンツをまとめる枠
- **Dialog**: モーダル(ポップアップ)ダイアログ
- **Select**: ドロップダウン選択
- **Checkbox**: チェックボックス
- **Toast**: 通知メッセージ

他にも `Badge`, `Alert`, `Tabs`, `Switch` など多数あります。詳しくは [shadcn/ui ドキュメント](https://ui.shadcn.com/docs/components) を参照してください。

[Components](https://ui.shadcn.com/docs/components)

---

## 🖼 素材・アセットの利用 (Assets & Media)

### アイコン (`lucide-react`)

[Lucide Icons](https://lucide.dev/icons) からアイコンを選んで使えます。

```tsx
import { Camera, Home, Settings } from 'lucide-react';

<Camera className="w-6 h-6 text-gray-500" />

```

### 画像の表示

画像ファイルは `src/assets/img` フォルダに配置してください。

**ディレクトリ構成:**

```
src/
└── assets/
    └── img/         # ここに画像ファイルを置く
        └── logo.png

```

```tsx
import logoParams from '@/assets/img/logo.png';

<img src={logoParams} alt="ロゴ" className="w-32" />

```

[https://zenn.dev/kiriyama/articles/20480ad223d36e#画像を表示する方法](https://zenn.dev/kiriyama/articles/20480ad223d36e#%E7%94%BB%E5%83%8F%E3%82%92%E8%A1%A8%E7%A4%BA%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95)

### 効果音を鳴らす (`use-sound`)

効果音ファイルは `src/assets/sounds` フォルダに配置してください。

**ディレクトリ構成:**

```
src/
└── assets/
    └── sounds/      # ここにmp3やwavファイルを置く
        ├── alert.mp3
        └── success.mp3

```

Reactで効果音を扱う場合、[use-sound](https://github.com/joshwcomeau/use-sound) ライブラリを使うのが便利です。

まずはインストールします。

```bash
npm install use-sound
```

使い方は以下の通りです。

```tsx
import useSound from 'use-sound';
import soundFile from '@/assets/sounds/alert.mp3';

const Component = () => {
  // play関数を取り出す
  const [play] = useSound(soundFile);

  return (
    <button onClick={() => play()}>
      音を鳴らす
    </button>
  );
};

```

`volume` オプションで音量を調整したり、`onend` で再生終了時の処理を書くこともできます。

```tsx
const [play] = useSound(soundFile, { volume: 0.5 });
```

---

## 困ったときは？

1. **エラーが出た！**: ターミナルやブラウザのコンソールを見てください。
2. **型エラー (赤線)**: カーソルを合わせるとヒントが出ます。
3. **AIに聞く**: 「Reactで〇〇するにはどう書けばいい？」と聞いてみましょう。