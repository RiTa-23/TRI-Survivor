package handler

import (
	"log"
	"net/http"

	"github.com/RiTa-23/TRI-Survivor/backend/internal/entity"
	"github.com/RiTa-23/TRI-Survivor/backend/internal/service"
	"github.com/labstack/echo/v4"
)

type ItemHandler struct {
	service *service.ItemService
}

func NewItemHandler(service *service.ItemService) *ItemHandler {
	return &ItemHandler{service: service}
}

// GetUserItems ログインユーザーの所持アイテム一覧を取得する
// GET /api/v1/items
func (h *ItemHandler) GetUserItems(c echo.Context) error {
	userID, ok := c.Get("userID").(string)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	items, err := h.service.GetUserItems(c.Request().Context(), userID)
	if err != nil {
		log.Printf("GetUserItems Error: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}

	// 空リストの場合は [] を返す
	if items == nil {
		items = []entity.Item{} // Note: entity.Item needs to be imported or handled
	}

	return c.JSON(http.StatusOK, items)
}
