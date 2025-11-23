import { createFileRoute } from '@tanstack/react-router'
import { SellerDetailPage } from '@/features/users/components/seller-detail-page'

export const Route = createFileRoute('/_authenticated/users/$sellerId')({
  component: SellerDetailPage,
})




