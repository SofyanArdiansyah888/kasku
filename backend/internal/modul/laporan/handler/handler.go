package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/kasku/backend/internal/bersama/middleware"
	"github.com/kasku/backend/internal/bersama/respons"
	"github.com/kasku/backend/internal/modul/laporan/usecase"
)

type Handler struct {
	uc *usecase.Usecase
}

func Baru(uc *usecase.Usecase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) RingkasanBulanan(c *gin.Context) {
	bulan := c.Query("bulan")
	if bulan == "" {
		respons.GagalValidasi(c, "Parameter bulan wajib (YYYY-MM)")
		return
	}
	hasil, err := h.uc.RingkasanBulanan(middleware.AmbilPenggunaID(c), bulan)
	if err != nil {
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, hasil)
}

func (h *Handler) RincianKategori(c *gin.Context) {
	bulan := c.Query("bulan")
	if bulan == "" {
		respons.GagalValidasi(c, "Parameter bulan wajib (YYYY-MM)")
		return
	}
	hasil, err := h.uc.RincianKategori(middleware.AmbilPenggunaID(c), bulan)
	if err != nil {
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, hasil)
}

func (h *Handler) EksporTransaksi(c *gin.Context) {
	csvData, err := h.uc.EksporCSV(
		middleware.AmbilPenggunaID(c),
		c.Query("dari"),
		c.Query("sampai"),
	)
	if err != nil {
		respons.GagalInternal(c, err.Error())
		return
	}
	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", "attachment; filename=transaksi.csv")
	c.String(200, csvData)
}
