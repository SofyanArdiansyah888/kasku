package anggaran

import (
	"github.com/gin-gonic/gin"
	"github.com/kasku/backend/internal/bersama/jwt"
	"github.com/kasku/backend/internal/bersama/middleware"
	"github.com/kasku/backend/internal/modul/anggaran/handler"
	"github.com/kasku/backend/internal/modul/anggaran/repositori"
	"github.com/kasku/backend/internal/modul/anggaran/usecase"
	repoTransaksi "github.com/kasku/backend/internal/modul/transaksi/repositori"
	"gorm.io/gorm"
)

type Modul struct {
	Handler *handler.Handler
}

func Baru(db *gorm.DB, repoTransaksi repoTransaksi.Repositori) *Modul {
	repo := repositori.Baru(db)
	uc := usecase.Baru(repo, repoTransaksi)
	return &Modul{Handler: handler.Baru(uc)}
}

func (m *Modul) DaftarkanRoute(r *gin.RouterGroup, jwtSvc *jwt.Layanan) {
	g := r.Group("/anggaran")
	g.Use(middleware.Otentikasi(jwtSvc))
	{
		g.GET("", m.Handler.AmbilSemua)
		g.GET("/ringkasan", m.Handler.AmbilRingkasan)
		g.POST("", m.Handler.Buat)
		g.GET("/:id", m.Handler.AmbilByID)
		g.PUT("/:id", m.Handler.Ubah)
		g.DELETE("/:id", m.Handler.Hapus)
	}
}
