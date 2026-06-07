package seed

import (
	"github.com/google/uuid"
	entDompet "github.com/kasku/backend/internal/modul/dompet/entitas"
	repoDompet "github.com/kasku/backend/internal/modul/dompet/repositori"
	entKategori "github.com/kasku/backend/internal/modul/kategori/entitas"
	repoKategori "github.com/kasku/backend/internal/modul/kategori/repositori"
)

func DataAwal(penggunaID uuid.UUID, repoKategori repoKategori.Repositori, repoDompet repoDompet.Repositori) error {
	kategoriDefault := []struct {
		nama  string
		jenis string
		ikon  string
		warna string
	}{
		{"Gaji", entKategori.JenisPemasukan, "wallet", "#22c55e"},
		{"Bonus", entKategori.JenisPemasukan, "gift", "#16a34a"},
		{"Makan", entKategori.JenisPengeluaran, "utensils", "#ef4444"},
		{"Transport", entKategori.JenisPengeluaran, "car", "#f97316"},
		{"Belanja", entKategori.JenisPengeluaran, "shopping-bag", "#eab308"},
		{"Tagihan", entKategori.JenisPengeluaran, "file-text", "#6366f1"},
		{"Hiburan", entKategori.JenisPengeluaran, "gamepad-2", "#a855f7"},
		{"Kesehatan", entKategori.JenisPengeluaran, "heart-pulse", "#ec4899"},
	}

	existing, _ := repoKategori.AmbilSemua(penggunaID, "")
	if len(existing) == 0 {
		for _, k := range kategoriDefault {
			if err := repoKategori.Simpan(&entKategori.Kategori{
				PenggunaID: penggunaID,
				Nama:       k.nama,
				Jenis:      k.jenis,
				Ikon:       k.ikon,
				Warna:      k.warna,
			}); err != nil {
				return err
			}
		}
	}

	dompetList, _ := repoDompet.AmbilSemua(penggunaID)
	if len(dompetList) == 0 {
		if err := repoDompet.Simpan(&entDompet.Dompet{
			PenggunaID: penggunaID,
			Nama:       "Tunai",
			Jenis:      entDompet.JenisTunai,
			SaldoAwal:  0,
			MataUang:   "IDR",
		}); err != nil {
			return err
		}
	}
	return nil
}
