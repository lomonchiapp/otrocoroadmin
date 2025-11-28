// Tipos para configuración de bancos y cuentas bancarias

export interface Bank {
  id: string
  name: string
  code: string // Código del banco (ej: "BHD", "BANRESERVAS")
  logo?: string
  isActive: boolean
  accounts: BankAccount[]
  createdAt: Date
  updatedAt: Date
}

export interface BankAccount {
  id: string
  bankId: string
  accountNumber: string
  accountType: 'checking' | 'savings'
  accountHolder: string
  currency: 'DOP' | 'USD'
  isActive: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Tipos para operaciones con bancos
export interface BankCreateInput {
  name: string
  code: string
  logo?: string
  isActive?: boolean
}

export interface BankAccountCreateInput {
  bankId: string
  accountNumber: string
  accountType: 'checking' | 'savings'
  accountHolder: string
  currency: 'DOP' | 'USD'
  isActive?: boolean
  notes?: string
}

export interface BankUpdateInput {
  name?: string
  code?: string
  logo?: string
  isActive?: boolean
}

export interface BankAccountUpdateInput {
  accountNumber?: string
  accountType?: 'checking' | 'savings'
  accountHolder?: string
  currency?: 'DOP' | 'USD'
  isActive?: boolean
  notes?: string
}



