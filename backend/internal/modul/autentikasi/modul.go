package autentikasi

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kasku/backend/internal/bersama/jwt"
	"github.com/kasku/backend/internal/bersama/middleware"
	"github.com/kasku/backend/internal/modul/autentikasi/handler"
	"github.com/kasku/backend/internal/modul/autentikasi/repositori"
	"github.com/kasku/backend/internal/modul/autentikasi/usecase"
	"gorm.io/gorm"
)

type Modul struct {
	Handler *handler.Handler
}

func Baru(db *gorm.DB, jwtSvc *jwt.Layanan, seedFn func(uuid.UUID) error) *Modul {
	repo := repositori.Baru(db)
	uc := usecase.Baru(repo, jwtSvc, seedFn)
	return &Modul{Handler: handler.Baru(uc)}
}

func (m *Modul) DaftarkanRoute(r *gin.RouterGroup, jwtSvc *jwt.Layanan) {
	auth := r.Group("/autentikasi")
	{
		auth.POST("/daftar", m.Handler.Daftar)
		auth.POST("/masuk", m.Handler.Masuk)
		auth.GET("/saya", middleware.Otentikasi(jwtSvc), m.Handler.Saya)
	}
}
