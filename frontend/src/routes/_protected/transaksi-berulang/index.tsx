import { createFileRoute } from '@tanstack/react-router'
import { TransaksiBerulangPage } from '../../../pages/transaksi-berulang/TransaksiBerulangPage'

export const Route = createFileRoute('/_protected/transaksi-berulang/')({
  component: TransaksiBerulangPage,
})
