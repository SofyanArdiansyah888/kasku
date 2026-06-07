import { createFileRoute } from '@tanstack/react-router'
import { UnauthorizedPage } from '../pages/error/UnauthorizedPage'

export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedPage,
})
