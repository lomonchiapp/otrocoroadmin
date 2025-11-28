import { createFileRoute } from '@tanstack/react-router'
import { OrderDetailPage } from '@/features/orders/components/order-detail-page'

export const Route = createFileRoute('/_authenticated/orders/$orderId')({
  component: OrderDetailPage,
})
