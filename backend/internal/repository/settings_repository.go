package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/RiTa-23/TRI-Survivor/backend/internal/entity"
	"github.com/uptrace/bun"
)

type SettingsRepository struct {
	db *bun.DB
}

func NewSettingsRepository(db *bun.DB) *SettingsRepository {
	return &SettingsRepository{db: db}
}

// GetByUserID ユーザーIDから設定を取得します
func (r *SettingsRepository) GetByUserID(ctx context.Context, userID string) (*entity.Settings, error) {
	settings := new(entity.Settings)
	err := r.db.NewSelect().
		Model(settings).
		Where("user_id = ?", userID).
		Scan(ctx)
	
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // Not Found
		}
		return nil, err
	}
	return settings, nil
}

// Upsert 設定を作成または更新します
func (r *SettingsRepository) Upsert(ctx context.Context, settings *entity.Settings) error {
	_, err := r.db.NewInsert().
		Model(settings).
		On("CONFLICT (user_id) DO UPDATE").
		Set("bgm_volume = EXCLUDED.bgm_volume").
		Set("se_volume = EXCLUDED.se_volume").
		Set("updated_at = now()").
		Returning("*").
		Exec(ctx)
	return err
}
