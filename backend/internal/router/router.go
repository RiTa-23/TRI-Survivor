package router

import (
	"net/http"

	userMiddleware "github.com/RiTa-23/TRI-Survivor/backend/internal/middleware"
	"github.com/labstack/echo/v4"
)

func SetupRouter(e *echo.Echo) {
	api := e.Group("/api")

	// パブリックルート
	api.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "ok",
		})
	})

	// 認証付きルート (v1)
	v1 := api.Group("/v1")
	v1.Use(userMiddleware.AuthMiddleware())

	v1.GET("/me", func(c echo.Context) error {
		userID, ok := c.Get("userID").(string)
		if !ok {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "user ID not found in context"})
		}
		return c.JSON(http.StatusOK, map[string]string{
			"user_id": userID,
			"message": "You are authenticated!",
		})
	})
}
