package usecase

import (
	"encoding/csv"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	entTransaksi "github.com/kasku/backend/internal/modul/transaksi/entitas"
	repoTransaksi "github.com/kasku/backend/internal/modul/transaksi/repositori"
	"github.com/kasku/backend/internal/modul/laporan/dto"
)

type Usecase struct {
	repoTransaksi repoTransaksi.Repositori
}

func Baru(repoTransaksi repoTransaksi.Repositori) *Usecase {
	return &Usecase{repoTransaksi: repoTransaksi}
}

func (u *Usecase) RingkasanBulanan(penggunaID uuid.UUID, bulan string) (*dto.RingkasanBulanan, error) {
	dari, sampai := rentangBulan(bulan)
	pemasukan, err := u.repoTransaksi.TotalByJenis(penggunaID, entTransaksi.JenisPemasukan, dari, sampai)
	if err != nil {
		return nil, err
	}
	pengeluaran, err := u.repoTransaksi.TotalByJenis(penggunaID, entTransaksi.JenisPengeluaran, dari, sampai)
	if err != nil {
		return nil, err
	}
	return &dto.RingkasanBulanan{
		Bulan:       bulan,
		Pemasukan:   pemasukan,
		Pengeluaran: pengeluaran,
		Saldo:       pemasukan - pengeluaran,
	}, nil
}

func (u *Usecase) RincianKategori(penggunaID uuid.UUID, bulan string) ([]dto.RincianKategori, error) {
	dari, sampai := rentangBulan(bulan)
	// Ambil transaksi bulan tersebut dan agregasi per kategori
	list, _, err := u.repoTransaksi.Filter(repoTransaksi.Filter{
		PenggunaID: penggunaID,
		Dari:       &dari,
		Sampai:     &sampai,
		Halaman:    1,
		Batas:      10000,
	})
	if err != nil {
		return nil, err
	}
	agg := make(map[string]*dto.RincianKategori)
	for _, t := range list {
		if t.KategoriID == nil || t.Jenis == entTransaksi.JenisTransfer {
			continue
		}
		key := t.KategoriID.String() + "|" + t.Jenis
		if agg[key] == nil {
			agg[key] = &dto.RincianKategori{KategoriID: t.KategoriID.String(), Jenis: t.Jenis}
		}
		agg[key].Total += t.Jumlah
	}
	hasil := make([]dto.RincianKategori, 0, len(agg))
	for _, v := range agg {
		hasil = append(hasil, *v)
	}
	return hasil, nil
}

func (u *Usecase) EksporCSV(penggunaID uuid.UUID, dari, sampai string) (string, error) {
	var dDari, dSampai *time.Time
	if dari != "" {
		t, _ := time.Parse("2006-01-02", dari)
		dDari = &t
	}
	if sampai != "" {
		t, _ := time.Parse("2006-01-02", sampai)
		dSampai = &t
	}
	list, err := u.repoTransaksi.AmbilUntukEkspor(penggunaID, dDari, dSampai)
	if err != nil {
		return "", err
	}

	var b strings.Builder
	w := csv.NewWriter(&b)
	_ = w.Write([]string{"Tanggal", "Jenis", "Jumlah", "Keterangan", "DompetID", "KategoriID"})
	for _, t := range list {
		kat := ""
		if t.KategoriID != nil {
			kat = t.KategoriID.String()
		}
		_ = w.Write([]string{
			t.TanggalTransaksi.Format("2006-01-02"),
			t.Jenis,
			fmt.Sprintf("%.2f", t.Jumlah),
			t.Keterangan,
			t.DompetID.String(),
			kat,
		})
	}
	w.Flush()
	return b.String(), nil
}

func rentangBulan(bulan string) (time.Time, time.Time) {
	t, _ := time.Parse("2006-01", bulan)
	dari := time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, time.UTC)
	sampai := dari.AddDate(0, 1, -1)
	return dari, sampai
}
