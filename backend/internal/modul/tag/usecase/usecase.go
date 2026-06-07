package usecase

import (
	"errors"

	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/tag/dto"
	"github.com/kasku/backend/internal/modul/tag/entitas"
	"github.com/kasku/backend/internal/modul/tag/repositori"
)

var ErrTagTidakAda = errors.New("tag tidak ditemukan")

type Usecase struct {
	repo repositori.Repositori
}

func Baru(repo repositori.Repositori) *Usecase {
	return &Usecase{repo: repo}
}

func (u *Usecase) Buat(penggunaID uuid.UUID, req dto.PermintaanBuat) (*dto.ResponsTag, error) {
	t := &entitas.Tag{PenggunaID: penggunaID, Nama: req.Nama}
	if err := u.repo.Simpan(t); err != nil {
		return nil, err
	}
	return keRespons(t), nil
}

func (u *Usecase) Ubah(penggunaID, id uuid.UUID, req dto.PermintaanUbah) (*dto.ResponsTag, error) {
	t, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return nil, err
	}
	if t == nil {
		return nil, ErrTagTidakAda
	}
	t.Nama = req.Nama
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
		return ErrTagTidakAda
	}
	return u.repo.Hapus(id, penggunaID)
}

func (u *Usecase) AmbilByID(penggunaID, id uuid.UUID) (*dto.ResponsTag, error) {
	t, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return nil, err
	}
	if t == nil {
		return nil, ErrTagTidakAda
	}
	return keRespons(t), nil
}

func (u *Usecase) AmbilSemua(penggunaID uuid.UUID) ([]dto.ResponsTag, error) {
	list, err := u.repo.AmbilSemua(penggunaID)
	if err != nil {
		return nil, err
	}
	hasil := make([]dto.ResponsTag, len(list))
	for i := range list {
		hasil[i] = *keRespons(&list[i])
	}
	return hasil, nil
}

func keRespons(t *entitas.Tag) *dto.ResponsTag {
	return &dto.ResponsTag{
		ID:         t.ID.String(),
		Nama:       t.Nama,
		DibuatPada: t.DibuatPada.Format("2006-01-02T15:04:05Z07:00"),
	}
}
