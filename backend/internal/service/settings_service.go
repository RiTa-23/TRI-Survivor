package service

import (
	"context"

	"github.com/RiTa-23/TRI-Survivor/backend/internal/entity"
	"github.com/RiTa-23/TRI-Survivor/backend/internal/repository"
)

type SettingsService struct {
	repo *repository.SettingsRepository
}

func NewSettingsService(repo *repository.SettingsRepository) *SettingsService {
	return &SettingsService{repo: repo}
}

// GetSettings ユーザー設定を取得する。存在しない場合はデフォルト値を返す
func (s *SettingsService) GetSettings(ctx context.Context, userID string) (*entity.Settings, error) {
	settings, err := s.repo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}
	// 設定が未作成の場合はデフォルト値を返す (DBには保存しない)
	if settings == nil {
		return &entity.Settings{
			UserID:    userID,
			BGMVolume: 100,
			SEVolume:  100,
		}, nil
	}
	return settings, nil
}

// UpdateSettings ユーザー設定を更新する
func (s *SettingsService) UpdateSettings(ctx context.Context, userID string, bgmVolume, seVolume int) (*entity.Settings, error) {
	settings := &entity.Settings{
		UserID:    userID,
		BGMVolume: bgmVolume,
		SEVolume:  seVolume,
	}
	
	if err := s.repo.Upsert(ctx, settings); err != nil {
		return nil, err
	}
	
	// 最新の状態（CreatedAtなど）を再取得して返す
	return s.GetSettings(ctx, userID)
}
