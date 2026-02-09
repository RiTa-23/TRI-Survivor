package entity

import (
	"time"

	"github.com/uptrace/bun"
)

// Shop ショップアイテム情報を表すドメインモデル
type Shop struct {
	bun.BaseModel `bun:"table:shop"`

	ItemID      int       `bun:"item_id,pk,autoincrement" json:"itemId"`
	ItemName    string    `bun:"item_name,notnull" json:"itemName"`
	Description string    `bun:"description,notnull" json:"description"`
	Price       int       `bun:"price,notnull" json:"price"`
	ItemType    string    `bun:"item_type,notnull" json:"itemType"`
	IconURL     string    `bun:"icon_url,notnull" json:"iconUrl"`
	IsActive    bool      `bun:"is_active,notnull,default:true" json:"isActive"`
	CreatedAt   time.Time `bun:"created_at,nullzero,notnull,default:current_timestamp" json:"createdAt"`
	UpdatedAt   time.Time `bun:"updated_at,nullzero,notnull,default:current_timestamp" json:"updatedAt"`
}
