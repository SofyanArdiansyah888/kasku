import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, ArrowRightLeft } from 'lucide-react'
import { transaksiApi } from '../../lib/api/transaksi'
import { dompetApi } from '../../lib/api/dompet'
import { kategoriApi } from '../../lib/api/kategori'
import { formatRupiah, tanggalHariIni } from '../../lib/api-client'
import { transaksiSchema, transferSchema, type Transaksi, type TransaksiInput, type TransferInput } from '../../schemas/transaksi.schema'
import { labelJenisKategori } from '../../schemas/kategori.schema'
import { Modal } from '../../components/ui/Modal'
import { NumericInput } from '../../components/ui/NumericInput'
import { TableActions } from '../../components/ui/TableActions'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

const defaultTransaksi: TransaksiInput = {
  dompetId: '', kategoriId: '', jenis: 'pengeluaran', jumlah: 0,
  keterangan: '', tanggalTransaksi: tanggalHariIni(),
}

const defaultTransfer: TransferInput = {
  dompetAsalId: '', dompetTujuanId: '', jumlah: 0,
  keterangan: 'Transfer', tanggalTransaksi: tanggalHariIni(),
}

export function TransaksiPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'transaksi' | 'transfer'>('transaksi')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TransaksiInput>(defaultTransaksi)
  const [transferForm, setTransferForm] = useState<TransferInput>(defaultTransfer)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)

  const { data: transaksiRes, isLoading } = useQuery({
    queryKey: ['transaksi'],
    queryFn: () => transaksiApi.list({ batas: 50 }),
  })
  const { data: dompetList = [] } = useQuery({ queryKey: ['dompet'], queryFn: dompetApi.list })
  const { data: kategoriList = [] } = useQuery({ queryKey: ['kategori'], queryFn: () => kategoriApi.list() })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['transaksi'] })
    qc.invalidateQueries({ queryKey: ['dompet'] })
    qc.invalidateQueries({ queryKey: ['dashboard-ringkasan'] })
    qc.invalidateQueries({ queryKey: ['aktivitas-terbaru'] })
  }

  const resetModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(defaultTransaksi)
    setTransferForm(defaultTransfer)
  }

  const createMut = useMutation({
    mutationFn: transaksiApi.create,
    onSuccess: () => { invalidate(); resetModal() },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransaksiInput }) => transaksiApi.update(id, data),
    onSuccess: () => { invalidate(); resetModal() },
  })
  const transferMut = useMutation({
    mutationFn: transaksiApi.transfer,
    onSuccess: () => { invalidate(); resetModal() },
  })
  const deleteMut = useMutation({
    mutationFn: transaksiApi.delete,
    onSuccess: () => {
      invalidate()
      setDeleteTarget(null)
    },
  })

  const kategoriMap = Object.fromEntries(kategoriList.map((k) => [k.id, k.nama]))
  const dompetMap = Object.fromEntries(dompetList.map((d) => [d.id, d.nama]))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tab === 'transaksi') {
      const p = transaksiSchema.safeParse(form)
      if (!p.success) return
      const data = { ...p.data, kategoriId: p.data.kategoriId || undefined }
      if (editingId) {
        updateMut.mutate({ id: editingId, data })
      } else {
        createMut.mutate(data)
      }
    } else {
      const p = transferSchema.safeParse(transferForm)
      if (p.success) transferMut.mutate(p.data)
    }
  }

  const openModal = () => {
    setTab('transaksi')
    setEditingId(null)
    setForm({ ...defaultTransaksi, tanggalTransaksi: tanggalHariIni() })
    setTransferForm({ ...defaultTransfer, tanggalTransaksi: tanggalHariIni() })
    setModalOpen(true)
  }

  const openEdit = (t: Transaksi) => {
    setTab('transaksi')
    setEditingId(t.id)
    setForm({
      dompetId: t.dompetId,
      kategoriId: t.kategoriId ?? '',
      jenis: (t.jenis === 'pemasukan' ? 'pemasukan' : 'pengeluaran') as TransaksiInput['jenis'],
      jumlah: t.jumlah,
      keterangan: t.keterangan ?? '',
      tanggalTransaksi: t.tanggalTransaksi,
    })
    setModalOpen(true)
  }

  const isPending = createMut.isPending || updateMut.isPending || transferMut.isPending
  const isEdit = editingId !== null

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transaksi</h1>
          <p className="page-subtitle">Catat pemasukan, pengeluaran, dan transfer</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openModal}>
          <Plus size={16} /> Tambah
        </button>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          isEdit ? 'Ubah Transaksi' : tab === 'transaksi' ? 'Tambah Transaksi' : 'Transfer Dompet'
        }
        onSubmit={handleSubmit}
        size="lg"
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? 'Menyimpan...' : isEdit || tab === 'transaksi' ? 'Simpan Transaksi' : 'Transfer'}
            </button>
          </>
        }
      >
        {!isEdit && (
          <div className="filter-chips" style={{ marginBottom: 0 }}>
            <button
              type="button"
              className={`btn ${tab === 'transaksi' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTab('transaksi')}
            >
              Transaksi
            </button>
            <button
              type="button"
              className={`btn ${tab === 'transfer' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTab('transfer')}
            >
              <ArrowRightLeft size={14} /> Transfer
            </button>
          </div>
        )}

        {tab === 'transaksi' ? (
          <div className="form-grid form-grid--2">
            <div className="form-group">
              <label className="form-label">Jenis</label>
              <select className="form-input" value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as TransaksiInput['jenis'] })}>
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
              <select className="form-input" value={form.kategoriId} onChange={(e) => setForm({ ...form, kategoriId: e.target.value })}>
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
              <label className="form-label">Tanggal</label>
              <input type="date" className="form-input" value={form.tanggalTransaksi} onChange={(e) => setForm({ ...form, tanggalTransaksi: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Keterangan</label>
              <input className="form-input" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
            </div>
          </div>
        ) : (
          <div className="form-grid form-grid--2">
            <div className="form-group">
              <label className="form-label">Dompet Asal</label>
              <select className="form-input" value={transferForm.dompetAsalId} onChange={(e) => setTransferForm({ ...transferForm, dompetAsalId: e.target.value })} required>
                <option value="">Pilih dompet asal</option>
                {dompetList.map((d) => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Dompet Tujuan</label>
              <select className="form-input" value={transferForm.dompetTujuanId} onChange={(e) => setTransferForm({ ...transferForm, dompetTujuanId: e.target.value })} required>
                <option value="">Pilih dompet tujuan</option>
                {dompetList.map((d) => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Jumlah</label>
              <NumericInput value={transferForm.jumlah} onChange={(jumlah) => setTransferForm({ ...transferForm, jumlah })} />
            </div>
            <div className="form-group">
              <label className="form-label">Tanggal</label>
              <input type="date" className="form-input" value={transferForm.tanggalTransaksi} onChange={(e) => setTransferForm({ ...transferForm, tanggalTransaksi: e.target.value })} />
            </div>
          </div>
        )}
      </Modal>

      <div className="panel table-responsive">
        <table className="data-table data-table--responsive">
          <thead>
            <tr><th>Tanggal</th><th>Jenis</th><th>Dompet</th><th>Kategori</th><th>Jumlah</th><th>Keterangan</th><th></th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7}>Memuat...</td></tr>}
            {transaksiRes?.data.map((t) => (
              <tr key={t.id}>
                <td data-label="Tanggal">{t.tanggalTransaksi}</td>
                <td data-label="Jenis">{t.jenis === 'transfer' ? 'Transfer' : labelJenisKategori[t.jenis as 'pemasukan' | 'pengeluaran'] ?? t.jenis}</td>
                <td data-label="Dompet">{dompetMap[t.dompetId] ?? '-'}</td>
                <td data-label="Kategori">{t.kategoriId ? kategoriMap[t.kategoriId] : '-'}</td>
                <td
                  data-label="Jumlah"
                  style={{ fontWeight: 800, color: t.jenis === 'pengeluaran' ? 'var(--color-danger)' : 'var(--color-success)' }}
                >
                  {formatRupiah(t.jumlah)}
                </td>
                <td data-label="Keterangan">{t.keterangan || '-'}</td>
                <td data-label="" className="td-actions">
                  <TableActions
                    hideEdit={t.jenis === 'transfer'}
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
        title="Hapus Transaksi"
        description={`Transaksi "${deleteTarget?.label}" akan dihapus permanen.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget) await deleteMut.mutateAsync(deleteTarget.id) }}
        isPending={deleteMut.isPending}
      />
    </div>
  )
}
