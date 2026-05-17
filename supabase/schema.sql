-- ====================================================
-- QR Restaurant Schema
-- Chạy file này trong Supabase SQL Editor
-- ====================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ====================================================
-- BRANCHES (chi nhánh)
-- ====================================================
create table branches (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,  -- dùng cho URL: /{slug}/table/{tableId}
  address text,
  phone text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ====================================================
-- TABLES (bàn)
-- ====================================================
create table tables (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid not null references branches(id) on delete cascade,
  number text not null,       -- số bàn (1, 2, 3...)
  name text not null,         -- tên hiển thị (Bàn 1, Bàn VIP...)
  capacity int default 4,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(branch_id, number)
);

-- ====================================================
-- CATEGORIES (danh mục món)
-- ====================================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid not null references branches(id) on delete cascade,
  name text not null,
  sort_order int default 0,
  is_active boolean default true
);

-- ====================================================
-- MENU ITEMS (món ăn)
-- ====================================================
create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid not null references branches(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(12, 0) not null,
  image_url text,
  is_available boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ====================================================
-- ORDERS (đơn hàng)
-- ====================================================
create type order_status as enum (
  'pending', 'confirmed', 'preparing', 'ready', 'served', 'paid', 'cancelled'
);
create type payment_method as enum (
  'cash', 'vietqr', 'momo', 'zalopay', 'stripe'
);
create type payment_status as enum (
  'unpaid', 'pending', 'paid', 'failed', 'refunded'
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid not null references branches(id),
  table_id uuid not null references tables(id),
  session_id text not null,       -- mỗi lần khách ngồi = 1 session
  status order_status default 'pending',
  payment_status payment_status default 'unpaid',
  payment_method payment_method,
  note text,
  total_amount numeric(12, 0) not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ====================================================
-- ORDER ITEMS (chi tiết đơn)
-- ====================================================
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid not null references menu_items(id),
  quantity int not null default 1,
  unit_price numeric(12, 0) not null,
  subtotal numeric(12, 0) not null,
  note text,
  created_at timestamptz default now()
);

-- ====================================================
-- STAFF CALLS (gọi nhân viên)
-- ====================================================
create table staff_calls (
  id uuid primary key default uuid_generate_v4(),
  branch_id uuid not null references branches(id),
  table_id uuid not null references tables(id),
  session_id text not null,
  message text default 'Khách cần hỗ trợ',
  is_resolved boolean default false,
  created_at timestamptz default now()
);

-- ====================================================
-- PROFILES (nhân viên)
-- ====================================================
create type user_role as enum (
  'super_admin', 'branch_admin', 'cashier', 'kitchen'
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role user_role default 'cashier',
  branch_id uuid references branches(id)
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- ====================================================
-- ROW LEVEL SECURITY
-- ====================================================
alter table branches enable row level security;
alter table tables enable row level security;
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table staff_calls enable row level security;
alter table profiles enable row level security;

-- Public read (khách hàng không cần login)
create policy "public_read_branches" on branches for select using (is_active = true);
create policy "public_read_tables" on tables for select using (is_active = true);
create policy "public_read_categories" on categories for select using (is_active = true);
create policy "public_read_menu_items" on menu_items for select using (is_available = true);

-- Khách hàng tạo order/order_item/staff_call (không cần login)
create policy "public_insert_orders" on orders for insert with check (true);
create policy "public_read_own_orders" on orders for select using (true);
create policy "public_insert_order_items" on order_items for insert with check (true);
create policy "public_read_order_items" on order_items for select using (true);
create policy "public_insert_staff_calls" on staff_calls for insert with check (true);

-- Staff (đã đăng nhập)
create policy "staff_all_orders" on orders for all using (auth.role() = 'authenticated');
create policy "staff_all_staff_calls" on staff_calls for all using (auth.role() = 'authenticated');
create policy "staff_all_menu" on menu_items for all using (auth.role() = 'authenticated');
create policy "staff_all_categories" on categories for all using (auth.role() = 'authenticated');
create policy "staff_all_tables" on tables for all using (auth.role() = 'authenticated');
create policy "staff_all_branches" on branches for all using (auth.role() = 'authenticated');
create policy "own_profile" on profiles for all using (auth.uid() = id);

-- Realtime
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table staff_calls;
alter publication supabase_realtime add table order_items;

-- ====================================================
-- SEED DATA (dữ liệu mẫu)
-- ====================================================
insert into branches (name, slug, address, phone) values
  ('Quán Ngon Q1', 'quan-ngon-q1', '123 Nguyễn Huệ, Q1, TP.HCM', '028-1234-5678'),
  ('Quán Ngon Q7', 'quan-ngon-q7', '456 Nguyễn Thị Thập, Q7, TP.HCM', '028-8765-4321');

-- Bàn cho chi nhánh Q1
insert into tables (branch_id, number, name, capacity)
select id, t.number, 'Bàn ' || t.number, 4
from branches, (values ('1'),('2'),('3'),('4'),('5'),('6'),('7'),('8'),('9'),('10')) as t(number)
where slug = 'quan-ngon-q1';

-- Bàn cho chi nhánh Q7
insert into tables (branch_id, number, name, capacity)
select id, t.number, 'Bàn ' || t.number, 4
from branches, (values ('1'),('2'),('3'),('4'),('5'),('6')) as t(number)
where slug = 'quan-ngon-q7';

-- Danh mục Q1
insert into categories (branch_id, name, sort_order)
select id, cat.name, cat.ord from branches,
  (values ('Khai vị', 1), ('Món chính', 2), ('Đồ uống', 3), ('Tráng miệng', 4)) as cat(name, ord)
where slug = 'quan-ngon-q1';

-- Món ăn mẫu Q1
insert into menu_items (branch_id, category_id, name, description, price, sort_order)
select
  b.id,
  c.id,
  m.name,
  m.descr,
  m.price,
  m.ord
from branches b
join categories c on c.branch_id = b.id
cross join (values
  ('Khai vị', 'Gỏi cuốn tôm thịt', 'Gỏi cuốn tươi ngon, chấm tương đậu phộng', 35000, 1),
  ('Khai vị', 'Chả giò chiên', 'Giòn tan, nhân thịt heo nấm', 40000, 2),
  ('Món chính', 'Phở bò tái nạm', 'Nước dùng xương hầm 12 tiếng', 75000, 1),
  ('Món chính', 'Bún bò Huế', 'Cay thơm đặc trưng xứ Huế', 70000, 2),
  ('Món chính', 'Cơm sườn nướng', 'Sườn nướng than hoa, cơm trắng', 85000, 3),
  ('Đồ uống', 'Trà đá', 'Trà thơm mát lạnh', 10000, 1),
  ('Đồ uống', 'Nước cam tươi', 'Cam vắt tươi 100%', 35000, 2),
  ('Đồ uống', 'Cà phê sữa đá', 'Cà phê phin truyền thống', 30000, 3),
  ('Tráng miệng', 'Chè đậu xanh', 'Chè đậu xanh đánh, nước cốt dừa', 25000, 1),
  ('Tráng miệng', 'Bánh flan', 'Mềm mịn, vị caramel', 30000, 2)
) as m(cat_name, name, descr, price, ord)
where b.slug = 'quan-ngon-q1'
  and c.name = m.cat_name;
