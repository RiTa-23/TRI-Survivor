package router

import (
	"net/http"

	"github.com/RiTa-23/TRI-Survivor/backend/internal/handler"
	userMiddleware "github.com/RiTa-23/TRI-Survivor/backend/internal/middleware"
	"github.com/labstack/echo/v4"
)

func SetupRouter(e *echo.Echo, userHandler *handler.UserHandler, settingsHandler *handler.SettingsHandler, shopHandler *handler.ShopHandler, itemHandler *handler.ItemHandler) {
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

	v1.POST("/users", userHandler.SyncUser)
	v1.GET("/users/me", userHandler.GetMe)
	v1.POST("/users/me/coins", userHandler.AddCoin)

	// Settings
	v1.GET("/settings", settingsHandler.GetSettings)
	v1.PUT("/settings", settingsHandler.UpdateSettings)

	// Shop
	v1.GET("/shop", shopHandler.GetShopItems)
	v1.GET("/shop/:id", shopHandler.GetShopItemByID)
	// Items
	v1.GET("/items", itemHandler.GetUserItems)
}
