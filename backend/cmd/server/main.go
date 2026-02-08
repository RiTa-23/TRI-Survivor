package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/RiTa-23/TRI-Survivor/backend/internal/infrastructure"
	"github.com/RiTa-23/TRI-Survivor/backend/internal/router"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found or error loading it (using system env)")
	}

	// Initialize Database
	db, err := infrastructure.NewDB()
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Println("Connected to Database")

	// Initialize Echo
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// CORS settings
	corsOrigins := os.Getenv("CORS_ORIGINS")
	var allowOrigins []string
	if corsOrigins != "" {
		allowOrigins = strings.Split(corsOrigins, ",")
	}

	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     allowOrigins,
		AllowMethods:     []string{http.MethodGet, http.MethodPut, http.MethodPost, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowCredentials: true,
	}))

	// Setup Router
	router.SetupRouter(e)

	// Start Server
	e.Logger.Fatal(e.Start(":8080"))
}
