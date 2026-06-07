import { createFileRoute } from '@tanstack/react-router'
import { KategoriPage } from '../../../pages/kategori/KategoriPage'

export const Route = createFileRoute('/_protected/kategori/')({
  component: KategoriPage,
})
