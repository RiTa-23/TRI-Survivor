package service

import (
	"context"

	"github.com/RiTa-23/TRI-Survivor/backend/internal/entity"
	"github.com/RiTa-23/TRI-Survivor/backend/internal/repository"
)

type UserService struct {
	repo *repository.UserRepository
}

func NewUserService(repo *repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

// SyncUser ユーザー情報を同期する（存在しなければ作成、あれば更新）
func (s *UserService) SyncUser(ctx context.Context, id, email, name, avatarURL string) (*entity.User, error) {
	user := &entity.User{
		ID:        id,
		Email:     email,
		Name:      name,
		AvatarURL: avatarURL,
	}
	if err := s.repo.CreateUser(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

// GetUser ユーザー詳細を取得する
func (s *UserService) GetUser(ctx context.Context, id string) (*entity.User, error) {
	return s.repo.FindByID(ctx, id)
}
