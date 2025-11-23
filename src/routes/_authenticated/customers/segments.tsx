import { createFileRoute } from '@tanstack/react-router'
import { CustomerSegments } from '@/features/customers/components/customer-segments'

export const Route = createFileRoute('/_authenticated/customers/segments')({
  component: CustomerSegments,
})





