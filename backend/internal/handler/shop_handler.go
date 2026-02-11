package handler

import (
	"log"
	"net/http"
	"strconv"

	"github.com/RiTa-23/TRI-Survivor/backend/internal/service"
	"github.com/labstack/echo/v4"
)

type ShopHandler struct {
	service *service.ShopService
}

func NewShopHandler(service *service.ShopService) *ShopHandler {
	return &ShopHandler{service: service}
}

// GetShopItems ショップの全商品を取得する
// GET /api/v1/shop
func (h *ShopHandler) GetShopItems(c echo.Context) error {
	items, err := h.service.GetShopItems(c.Request().Context())
	if err != nil {
		log.Printf("GetShopItems Error: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}

	return c.JSON(http.StatusOK, items)
}

// GetShopItemByID 指定したIDの商品を取得する
// GET /api/v1/shop/:id
func (h *ShopHandler) GetShopItemByID(c echo.Context) error {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid item id"})
	}

	item, err := h.service.GetShopItemByID(c.Request().Context(), id)
	if err != nil {
		log.Printf("GetShopItemByID Error: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}

	if item == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "item not found"})
	}

	return c.JSON(http.StatusOK, item)
}
