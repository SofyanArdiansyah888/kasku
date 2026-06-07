import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { kategoriApi } from '../../lib/api/kategori'
import { kategoriSchema, labelJenisKategori, type Kategori, type KategoriInput } from '../../schemas/kategori.schema'
import { Modal } from '../../components/ui/Modal'
import { TableActions } from '../../components/ui/TableActions'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

const defaultForm: KategoriInput = { nama: '', jenis: 'pengeluaran', ikon: '', warna: '#dc2626' }

export function KategoriPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState<KategoriInput>(defaultForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState<string>('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['kategori', filter],
    queryFn: () => kategoriApi.list(filter || undefined),
  })

  const onSuccess = () => {
    qc.invalidateQueries({ queryKey: ['kategori'] })
    setForm(defaultForm)
    setEditingId(null)
    setModalOpen(false)
  }

  const createMut = useMutation({
    mutationFn: kategoriApi.create,
    onSuccess,
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: KategoriInput }) => kategoriApi.update(id, data),
    onSuccess,
  })

  const deleteMut = useMutation({
    mutationFn: kategoriApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kategori'] })
      setDeleteTarget(null)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = kategoriSchema.safeParse(form)
    if (!parsed.success) return
    if (editingId) {
      updateMut.mutate({ id: editingId, data: parsed.data })
    } else {
      createMut.mutate(parsed.data)
    }
  }

  const openCreate = () => {
    setForm(defaultForm)
    setEditingId(null)
    setModalOpen(true)
  }

  const openEdit = (k: Kategori) => {
    setForm({ nama: k.nama, jenis: k.jenis, ikon: k.ikon ?? '', warna: k.warna ?? '#dc2626' })
    setEditingId(k.id)
    setModalOpen(true)
  }

  const isPending = createMut.isPending || updateMut.isPending

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kategori</h1>
          <p className="page-subtitle">Kategorikan pemasukan dan pengeluaran</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>

      <div className="filter-chips">
        {['', 'pemasukan', 'pengeluaran'].map((f) => (
          <button
            key={f}
            type="button"
            className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f)}
          >
            {f === '' ? 'Semua' : labelJenisKategori[f as 'pemasukan' | 'pengeluaran']}
          </button>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Ubah Kategori' : 'Tambah Kategori'}
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
            <label className="form-label">Nama</label>
            <input
              className="form-input"
              placeholder="Nama kategori"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Jenis</label>
            <select
              className="form-input"
              value={form.jenis}
              onChange={(e) => setForm({ ...form, jenis: e.target.value as KategoriInput['jenis'] })}
            >
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Warna</label>
            <input
              className="form-input"
              placeholder="#dc2626"
              value={form.warna}
              onChange={(e) => setForm({ ...form, warna: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      <div className="panel table-responsive">
        <table className="data-table data-table--responsive">
          <thead><tr><th>Nama</th><th>Jenis</th><th>Warna</th><th></th></tr></thead>
          <tbody>
            {isLoading && <tr><td colSpan={4}>Memuat...</td></tr>}
            {list.map((k) => (
              <tr key={k.id}>
                <td data-label="Nama" style={{ fontWeight: 700 }}>{k.nama}</td>
                <td data-label="Jenis">{labelJenisKategori[k.jenis]}</td>
                <td data-label="Warna">
                  <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: 'var(--radius-sm)', background: k.warna || '#ccc' }} />
                </td>
                <td data-label="" className="td-actions">
                  <TableActions
                    onEdit={() => openEdit(k)}
                    onDelete={() => setDeleteTarget({ id: k.id, label: k.nama })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Kategori"
        description={`Kategori "${deleteTarget?.label}" akan dihapus permanen.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget) await deleteMut.mutateAsync(deleteTarget.id) }}
        isPending={deleteMut.isPending}
      />
    </div>
  )
}
