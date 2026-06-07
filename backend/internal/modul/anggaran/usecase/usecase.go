package usecase

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/anggaran/dto"
	"github.com/kasku/backend/internal/modul/anggaran/entitas"
	"github.com/kasku/backend/internal/modul/anggaran/repositori"
	repoTransaksi "github.com/kasku/backend/internal/modul/transaksi/repositori"
)

var ErrAnggaranTidakAda = errors.New("anggaran tidak ditemukan")

type Usecase struct {
	repo         repositori.Repositori
	repoTransaksi repoTransaksi.Repositori
}

func Baru(repo repositori.Repositori, repoTransaksi repoTransaksi.Repositori) *Usecase {
	return &Usecase{repo: repo, repoTransaksi: repoTransaksi}
}

func (u *Usecase) Buat(penggunaID uuid.UUID, req dto.PermintaanBuat) (*dto.ResponsAnggaran, error) {
	kid, _ := uuid.Parse(req.KategoriID)
	ada, _ := u.repo.AmbilByKategoriBulan(penggunaID, kid, req.Bulan)
	if ada != nil {
		return nil, errors.New("anggaran untuk kategori dan bulan ini sudah ada")
	}
	a := &entitas.Anggaran{
		PenggunaID: penggunaID,
		KategoriID: kid,
		Bulan:      req.Bulan,
		Jumlah:     req.Jumlah,
	}
	if err := u.repo.Simpan(a); err != nil {
		return nil, err
	}
	return keRespons(a), nil
}

func (u *Usecase) Ubah(penggunaID, id uuid.UUID, req dto.PermintaanUbah) (*dto.ResponsAnggaran, error) {
	a, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return nil, err
	}
	if a == nil {
		return nil, ErrAnggaranTidakAda
	}
	a.Jumlah = req.Jumlah
	if err := u.repo.Ubah(a); err != nil {
		return nil, err
	}
	return keRespons(a), nil
}

func (u *Usecase) Hapus(penggunaID, id uuid.UUID) error {
	a, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return err
	}
	if a == nil {
		return ErrAnggaranTidakAda
	}
	return u.repo.Hapus(id, penggunaID)
}

func (u *Usecase) AmbilByID(penggunaID, id uuid.UUID) (*dto.ResponsAnggaran, error) {
	a, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return nil, err
	}
	if a == nil {
		return nil, ErrAnggaranTidakAda
	}
	return keRespons(a), nil
}

func (u *Usecase) AmbilSemua(penggunaID uuid.UUID, bulan string) ([]dto.ResponsAnggaran, error) {
	list, err := u.repo.AmbilSemua(penggunaID, bulan)
	if err != nil {
		return nil, err
	}
	hasil := make([]dto.ResponsAnggaran, len(list))
	for i := range list {
		hasil[i] = *keRespons(&list[i])
	}
	return hasil, nil
}

func (u *Usecase) AmbilRingkasan(penggunaID uuid.UUID, bulan string) ([]dto.ItemRingkasan, error) {
	list, err := u.repo.AmbilSemua(penggunaID, bulan)
	if err != nil {
		return nil, err
	}
	dari, sampai := rentangBulan(bulan)
	hasil := make([]dto.ItemRingkasan, 0, len(list))
	for _, a := range list {
		terpakai, _ := u.repoTransaksi.TotalByKategori(penggunaID, a.KategoriID, dari, sampai)
		sisa := a.Jumlah - terpakai
		persen := 0.0
		if a.Jumlah > 0 {
			persen = (terpakai / a.Jumlah) * 100
		}
		hasil = append(hasil, dto.ItemRingkasan{
			KategoriID:     a.KategoriID.String(),
			Bulan:          a.Bulan,
			JumlahAnggaran: a.Jumlah,
			Terpakai:       terpakai,
			Sisa:           sisa,
			Persentase:     persen,
		})
	}
	return hasil, nil
}

func keRespons(a *entitas.Anggaran) *dto.ResponsAnggaran {
	return &dto.ResponsAnggaran{
		ID:         a.ID.String(),
		KategoriID: a.KategoriID.String(),
		Bulan:      a.Bulan,
		Jumlah:     a.Jumlah,
		DibuatPada: a.DibuatPada.Format("2006-01-02T15:04:05Z07:00"),
	}
}

func rentangBulan(bulan string) (time.Time, time.Time) {
	t, _ := time.Parse("2006-01", bulan)
	dari := time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, time.UTC)
	sampai := dari.AddDate(0, 1, -1)
	return dari, sampai
}
