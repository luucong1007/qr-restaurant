import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, MenuItem } from '@/types'

interface CartStore {
  items: CartItem[]
  sessionId: string
  addItem: (menuItem: MenuItem, note?: string) => void
  removeItem: (menuItemId: string) => void
  updateQty: (menuItemId: string, qty: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      sessionId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,

      addItem: (menuItem, note) => set((state) => {
        const existing = state.items.find(i => i.menu_item.id === menuItem.id)
        if (existing) {
          return {
            items: state.items.map(i =>
              i.menu_item.id === menuItem.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          }
        }
        return { items: [...state.items, { menu_item: menuItem, quantity: 1, note }] }
      }),

      removeItem: (menuItemId) => set((state) => ({
        items: state.items.filter(i => i.menu_item.id !== menuItemId),
      })),

      updateQty: (menuItemId, qty) => set((state) => {
        if (qty <= 0) return { items: state.items.filter(i => i.menu_item.id !== menuItemId) }
        return {
          items: state.items.map(i =>
            i.menu_item.id === menuItemId ? { ...i, quantity: qty } : i
          ),
        }
      }),

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.menu_item.price * i.quantity, 0),
    }),
    { name: 'qr-cart' }
  )
)
