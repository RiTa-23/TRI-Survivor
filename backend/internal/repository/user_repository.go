package repository

import (
	"context"

	"github.com/RiTa-23/TRI-Survivor/backend/internal/entity"
	"github.com/uptrace/bun"
)

type UserRepository struct {
	db *bun.DB
}

func NewUserRepository(db *bun.DB) *UserRepository {
	return &UserRepository{db: db}
}

// CreateUser ユーザーを作成または更新します (UPSERT)
// IDが既に存在する場合は、Name, Email, AvatarURLを更新します
func (r *UserRepository) CreateUser(ctx context.Context, user *entity.User) error {
	_, err := r.db.NewInsert().
		Model(user).
		On("CONFLICT (id) DO UPDATE").
		Set("name = EXCLUDED.name").
		Set("email = EXCLUDED.email").
		Set("avatar_url = EXCLUDED.avatar_url").
		Exec(ctx)
	return err
}

// FindByID IDからユーザーを取得します
func (r *UserRepository) FindByID(ctx context.Context, id string) (*entity.User, error) {
	user := new(entity.User)
	err := r.db.NewSelect().
		Model(user).
		Where("id = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return user, nil
}
