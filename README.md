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

## 環境構築手順

本プロジェクトは `devbox` を使用して開発環境を管理しています。

### 1. 前提条件
- **Devbox** がインストールされていること
- **Docker** がインストールされていること（DB起動用）

### 2. セットアップ

リポジトリをクローンし、プロジェクトルートで以下のコマンドを実行します。

```bash
# 依存関係のインストール (Go Modules, Root npm, Frontend npm)
devbox run setup
```

### 3. 開発サーバーの起動

以下のコマンドで、Frontend（Vite）と Backend（Air/Go）を同時に起動できます。

```bash
# プロジェクトルートで実行
devbox run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8080 (予定)

### 4. 個別の起動コマンド

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
