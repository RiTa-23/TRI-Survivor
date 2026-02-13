package entity

import (
	"time"

	"github.com/uptrace/bun"
)

// User ユーザー情報を表すドメインモデル
type User struct {
	bun.BaseModel `bun:"table:users"`

	ID        string    `bun:",pk" json:"id"`        // Supabase Auth ID
	Email     string    `bun:",notnull" json:"email"`
	Name      string    `bun:",notnull" json:"name"`
	AvatarURL string    `bun:",nullzero" json:"avatarUrl"` // GoogleアイコンURL
	Coin      int       `bun:",notnull,default:0" json:"coin"`
	CreatedAt time.Time `bun:",nullzero,notnull,default:current_timestamp" json:"createdAt"`
}
