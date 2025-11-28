import { createFileRoute } from '@tanstack/react-router'
import { PosLayout } from '@/features/pos'

export const Route = createFileRoute('/_authenticated/pos/')({
  component: PosLayout,
})
