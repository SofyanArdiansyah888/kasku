import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { laporanApi } from '../../lib/api/laporan'
import { kategoriApi } from '../../lib/api/kategori'
import { dompetApi } from '../../lib/api/dompet'
import { transaksiApi } from '../../lib/api/transaksi'
import { formatRupiah, bulanSekarang, rentangBulan } from '../../lib/api-client'
import { labelJenisKategori } from '../../schemas/kategori.schema'
import type { RincianKategori } from '../../schemas/laporan.schema'
import { Modal } from '../../components/ui/Modal'

export function LaporanPage() {
  const [bulan, setBulan] = useState(bulanSekarang())
  const [dari, setDari] = useState('')
  const [sampai, setSampai] = useState('')
  const [detailTarget, setDetailTarget] = useState<(RincianKategori & { nama: string }) | null>(null)

  const { dari: bulanDari, sampai: bulanSampai } = useMemo(() => rentangBulan(bulan), [bulan])

  const { data: ringkasan, isLoading } = useQuery({
    queryKey: ['laporan-bulanan', bulan],
    queryFn: () => laporanApi.bulanan(bulan),
  })
  const { data: rincian = [] } = useQuery({
    queryKey: ['laporan-rincian', bulan],
    queryFn: () => laporanApi.rincianKategori(bulan),
  })
  const { data: kategoriList = [] } = useQuery({
    queryKey: ['kategori'],
    queryFn: () => kategoriApi.list(),
  })
  const { data: dompetList = [] } = useQuery({
    queryKey: ['dompet'],
    queryFn: dompetApi.list,
  })

  const { data: detailRes, isLoading: detailLoading } = useQuery({
    queryKey: ['laporan-detail', bulan, detailTarget?.kategoriId, detailTarget?.jenis],
    queryFn: () =>
      transaksiApi.list({
        dari: bulanDari,
        sampai: bulanSampai,
        kategori_id: detailTarget!.kategoriId,
        jenis: detailTarget!.jenis,
        batas: 500,
      }),
    enabled: detailTarget !== null,
  })

  const kategoriMap = Object.fromEntries(kategoriList.map((k) => [k.id, k.nama]))
  const dompetMap = Object.fromEntries(dompetList.map((d) => [d.id, d.nama]))
  const detailList = detailRes?.data ?? []

  const handleEkspor = async () => {
    const blob = await laporanApi.eksporTransaksi(dari || undefined, sampai || undefined)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'transaksi.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const openDetail = (r: RincianKategori) => {
    if (r.jenis !== 'pengeluaran') return
    setDetailTarget({
      ...r,
      nama: kategoriMap[r.kategoriId] ?? r.kategoriId,
    })
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan & Ekspor</h1>
          <p className="page-subtitle">Ringkasan keuangan dan unduh data</p>
        </div>
        <div className="page-header-actions">
          <input type="month" className="form-input" value={bulan} onChange={(e) => setBulan(e.target.value)} />
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 32 }}>
        <div className="panel" style={{ padding: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 700 }}>PEMASUKAN</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-success)', marginTop: 8 }}>
            {isLoading ? '...' : formatRupiah(ringkasan?.pemasukan ?? 0)}
          </div>
        </div>
        <div className="panel" style={{ padding: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 700 }}>PENGELUARAN</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-danger)', marginTop: 8 }}>
            {isLoading ? '...' : formatRupiah(ringkasan?.pengeluaran ?? 0)}
          </div>
        </div>
        <div className="panel" style={{ padding: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 700 }}>SALDO BULAN INI</div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 8 }}>
            {isLoading ? '...' : formatRupiah(ringkasan?.saldo ?? 0)}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Rincian per Kategori</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 12 }}>
        Klik baris pengeluaran untuk melihat detail transaksi.
      </p>
      <div className="panel table-responsive" style={{ marginBottom: 24, padding: 0 }}>
        <table className="data-table data-table--responsive">
          <thead><tr><th>Kategori</th><th>Jenis</th><th>Total</th></tr></thead>
          <tbody>
            {rincian.map((r) => {
              const clickable = r.jenis === 'pengeluaran'
              return (
                <tr
                  key={`${r.kategoriId}-${r.jenis}`}
                  onClick={() => openDetail(r)}
                  style={clickable ? { cursor: 'pointer' } : undefined}
                  className={clickable ? 'data-table__row--clickable' : undefined}
                >
                  <td data-label="Kategori">{kategoriMap[r.kategoriId] ?? r.kategoriId}</td>
                  <td data-label="Jenis">{labelJenisKategori[r.jenis as 'pemasukan' | 'pengeluaran'] ?? r.jenis}</td>
                  <td data-label="Total" style={{ fontWeight: 800 }}>{formatRupiah(r.total)}</td>
                </tr>
              )
            })}
            {rincian.length === 0 && <tr><td colSpan={3}>Tidak ada data</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal
        open={detailTarget !== null}
        onClose={() => setDetailTarget(null)}
        title={`Detail Pengeluaran — ${detailTarget?.nama ?? ''}`}
        size="lg"
        footer={
          <button type="button" className="btn btn-primary" onClick={() => setDetailTarget(null)}>
            Tutup
          </button>
        }
      >
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
          Bulan {bulan} · Total {formatRupiah(detailTarget?.total ?? 0)}
        </p>
        <div className="table-responsive">
          <table className="data-table data-table--responsive">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Dompet</th>
                <th>Jumlah</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {detailLoading && (
                <tr><td colSpan={4}>Memuat...</td></tr>
              )}
              {!detailLoading && detailList.length === 0 && (
                <tr><td colSpan={4}>Tidak ada transaksi</td></tr>
              )}
              {!detailLoading && detailList.map((t) => (
                <tr key={t.id}>
                  <td data-label="Tanggal">{t.tanggalTransaksi}</td>
                  <td data-label="Dompet">{dompetMap[t.dompetId] ?? '-'}</td>
                  <td
                    data-label="Jumlah"
                    style={{ fontWeight: 800, color: 'var(--color-danger)' }}
                  >
                    -{formatRupiah(t.jumlah)}
                  </td>
                  <td data-label="Keterangan">{t.keterangan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      <div className="panel" style={{ padding: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Ekspor CSV</h2>
        <div className="form-grid form-grid--2" style={{ alignItems: 'end' }}>
          <div className="form-group">
            <label className="form-label">Dari</label>
            <input type="date" className="form-input" value={dari} onChange={(e) => setDari(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Sampai</label>
            <input type="date" className="form-input" value={sampai} onChange={(e) => setSampai(e.target.value)} />
          </div>
          <button type="button" className="btn btn-primary btn-block" onClick={handleEkspor}>
            <Download size={16} /> Unduh CSV
          </button>
        </div>
      </div>
    </div>
  )
}
