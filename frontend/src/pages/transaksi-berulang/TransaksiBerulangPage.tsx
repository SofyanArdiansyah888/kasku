import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Play } from 'lucide-react'
import { transaksiBerulangApi } from '../../lib/api/transaksi-berulang'
import { dompetApi } from '../../lib/api/dompet'
import { kategoriApi } from '../../lib/api/kategori'
import { transaksiBerulangSchema, labelFrekuensi, type TransaksiBerulang, type TransaksiBerulangInput } from '../../schemas/transaksi-berulang.schema'
import { formatRupiah, tanggalHariIni } from '../../lib/api-client'
import { Modal } from '../../components/ui/Modal'
import { NumericInput } from '../../components/ui/NumericInput'
import { TableActions } from '../../components/ui/TableActions'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

const defaultForm: TransaksiBerulangInput = {
  dompetId: '', kategoriId: '', jenis: 'pengeluaran', jumlah: 0,
  keterangan: '', frekuensi: 'bulanan', interval: 1,
  tanggalMulai: tanggalHariIni(), aktif: true,
}

export function TransaksiBerulangPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [prosesInfo, setProsesInfo] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['transaksi-berulang'],
    queryFn: transaksiBerulangApi.list,
  })
  const { data: dompetList = [] } = useQuery({ queryKey: ['dompet'], queryFn: dompetApi.list })
  const { data: kategoriList = [] } = useQuery({ queryKey: ['kategori'], queryFn: () => kategoriApi.list() })

  const onSuccess = () => {
    qc.invalidateQueries({ queryKey: ['transaksi-berulang'] })
    setModalOpen(false)
    setEditingId(null)
    setForm(defaultForm)
  }

  const createMut = useMutation({
    mutationFn: transaksiBerulangApi.create,
    onSuccess,
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransaksiBerulangInput }) =>
      transaksiBerulangApi.update(id, { ...data, aktif: data.aktif }),
    onSuccess,
  })

  const deleteMut = useMutation({
    mutationFn: transaksiBerulangApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transaksi-berulang'] })
      setDeleteTarget(null)
    },
  })

  const prosesMut = useMutation({
    mutationFn: transaksiBerulangApi.proses,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['transaksi-berulang'] })
      qc.invalidateQueries({ queryKey: ['transaksi'] })
      qc.invalidateQueries({ queryKey: ['dompet'] })
      qc.invalidateQueries({ queryKey: ['dashboard-ringkasan'] })
      qc.invalidateQueries({ queryKey: ['aktivitas-terbaru'] })
      setProsesInfo({
        type: data.diproses > 0 ? 'success' : 'info',
        text: data.diproses > 0
          ? `${data.diproses} transaksi berulang diproses dan dicatat ke transaksi.`
          : data.pesan ?? 'Tidak ada transaksi berulang yang jatuh tempo hari ini.',
      })
    },
    onError: (e: Error) => {
      setProsesInfo({ type: 'error', text: e.message })
    },
  })

  const kategoriMap = Object.fromEntries(kategoriList.map((k) => [k.id, k.nama]))
  const dompetMap = Object.fromEntries(dompetList.map((d) => [d.id, d.nama]))

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...defaultForm, tanggalMulai: tanggalHariIni() })
    setModalOpen(true)
  }

  const openEdit = (t: TransaksiBerulang) => {
    setEditingId(t.id)
    setForm({
      dompetId: t.dompetId,
      kategoriId: t.kategoriId,
      jenis: t.jenis as 'pemasukan' | 'pengeluaran',
      jumlah: t.jumlah,
      keterangan: t.keterangan ?? '',
      frekuensi: t.frekuensi as TransaksiBerulangInput['frekuensi'],
      interval: t.interval,
      tanggalMulai: t.tanggalMulai,
      tanggalSelesai: t.tanggalSelesai,
      aktif: t.aktif,
    })
    setModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const p = transaksiBerulangSchema.safeParse(form)
    if (!p.success) return
    if (editingId) {
      updateMut.mutate({ id: editingId, data: p.data })
    } else {
      createMut.mutate(p.data)
    }
  }

  const isPending = createMut.isPending || updateMut.isPending

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transaksi Berulang</h1>
          <p className="page-subtitle">Otomatisasi transaksi rutin</p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => { setProsesInfo(null); prosesMut.mutate() }}
            disabled={prosesMut.isPending}
          >
            <Play size={16} /> {prosesMut.isPending ? 'Memproses...' : 'Proses Jatuh Tempo'}
          </button>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Tambah
          </button>
        </div>
      </div>

      {prosesInfo && (
        <div className={`alert-banner alert-banner--${prosesInfo.type}`}>
          {prosesInfo.text}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Ubah Transaksi Berulang' : 'Tambah Transaksi Berulang'}
        onSubmit={handleSubmit}
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>
        }
      >
        <div className="form-grid form-grid--2">
          <div className="form-group">
            <label className="form-label">Jenis</label>
            <select className="form-input" value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as 'pemasukan' | 'pengeluaran' })}>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Dompet</label>
            <select className="form-input" value={form.dompetId} onChange={(e) => setForm({ ...form, dompetId: e.target.value })} required>
              <option value="">Pilih dompet</option>
              {dompetList.map((d) => <option key={d.id} value={d.id}>{d.nama}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-input" value={form.kategoriId} onChange={(e) => setForm({ ...form, kategoriId: e.target.value })} required>
              <option value="">Pilih kategori</option>
              {kategoriList.filter((k) => k.jenis === form.jenis).map((k) => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Jumlah</label>
            <NumericInput value={form.jumlah} onChange={(jumlah) => setForm({ ...form, jumlah })} />
          </div>
          <div className="form-group">
            <label className="form-label">Frekuensi</label>
            <select className="form-input" value={form.frekuensi} onChange={(e) => setForm({ ...form, frekuensi: e.target.value as TransaksiBerulangInput['frekuensi'] })}>
              {Object.entries(labelFrekuensi).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal Mulai</label>
            <input type="date" className="form-input" value={form.tanggalMulai} onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })} />
          </div>
          {editingId && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.aktif ? 'aktif' : 'nonaktif'} onChange={(e) => setForm({ ...form, aktif: e.target.value === 'aktif' })}>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          )}
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Keterangan</label>
            <input className="form-input" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
          </div>
        </div>
      </Modal>

      <div className="panel table-responsive">
        <table className="data-table data-table--responsive">
          <thead>
            <tr><th>Keterangan</th><th>Dompet</th><th>Kategori</th><th>Jumlah</th><th>Frekuensi</th><th>Berikutnya</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={8}>Memuat...</td></tr>}
            {list.map((t) => (
              <tr key={t.id}>
                <td data-label="Keterangan">{t.keterangan || '-'}</td>
                <td data-label="Dompet">{dompetMap[t.dompetId]}</td>
                <td data-label="Kategori">{kategoriMap[t.kategoriId]}</td>
                <td data-label="Jumlah">{formatRupiah(t.jumlah)}</td>
                <td data-label="Frekuensi">{labelFrekuensi[t.frekuensi as keyof typeof labelFrekuensi]}</td>
                <td data-label="Berikutnya">{t.tanggalJalankanBerikutnya}</td>
                <td data-label="Status">{t.aktif ? 'Aktif' : 'Nonaktif'}</td>
                <td data-label="" className="td-actions">
                  <TableActions
                    onEdit={() => openEdit(t)}
                    onDelete={() => setDeleteTarget({
                      id: t.id,
                      label: t.keterangan || formatRupiah(t.jumlah),
                    })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Transaksi Berulang"
        description={`Transaksi berulang "${deleteTarget?.label}" akan dihapus permanen.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget) await deleteMut.mutateAsync(deleteTarget.id) }}
        isPending={deleteMut.isPending}
      />
    </div>
  )
}
