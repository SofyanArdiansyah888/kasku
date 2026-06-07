package usecase

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/kasku/backend/internal/modul/transaksi/dto"
	"github.com/kasku/backend/internal/modul/transaksi/entitas"
	"github.com/kasku/backend/internal/modul/transaksi/repositori"
)

var ErrTransaksiTidakAda = errors.New("transaksi tidak ditemukan")

type Usecase struct {
	repo repositori.Repositori
}

func Baru(repo repositori.Repositori) *Usecase {
	return &Usecase{repo: repo}
}

func (u *Usecase) Buat(penggunaID uuid.UUID, req dto.PermintaanBuat) (*dto.ResponsTransaksi, error) {
	dompetID, _ := uuid.Parse(req.DompetID)
	tgl, err := time.Parse("2006-01-02", req.TanggalTransaksi)
	if err != nil {
		return nil, errors.New("format tanggal tidak valid, gunakan YYYY-MM-DD")
	}

	t := &entitas.Transaksi{
		PenggunaID:       penggunaID,
		DompetID:         dompetID,
		Jenis:            req.Jenis,
		Jumlah:           req.Jumlah,
		Keterangan:       req.Keterangan,
		TanggalTransaksi: tgl,
	}
	if req.KategoriID != "" {
		kid, _ := uuid.Parse(req.KategoriID)
		t.KategoriID = &kid
	}
	if err := u.repo.Simpan(t); err != nil {
		return nil, err
	}
	tagIDs := parseTagIDs(req.TagIDs)
	if len(tagIDs) > 0 {
		_ = u.repo.SimpanTag(t.ID, tagIDs)
	}
	return u.keRespons(t, tagIDs)
}

func (u *Usecase) Ubah(penggunaID, id uuid.UUID, req dto.PermintaanUbah) (*dto.ResponsTransaksi, error) {
	t, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return nil, err
	}
	if t == nil {
		return nil, ErrTransaksiTidakAda
	}
	if t.Jenis == entitas.JenisTransfer {
		return nil, errors.New("transaksi transfer tidak dapat diubah, hapus dan buat ulang")
	}

	dompetID, _ := uuid.Parse(req.DompetID)
	tgl, err := time.Parse("2006-01-02", req.TanggalTransaksi)
	if err != nil {
		return nil, errors.New("format tanggal tidak valid")
	}

	t.DompetID = dompetID
	t.Jenis = req.Jenis
	t.Jumlah = req.Jumlah
	t.Keterangan = req.Keterangan
	t.TanggalTransaksi = tgl
	if req.KategoriID != "" {
		kid, _ := uuid.Parse(req.KategoriID)
		t.KategoriID = &kid
	} else {
		t.KategoriID = nil
	}
	if err := u.repo.Ubah(t); err != nil {
		return nil, err
	}
	tagIDs := parseTagIDs(req.TagIDs)
	_ = u.repo.SimpanTag(t.ID, tagIDs)
	return u.keRespons(t, tagIDs)
}

func (u *Usecase) Hapus(penggunaID, id uuid.UUID) error {
	t, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return err
	}
	if t == nil {
		return ErrTransaksiTidakAda
	}
	if t.Jenis == entitas.JenisTransfer && t.PasanganTransferID != nil {
		_ = u.repo.Hapus(*t.PasanganTransferID, penggunaID)
	}
	return u.repo.Hapus(id, penggunaID)
}

func (u *Usecase) AmbilByID(penggunaID, id uuid.UUID) (*dto.ResponsTransaksi, error) {
	t, err := u.repo.AmbilByID(id, penggunaID)
	if err != nil {
		return nil, err
	}
	if t == nil {
		return nil, ErrTransaksiTidakAda
	}
	tagIDs, _ := u.repo.AmbilTagIDs(t.ID)
	return u.keRespons(t, tagIDs)
}

func (u *Usecase) Filter(penggunaID uuid.UUID, q dto.FilterQuery) ([]dto.ResponsTransaksi, int64, error) {
	f := repositori.Filter{PenggunaID: penggunaID, Jenis: q.Jenis, Halaman: q.Halaman, Batas: q.Batas}
	if q.Dari != "" {
		t, _ := time.Parse("2006-01-02", q.Dari)
		f.Dari = &t
	}
	if q.Sampai != "" {
		t, _ := time.Parse("2006-01-02", q.Sampai)
		f.Sampai = &t
	}
	if q.DompetID != "" {
		id, _ := uuid.Parse(q.DompetID)
		f.DompetID = &id
	}
	if q.KategoriID != "" {
		id, _ := uuid.Parse(q.KategoriID)
		f.KategoriID = &id
	}
	if q.TagID != "" {
		id, _ := uuid.Parse(q.TagID)
		f.TagID = &id
	}

	list, total, err := u.repo.Filter(f)
	if err != nil {
		return nil, 0, err
	}
	hasil := make([]dto.ResponsTransaksi, 0, len(list))
	for i := range list {
		tagIDs, _ := u.repo.AmbilTagIDs(list[i].ID)
		r, _ := u.keRespons(&list[i], tagIDs)
		hasil = append(hasil, *r)
	}
	return hasil, total, nil
}

func (u *Usecase) Transfer(penggunaID uuid.UUID, req dto.PermintaanTransfer) (*dto.ResponsTransaksi, error) {
	asalID, _ := uuid.Parse(req.DompetAsalID)
	tujuanID, _ := uuid.Parse(req.DompetTujuanID)
	if asalID == tujuanID {
		return nil, errors.New("dompet asal dan tujuan tidak boleh sama")
	}
	tgl, err := time.Parse("2006-01-02", req.TanggalTransaksi)
	if err != nil {
		return nil, errors.New("format tanggal tidak valid")
	}

	tx := u.repo.MulaiTx()

	keluar := &entitas.Transaksi{
		PenggunaID:       penggunaID,
		DompetID:         asalID,
		Jenis:            entitas.JenisTransfer,
		Jumlah:           req.Jumlah,
		Keterangan:       req.Keterangan,
		TanggalTransaksi: tgl,
		DompetTujuanID:   &tujuanID,
	}
	if err := u.repo.SimpanDalamTx(tx, keluar); err != nil {
		u.repo.RollbackTx(tx)
		return nil, err
	}

	masuk := &entitas.Transaksi{
		PenggunaID:       penggunaID,
		DompetID:         tujuanID,
		Jenis:            entitas.JenisTransfer,
		Jumlah:           req.Jumlah,
		Keterangan:       req.Keterangan,
		TanggalTransaksi: tgl,
		DompetTujuanID:   &asalID,
		PasanganTransferID: &keluar.ID,
	}
	if err := u.repo.SimpanDalamTx(tx, masuk); err != nil {
		u.repo.RollbackTx(tx)
		return nil, err
	}

	keluar.PasanganTransferID = &masuk.ID
	if err := u.repo.UbahDalamTx(tx, keluar); err != nil {
		u.repo.RollbackTx(tx)
		return nil, err
	}

	if err := u.repo.CommitTx(tx); err != nil {
		return nil, err
	}
	return u.keRespons(keluar, nil)
}

func (u *Usecase) keRespons(t *entitas.Transaksi, tagIDs []uuid.UUID) (*dto.ResponsTransaksi, error) {
	r := &dto.ResponsTransaksi{
		ID:               t.ID.String(),
		DompetID:         t.DompetID.String(),
		Jenis:            t.Jenis,
		Jumlah:           t.Jumlah,
		Keterangan:       t.Keterangan,
		TanggalTransaksi: t.TanggalTransaksi.Format("2006-01-02"),
		DibuatPada:       t.DibuatPada.Format("2006-01-02T15:04:05Z07:00"),
	}
	if t.KategoriID != nil {
		r.KategoriID = t.KategoriID.String()
	}
	if t.DompetTujuanID != nil {
		r.DompetTujuanID = t.DompetTujuanID.String()
	}
	if t.PasanganTransferID != nil {
		r.PasanganTransferID = t.PasanganTransferID.String()
	}
	if len(tagIDs) > 0 {
		r.TagIDs = make([]string, len(tagIDs))
		for i, id := range tagIDs {
			r.TagIDs[i] = id.String()
		}
	}
	return r, nil
}

func parseTagIDs(ids []string) []uuid.UUID {
	result := make([]uuid.UUID, 0, len(ids))
	for _, s := range ids {
		if id, err := uuid.Parse(s); err == nil {
			result = append(result, id)
		}
	}
	return result
}
