import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppLayout } from '../components/layout/AppLayout'

export const Route = createFileRoute('/_protected')({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
    // Role-based guard example — uncomment to restrict a specific route:
    // if (requiredRole && auth.user?.role !== requiredRole) {
    //   throw redirect({ to: '/unauthorized' })
    // }
  },
  component: ProtectedLayout,
})

function ProtectedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
