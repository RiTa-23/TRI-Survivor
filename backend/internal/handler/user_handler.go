package handler

import (
	"log"
	"net/http"

	"github.com/RiTa-23/TRI-Survivor/backend/internal/service"
	"github.com/labstack/echo/v4"
)

type UserHandler struct {
	service *service.UserService
}

func NewUserHandler(service *service.UserService) *UserHandler {
	return &UserHandler{service: service}
}

type CreateUserRequest struct {
	Email     string `json:"email"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatarUrl"`
}

// SyncUser ログインユーザーの情報を同期する
// POST /api/v1/users
func (h *UserHandler) SyncUser(c echo.Context) error {
	userID, ok := c.Get("userID").(string)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	req := new(CreateUserRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}
	
	// シンプルなバリデーション
	if req.Email == "" || req.Name == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "email and name are required"})
	}

	user, err := h.service.SyncUser(c.Request().Context(), userID, req.Email, req.Name, req.AvatarURL)
	if err != nil {
		log.Printf("SyncUser Error: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}

	return c.JSON(http.StatusOK, user)
}

// GetMe ログインユーザーの詳細情報を取得する
// GET /api/v1/users/me
func (h *UserHandler) GetMe(c echo.Context) error {
	userID, ok := c.Get("userID").(string)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	user, err := h.service.GetUser(c.Request().Context(), userID)
	if err != nil {
		log.Printf("GetMe Error: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}
	if user == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "user not found"})
	}

	return c.JSON(http.StatusOK, user)
}


type AddCoinRequest struct {
	Amount int `json:"amount"`
}

// AddCoin ユーザーにコインを追加する
// POST /api/v1/users/me/coins
func (h *UserHandler) AddCoin(c echo.Context) error {
	userID, ok := c.Get("userID").(string)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	req := new(AddCoinRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	user, err := h.service.AddCoin(c.Request().Context(), userID, req.Amount)
	if err != nil {
		log.Printf("AddCoin Error: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server error"})
	}

	return c.JSON(http.StatusOK, user)
}
