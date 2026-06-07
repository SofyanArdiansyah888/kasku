package usecase

import (
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/kasku/backend/internal/bersama/hash"
	"github.com/kasku/backend/internal/bersama/jwt"
	"github.com/kasku/backend/internal/modul/autentikasi/dto"
	"github.com/kasku/backend/internal/modul/autentikasi/entitas"
	"github.com/kasku/backend/internal/modul/autentikasi/repositori"
)

var (
	ErrEmailSudahAda     = errors.New("email sudah terdaftar")
	ErrKredensialSalah   = errors.New("email atau kata sandi salah")
	ErrPenggunaTidakAda  = errors.New("pengguna tidak ditemukan")
)

type Usecase struct {
	repo      repositori.Repositori
	jwt       *jwt.Layanan
	seedFn    func(penggunaID uuid.UUID) error
}

func Baru(repo repositori.Repositori, jwtSvc *jwt.Layanan, seedFn func(uuid.UUID) error) *Usecase {
	return &Usecase{repo: repo, jwt: jwtSvc, seedFn: seedFn}
}

func (u *Usecase) Daftar(req dto.PermintaanDaftar) (*dto.ResponsMasuk, error) {
	ada, err := u.repo.CariByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if ada != nil {
		return nil, ErrEmailSudahAda
	}

	hashSandi, err := hash.Enkripsi(req.KataSandi)
	if err != nil {
		return nil, fmt.Errorf("gagal enkripsi kata sandi: %w", err)
	}

	pengguna := &entitas.Pengguna{
		Nama:          req.Nama,
		Email:         req.Email,
		KataSandiHash: hashSandi,
	}
	if err := u.repo.Simpan(pengguna); err != nil {
		return nil, err
	}
	if u.seedFn != nil {
		_ = u.seedFn(pengguna.ID)
	}

	return u.buatResponsMasuk(pengguna)
}

func (u *Usecase) Masuk(req dto.PermintaanMasuk) (*dto.ResponsMasuk, error) {
	pengguna, err := u.repo.CariByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if pengguna == nil || !hash.Verifikasi(req.KataSandi, pengguna.KataSandiHash) {
		return nil, ErrKredensialSalah
	}
	return u.buatResponsMasuk(pengguna)
}

func (u *Usecase) AmbilProfil(penggunaID uuid.UUID) (*dto.ResponsPengguna, error) {
	pengguna, err := u.repo.CariByID(penggunaID)
	if err != nil {
		return nil, err
	}
	if pengguna == nil {
		return nil, ErrPenggunaTidakAda
	}
	resp := keResponsPengguna(pengguna)
	return &resp, nil
}

func (u *Usecase) buatResponsMasuk(p *entitas.Pengguna) (*dto.ResponsMasuk, error) {
	token, err := u.jwt.BuatToken(p.ID, p.Email)
	if err != nil {
		return nil, err
	}
	resp := keResponsPengguna(p)
	return &dto.ResponsMasuk{Token: token, Pengguna: resp}, nil
}

func keResponsPengguna(p *entitas.Pengguna) dto.ResponsPengguna {
	return dto.ResponsPengguna{
		ID:         p.ID.String(),
		Nama:       p.Nama,
		Email:      p.Email,
		DibuatPada: p.DibuatPada.Format("2006-01-02T15:04:05Z07:00"),
	}
}
