import { createFileRoute } from '@tanstack/react-router'
import { PaymentMethodsConfig } from '@/features/system/payment-methods'

export const Route = createFileRoute('/_authenticated/system/payment-methods')({
  component: PaymentMethodsConfig,
})
