package usecase

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	repoDompet "github.com/kasku/backend/internal/modul/dompet/repositori"
	entTransaksi "github.com/kasku/backend/internal/modul/transaksi/entitas"
	repoTransaksi "github.com/kasku/backend/internal/modul/transaksi/repositori"
	"github.com/kasku/backend/internal/modul/dashboard/dto"
)

type Usecase struct {
	repoDompet    repoDompet.Repositori
	repoTransaksi repoTransaksi.Repositori
	penghitung    repoDompet.PenghitungSaldo
}

func Baru(repoDompet repoDompet.Repositori, repoTransaksi repoTransaksi.Repositori, penghitung repoDompet.PenghitungSaldo) *Usecase {
	return &Usecase{repoDompet: repoDompet, repoTransaksi: repoTransaksi, penghitung: penghitung}
}

func (u *Usecase) Ringkasan(penggunaID uuid.UUID) (*dto.RingkasanDashboard, error) {
	dompetList, err := u.repoDompet.AmbilSemua(penggunaID)
	if err != nil {
		return nil, err
	}
	var totalSaldo float64
	for _, d := range dompetList {
		saldo, _ := u.penghitung.HitungSaldoDompet(d.ID, penggunaID)
		totalSaldo += saldo
	}

	sekarang := time.Now()
	dari := time.Date(sekarang.Year(), sekarang.Month(), 1, 0, 0, 0, 0, time.UTC)
	sampai := dari.AddDate(0, 1, -1)

	pemasukan, _ := u.repoTransaksi.TotalByJenis(penggunaID, entTransaksi.JenisPemasukan, dari, sampai)
	pengeluaran, _ := u.repoTransaksi.TotalByJenis(penggunaID, entTransaksi.JenisPengeluaran, dari, sampai)

	_, totalTx, _ := u.repoTransaksi.Filter(repoTransaksi.Filter{
		PenggunaID: penggunaID,
		Halaman:    1,
		Batas:      1,
	})

	return &dto.RingkasanDashboard{
		TotalSaldo:          totalSaldo,
		PemasukanBulanIni:   pemasukan,
		PengeluaranBulanIni: pengeluaran,
		SaldoBulanIni:       pemasukan - pengeluaran,
		JumlahDompet:        len(dompetList),
		JumlahTransaksi:     totalTx,
	}, nil
}

func (u *Usecase) AktivitasTerbaru(penggunaID uuid.UUID) ([]dto.AktivitasTerbaru, error) {
	list, err := u.repoTransaksi.AmbilTerbaru(penggunaID, 10)
	if err != nil {
		return nil, err
	}
	hasil := make([]dto.AktivitasTerbaru, len(list))
	for i, t := range list {
		pesan := fmt.Sprintf("%s: %s", t.Jenis, t.Keterangan)
		if t.Keterangan == "" {
			pesan = t.Jenis
		}
		hasil[i] = dto.AktivitasTerbaru{
			ID:     t.ID.String(),
			Pesan:  pesan,
			Jumlah: t.Jumlah,
			Jenis:  t.Jenis,
			Waktu:  t.DibuatPada.Format("2006-01-02T15:04:05Z07:00"),
		}
	}
	return hasil, nil
}
