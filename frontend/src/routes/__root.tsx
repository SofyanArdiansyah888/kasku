import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { RouterContext } from '../router'
import { NotFoundPage } from '../pages/error/NotFoundPage'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
})
