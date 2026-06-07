import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { anggaranApi } from '../../lib/api/anggaran'
import { kategoriApi } from '../../lib/api/kategori'
import { anggaranSchema, type AnggaranInput } from '../../schemas/anggaran.schema'
import { formatRupiah, bulanSekarang } from '../../lib/api-client'
import { Modal } from '../../components/ui/Modal'
import { NumericInput } from '../../components/ui/NumericInput'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

export function AnggaranPage() {
  const qc = useQueryClient()
  const [bulan, setBulan] = useState(bulanSekarang())
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AnggaranInput>({ kategoriId: '', bulan: bulanSekarang(), jumlah: 0 })
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)

  const { data: ringkasan = [], isLoading } = useQuery({
    queryKey: ['anggaran-ringkasan', bulan],
    queryFn: () => anggaranApi.ringkasan(bulan),
  })
  const { data: anggaranList = [] } = useQuery({
    queryKey: ['anggaran', bulan],
    queryFn: () => anggaranApi.list(bulan),
  })
  const { data: kategoriList = [] } = useQuery({
    queryKey: ['kategori', 'pengeluaran'],
    queryFn: () => kategoriApi.list('pengeluaran'),
  })

  const onSuccess = () => {
    qc.invalidateQueries({ queryKey: ['anggaran-ringkasan'] })
    qc.invalidateQueries({ queryKey: ['anggaran'] })
    setModalOpen(false)
    setEditingId(null)
  }

  const createMut = useMutation({
    mutationFn: anggaranApi.create,
    onSuccess,
  })

  const updateMut = useMutation({
    mutationFn: ({ id, jumlah }: { id: string; jumlah: number }) => anggaranApi.update(id, jumlah),
    onSuccess,
  })

  const deleteMut = useMutation({
    mutationFn: anggaranApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['anggaran-ringkasan'] })
      qc.invalidateQueries({ queryKey: ['anggaran'] })
      setDeleteTarget(null)
    },
  })

  const kategoriMap = Object.fromEntries(kategoriList.map((k) => [k.id, k.nama]))
  const anggaranByKategori = Object.fromEntries(anggaranList.map((a) => [a.kategoriId, a]))

  const openModal = () => {
    setEditingId(null)
    setForm({ kategoriId: '', bulan, jumlah: 0 })
    setModalOpen(true)
  }

  const openEdit = (kategoriId: string, jumlah: number) => {
    const anggaran = anggaranByKategori[kategoriId]
    if (!anggaran) return
    setEditingId(anggaran.id)
    setForm({ kategoriId, bulan, jumlah })
    setModalOpen(true)
  }

  const openDelete = (kategoriId: string) => {
    const anggaran = anggaranByKategori[kategoriId]
    if (!anggaran) return
    setDeleteTarget({
      id: anggaran.id,
      label: kategoriMap[kategoriId] ?? kategoriId,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const p = anggaranSchema.safeParse(form)
    if (!p.success) return
    if (editingId) {
      updateMut.mutate({ id: editingId, jumlah: p.data.jumlah })
    } else {
      createMut.mutate(p.data)
    }
  }

  const isPending = createMut.isPending || updateMut.isPending
  const isEdit = editingId !== null

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Anggaran</h1>
          <p className="page-subtitle">Atur batas pengeluaran per kategori</p>
        </div>
        <div className="page-header-actions">
          <input type="month" className="form-input" value={bulan} onChange={(e) => setBulan(e.target.value)} />
          <button type="button" className="btn btn-primary" onClick={openModal}>
            <Plus size={16} /> Set Anggaran
          </button>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEdit ? 'Ubah Anggaran' : 'Set Anggaran'}
        onSubmit={handleSubmit}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>
        }
      >
        <div className="form-grid form-grid--stack">
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select
              className="form-input"
              value={form.kategoriId}
              onChange={(e) => setForm({ ...form, kategoriId: e.target.value })}
              required
              disabled={isEdit}
            >
              <option value="">Pilih kategori</option>
              {kategoriList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Bulan</label>
            <input
              type="month"
              className="form-input"
              value={form.bulan}
              onChange={(e) => setForm({ ...form, bulan: e.target.value })}
              disabled={isEdit}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Jumlah Anggaran</label>
            <NumericInput value={form.jumlah} onChange={(jumlah) => setForm({ ...form, jumlah })} />
          </div>
        </div>
      </Modal>

      <div className="panel panel-body--padded">
        {isLoading && <p>Memuat...</p>}
        {ringkasan.map((item) => (
          <div key={item.kategoriId} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <span style={{ fontWeight: 700 }}>{kategoriMap[item.kategoriId] ?? item.kategoriId}</span>
              <div className="table-actions" style={{ opacity: 1 }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {formatRupiah(item.terpakai)} / {formatRupiah(item.jumlahAnggaran)}
                </span>
                <button
                  type="button"
                  className="btn-icon btn-icon--edit"
                  title="Edit anggaran"
                  onClick={() => openEdit(item.kategoriId, item.jumlahAnggaran)}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  className="btn-icon btn-icon--danger"
                  title="Hapus anggaran"
                  onClick={() => openDelete(item.kategoriId)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div style={{ height: 8, background: 'var(--color-border-light)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(item.persentase, 100)}%`,
                  background: item.persentase > 100 ? 'var(--color-danger)' : 'var(--color-success)',
                  borderRadius: 'var(--radius-sm)',
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Sisa: {formatRupiah(item.sisa)} ({item.persentase.toFixed(0)}%)
            </div>
          </div>
        ))}
        {ringkasan.length === 0 && !isLoading && (
          <p style={{ color: 'var(--color-text-muted)' }}>Belum ada anggaran untuk bulan ini.</p>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Anggaran"
        description={`Anggaran kategori "${deleteTarget?.label}" untuk bulan ini akan dihapus permanen.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget) await deleteMut.mutateAsync(deleteTarget.id) }}
        isPending={deleteMut.isPending}
      />
    </div>
  )
}
