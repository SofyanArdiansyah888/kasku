import { createFileRoute } from '@tanstack/react-router'
import { DompetPage } from '../../../pages/dompet/DompetPage'

export const Route = createFileRoute('/_protected/dompet/')({
  component: DompetPage,
})
