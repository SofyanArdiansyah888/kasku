import { createFileRoute } from '@tanstack/react-router'
import { AnggaranPage } from '../../../pages/anggaran/AnggaranPage'

export const Route = createFileRoute('/_protected/anggaran/')({
  component: AnggaranPage,
})
