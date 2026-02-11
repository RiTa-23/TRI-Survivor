package service

import (
	"context"

	"github.com/RiTa-23/TRI-Survivor/backend/internal/entity"
	"github.com/RiTa-23/TRI-Survivor/backend/internal/repository"
)

type ItemService struct {
	repo *repository.ItemRepository
}

func NewItemService(repo *repository.ItemRepository) *ItemService {
	return &ItemService{repo: repo}
}

// GetUserItems ユーザーが所持しているアイテム一覧を取得します
func (s *ItemService) GetUserItems(ctx context.Context, userID string) ([]entity.Item, error) {
	return s.repo.FindByUserID(ctx, userID)
}

// AddItemItems 所持アイテムを追加または数量を更新します
func (s *ItemService) AddItem(ctx context.Context, userID string, itemID int, quantity int) error {
	item := &entity.Item{
		UserID:   userID,
		ItemID:   itemID,
		Quantity: quantity,
	}
	return s.repo.Upsert(ctx, item)
}
