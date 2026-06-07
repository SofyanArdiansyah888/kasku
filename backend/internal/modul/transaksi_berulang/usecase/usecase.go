package usecase

import (
	"errors"
	"time"

	"github.com/google/uuid"
	entTransaksi "github.com/kasku/backend/internal/modul/transaksi/entitas"
	repoTransaksi "github.com/kasku/backend/internal/modul/transaksi/repositori"
	"github.com/kasku/backend/internal/modul/transaksi_berulang/dto"
	"github.com/kasku/backend/internal/modul/transaksi_berulang/entitas"
	"github.com/kasku/backend/internal/modul/transaksi_berulang/repositori"
)

var ErrTBTidakAda = errors.New("transaksi berulang tidak ditemukan")

type Usecase struct {
	repo          repositori.Repositori
	repoTransaksi repoTransaksi.Repositori
}

func Baru(repo repositori.Repositori, repoTransaksi repoTransaksi.Repositori) *Usecase {
	return &Usecase{repo: repo, repoTransaksi: repoTransaksi}
}

func (u *Usecase) Buat(penggunaID uuid.UUID, req dto.PermintaanBuat) (*dto.ResponsTransaksiBerulang, error) {
	dompetID, _ := uuid.Parse(req.DompetID)
	kategoriID, _ := uuid.Parse(req.KategoriID)
	mulai, err := time.Parse("2006-01-02", req.TanggalMulai)
	if err != nil {
		return nil, errors.New("format tanggal mulai tidak valid")
	}
	interval := req.Interval
	if interval <= 0 {
		interval = 1
	}
	aktif := true
	if req.Aktif != nil {
		aktif = *req.Aktif
	}

	t := &entitas.TransaksiBerulang{
		PenggunaID:                penggunaID,
		DompetID:                  dompetID,
		KategoriID:                kategoriID,
		Jenis:                     req.Jenis,
		Jumlah:                    req.Jumlah,
		Keterangan:                req.Keterangan,
		Frekuensi:                 req.Frekuensi,
		Interval:                  interval,
		TanggalMulai:              mulai,
		TanggalJalankanBerikutnya: mulai,
		Aktif:                     aktif,
	}
	if req.TanggalSelesai != "" {
		selesai, err := time.Parse("2006-01-02", req.TanggalSelesai)
		if err == nil {
			t.TanggalSelesai = &selesai
		}
	}
	if err := u.repo.Simpan(t); err != nil {
		return nil, err
	}
	return keRespons(t), nil
}

func (u *Usecase) Ubah(penggunaID, id uuid.UUID, req dto.PermintaanUbah) (*dto.ResponsTransaksiBerulang, error) {
	t, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return nil, err
	}
	if t == nil {
		return nil, ErrTBTidakAda
	}
	t.Jumlah = req.Jumlah
	t.Keterangan = req.Keterangan
	t.Frekuensi = req.Frekuensi
	t.Interval = req.Interval
	t.Aktif = req.Aktif
	if req.TanggalSelesai != "" {
		selesai, err := time.Parse("2006-01-02", req.TanggalSelesai)
		if err == nil {
			t.TanggalSelesai = &selesai
		}
	} else {
		t.TanggalSelesai = nil
	}
	if err := u.repo.Ubah(t); err != nil {
		return nil, err
	}
	return keRespons(t), nil
}

func (u *Usecase) Hapus(penggunaID, id uuid.UUID) error {
	t, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return err
	}
	if t == nil {
		return ErrTBTidakAda
	}
	return u.repo.Hapus(id, penggunaID)
}

func (u *Usecase) AmbilByID(penggunaID, id uuid.UUID) (*dto.ResponsTransaksiBerulang, error) {
	t, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return nil, err
	}
	if t == nil {
		return nil, ErrTBTidakAda
	}
	return keRespons(t), nil
}

func (u *Usecase) AmbilSemua(penggunaID uuid.UUID) ([]dto.ResponsTransaksiBerulang, error) {
	list, err := u.repo.AmbilSemua(penggunaID)
	if err != nil {
		return nil, err
	}
	hasil := make([]dto.ResponsTransaksiBerulang, len(list))
	for i := range list {
		hasil[i] = *keRespons(&list[i])
	}
	return hasil, nil
}

func (u *Usecase) ProsesJatuhTempo(penggunaID *uuid.UUID) (int, error) {
	now := time.Now()
	hariIni := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.Local)

	list, err := u.repo.AmbilJatuhTempo(penggunaID, hariIni)
	if err != nil {
		return 0, err
	}

	diproses := 0
	for i := range list {
		tb := &list[i]
		for iter := 0; !tb.TanggalJalankanBerikutnya.After(hariIni); iter++ {
			if iter > 366 {
				break
			}
			if tb.TanggalSelesai != nil && tb.TanggalJalankanBerikutnya.After(*tb.TanggalSelesai) {
				tb.Aktif = false
				if err := u.repo.Ubah(tb); err != nil {
					return diproses, err
				}
				break
			}

			tbID := tb.ID
			tr := &entTransaksi.Transaksi{
				PenggunaID:          tb.PenggunaID,
				DompetID:            tb.DompetID,
				KategoriID:          &tb.KategoriID,
				Jenis:               tb.Jenis,
				Jumlah:              tb.Jumlah,
				Keterangan:          tb.Keterangan,
				TanggalTransaksi:    tb.TanggalJalankanBerikutnya,
				TransaksiBerulangID: &tbID,
			}
			if err := u.repoTransaksi.Simpan(tr); err != nil {
				return diproses, err
			}

			tb.TanggalJalankanBerikutnya = hitungBerikutnya(tb.TanggalJalankanBerikutnya, tb.Frekuensi, tb.Interval)
			if err := u.repo.Ubah(tb); err != nil {
				return diproses, err
			}
			diproses++
		}
	}
	return diproses, nil
}

func hitungBerikutnya(dari time.Time, frekuensi string, interval int) time.Time {
	switch frekuensi {
	case entitas.FrekuensiHarian:
		return dari.AddDate(0, 0, interval)
	case entitas.FrekuensiMingguan:
		return dari.AddDate(0, 0, 7*interval)
	case entitas.FrekuensiBulanan:
		return dari.AddDate(0, interval, 0)
	case entitas.FrekuensiTahunan:
		return dari.AddDate(interval, 0, 0)
	default:
		return dari.AddDate(0, 1, 0)
	}
}

func keRespons(t *entitas.TransaksiBerulang) *dto.ResponsTransaksiBerulang {
	r := &dto.ResponsTransaksiBerulang{
		ID:                        t.ID.String(),
		DompetID:                  t.DompetID.String(),
		KategoriID:                t.KategoriID.String(),
		Jenis:                     t.Jenis,
		Jumlah:                    t.Jumlah,
		Keterangan:                t.Keterangan,
		Frekuensi:                 t.Frekuensi,
		Interval:                  t.Interval,
		TanggalMulai:              t.TanggalMulai.Format("2006-01-02"),
		TanggalJalankanBerikutnya: t.TanggalJalankanBerikutnya.Format("2006-01-02"),
		Aktif:                     t.Aktif,
		DibuatPada:                t.DibuatPada.Format("2006-01-02T15:04:05Z07:00"),
	}
	if t.TanggalSelesai != nil {
		r.TanggalSelesai = t.TanggalSelesai.Format("2006-01-02")
	}
	return r
}
