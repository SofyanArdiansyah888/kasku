package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/kasku/backend/internal/bersama/middleware"
	"github.com/kasku/backend/internal/bersama/respons"
	"github.com/kasku/backend/internal/modul/dashboard/usecase"
)

type Handler struct {
	uc *usecase.Usecase
}

func Baru(uc *usecase.Usecase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) Ringkasan(c *gin.Context) {
	hasil, err := h.uc.Ringkasan(middleware.AmbilPenggunaID(c))
	if err != nil {
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, hasil)
}

func (h *Handler) AktivitasTerbaru(c *gin.Context) {
	hasil, err := h.uc.AktivitasTerbaru(middleware.AmbilPenggunaID(c))
	if err != nil {
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, hasil)
}
