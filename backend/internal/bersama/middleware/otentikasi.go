package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kasku/backend/internal/bersama/jwt"
	"github.com/kasku/backend/internal/bersama/respons"
)

const KunciPenggunaID = "penggunaID"

func Otentikasi(layananJWT *jwt.Layanan) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			respons.GagalTidakDiizinkan(c, "Token autentikasi diperlukan")
			c.Abort()
			return
		}

		tokenStr := strings.TrimPrefix(header, "Bearer ")
		klaim, err := layananJWT.Verifikasi(tokenStr)
		if err != nil {
			respons.GagalTidakDiizinkan(c, "Token tidak valid atau kedaluwarsa")
			c.Abort()
			return
		}

		c.Set(KunciPenggunaID, klaim.PenggunaID)
		c.Next()
	}
}

func AmbilPenggunaID(c *gin.Context) uuid.UUID {
	id, _ := c.Get(KunciPenggunaID)
	if uid, ok := id.(uuid.UUID); ok {
		return uid
	}
	return uuid.Nil
}
