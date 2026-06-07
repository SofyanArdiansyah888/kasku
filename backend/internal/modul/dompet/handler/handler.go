package handler

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kasku/backend/internal/bersama/middleware"
	"github.com/kasku/backend/internal/bersama/respons"
	"github.com/kasku/backend/internal/modul/dompet/dto"
	"github.com/kasku/backend/internal/modul/dompet/usecase"
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
	pid := middleware.AmbilPenggunaID(c)
	hasil, err := h.uc.Buat(pid, req)
	if err != nil {
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.SuksesBuat(c, hasil)
}

func (h *Handler) Ubah(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		respons.GagalValidasi(c, "ID tidak valid")
		return
	}
	var req dto.PermintaanUbah
	if err := c.ShouldBindJSON(&req); err != nil {
		respons.GagalValidasi(c, err.Error())
		return
	}
	pid := middleware.AmbilPenggunaID(c)
	hasil, err := h.uc.Ubah(pid, id, req)
	if err != nil {
		if errors.Is(err, usecase.ErrDompetTidakAda) {
			respons.GagalTidakDitemukan(c, err.Error())
			return
		}
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, hasil)
}

func (h *Handler) Hapus(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		respons.GagalValidasi(c, "ID tidak valid")
		return
	}
	pid := middleware.AmbilPenggunaID(c)
	if err := h.uc.Hapus(pid, id); err != nil {
		if errors.Is(err, usecase.ErrDompetTidakAda) {
			respons.GagalTidakDitemukan(c, err.Error())
			return
		}
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, gin.H{"pesan": "Dompet berhasil dihapus"})
}

func (h *Handler) AmbilByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		respons.GagalValidasi(c, "ID tidak valid")
		return
	}
	pid := middleware.AmbilPenggunaID(c)
	hasil, err := h.uc.AmbilByID(pid, id)
	if err != nil {
		if errors.Is(err, usecase.ErrDompetTidakAda) {
			respons.GagalTidakDitemukan(c, err.Error())
			return
		}
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, hasil)
}

func (h *Handler) AmbilSemua(c *gin.Context) {
	pid := middleware.AmbilPenggunaID(c)
	hasil, err := h.uc.AmbilSemua(pid)
	if err != nil {
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, hasil)
}

func (h *Handler) HitungSaldo(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		respons.GagalValidasi(c, "ID tidak valid")
		return
	}
	pid := middleware.AmbilPenggunaID(c)
	saldo, err := h.uc.HitungSaldo(pid, id)
	if err != nil {
		if errors.Is(err, usecase.ErrDompetTidakAda) {
			respons.GagalTidakDitemukan(c, err.Error())
			return
		}
		respons.GagalInternal(c, err.Error())
		return
	}
	respons.Sukses(c, gin.H{"saldo": saldo})
}
