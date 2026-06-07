package dompet

import (
	"github.com/gin-gonic/gin"
	"github.com/kasku/backend/internal/bersama/jwt"
	"github.com/kasku/backend/internal/bersama/middleware"
	"github.com/kasku/backend/internal/modul/dompet/handler"
	"github.com/kasku/backend/internal/modul/dompet/repositori"
	"github.com/kasku/backend/internal/modul/dompet/usecase"
	"gorm.io/gorm"
)

type Modul struct {
	Handler    *handler.Handler
	Usecase    *usecase.Usecase
	Repositori repositori.Repositori
}

func Baru(db *gorm.DB, penghitungSaldo repositori.PenghitungSaldo) *Modul {
	repo := repositori.Baru(db)
	uc := usecase.Baru(repo, penghitungSaldo)
	return &Modul{Handler: handler.Baru(uc), Usecase: uc, Repositori: repo}
}

func (m *Modul) DaftarkanRoute(r *gin.RouterGroup, jwtSvc *jwt.Layanan) {
	g := r.Group("/dompet")
	g.Use(middleware.Otentikasi(jwtSvc))
	{
		g.GET("", m.Handler.AmbilSemua)
		g.POST("", m.Handler.Buat)
		g.GET("/:id", m.Handler.AmbilByID)
		g.PUT("/:id", m.Handler.Ubah)
		g.DELETE("/:id", m.Handler.Hapus)
		g.GET("/:id/saldo", m.Handler.HitungSaldo)
	}
}
