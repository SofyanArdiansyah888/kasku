import { createFileRoute } from '@tanstack/react-router'
import { LaporanPage } from '../../../pages/laporan/LaporanPage'

export const Route = createFileRoute('/_protected/laporan/')({
  component: LaporanPage,
})
