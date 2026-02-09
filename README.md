# TRI-Survivor

2Dサバイバー系ローグライクアクションゲーム。

## プロダクト概要

- **ゲームプレイ**: 迫りくる敵の群れを倒しながら、パワーアップを選択して自機を強化し、可能な限り長く生き残ることを目指します。
- **特徴**:
    - React + PixiJS による高速かつスムーズな描画
    - Go + Echo による堅牢なバックエンドAPI
    - Devbox による統一された開発環境

## 使用技術

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Game Engine**: PixiJS (Game Logic), React (UI Overlay)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **State Management**: Zustand
- **Routing**: React Router

### Backend (Planned)
- **Language**: Go
- **Framework**: Echo
- **ORM**: Bun
- **Database**: PostgreSQL (Development: SQLite/Docker)
- **Migration**: Atlas

### Infrastructure & Tools
- **Environment Management**: Devbox
- **Containerization**: Docker (DB, etc.)
- **Code Review**: CodeRabbit
- **Linting/Formatting**: Biome (Frontend), gofmt (Backend)

## 環境構築手順 (Windows WSL2 / Mac)

### 1. WSL2の準備（Windowsユーザーのみ）
PowerShellを管理者権限で開き、`wsl --install` を実行して再起動してください。

### 2. Devboxのインストール
WSL2内 または Macターミナルで以下を実行します。
```bash
curl -fsSL https://get.jetpack.io/devbox | bash
```

### 3. リポジトリのクローンと移動
```bash
git clone <リポジトリのURL>
cd TRI-Survivor
```

### 4. 開発環境への潜入
```bash
devbox shell
```
※これ以降は、PC本体のツールではなく「Devbox内のツール」が使われます。開発作業時は必ずこのシェルに入ってください。

### 5. 一括セットアップ
依存関係（Go modules, npm）をインストールします。
```bash
devbox run setup
```

### 6. 環境変数の設定
プロジェクトルートに **`.env`** ファイルを作成し、データベース設定などを書き込みます。
（`.env.example` をコピーして使用してください）

### 7. データベース設定の確認
`.env` ファイルに `DATABASE_URL` が正しく設定されていることを確認してください。
本プロジェクトでは Supabase (Hosted DB) を使用するため、DockerなどのローカルDB起動は不要です。

### 8. 開発開始！
Frontend, Backend (Air) を一括で起動します。
```bash
devbox run dev
```
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8080 (予定)


### 便利なコマンド (Advanced)

```bash
# Frontendのみ起動
devbox run dev:front

# Backendのみ起動
devbox run dev:back
```

## ディレクトリ構成

- `frontend/`: React + PixiJS アプリケーション
    - `src/features/`: 機能ごとのコンポーネント
    - `src/game/`: PixiJS ゲームロジック (Core, Entities)
- `backend/`: Go API サーバー (構成中)
- `docs/`: 開発マニュアル・設計資料

---

## ドキュメント
- [Frontend Development Manual](./docs/manual_frontend.md)
- [Backend Development Manual](./docs/manual_backend.md)
- [Game Logic Manual](./docs/manual_game_pixi.md)
