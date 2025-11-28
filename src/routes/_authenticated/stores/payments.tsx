import { createFileRoute } from '@tanstack/react-router'
import { PaymentsTracking } from '@/features/stores/payments'

export const Route = createFileRoute('/_authenticated/stores/payments')({
  component: PaymentsTracking,
})
