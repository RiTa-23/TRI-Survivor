package repository

import (
	"context"

	"github.com/RiTa-23/TRI-Survivor/backend/internal/entity"
	"github.com/uptrace/bun"
)

type ShopRepository struct {
	db *bun.DB
}

func NewShopRepository(db *bun.DB) *ShopRepository {
	return &ShopRepository{db: db}
}

// FindAll アクティブな全アイテムを取得します
func (r *ShopRepository) FindAll(ctx context.Context) ([]entity.Shop, error) {
	var shops []entity.Shop
	err := r.db.NewSelect().
		Model(&shops).
		Where("is_active = ?", true).
		Order("price ASC").
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return shops, nil
}

// FindByID IDからアイテムを取得します
func (r *ShopRepository) FindByID(ctx context.Context, id int) (*entity.Shop, error) {
	shop := new(entity.Shop)
	err := r.db.NewSelect().
		Model(shop).
		Where("item_id = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, err
	}
	return shop, nil
}
