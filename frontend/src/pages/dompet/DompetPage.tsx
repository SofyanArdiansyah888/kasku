import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { dompetApi } from '../../lib/api/dompet'
import { formatRupiah } from '../../lib/api-client'
import { dompetSchema, labelJenisDompet, type Dompet, type DompetInput } from '../../schemas/dompet.schema'
import { Modal } from '../../components/ui/Modal'
import { NumericInput } from '../../components/ui/NumericInput'
import { TableActions } from '../../components/ui/TableActions'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

const defaultForm: DompetInput = { nama: '', jenis: 'tunai', saldoAwal: 0, mataUang: 'IDR' }

export function DompetPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState<DompetInput>(defaultForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['dompet'],
    queryFn: dompetApi.list,
  })

  const onSuccess = () => {
    qc.invalidateQueries({ queryKey: ['dompet'] })
    qc.invalidateQueries({ queryKey: ['dashboard-ringkasan'] })
    setForm(defaultForm)
    setEditingId(null)
    setModalOpen(false)
    setError('')
  }

  const createMut = useMutation({
    mutationFn: dompetApi.create,
    onSuccess,
    onError: (e: Error) => setError(e.message),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: DompetInput }) => dompetApi.update(id, data),
    onSuccess,
    onError: (e: Error) => setError(e.message),
  })

  const deleteMut = useMutation({
    mutationFn: dompetApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dompet'] })
      qc.invalidateQueries({ queryKey: ['dashboard-ringkasan'] })
      setDeleteTarget(null)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const parsed = dompetSchema.safeParse(form)
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Data tidak valid')
      return
    }
    if (editingId) {
      updateMut.mutate({ id: editingId, data: parsed.data })
    } else {
      createMut.mutate(parsed.data)
    }
  }

  const openModal = () => {
    setForm(defaultForm)
    setEditingId(null)
    setError('')
    setModalOpen(true)
  }

  const openEdit = (d: Dompet) => {
    setForm({ nama: d.nama, jenis: d.jenis, saldoAwal: d.saldoAwal, mataUang: d.mataUang })
    setEditingId(d.id)
    setError('')
    setModalOpen(true)
  }

  const isPending = createMut.isPending || updateMut.isPending
  const isEdit = editingId !== null

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dompet & Rekening</h1>
          <p className="page-subtitle">Kelola sumber dana Anda</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openModal}>
          <Plus size={16} /> Tambah Dompet
        </button>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEdit ? 'Ubah Dompet' : 'Tambah Dompet'}
        onSubmit={handleSubmit}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
              Batal
            </button>
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
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Contoh: BCA, Tunai"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Jenis</label>
            <select
              className="form-input"
              value={form.jenis}
              onChange={(e) => setForm({ ...form, jenis: e.target.value as DompetInput['jenis'] })}
            >
              {Object.entries(labelJenisDompet).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          {!isEdit && (
            <div className="form-group">
              <label className="form-label">Saldo Awal</label>
              <NumericInput
                value={form.saldoAwal}
                onChange={(saldoAwal) => setForm({ ...form, saldoAwal })}
              />
            </div>
          )}
        </div>
        {error && <p className="form-error">{error}</p>}
      </Modal>

      <div className="panel table-responsive">
        <table className="data-table data-table--responsive">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Jenis</th>
              <th>Saldo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={4} style={{ padding: 24 }}>Memuat...</td></tr>
            )}
            {!isLoading && list.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 24 }}>Belum ada dompet.</td></tr>
            )}
            {list.map((d) => (
              <tr key={d.id}>
                <td data-label="Nama" style={{ fontWeight: 700 }}>{d.nama}</td>
                <td data-label="Jenis">{labelJenisDompet[d.jenis]}</td>
                <td data-label="Saldo" style={{ fontWeight: 800 }}>{formatRupiah(d.saldo)}</td>
                <td data-label="" className="td-actions">
                  <TableActions
                    onEdit={() => openEdit(d)}
                    onDelete={() => setDeleteTarget({ id: d.id, label: d.nama })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Dompet"
        description={`Dompet "${deleteTarget?.label}" akan dihapus permanen.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { if (deleteTarget) await deleteMut.mutateAsync(deleteTarget.id) }}
        isPending={deleteMut.isPending}
      />
    </div>
  )
}
