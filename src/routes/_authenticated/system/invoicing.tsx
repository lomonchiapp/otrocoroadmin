import { createFileRoute } from '@tanstack/react-router'
import { InvoicingConfig } from '@/features/system/invoicing'

export const Route = createFileRoute('/_authenticated/system/invoicing')({
  component: InvoicingConfig,
})
