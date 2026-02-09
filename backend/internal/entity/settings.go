package entity

import (
	"time"

	"github.com/uptrace/bun"
)

// Settings ユーザー設定情報を表すドメインモデル
type Settings struct {
	bun.BaseModel `bun:"table:settings"`

	UserID    string    `bun:"user_id,pk" json:"userId"` // Supabase Auth ID used as PK/FK
	BGMVolume int       `bun:"bgm_volume,notnull,default:100" json:"bgmVolume"`
	SEVolume  int       `bun:"se_volume,notnull,default:100" json:"seVolume"`
	CreatedAt time.Time `bun:"created_at,nullzero,notnull,default:current_timestamp" json:"createdAt"`
	UpdatedAt time.Time `bun:"updated_at,nullzero,notnull,default:current_timestamp" json:"updatedAt"`
}
