import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import type { AuthContextType } from './contexts/AuthContext'

export interface RouterContext {
  auth: AuthContextType
}

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined! as AuthContextType,
  },
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
