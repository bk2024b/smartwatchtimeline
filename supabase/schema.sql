-- SmartwatchTimeline — Supabase schema
-- Adapted from EarbudsTimeline's schema. Two structural changes from that
-- project, both decided upfront based on lessons learned building it:
--
-- 1. No bilingual columns (tagline_en, etc.) — this site is English-only.
--    The admin/back-office UI can stay in French; the public schema does not
--    need a language dimension at all.
--
-- 2. `buy_url` (a single link per model) is replaced by a proper `product_links`
--    table, one row per (model, vendor). EarbudsTimeline started with a single
--    Amazon link per model and that was fine — but this project explicitly
--    wants a "Check Price" button per vendor from day one, so the one-to-many
--    relationship is modeled from the start instead of retrofitted later.

create table if not exists brands (
  id text primary key,
  name text not null,
  color text not null
);

create table if not exists smartwatches (
  id text primary key,
  brand_id text not null references brands(id) on delete cascade,
  gamme text not null,              -- product line, e.g. "Watch", "Fenix", "Galaxy Watch"
  name text not null,
  tagline text not null,
  release_date date not null,
  price numeric,                    -- launch MSRP, for the price-tier guides
  marquant boolean not null default false,  -- "landmark model" flag, same role as in earbuds

  -- Core specs
  battery_life_h numeric not null,          -- typical daily-use battery life
  battery_life_h_saver numeric,             -- battery-saver / low-power mode, if documented
  charging_time_h numeric,
  weight_g numeric not null,
  case_size_mm numeric,                     -- diameter or width, whichever the model uses
  water_rating text not null default 'Not rated',   -- e.g. "5 ATM", "IP68", "50m"
  display_type text,                        -- "AMOLED", "LTPO OLED", "MIP", "Retina LTPO", ...
  always_on_display boolean not null default false,

  -- Connectivity / platform
  cellular boolean not null default false,   -- has an LTE/cellular variant
  gps boolean not null default false,
  nfc_payments boolean not null default false,
  ecosystem text,                            -- "iOS only", "Android only", "iOS + Android", ...
  os text,                                   -- "watchOS", "Wear OS", "Garmin OS", proprietary, ...

  -- Health & fitness sensors
  ecg boolean not null default false,
  blood_oxygen boolean not null default false,
  heart_rate boolean not null default true,
  sleep_tracking boolean not null default true,
  gps_sports_modes integer,                  -- rough count of tracked sport profiles, if documented

  -- Standard DATA V1 — optional fields, same idea as EarbudsTimeline's
  -- extended standard: absent just means empty, nothing breaks without them.
  family text,
  generation text,
  variant text,
  announcement_date date,
  status text not null default 'released',   -- released | announced | discontinued
  rugged boolean not null default false,
  round_face boolean not null default false, -- vs. square/rectangular — a real recurring search intent
  image_url text,
  image_count integer not null default 0,
  source_primary text,
  source_secondary text,
  source_checked_at date,
  data_confidence text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_smartwatches_brand on smartwatches(brand_id);
create index if not exists idx_smartwatches_release on smartwatches(release_date);

-- One row per (model, vendor). This is the multi-vendor "Check Price" system.
create table if not exists product_links (
  id bigint generated always as identity primary key,
  smartwatch_id text not null references smartwatches(id) on delete cascade,
  vendor text not null,             -- 'amazon' | 'best_buy' | 'walmart' | 'garmin_store' | 'samsung_store' | ...
  vendor_label text not null,       -- display label, e.g. "Amazon", "Best Buy"
  url text not null,
  price numeric,                    -- last-known price at this vendor, nullable (not always tracked)
  currency text not null default 'USD',
  is_affiliate boolean not null default true,
  rel_sponsored boolean not null default true,  -- controls rel="sponsored" on the outbound link
  priority integer not null default 0,          -- display order among a model's vendor buttons
  last_checked_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_product_links_watch on product_links(smartwatch_id);
create unique index if not exists idx_product_links_watch_vendor on product_links(smartwatch_id, vendor);

-- Newsletter — kept identical in shape to EarbudsTimeline's, no schema reason to change it.
create table if not exists newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);
