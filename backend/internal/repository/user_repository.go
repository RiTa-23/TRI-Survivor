package repository

import (
	"context"
	"database/sql"
	"errors"

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
		// coin カラムは、不慮の更新（リセット）を防ぐため DO UPDATE の対象外とする
		Returning("*"). // 永続化されたデータを返す（CreatedAtなど）
		Exec(ctx)
	return err
}

// UpdateCoin ユーザーのコインを加算または減算します
func (r *UserRepository) UpdateCoin(ctx context.Context, userID string, amount int) error {
	_, err := r.db.NewUpdate().
		Table("users").
		Set("coin = coin + ?", amount).
		Where("id = ?", userID).
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
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // Not Found
		}
		return nil, err
	}
	return user, nil
}
