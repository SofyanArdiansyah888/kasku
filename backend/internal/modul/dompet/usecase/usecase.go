package usecase

import (
	"errors"

	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/dompet/dto"
	"github.com/kasku/backend/internal/modul/dompet/entitas"
	"github.com/kasku/backend/internal/modul/dompet/repositori"
)

var ErrDompetTidakAda = errors.New("dompet tidak ditemukan")

type Usecase struct {
	repo     repositori.Repositori
	saldo    repositori.PenghitungSaldo
}

func Baru(repo repositori.Repositori, saldo repositori.PenghitungSaldo) *Usecase {
	return &Usecase{repo: repo, saldo: saldo}
}

func (u *Usecase) Buat(penggunaID uuid.UUID, req dto.PermintaanBuat) (*dto.ResponsDompet, error) {
	mataUang := req.MataUang
	if mataUang == "" {
		mataUang = "IDR"
	}
	d := &entitas.Dompet{
		PenggunaID: penggunaID,
		Nama:       req.Nama,
		Jenis:      req.Jenis,
		SaldoAwal:  req.SaldoAwal,
		MataUang:   mataUang,
	}
	if err := u.repo.Simpan(d); err != nil {
		return nil, err
	}
	return u.keRespons(d, penggunaID)
}

func (u *Usecase) Ubah(penggunaID, id uuid.UUID, req dto.PermintaanUbah) (*dto.ResponsDompet, error) {
	d, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return nil, err
	}
	if d == nil {
		return nil, ErrDompetTidakAda
	}
	d.Nama = req.Nama
	d.Jenis = req.Jenis
	d.SaldoAwal = req.SaldoAwal
	if req.MataUang != "" {
		d.MataUang = req.MataUang
	}
	if err := u.repo.Ubah(d); err != nil {
		return nil, err
	}
	return u.keRespons(d, penggunaID)
}

func (u *Usecase) Hapus(penggunaID, id uuid.UUID) error {
	d, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return err
	}
	if d == nil {
		return ErrDompetTidakAda
	}
	return u.repo.Hapus(id, penggunaID)
}

func (u *Usecase) AmbilByID(penggunaID, id uuid.UUID) (*dto.ResponsDompet, error) {
	d, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return nil, err
	}
	if d == nil {
		return nil, ErrDompetTidakAda
	}
	return u.keRespons(d, penggunaID)
}

func (u *Usecase) AmbilSemua(penggunaID uuid.UUID) ([]dto.ResponsDompet, error) {
	list, err := u.repo.AmbilSemua(penggunaID)
	if err != nil {
		return nil, err
	}
	hasil := make([]dto.ResponsDompet, 0, len(list))
	for i := range list {
		r, err := u.keRespons(&list[i], penggunaID)
		if err != nil {
			return nil, err
		}
		hasil = append(hasil, *r)
	}
	return hasil, nil
}

func (u *Usecase) HitungSaldo(penggunaID, id uuid.UUID) (float64, error) {
	d, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return 0, err
	}
	if d == nil {
		return 0, ErrDompetTidakAda
	}
	return u.saldo.HitungSaldoDompet(id, penggunaID)
}

func (u *Usecase) keRespons(d *entitas.Dompet, penggunaID uuid.UUID) (*dto.ResponsDompet, error) {
	saldo, err := u.saldo.HitungSaldoDompet(d.ID, penggunaID)
	if err != nil {
		saldo = d.SaldoAwal
	}
	return &dto.ResponsDompet{
		ID:         d.ID.String(),
		Nama:       d.Nama,
		Jenis:      d.Jenis,
		SaldoAwal:  d.SaldoAwal,
		Saldo:      saldo,
		MataUang:   d.MataUang,
		DibuatPada: d.DibuatPada.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}
