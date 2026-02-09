package handler

import (
	"log"
	"net/http"

	"github.com/RiTa-23/TRI-Survivor/backend/internal/service"
	"github.com/labstack/echo/v4"
)

type SettingsHandler struct {
	service *service.SettingsService
}

func NewSettingsHandler(service *service.SettingsService) *SettingsHandler {
	return &SettingsHandler{service: service}
}

type UpdateSettingsRequest struct {
	BGMVolume int `json:"bgmVolume"`
	SEVolume  int `json:"seVolume"`
}

// GetSettings ログインユーザーの設定を取得する
// GET /api/v1/settings
func (h *SettingsHandler) GetSettings(c echo.Context) error {
	userID, ok := c.Get("userID").(string)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	settings, err := h.service.GetSettings(c.Request().Context(), userID)
	if err != nil {
		log.Printf("GetSettings Error: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}

	return c.JSON(http.StatusOK, settings)
}

// UpdateSettings ログインユーザーの設定を更新する
// PUT /api/v1/settings
func (h *SettingsHandler) UpdateSettings(c echo.Context) error {
	userID, ok := c.Get("userID").(string)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	req := new(UpdateSettingsRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	// 簡易バリデーション (0-100の範囲など)
	if req.BGMVolume < 0 || req.BGMVolume > 100 || req.SEVolume < 0 || req.SEVolume > 100 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "volume must be between 0 and 100"})
	}

	settings, err := h.service.UpdateSettings(c.Request().Context(), userID, req.BGMVolume, req.SEVolume)
	if err != nil {
		log.Printf("UpdateSettings Error: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}

	return c.JSON(http.StatusOK, settings)
}
