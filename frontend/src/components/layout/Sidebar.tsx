import { LayoutDashboard, Wallet, ArrowLeftRight, Tags, PiggyBank, FileBarChart } from 'lucide-react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { label: 'Ringkasan', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Transaksi', path: '/transaksi', icon: ArrowLeftRight },
  { label: 'Dompet', path: '/dompet', icon: Wallet },
  { label: 'Kategori', path: '/kategori', icon: Tags },
  { label: 'Anggaran', path: '/anggaran', icon: PiggyBank },
  { label: 'Laporan', path: '/laporan', icon: FileBarChart },
]

export function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useRouterState({ select: (s) => s.location })
  const { pengguna, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  const initials = pengguna?.nama
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'KA'

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        KAS<span style={{ color: 'var(--color-accent)' }}>KU</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path)
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate({ to: item.path })}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {pengguna?.nama ?? 'Pengguna'}
            </div>
            <div
              style={{
                fontSize: 9,
                color: 'var(--color-accent)',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                marginTop: 2,
              }}
            >
              Catatan Keuangan
            </div>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Keluar
        </button>
      </div>
    </aside>
  )
}
