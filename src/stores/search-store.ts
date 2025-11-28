import { create } from 'zustand'

interface SearchState {
  open: boolean
  setOpen: (open: boolean) => void
  toggleOpen: () => void
}

export const useSearchStore = create<SearchState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggleOpen: () => set((state) => ({ open: !state.open })),
}))



