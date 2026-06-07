package repositori

import (
	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/autentikasi/entitas"
)

type Repositori interface {
	Simpan(p *entitas.Pengguna) error
	CariByEmail(email string) (*entitas.Pengguna, error)
	CariByID(id uuid.UUID) (*entitas.Pengguna, error)
	Hitung() (int64, error)
}
