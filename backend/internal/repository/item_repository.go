package repository

import (
	"context"

	"github.com/RiTa-23/TRI-Survivor/backend/internal/entity"
	"github.com/uptrace/bun"
)

type ItemRepository struct {
	db *bun.DB
}

func NewItemRepository(db *bun.DB) *ItemRepository {
	return &ItemRepository{db: db}
}

// FindByUserID ユーザーIDに紐づく所持アイテム一覧を取得します（ショップ情報も含む）
func (r *ItemRepository) FindByUserID(ctx context.Context, userID string) ([]entity.Item, error) {
	items := []entity.Item{}
	err := r.db.NewSelect().
		Model(&items).
		Relation("Shop").
		Where("user_id = ?", userID).
		Order("item_id ASC").
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return items, nil
}

// Upsert アイテムの所持数を更新または新規登録します
func (r *ItemRepository) Upsert(ctx context.Context, item *entity.Item) error {
	_, err := r.db.NewInsert().
		Model(item).
		On("CONFLICT (user_id, item_id) DO UPDATE").
		Set("quantity = EXCLUDED.quantity").
		Set("updated_at = now()").
		Returning("*").
		Exec(ctx)
	return err
}
