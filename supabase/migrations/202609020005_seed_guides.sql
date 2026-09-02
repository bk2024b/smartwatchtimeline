INSERT INTO public.guides (
  slug, priority, category, icon, title, description, intro, sections, faq, filter, sort, brand_compare, status, published_at
) VALUES
(
  'best-smartwatch-under-100', 0.90, 'Budget', '💰',
  'Best Smartwatch Under $100',
  'The best wireless smartwatches you can buy for $100 or less, compared on battery life, tracking accuracy and build quality.',
  'A $100 ceiling still covers a wide range of smartwatches, from basic fitness trackers with a watch face to genuinely capable health-tracking devices. The right pick depends on which sensors and features you will actually use.',
  '[["What to prioritize under $100", "At this price, battery life and sensor accuracy vary more than the spec sheet suggests. Prioritize what you will use daily — heart rate and sleep tracking matter more than rarely-used extras."], ["What you typically give up", "Cellular connectivity, ECG, and premium display technology (LTPO AMOLED) are usually reserved for higher price tiers. Most models here rely on a paired phone for notifications and GPS."], ["Battery life varies a lot at this price", "Budget doesn''t always mean lower battery life — some inexpensive models with simpler displays last considerably longer than pricier AMOLED watches."]]'::jsonb,
  '[["Are cheap smartwatches accurate for heart rate?", "Accuracy varies by model more than by price alone — check for models with a dedicated, documented heart-rate sensor rather than a bare ''heart rate'' checkbox."], ["Do budget smartwatches work with both iPhone and Android?", "Most do for basic notifications, but deeper integration (like Siri or Google Assistant access) is usually limited outside a brand''s own ecosystem."]]'::jsonb,
  '{"field":"price","operator":"lte","value":100}'::jsonb,
  '{"field":"battery_life_h","direction":"desc"}'::jsonb,
  NULL, 'published', now()
),
(
  'best-smartwatch-under-200', 0.90, 'Budget', '💰',
  'Best Smartwatch Under $200',
  'Smartwatches under $200 with AMOLED displays, GPS and multi-day battery life become common at this price.',
  'Under $200 is where AMOLED displays, onboard GPS and genuinely useful health tracking stop being the exception. This is the range where most people find their best fit between features and price.',
  '[["What this budget typically buys", "Expect a bright AMOLED or similar display, onboard GPS, and several days of battery life on most models in this range."], ["Cellular is still mostly absent", "A dedicated cellular variant, when available at all in this range, is usually a separate SKU at a premium over the Bluetooth-only version."]]'::jsonb,
  '[]'::jsonb,
  '{"field":"price","operator":"lte","value":200}'::jsonb,
  '{"field":"battery_life_h","direction":"desc"}'::jsonb,
  NULL, 'published', now()
),
(
  'best-budget-smartwatch', 0.85, 'Budget', '💰',
  'Best Budget Smartwatch',
  'Strong smartwatches for people who want to spend less, ranked by battery life and sensor completeness rather than price alone.',
  'The best budget smartwatch is not simply the cheapest one — it is the one that keeps the sensors and battery life you will actually use while cutting the extras you will not.',
  '[["Battery life over brand", "A watch you have to charge every night defeats the point of sleep tracking. At the budget end, battery life differences matter more than brand name."], ["Check sensor completeness, not just the price tag", "Some inexpensive models cut heart-rate accuracy or drop blood-oxygen sensing entirely — check what is actually onboard before assuming a budget model has everything a pricier one does."]]'::jsonb,
  '[]'::jsonb,
  '{"field":"price","operator":"lte","value":150}'::jsonb,
  '{"field":"price","direction":"asc"}'::jsonb,
  NULL, 'published', now()
),
(
  'rugged-smartwatches', 0.80, 'Outdoor', '🛡️',
  'Best Rugged Smartwatches',
  'Smartwatches built for real durability — reinforced cases, high water and shock resistance — rather than a merely fashionable fitness tracker.',
  '''Rugged'' means more than a sporty look. This guide only includes models with a genuinely reinforced case and a water/shock rating built for outdoor and work use, not everyday commuting.',
  '[["What \"rugged\" should actually mean", "Look for a documented shock rating (often a military-standard reference) alongside water resistance — a high water rating alone does not make a watch rugged."], ["Trade-offs to expect", "Rugged builds are usually heavier and thicker than mainstream smartwatches, and displays sometimes prioritize outdoor visibility over color depth."]]'::jsonb,
  '[]'::jsonb,
  '{"field":"rugged","operator":"eq","value":true}'::jsonb,
  '{"field":"battery_life_h","direction":"desc"}'::jsonb,
  NULL, 'published', now()
),
(
  'best-smartwatch-for-running', 0.85, 'Fitness', '🏃',
  'Best Smartwatch for Running',
  'Smartwatches with accurate onboard GPS and running-specific metrics, for training without carrying a phone.',
  'Running puts specific demands on a smartwatch: standalone GPS accuracy, a display readable mid-stride, and enough battery to survive a long run without a mid-session recharge.',
  '[["Onboard GPS matters most here", "A watch that needs your phone for GPS defeats the point of running with just a watch. This guide only includes models with GPS built into the watch itself."], ["Battery life for long runs", "A marathon or ultra-distance training block needs meaningfully more battery headroom than daily step-counting."]]'::jsonb,
  '[]'::jsonb,
  '{"field":"gps","operator":"eq","value":true}'::jsonb,
  '{"field":"battery_life_h","direction":"desc"}'::jsonb,
  NULL, 'published', now()
),
(
  'best-smartwatch-for-sleep-tracking', 0.80, 'Health', '😴',
  'Best Smartwatch for Sleep Tracking',
  'Smartwatches comfortable and light enough to wear overnight, with battery life that survives a full day plus the night.',
  'Sleep tracking has a requirement most other smartwatch use cases do not: you actually have to wear the thing to bed, every night, which rules out anything heavy, bulky, or that needs a nightly charge.',
  '[["Weight matters more than for daytime use", "A watch that is comfortable on your wrist all day can still be too bulky to sleep in comfortably. Lighter models are listed first here."], ["Battery life has to cover day AND night", "If a watch barely makes it through a waking day, it will not survive a full 24-hour cycle including sleep — you''ll end up removing it to charge exactly when you need it tracking."]]'::jsonb,
  '[]'::jsonb,
  '{"field":"sleep_tracking","operator":"eq","value":true}'::jsonb,
  '{"field":"weight_g","direction":"asc","then":{"field":"battery_life_h","direction":"desc"}}'::jsonb,
  NULL, 'published', now()
),
(
  'best-smartwatch-for-seniors', 0.75, 'Health', '❤️',
  'Best Smartwatch for Seniors',
  'Smartwatches with simple interfaces, larger displays, and genuinely useful safety features like fall detection and ECG.',
  'The best smartwatch for an older adult usually is not the most feature-packed one — it is the one with a legible display, a simple interface, and safety features that matter, like fall detection or ECG.',
  '[["Legibility over feature count", "A large, high-contrast always-on display matters more here than a long list of sport modes most people will never open."], ["Safety features worth checking for", "ECG and fall detection are the two features most worth prioritizing for this use case specifically — not every smartwatch includes either."]]'::jsonb,
  '[]'::jsonb,
  '{"any":[{"field":"always_on_display","operator":"eq","value":true},{"field":"ecg","operator":"eq","value":true}]}'::jsonb,
  '{"field":"ecg","direction":"desc","then":{"field":"battery_life_h","direction":"desc"}}'::jsonb,
  NULL, 'published', now()
),
(
  'apple-watch-vs-galaxy-watch', 0.85, 'Comparison', '⚔️',
  'Apple Watch vs Galaxy Watch: Which Should You Buy?',
  'A comparison of Apple Watch and Samsung Galaxy Watch lines — ecosystem lock-in, health features, and what each is actually built for.',
  'The honest answer to ''Apple Watch or Galaxy Watch'' is usually decided before you even compare specs: it depends entirely on which phone is in your pocket. Both largely require their matching ecosystem to work fully.',
  '[["Ecosystem lock-in is the real deciding factor", "Apple Watch requires an iPhone to set up and use at all. Galaxy Watch works best with a Samsung phone and has reduced functionality on other Android phones or iPhone."], ["Where the two actually differ on hardware", "Beyond ecosystem, the two lines tend to trade off differently on always-on display efficiency, rotating bezel/crown input, and third-party app selection."]]'::jsonb,
  '[["Can a Galaxy Watch work with an iPhone?", "Not fully — core health and notification features require an Android phone, and Samsung phones specifically for the deepest integration."]]'::jsonb,
  NULL,
  '{"field":"release_date","direction":"desc"}'::jsonb,
  ARRAY['apple','samsung'], 'published', now()
)
ON CONFLICT (slug) DO UPDATE SET
  priority = EXCLUDED.priority,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  intro = EXCLUDED.intro,
  sections = EXCLUDED.sections,
  faq = EXCLUDED.faq,
  filter = EXCLUDED.filter,
  sort = EXCLUDED.sort,
  brand_compare = EXCLUDED.brand_compare,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  updated_at = now();
