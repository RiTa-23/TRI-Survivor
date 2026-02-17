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
	// Userを保存 (UPSERT)
	if err := s.repo.CreateUser(ctx, user); err != nil {
		return nil, err
	}

	// 保存された最新の状態 (CreatedAtなど) を再取得して返す
	// CreateUserでReturningを使っていても、念のため確実にDBの状態を返す
	return s.GetUser(ctx, id)
}

// GetUser ユーザー詳細を取得する
func (s *UserService) GetUser(ctx context.Context, id string) (*entity.User, error) {
	return s.repo.FindByID(ctx, id)
}

// AddCoin ユーザーにコインを追加する
func (s *UserService) AddCoin(ctx context.Context, id string, amount int) (*entity.User, error) {
	if err := s.repo.UpdateCoin(ctx, id, amount); err != nil {
		return nil, err
	}
	return s.GetUser(ctx, id)
}
