package usecase

import (
	"errors"

	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/kategori/dto"
	"github.com/kasku/backend/internal/modul/kategori/entitas"
	"github.com/kasku/backend/internal/modul/kategori/repositori"
)

var ErrKategoriTidakAda = errors.New("kategori tidak ditemukan")

type Usecase struct {
	repo repositori.Repositori
}

func Baru(repo repositori.Repositori) *Usecase {
	return &Usecase{repo: repo}
}

func (u *Usecase) Buat(penggunaID uuid.UUID, req dto.PermintaanBuat) (*dto.ResponsKategori, error) {
	k := &entitas.Kategori{
		PenggunaID: penggunaID,
		Nama:       req.Nama,
		Jenis:      req.Jenis,
		Ikon:       req.Ikon,
		Warna:      req.Warna,
	}
	if err := u.repo.Simpan(k); err != nil {
		return nil, err
	}
	return keRespons(k), nil
}

func (u *Usecase) Ubah(penggunaID, id uuid.UUID, req dto.PermintaanUbah) (*dto.ResponsKategori, error) {
	k, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return nil, err
	}
	if k == nil {
		return nil, ErrKategoriTidakAda
	}
	k.Nama = req.Nama
	k.Jenis = req.Jenis
	k.Ikon = req.Ikon
	k.Warna = req.Warna
	if err := u.repo.Ubah(k); err != nil {
		return nil, err
	}
	return keRespons(k), nil
}

func (u *Usecase) Hapus(penggunaID, id uuid.UUID) error {
	k, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return err
	}
	if k == nil {
		return ErrKategoriTidakAda
	}
	return u.repo.Hapus(id, penggunaID)
}

func (u *Usecase) AmbilByID(penggunaID, id uuid.UUID) (*dto.ResponsKategori, error) {
	k, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return nil, err
	}
	if k == nil {
		return nil, ErrKategoriTidakAda
	}
	return keRespons(k), nil
}

func (u *Usecase) AmbilSemua(penggunaID uuid.UUID, jenis string) ([]dto.ResponsKategori, error) {
	list, err := u.repo.AmbilSemua(penggunaID, jenis)
	if err != nil {
		return nil, err
	}
	hasil := make([]dto.ResponsKategori, len(list))
	for i := range list {
		hasil[i] = *keRespons(&list[i])
	}
	return hasil, nil
}

func keRespons(k *entitas.Kategori) *dto.ResponsKategori {
	return &dto.ResponsKategori{
		ID:         k.ID.String(),
		Nama:       k.Nama,
		Jenis:      k.Jenis,
		Ikon:       k.Ikon,
		Warna:      k.Warna,
		DibuatPada: k.DibuatPada.Format("2006-01-02T15:04:05Z07:00"),
	}
}
