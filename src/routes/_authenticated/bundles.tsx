import { createFileRoute } from '@tanstack/react-router'
import BundlesPage from '@/features/bundles'

export const Route = createFileRoute('/_authenticated/bundles')({
  component: BundlesPage,
})





