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
		userID := c.Get("userID").(string)
		return c.JSON(http.StatusOK, map[string]string{
			"user_id": userID,
			"message": "You are authenticated!",
		})
	})
}
