export type UserRole = 'super_admin' | 'branch_admin' | 'cashier' | 'kitchen'

export interface Branch {
  id: string
  name: string
  slug: string
  address: string
  phone: string
  is_active: boolean
  created_at: string
}

export interface Table {
  id: string
  branch_id: string
  number: string
  name: string
  capacity: number
  is_active: boolean
  qr_code?: string
  created_at: string
}

export interface Category {
  id: string
  branch_id: string
  name: string
  sort_order: number
  is_active: boolean
}

export interface MenuItem {
  id: string
  branch_id: string
  category_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  is_available: boolean
  sort_order: number
  category?: Category
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled'
export type PaymentMethod = 'cash' | 'vietqr' | 'momo' | 'zalopay' | 'stripe'
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'

export interface Order {
  id: string
  branch_id: string
  table_id: string
  session_id: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method?: PaymentMethod
  note?: string
  total_amount: number
  created_at: string
  updated_at: string
  table?: Table
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  subtotal: number
  note?: string
  menu_item?: MenuItem
}

export interface StaffCall {
  id: string
  branch_id: string
  table_id: string
  session_id: string
  message: string
  is_resolved: boolean
  created_at: string
  table?: Table
}

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  branch_id?: string
}

export interface CartItem {
  menu_item: MenuItem
  quantity: number
  note?: string
}
