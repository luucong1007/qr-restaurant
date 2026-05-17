-- Chạy trong Supabase SQL Editor
alter table branches add column if not exists latitude double precision;
alter table branches add column if not exists longitude double precision;
