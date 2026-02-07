# ディレクトリ構造提案

`prompt.md` の要件に基づいた、`TRI-Survivor` プロジェクトの推奨ディレクトリ構造を提案します。
フロントエンドは PixiJS (Game) と React (UI) の責務分離、バックエンドは Go (Echo/Bun/Atlas) の標準的な構成を意識しています。

## Root Directory

プロジェクトのルートは、開発環境の定義と各サービスのオーケストレーションを管理します。

```text
TRI-Survivor/
├── devbox.json           # 開発環境の定義 (Go, Node.js, ツールチェーン)
├── package.json          # 全体コマンドランナー (npm-run-all で frontend/backend を同時起動)
├── docker-compose.yml    # (Optional) DBやミドルウェアのコンテナ定義
├── document/             # 設計書・ドキュメント関連
├── backend/              # Go バックエンドアプリケーション
└── frontend/             # React フロントエンドアプリケーション
```

### ポイント
- **devbox.json**: `Go`, `Node.js`, `Bun`, `Atlas` などのバージョンを固定し、開発者間で環境を統一します。
- **package.json**: ルートの `package.json` は **ビルドアーティファクトを含まず**、開発用スクリプト (`dev`, `build`, `lint` など) の一元管理に使用します。

---

## Backend (Go)

`internal` パッケージを活用し、外部から import できないようにカプセル化を行います。アーキテクチャはレイヤードアーキテクチャ（Handler -> Service -> Repository）を基本とします。

```text
backend/
├── cmd/
│   └── server/
│       └── main.go           # エントリーポイント (サーバー起動のみを行う)
├── db/
│   ├── migrations/           # Atlas で生成されたマイグレーションファイル
│   └── schema.hcl            # Atlas スキーマ定義 (HCL)
├── internal/
│   ├── config/               # 環境変数・設定読み込み
│   ├── db/                   # DB接続初期化 (Bun)
│   ├── entity/               # ドメインモデル (DB構造体定義など)
│   ├── handler/              # HTTPハンドラー (Echo Context の処理)
│   │   ├── auth_handler.go
│   │   ├── user_handler.go
│   │   └── game_handler.go
│   ├── middleware/           # カスタムミドルウェア (Authなど)
│   ├── repository/           # データアクセス層 (Bun クエリの発行)
│   ├── router/               # ルーティング定義
│   └── service/              # ビジネスロジック
└── go.mod
```

### ポイント
- **cmd/server/main.go**: アプリケーションの初期化と起動のみに責務を保ちます。
- **internal/**: アプリケーション固有のコードを配置し、外部ライブラリとして使われないようにします。
- **entity**: `model` と呼ぶことも多いですが、DB構造体やビジネスモデルを置きます。
- **repository**: `Bun` を使ったクエリビルドはここで行い、Service層からSQLを隠蔽します。
- **db/schema.hcl**: Atlasでの管理を前提とするため、HCLファイルを配置します。

---

## Frontend (React + PixiJS)

ReactのUIコンポーネントと、PixiJSのゲームロジックを明確に分離します。

```text
frontend/
├── public/                   # 静的アセット (画像、音声など)
├── src/
│   ├── components/           # React UI コンポーネント (再利用可能)
│   │   ├── ui/               # shadcn/ui コンポーネント
│   │   ├── layout/           # レイアウト用コンポーネント
│   │   └── common/           # 汎用コンポーネント
│   ├── features/             # 機能ごとのコンポーネント (画面単位など)
│   │   ├── auth/             # ログイン・サインアップ画面
│   │   ├── home/             # ロビー画面
│   │   ├── settings/         # 設定画面
│   │   └── game/             # ゲーム画面の **UIレイヤー** (HUD, ポーズメニュー)
│   ├── game/                 # PixiJS ゲームロジック (React依存を極力排除)
│   │   ├── core/             # Application, GameLoop, SceneManager
│   │   ├── entities/         # Player, Enemy, Bullet 等のクラス
│   │   ├── systems/          # Movement, Collision, Input 等のシステム
│   │   ├── assets/           # アセットローダー定義
│   │   └── utils/            # ゲーム計算用ユーティリティ
│   ├── hooks/                # グローバル React Hooks
│   ├── lib/                  # 外部ライブラリ設定 (axios, supabaseClient, utils)
│   ├── stores/               # Zustand ストア
│   │   ├── useGameStore.ts   # HP, EXP などのゲーム状態 (React/Pixi 共有)
│   │   └── useAuthStore.ts   # 認証状態
│   ├── types/                # グローバル型定義
│   ├── App.tsx               # ルーティング設定
│   └── main.tsx              # エントリーポイント
├── index.html
├── vite.config.ts
└── tsconfig.json
```

### ポイント
- **src/game/**: ここには基本的に React コンポーネントを含めず、純粋な TypeScript クラスや PixiJS オブジェクトで構成します。
    - React との連携は `zustand` ストアを介して行うか、Custom Hook (`useGameInstance` など) で Pixi Canvas をマウントする形を取ります。
- **src/features/game**: ここは「ゲーム画面」の **UIオーバーレイ** (ヒットポイントバー、スコア表示、ポーズボタンなど) を担当します。
- **components/ui**: `shadcn/ui` のコンポーネントはここに配置されます。

---

## 開発フローとの連携

- **Devbox**: `devbox.json` で Go と Node.js の環境が管理されているため、コマンドは `devbox run dev` などで両方を立ち上げられるように `package.json` (ルート) の scripts を整備することを推奨します。
- **Import Alias**: フロントエンドは `@/` で `src/` を参照するように `tsconfig.json` と `vite.config.ts` を設定済みであることを確認してください。
