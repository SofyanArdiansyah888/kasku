import { createFileRoute } from '@tanstack/react-router'
import { TransaksiPage } from '../../../pages/transaksi/TransaksiPage'

export const Route = createFileRoute('/_protected/transaksi/')({
  component: TransaksiPage,
})
