package tag

import (
	"github.com/gin-gonic/gin"
	"github.com/kasku/backend/internal/bersama/jwt"
	"github.com/kasku/backend/internal/bersama/middleware"
	"github.com/kasku/backend/internal/modul/tag/handler"
	"github.com/kasku/backend/internal/modul/tag/repositori"
	"github.com/kasku/backend/internal/modul/tag/usecase"
	"gorm.io/gorm"
)

type Modul struct {
	Handler *handler.Handler
	Repositori repositori.Repositori
}

func Baru(db *gorm.DB) *Modul {
	repo := repositori.Baru(db)
	uc := usecase.Baru(repo)
	return &Modul{Handler: handler.Baru(uc), Repositori: repo}
}

func (m *Modul) DaftarkanRoute(r *gin.RouterGroup, jwtSvc *jwt.Layanan) {
	g := r.Group("/tag")
	g.Use(middleware.Otentikasi(jwtSvc))
	{
		g.GET("", m.Handler.AmbilSemua)
		g.POST("", m.Handler.Buat)
		g.GET("/:id", m.Handler.AmbilByID)
		g.PUT("/:id", m.Handler.Ubah)
		g.DELETE("/:id", m.Handler.Hapus)
	}
}
