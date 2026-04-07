import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartItem {
  id: string
  productId: string
  variantId: string
  title: string
  thumbnail: string | null
  price: number
  quantity: number
  size?: string
  color?: string
}

interface CartState {
  cartId: string | null
  items: CartItem[]
  total: number
  isOpen: boolean
  setCartId: (id: string) => void
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      items: [],
      total: 0,
      isOpen: false,

      setCartId: (id) => set({ cartId: id }),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === item.variantId
          )
          if (existing) {
            const items = state.items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
            return {
              items,
              total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
            }
          }
          const items = [...state.items, item]
          return {
            items,
            total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
          }
        }),

      removeItem: (id) =>
        set((state) => {
          const items = state.items.filter((i) => i.id !== id)
          return {
            items,
            total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
          }
        }),

      updateQuantity: (id, quantity) =>
        set((state) => {
          const items = state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          )
          return {
            items,
            total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
          }
        }),

      clearCart: () => set({ items: [], total: 0, cartId: null }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "fabric-cart",
      partialize: (state) => ({
        cartId: state.cartId,
        items: state.items,
        total: state.total,
      }),
    }
  )
)
