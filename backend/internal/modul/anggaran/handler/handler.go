package handler

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kasku/backend/internal/bersama/middleware"
	"github.com/kasku/backend/internal/bersama/respons"
	"github.com/kasku/backend/internal/modul/anggaran/dto"
	"github.com/kasku/backend/internal/modul/anggaran/usecase"
)

type Handler struct {
	uc *usecase.Usecase
}

func Baru(uc *usecase.Usecase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) Buat(c *gin.Context) {
	var req dto.PermintaanBuat
	if err := c.ShouldBindJSON(&req); err != nil {
		respons.GagalValidasi(c, err.Error())
		return
	}
	hasil, err := h.uc.Buat(middleware.AmbilPenggunaID(c), req)
	if err != nil {
		respons.GagalValidasi(c, err.Error())
		return
	}
	respons.SuksesBuat(c, hasil)
}

func (h *Handler) Ubah(c *gin.Context) {
	id, _ := uuid.Parse(c.Param("id"))
	var req dto.PermintaanUbah
	if err := c.ShouldBindJSON(&req); err != nil {
		respons.GagalValidasi(c, err.Error())
		return
	}
	hasil, err := h.uc.Ubah(middleware.AmbilPenggunaID(c), id, req)
	if err != nil {
		if errors.Is(err, usecase.ErrAnggaranTidakAda) {
			respons.GagalTidakDitemukan(c, err.Error())
			return
		}
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, hasil)
}

func (h *Handler) Hapus(c *gin.Context) {
	id, _ := uuid.Parse(c.Param("id"))
	if err := h.uc.Hapus(middleware.AmbilPenggunaID(c), id); err != nil {
		if errors.Is(err, usecase.ErrAnggaranTidakAda) {
			respons.GagalTidakDitemukan(c, err.Error())
			return
		}
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, gin.H{"pesan": "Anggaran berhasil dihapus"})
}

func (h *Handler) AmbilByID(c *gin.Context) {
	id, _ := uuid.Parse(c.Param("id"))
	hasil, err := h.uc.AmbilByID(middleware.AmbilPenggunaID(c), id)
	if err != nil {
		if errors.Is(err, usecase.ErrAnggaranTidakAda) {
			respons.GagalTidakDitemukan(c, err.Error())
			return
		}
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, hasil)
}

func (h *Handler) AmbilSemua(c *gin.Context) {
	bulan := c.Query("bulan")
	hasil, err := h.uc.AmbilSemua(middleware.AmbilPenggunaID(c), bulan)
	if err != nil {
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, hasil)
}

func (h *Handler) AmbilRingkasan(c *gin.Context) {
	bulan := c.Query("bulan")
	if bulan == "" {
		respons.GagalValidasi(c, "Parameter bulan wajib diisi (YYYY-MM)")
		return
	}
	hasil, err := h.uc.AmbilRingkasan(middleware.AmbilPenggunaID(c), bulan)
	if err != nil {
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, hasil)
}
