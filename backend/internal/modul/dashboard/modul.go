package dashboard

import (
	"github.com/gin-gonic/gin"
	"github.com/kasku/backend/internal/bersama/jwt"
	"github.com/kasku/backend/internal/bersama/middleware"
	"github.com/kasku/backend/internal/modul/dashboard/handler"
	"github.com/kasku/backend/internal/modul/dashboard/usecase"
	repoDompet "github.com/kasku/backend/internal/modul/dompet/repositori"
	repoTransaksi "github.com/kasku/backend/internal/modul/transaksi/repositori"
)

type Modul struct {
	Handler *handler.Handler
}

func Baru(repoDompet repoDompet.Repositori, repoTransaksi repoTransaksi.Repositori, penghitung repoDompet.PenghitungSaldo) *Modul {
	uc := usecase.Baru(repoDompet, repoTransaksi, penghitung)
	return &Modul{Handler: handler.Baru(uc)}
}

func (m *Modul) DaftarkanRoute(r *gin.RouterGroup, jwtSvc *jwt.Layanan) {
	g := r.Group("/dashboard")
	g.Use(middleware.Otentikasi(jwtSvc))
	{
		g.GET("/ringkasan", m.Handler.Ringkasan)
		g.GET("/aktivitas-terbaru", m.Handler.AktivitasTerbaru)
	}
}
