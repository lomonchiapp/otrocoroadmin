import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { PosCartItem, PosSession } from '@/types/pos'
import type { Product } from '@/types'

interface PosStoreState {
  // Estado de la sesión
  session: PosSession | null
  setSession: (session: PosSession | null) => void
  
  // Estado del carrito
  cart: PosCartItem[]
  addToCart: (product: Product, variantId?: string) => void
  removeFromCart: (productId: string, variantId: string) => void
  updateQuantity: (productId: string, variantId: string, quantity: number) => void
  updateItemPrice: (productId: string, variantId: string, price: number) => void
  clearCart: () => void
  
  // Estado del cliente
  customer: { id: string; name: string; email?: string } | null
  setCustomer: (customer: { id: string; name: string; email?: string } | null) => void
  
  // Totales
  getCartSubtotal: () => number
  getCartTax: () => number
  getCartTotal: () => number
}

export const usePosStore = create<PosStoreState>()(
  persist(
    (set, get) => ({
      session: null,
      setSession: (session) => set({ session }),
      
      cart: [],
      
      addToCart: (product, variantId) => {
        const { cart } = get()
        // Buscar si ya existe el item
        // Si no hay variante seleccionada, usamos la primera o el producto base
        const selectedVariant = variantId 
          ? product.variants?.find(v => v.id === variantId)
          : product.variants?.[0]
          
        const finalVariantId = selectedVariant?.id || 'base'
        const price = selectedVariant?.price || product.price || 0
        const sku = selectedVariant?.sku || product.slug
        const name = selectedVariant 
          ? `${product.name} - ${selectedVariant.title || selectedVariant.sku}`
          : product.name

        const existingItemIndex = cart.findIndex(
          item => item.productId === product.id && item.variantId === finalVariantId
        )

        if (existingItemIndex >= 0) {
          // Actualizar cantidad
          const updatedCart = [...cart]
          updatedCart[existingItemIndex].quantity += 1
          updatedCart[existingItemIndex].subtotal = updatedCart[existingItemIndex].quantity * updatedCart[existingItemIndex].price
          updatedCart[existingItemIndex].total = updatedCart[existingItemIndex].subtotal // + tax si aplica
          set({ cart: updatedCart })
        } else {
          // Agregar nuevo
          const newItem: PosCartItem = {
            productId: product.id,
            variantId: finalVariantId,
            name,
            sku,
            price,
            originalPrice: price,
            quantity: 1,
            image: product.images?.[0] || '',
            subtotal: price,
            total: price
          }
          set({ cart: [...cart, newItem] })
        }
      },
      
      removeFromCart: (productId, variantId) => {
        set({ 
          cart: get().cart.filter(
            item => !(item.productId === productId && item.variantId === variantId)
          ) 
        })
      },
      
      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, variantId)
          return
        }
        
        set({
          cart: get().cart.map(item => {
            if (item.productId === productId && item.variantId === variantId) {
              return {
                ...item,
                quantity,
                subtotal: item.price * quantity,
                total: item.price * quantity // + tax
              }
            }
            return item
          })
        })
      },

      updateItemPrice: (productId, variantId, price) => {
        set({
          cart: get().cart.map(item => {
            if (item.productId === productId && item.variantId === variantId) {
              return {
                ...item,
                price,
                subtotal: price * item.quantity,
                total: price * item.quantity
              }
            }
            return item
          })
        })
      },
      
      clearCart: () => set({ cart: [], customer: null }),
      
      customer: null,
      setCustomer: (customer) => set({ customer }),
      
      getCartSubtotal: () => get().cart.reduce((sum, item) => sum + item.subtotal, 0),
      getCartTax: () => get().cart.reduce((sum, item) => sum + (item.tax || 0), 0),
      getCartTotal: () => get().cart.reduce((sum, item) => sum + item.total, 0),
    }),
    {
      name: 'pos-storage',
      storage: createJSONStorage(() => sessionStorage), // Usar sessionStorage para limpiar al cerrar pestaña
      partialize: (state) => ({ 
        // Persistir solo sesión y carrito, no acciones
        session: state.session, 
        cart: state.cart,
        customer: state.customer 
      }),
    }
  )
)



