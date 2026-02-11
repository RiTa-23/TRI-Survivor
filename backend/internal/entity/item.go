package entity

import (
	"time"

	"github.com/uptrace/bun"
)

// Item ユーザーの所持アイテム情報を表すドメインモデル
type Item struct {
	bun.BaseModel `bun:"table:items"`

	ID        int       `bun:"id,pk,autoincrement" json:"id"`
	UserID    string    `bun:"user_id,notnull" json:"userId"`
	ItemID    int       `bun:"item_id,notnull" json:"itemId"`
	Quantity  int       `bun:"quantity,notnull,default:0" json:"quantity"`
	CreatedAt time.Time `bun:"created_at,nullzero,notnull,default:current_timestamp" json:"createdAt"`
	UpdatedAt time.Time `bun:"updated_at,nullzero,notnull,default:current_timestamp" json:"updatedAt"`

	// Relations
	Shop *Shop `bun:"rel:belongs-to,join:item_id=item_id" json:"shop,omitempty"`
}
