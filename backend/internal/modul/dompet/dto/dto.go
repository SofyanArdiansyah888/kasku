package dto

type PermintaanBuat struct {
	Nama      string  `json:"nama" binding:"required"`
	Jenis     string  `json:"jenis" binding:"required,oneof=tunai bank dompet_digital"`
	SaldoAwal float64 `json:"saldoAwal"`
	MataUang  string  `json:"mataUang"`
}

type PermintaanUbah struct {
	Nama      string  `json:"nama" binding:"required"`
	Jenis     string  `json:"jenis" binding:"required,oneof=tunai bank dompet_digital"`
	SaldoAwal float64 `json:"saldoAwal"`
	MataUang  string  `json:"mataUang"`
}

type ResponsDompet struct {
	ID         string  `json:"id"`
	Nama       string  `json:"nama"`
	Jenis      string  `json:"jenis"`
	SaldoAwal  float64 `json:"saldoAwal"`
	Saldo      float64 `json:"saldo"`
	MataUang   string  `json:"mataUang"`
	DibuatPada string  `json:"dibuatPada"`
}
