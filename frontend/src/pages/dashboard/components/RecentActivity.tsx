import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../../../lib/api/laporan'
import { formatRupiah } from '../../../lib/api-client'

export function RecentActivity() {
  const { data, isLoading } = useQuery({
    queryKey: ['aktivitas-terbaru'],
    queryFn: dashboardApi.aktivitas,
  })

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Aktivitas Terbaru</h2>
      </div>
      <div className="panel-body">
        {isLoading && (
          <div style={{ padding: 24, color: 'var(--color-text-muted)' }}>Memuat...</div>
        )}
        {!isLoading && (!data || data.length === 0) && (
          <div style={{ padding: 24, color: 'var(--color-text-muted)' }}>
            Belum ada transaksi.
          </div>
        )}
        {data?.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--color-border-light)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{item.pesan}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                {new Date(item.waktu).toLocaleString('id-ID')}
              </div>
            </div>
            <div
              style={{
                fontWeight: 800,
                color:
                  item.jenis === 'pemasukan'
                    ? 'var(--color-success)'
                    : item.jenis === 'pengeluaran'
                      ? 'var(--color-danger)'
                      : 'var(--color-text)',
              }}
            >
              {item.jenis === 'pengeluaran' ? '-' : ''}
              {formatRupiah(item.jumlah)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
