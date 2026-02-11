package middleware

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

var (
	jwksURL  string
	jwks     keyfunc.Keyfunc
	jwksOnce sync.Once
)

// InitJWKS JWKSの初期化を行います。起動時または遅延実行されます。
// sync.Onceを使用して、複数回呼び出されても一度だけ実行されることを保証します。
func InitJWKS() error {
	var initErr error
	jwksOnce.Do(func() {
		refID := os.Getenv("SUPABASE_REFERENCE_ID")
		if refID == "" {
			initErr = fmt.Errorf("SUPABASE_REFERENCE_ID is not set")
			return
		}

		// SupabaseのJWKS URLを構築
		jwksURL = fmt.Sprintf("https://%s.supabase.co/auth/v1/.well-known/jwks.json", refID)

		// URLからJWKSを作成
		// keyfuncライブラリがキャッシュと更新を自動的に処理します
		var err error
		jwks, err = keyfunc.NewDefault([]string{jwksURL})
		if err != nil {
			initErr = fmt.Errorf("failed to create JWKS from resource at %s: %w", jwksURL, err)
			return
		}

		log.Printf("JWKS initialized with URL: %s", jwksURL)
	})
	return initErr
}

// AuthMiddleware JWKSを使用してSupabaseからのJWTトークンを検証します (ES256対応)
func AuthMiddleware() echo.MiddlewareFunc {
	// JWKSが未初期化の場合は初期化を試みます（初回リクエスト時など）
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
			// jwksがnilの場合（初期化失敗後など）再度初期化を試みます
			if jwks == nil {
				// note: sync.Onceは一度しか実行されないため、最初の実行が失敗した場合、
				// この実装では再試行されません。アプリケーションの再起動が必要です。
				// 本番運用では起動時のヘルスチェックで検知すべきです。
				if err := InitJWKS(); err != nil {
					return c.JSON(http.StatusInternalServerError, map[string]string{"error": "internal server configuration error"})
				}
				// それでもnilならエラー
				if jwks == nil {
					return c.JSON(http.StatusInternalServerError, map[string]string{"error": "JWKS not initialized"})
				}
			}

			token, err := jwt.Parse(tokenString, jwks.Keyfunc)

			// 3. 検証結果の確認
			if err != nil {
				log.Printf("JWT Parse Error: %v", err)
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token"})
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
