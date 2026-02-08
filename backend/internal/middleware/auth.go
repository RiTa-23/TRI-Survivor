package middleware

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

var (
	jwksURL string
	jwks    keyfunc.Keyfunc
)

// InitJWKS JWKSの初期化を行います。起動時または遅延実行されます。
func InitJWKS() error {
	refID := os.Getenv("SUPABASE_REFERENCE_ID")
	if refID == "" {
		return fmt.Errorf("SUPABASE_REFERENCE_ID is not set")
	}

	// SupabaseのJWKS URLを構築
	jwksURL = fmt.Sprintf("https://%s.supabase.co/auth/v1/.well-known/jwks.json", refID)
	
	// URLからJWKSを作成
	// keyfuncライブラリがキャッシュと更新を自動的に処理します
	var err error
	jwks, err = keyfunc.NewDefault([]string{jwksURL})
	if err != nil {
		return fmt.Errorf("failed to create JWKS from resource at %s: %w", jwksURL, err)
	}
	
	log.Printf("JWKS initialized with URL: %s", jwksURL)
	return nil
}

// AuthMiddleware JWKSを使用してSupabaseからのJWTトークンを検証します (ES256対応)
func AuthMiddleware() echo.MiddlewareFunc {
	// JWKSが未初期化の場合は初期化を試みます
    // 本来はmain.goで行うのが良いですが、簡易的な実装としてここでチェックします
	if jwks == nil {
		if err := InitJWKS(); err != nil {
			log.Printf("CRITICAL: Failed to initialize JWKS: %v", err)
		}
	}

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// 1. ヘッダーからトークンを取得
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "missing authorization header"})
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			if tokenString == authHeader {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token format"})
			}

			// 2. JWKSを使用してトークンを解析・検証
			if jwks == nil {
                 // 初期化に失敗していた場合の再試行（堅牢性のため）
                 if err := InitJWKS(); err != nil {
                     return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server configuration error"})
                 }
            }

			token, err := jwt.Parse(tokenString, jwks.Keyfunc)

			// 3. 検証結果の確認
			if err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token: " + err.Error()})
			}

            if !token.Valid {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token"})
			}
            
            // アルゴリズムのチェック（keyfuncが鍵の一致を行うため必須ではありませんが、SupabaseはRS256またはES256を使用）

			// 4. ユーザー情報の抽出
			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token claims"})
			}

			userID, ok := claims["sub"].(string)
			if !ok {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "user id not found in token"})
			}

			// コンテキストにユーザーIDをセット
			c.Set("userID", userID)

			return next(c)
		}
	}
}
