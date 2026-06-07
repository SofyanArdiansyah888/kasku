import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PiggyBank,
  Menu,
  X,
  Tags,
  FileBarChart,
  LogOut,
} from 'lucide-react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

const mainNav = [
  { label: 'Ringkasan', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Transaksi', path: '/transaksi', icon: ArrowLeftRight },
  { label: 'Dompet', path: '/dompet', icon: Wallet },
  { label: 'Anggaran', path: '/anggaran', icon: PiggyBank },
]

const moreNav = [
  { label: 'Kategori', path: '/kategori', icon: Tags },
  { label: 'Laporan', path: '/laporan', icon: FileBarChart },
]

export function MobileBottomNav() {
  const navigate = useNavigate()
  const { pathname } = useRouterState({ select: (s) => s.location })
  const { pengguna, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const isMoreActive = moreNav.some((item) => pathname.startsWith(item.path))

  const go = (path: string) => {
    navigate({ to: path })
    setMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
    setMenuOpen(false)
  }

  return (
    <>
      <nav className="mobile-bottom-nav" aria-label="Navigasi utama">
        {mainNav.map((item) => {
          const active = pathname.startsWith(item.path)
          return (
            <button
              key={item.path}
              className={`mobile-nav-item ${active ? 'active' : ''}`}
              onClick={() => go(item.path)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
        <button
          className={`mobile-nav-item ${isMoreActive || menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="mobile-menu-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div>
                <div className="mobile-menu-brand">KASKU</div>
                <div className="mobile-menu-user">{pengguna?.nama ?? 'Pengguna'}</div>
              </div>
              <button className="modal-close" onClick={() => setMenuOpen(false)} aria-label="Tutup menu">
                <X size={18} />
              </button>
            </div>
            <div className="mobile-menu-links">
              {moreNav.map((item) => (
                <button
                  key={item.path}
                  className={`mobile-menu-link ${pathname.startsWith(item.path) ? 'active' : ''}`}
                  onClick={() => go(item.path)}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </div>
            <button className="mobile-menu-logout" onClick={handleLogout}>
              <LogOut size={18} />
              Keluar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
