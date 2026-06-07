package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kasku/backend/internal/bersama/middleware"
	"github.com/kasku/backend/internal/bersama/respons"
	"github.com/kasku/backend/internal/modul/autentikasi/dto"
	"github.com/kasku/backend/internal/modul/autentikasi/usecase"
)

type Handler struct {
	uc *usecase.Usecase
}

func Baru(uc *usecase.Usecase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) Daftar(c *gin.Context) {
	var req dto.PermintaanDaftar
	if err := c.ShouldBindJSON(&req); err != nil {
		respons.GagalValidasi(c, "Data tidak valid: "+err.Error())
		return
	}
	hasil, err := h.uc.Daftar(req)
	if err != nil {
		if errors.Is(err, usecase.ErrEmailSudahAda) {
			respons.Gagal(c, http.StatusConflict, "EMAIL_SUDAH_ADA", err.Error())
			return
		}
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.SuksesBuat(c, hasil)
}

func (h *Handler) Masuk(c *gin.Context) {
	var req dto.PermintaanMasuk
	if err := c.ShouldBindJSON(&req); err != nil {
		respons.GagalValidasi(c, "Data tidak valid: "+err.Error())
		return
	}
	hasil, err := h.uc.Masuk(req)
	if err != nil {
		if errors.Is(err, usecase.ErrKredensialSalah) {
			respons.Gagal(c, http.StatusUnauthorized, "KREDENSIAL_SALAH", err.Error())
			return
		}
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, hasil)
}

func (h *Handler) Saya(c *gin.Context) {
	penggunaID := middleware.AmbilPenggunaID(c)
	profil, err := h.uc.AmbilProfil(penggunaID)
	if err != nil {
		if errors.Is(err, usecase.ErrPenggunaTidakAda) {
			respons.GagalTidakDitemukan(c, err.Error())
			return
		}
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, profil)
}
