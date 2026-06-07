package respons

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Meta struct {
	Halaman int   `json:"halaman,omitempty"`
	Batas   int   `json:"batas,omitempty"`
	Total   int64 `json:"total,omitempty"`
}

type ErrorDetail struct {
	Kode  string `json:"kode"`
	Pesan string `json:"pesan"`
}

func Sukses(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, gin.H{
		"berhasil": true,
		"data":     data,
	})
}

func SuksesDenganMeta(c *gin.Context, data interface{}, meta Meta) {
	c.JSON(http.StatusOK, gin.H{
		"berhasil": true,
		"data":     data,
		"meta":     meta,
	})
}

func SuksesBuat(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, gin.H{
		"berhasil": true,
		"data":     data,
	})
}

func Gagal(c *gin.Context, status int, kode, pesan string) {
	c.JSON(status, gin.H{
		"berhasil": false,
		"error": ErrorDetail{
			Kode:  kode,
			Pesan: pesan,
		},
	})
}

func GagalValidasi(c *gin.Context, pesan string) {
	Gagal(c, http.StatusBadRequest, "VALIDASI_GAGAL", pesan)
}

func GagalInternal(c *gin.Context, pesan string) {
	Gagal(c, http.StatusInternalServerError, "KESALAHAN_INTERNAL", pesan)
}

func GagalTidakDitemukan(c *gin.Context, pesan string) {
	Gagal(c, http.StatusNotFound, "TIDAK_DITEMUKAN", pesan)
}

func GagalTidakDiizinkan(c *gin.Context, pesan string) {
	Gagal(c, http.StatusUnauthorized, "TIDAK_DIIZINKAN", pesan)
}
