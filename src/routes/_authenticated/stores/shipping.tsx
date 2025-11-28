import { createFileRoute } from '@tanstack/react-router'
import { ShippingTracking } from '@/features/stores/shipping'

export const Route = createFileRoute('/_authenticated/stores/shipping')({
  component: ShippingTracking,
})
