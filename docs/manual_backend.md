# バックエンド開発マニュアル

Go言語、Echoフレームワーク、DB操作(Bun)を使ったAPI開発の流れを解説します。
「新しいAPIを追加して、画面からデータを取得できるようにする」までの流れをマスターしましょう。

## 1. ディレクトリ構成（どこに何を書くの？）

バックエンドのコードは `backend/` の中にあります。
「Role」ごとにフォルダが分かれている「レイヤードアーキテクチャ」という構成になっています。

```text
backend/
├── cmd/server/main.go  # サーバーの起動ボタン (ここはあまり触らない)
├── internal/
│   ├── entity/         # 【名詞】データの「型」定義 (ユーザー、アイテムなど)
│   ├── repository/     # 【倉庫】データベースからデータを取ってくる係
│   ├── service/        # 【仕事】データの加工やチェックをする係 (ビジネスロジック)
│   ├── handler/        # 【受付】リクエストを受け取り、レスポンスを返す係
│   └── router/         # 【案内】URLと受付(Handler)を紐付ける係
└── db/migrations/      # データベースの設計図 (マイグレーションファイル)
```

---

## 2. データベースの変更 (テーブル作成)

APIを作る前に、まずはデータを保存する箱（テーブル）を用意しましょう。
`golang-migrate` ツールを使います。

### 手順①：マイグレーションファイルの作成

ターミナルで以下のコマンドを実行します。`<name>` には変更内容を英語で記述します（例: `create_items_table`）。

```bash
devbox run db:new <name>
```

すると、`backend/db/migrations/` フォルダに2つのファイルが生成されます。
- `xxxxxx_<name>.up.sql`: **適用**するためのSQL (CREATE TABLEなど)
- `xxxxxx_<name>.down.sql`: **取り消す**ためのSQL (DROP TABLEなど)

### 手順②：SQLの記述

生成された `.up.sql` に作成したいテーブルのSQLを書きます。

例 (`backend/db/migrations/xxxxxx_create_items_table.up.sql`):
```sql
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL
);
```

`.down.sql` には、それを元の状態に戻すSQLを書きます。

例 (`backend/db/migrations/xxxxxx_create_items_table.down.sql`):
```sql
DROP TABLE IF EXISTS items;
```

### 手順③：DBへの反映 (Migrate Up)

以下のコマンドで、未適用のマイグレーションをDBに反映します。

```bash
devbox run db:migrate
```

### 手順④：やり直し (Rollback) ※必要な場合

直前のマイグレーションを取り消したい場合は、以下を実行します。

```bash
devbox run db:rollback
```

---

## 3. 新しいAPIを作る手順

テーブルができたら、そのデータを使うAPIを作ります。
例として「アイテム一覧を取得する機能 (GET /items)」を作ってみましょう。

### 手順①：データの「型」を決める (Entity)

`internal/entity/item.go`

まず、「アイテム」とはどんなデータなのかを定義します。

```go
package entity

import "github.com/uptrace/bun"

// Item 構造体
type Item struct {
    bun.BaseModel `bun:"table:items"` // DBの items テーブルと紐付け

    ID    int64  `bun:",pk,autoincrement" json:"id"` // ID (自動採番)
    Name  string `bun:",notnull" json:"name"`        // 名前
    Price int    `bun:",notnull" json:"price"`       // 価格
}
```

### 手順②：データベースから取る処理を書く (Repository)

`internal/repository/item_repository.go`

SQLを書く代わりに `Bun` というライブラリを使ってデータを取得します。

```go
package repository

import (
    "context"
    "github.com/uptrace/bun"
    "github.com/RiTa-23/TRI-Survivor/backend/internal/entity"
)

type ItemRepository struct {
    db *bun.DB
}

func NewItemRepository(db *bun.DB) *ItemRepository {
    return &ItemRepository{db: db}
}

// 全てのアイテムを取得する
func (r *ItemRepository) FindAll(ctx context.Context) ([]entity.Item, error) {
    var items []entity.Item
    // SELECT * FROM items
    err := r.db.NewSelect().Model(&items).Scan(ctx)
    return items, err
}
```

### 手順③：ビジネスロジックを書く (Service)

`internal/service/item_service.go`

Repositoryからデータを受け取り、必要なら加工します。今回はそのまま返すだけです。

```go
package service

import (
    "context"
    "github.com/RiTa-23/TRI-Survivor/backend/internal/entity"
    "github.com/RiTa-23/TRI-Survivor/backend/internal/repository"
)

type ItemService struct {
    repo *repository.ItemRepository
}

func NewItemService(repo *repository.ItemRepository) *ItemService {
    return &ItemService{repo: repo}
}

func (s *ItemService) GetItems(ctx context.Context) ([]entity.Item, error) {
    // リポジトリを呼んでデータを取得
    return s.repo.FindAll(ctx)
}
```

### 手順④：リクエストを受け取る (Handler)

`internal/handler/item_handler.go`

ブラウザ(フロントエンド)からのリクエストを受け取り、Serviceの結果をJSONで返します。

```go
package handler

import (
    "net/http"
    "github.com/labstack/echo/v4"
    "github.com/RiTa-23/TRI-Survivor/backend/internal/service"
)

type ItemHandler struct {
    service *service.ItemService
}

func NewItemHandler(service *service.ItemService) *ItemHandler {
    return &ItemHandler{service: service}
}

// GET /api/v1/items の処理
func (h *ItemHandler) ListItems(c echo.Context) error {
    ctx := c.Request().Context()
    
    // サービスを呼ぶ
    items, err := h.service.GetItems(ctx)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    
    // JSONで返す
    return c.JSON(http.StatusOK, items)
}
```

### 手順⑤：URLを登録する (Router)

`internal/router/router.go`

最後に、URL (`/items`) と Handler を紐付けます。

```go
func SetupRouter(e *echo.Echo, itemHandler *handler.ItemHandler) {
    api := e.Group("/api/v1")
    
    // GET /api/v1/items に来たら ListItems を実行
    api.GET("/items", itemHandler.ListItems)
}
```

これで、`http://localhost:8080/api/v1/items` にアクセスするとアイテム一覧が返ってくるようになります！

---

## 4. 応用：データベースの変更 (カラム追加など)

既存のテーブルにカラムを追加したい場合も、基本は同じ手順です。

例：`items` テーブルに `description` カラムを追加する場合

1. **ファイル作成**:
   ターミナルで `devbox run db:new add_description_to_items` を実行。

2. **.up.sql の編集**:
   ```sql
   ALTER TABLE items ADD COLUMN description TEXT;
   ```

3. **.down.sql の編集**:
   ```sql
   ALTER TABLE items DROP COLUMN description;
   ```

4. **反映**:
   `devbox run db:migrate` を実行。

---

## 5. トラブルシューティング

- **importエラーが出る**: Goは使わないimportがあるとエラーになります。保存時に自動で消える設定になっていることが多いですが、消えない場合は手動で削除してください。
- **サーバーが起動しない**: エラーメッセージをよく読みましょう。「ポート8080が使われている」と言われたら、別のプロセスが動いていないか確認してください。
- **DBにつながらない**: `.env` の `DATABASE_URL` が正しく設定されているか確認してください。
- **マイグレーションエラー (Dirty state)**: マイグレーションが途中で失敗すると、DBが "Dirty" 状態になり、次のコマンドが打てなくなることがあります。その場合は `devbox run db:force <バージョン番号>` で強制的にバージョンを指定して復旧してください。
