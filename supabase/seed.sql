-- SmartwatchTimeline — seed data
-- Run after schema.sql. Real models with real specs (as of early-to-mid
-- 2026 knowledge) so the site is genuinely browsable out of the box, not
-- just structurally correct — but check current specs/prices before
-- publishing, since watch prices and exact battery figures drift.

insert into brands (id, name, color) values
  ('apple', 'Apple', '#A2AAAD'),
  ('samsung', 'Samsung', '#1428A0'),
  ('garmin', 'Garmin', '#007CC3'),
  ('fitbit', 'Fitbit', '#00B0B9'),
  ('amazfit', 'Amazfit', '#F65058'),
  ('google', 'Google', '#4285F4')
on conflict (id) do nothing;

insert into smartwatches (
  id, brand_id, gamme, name, tagline, release_date, price, marquant,
  battery_life_h, weight_g, case_size_mm, water_rating, display_type,
  always_on_display, cellular, gps, nfc_payments, ecosystem, os,
  ecg, blood_oxygen, heart_rate, sleep_tracking, rugged, round_face
) values
  ('apple-watch-series-10', 'apple', 'Watch', 'Apple Watch Series 10',
   'The thinnest Apple Watch yet, with a larger always-on display.',
   '2024-09-20', 399, true,
   18, 34.4, 46, '50m (WR50)', 'LTPO OLED',
   true, true, true, true, 'iOS only', 'watchOS',
   true, true, true, true, false, false),

  ('apple-watch-ultra-2', 'apple', 'Watch Ultra', 'Apple Watch Ultra 2',
   'Apple''s rugged, longest-battery-life watch, built for outdoor endurance sports.',
   '2023-09-22', 799, true,
   36, 61.4, 49, '100m (WR100)', 'LTPO OLED',
   true, true, true, true, 'iOS only', 'watchOS',
   true, true, true, true, true, false),

  ('galaxy-watch-7', 'samsung', 'Galaxy Watch', 'Samsung Galaxy Watch 7',
   'Samsung''s mainstream smartwatch with a faster chip and improved sleep coaching.',
   '2024-07-24', 299, true,
   30, 33.8, 44, '5 ATM + IP68', 'Super AMOLED',
   true, true, true, true, 'Android (best with Samsung)', 'Wear OS',
   true, true, true, true, false, true),

  ('galaxy-watch-ultra', 'samsung', 'Galaxy Watch Ultra', 'Samsung Galaxy Watch Ultra',
   'Samsung''s rugged flagship, aimed directly at Apple Watch Ultra.',
   '2024-07-24', 649, true,
   100, 60.5, 47, '10 ATM + IP68', 'Super AMOLED',
   true, true, true, true, 'Android (best with Samsung)', 'Wear OS',
   true, true, true, true, true, true),

  ('garmin-fenix-8', 'garmin', 'Fenix', 'Garmin Fenix 8',
   'Garmin''s premium multisport watch, with a bright AMOLED display option.',
   '2024-08-27', 999, true,
   48, 68, 47, '10 ATM', 'AMOLED',
   true, false, true, false, 'iOS + Android', 'Garmin OS',
   true, true, true, true, true, true),

  ('garmin-instinct-3', 'garmin', 'Instinct', 'Garmin Instinct 3',
   'Garmin''s rugged, long-battery-life watch with a solar charging option.',
   '2025-01-15', 349, false,
   28, 52, 45, '10 ATM', 'MIP',
   true, false, true, false, 'iOS + Android', 'Garmin OS',
   false, true, true, true, true, true),

  ('fitbit-versa-4', 'fitbit', 'Versa', 'Fitbit Versa 4',
   'Fitbit''s mainstream fitness smartwatch with built-in GPS.',
   '2022-09-23', 199, false,
   144, 37, 40, '50m', 'AMOLED',
   false, false, true, true, 'iOS + Android', 'Fitbit OS',
   false, true, true, true, false, true),

  ('amazfit-gtr-4', 'amazfit', 'GTR', 'Amazfit GTR 4',
   'A budget-friendly smartwatch with a surprisingly long battery life.',
   '2022-11-16', 199, false,
   168, 32, 46, '5 ATM', 'AMOLED',
   true, false, true, false, 'iOS + Android', 'Zepp OS',
   false, true, true, true, false, true),

  ('google-pixel-watch-3', 'google', 'Pixel Watch', 'Google Pixel Watch 3',
   'Google''s own smartwatch, deeply integrated with Android and Fitbit.',
   '2024-10-10', 349, true,
   36, 36, 45, '5 ATM + IP68', 'LTPO OLED',
   true, true, true, true, 'Android only', 'Wear OS',
   true, true, true, true, false, true)
on conflict (id) do nothing;

-- Example multi-vendor links — replace with your real affiliate URLs.
-- vendor codes match components/VendorButtons.js:VENDOR_STYLE.
insert into product_links (smartwatch_id, vendor, vendor_label, url, price, priority) values
  ('apple-watch-series-10', 'amazon', 'Amazon', 'https://www.amazon.com/dp/REPLACE_ME?tag=your-affiliate-tag', 399, 1),
  ('apple-watch-series-10', 'best_buy', 'Best Buy', 'https://www.bestbuy.com/site/REPLACE_ME', 399, 2),
  ('galaxy-watch-7', 'amazon', 'Amazon', 'https://www.amazon.com/dp/REPLACE_ME?tag=your-affiliate-tag', 299, 1),
  ('galaxy-watch-7', 'samsung_store', 'Samsung', 'https://www.samsung.com/us/REPLACE_ME', 299, 2),
  ('garmin-fenix-8', 'amazon', 'Amazon', 'https://www.amazon.com/dp/REPLACE_ME?tag=your-affiliate-tag', 999, 1),
  ('garmin-fenix-8', 'garmin_store', 'Garmin', 'https://www.garmin.com/en-US/p/REPLACE_ME', 999, 2)
on conflict (smartwatch_id, vendor) do nothing;
