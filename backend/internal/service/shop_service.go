package service

import (
	"context"

	"github.com/RiTa-23/TRI-Survivor/backend/internal/entity"
	"github.com/RiTa-23/TRI-Survivor/backend/internal/repository"
)

type ShopService struct {
	repo *repository.ShopRepository
}

func NewShopService(repo *repository.ShopRepository) *ShopService {
	return &ShopService{repo: repo}
}

// GetShopItems ショップの全商品を取得します
func (s *ShopService) GetShopItems(ctx context.Context) ([]entity.Shop, error) {
	return s.repo.FindAll(ctx)
}

// GetShopItemByID 指定したIDの商品を取得します
func (s *ShopService) GetShopItemByID(ctx context.Context, id int) (*entity.Shop, error) {
	return s.repo.FindByID(ctx, id)
}
