import { useEffect } from 'react'
import { useSearchStore } from '@/stores/search-store'

export function SearchInitializer() {
  const { toggleOpen } = useSearchStore()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleOpen()
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [toggleOpen])

  return null
}



