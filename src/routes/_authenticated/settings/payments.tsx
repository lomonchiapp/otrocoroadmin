import { createFileRoute } from '@tanstack/react-router'
import { PaymentMethodsConfig } from '@/features/settings/payments'

export const Route = createFileRoute('/_authenticated/settings/payments')({
  component: PaymentMethodsConfig,
})
