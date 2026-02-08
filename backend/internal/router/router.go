package router

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func SetupRouter(e *echo.Echo) {
	api := e.Group("/api")

	api.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "ok",
		})
	})
}
