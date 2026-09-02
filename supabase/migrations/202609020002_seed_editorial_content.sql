-- Move the initial static editorial set into the CMS tables.
-- English-only by design: SmartwatchTimeline does not use the EarbudsTimeline i18n model.

INSERT INTO public.articles (
  id,
  title,
  excerpt,
  content_html,
  status,
  table_of_contents,
  word_count,
  reading_minutes,
  published_at
)
VALUES
(
  'how-smartwatches-evolved',
  'How Smartwatches Evolved: From Notifications to Health Computers',
  'A concise history of the smartwatch category, from early connected watches to today’s health, fitness and cellular platforms.',
  '<h2>The first generation was about the phone</h2><p>Early smartwatches were primarily second screens: notifications, basic controls, alarms and simple apps. Their value came from reducing the number of times you had to take your phone out of your pocket.</p><h2>Fitness changed the category</h2><p>GPS, optical heart-rate sensing and increasingly capable motion sensors turned the watch into a standalone fitness tool. Battery life became a much more important part of the buying decision.</p><h2>Health became a core differentiator</h2><p>ECG, blood-oxygen sensing, sleep tracking and safety features pushed smartwatches beyond convenience. The category increasingly became a continuous sensor platform worn throughout the day.</p><h2>Where the category is going</h2><p>The next phase is less about adding another notification and more about making the accumulated sensor data useful: better recovery insights, more contextual coaching and tighter integration between hardware, software and health services.</p>',
  'published',
  '[{"title":"The first generation was about the phone"},{"title":"Fitness changed the category"},{"title":"Health became a core differentiator"},{"title":"Where the category is going"}]'::jsonb,
  181,
  6,
  '2026-09-02T09:00:00Z'
),
(
  'smartwatch-battery-life-explained',
  'Smartwatch Battery Life Explained: What the Number Really Means',
  'Why advertised battery life can be misleading, and which hardware choices actually determine how often you charge your watch.',
  '<h2>Battery claims are not directly comparable</h2><p>A quoted battery figure depends on display settings, workout frequency, GPS use, cellular connectivity and notification load. Two watches with similar advertised numbers can behave very differently in daily use.</p><h2>The display is one of the biggest variables</h2><p>Always-on displays, high refresh rates and bright outdoor settings increase power consumption. A simpler display can therefore deliver much longer endurance without a larger battery.</p><h2>GPS and cellular change the equation</h2><p>Continuous GPS recording is demanding, while cellular radios can add another significant power cost. If you train for hours or use your watch away from your phone, advertised battery life deserves extra scrutiny.</p><h2>Think in charging cycles, not just hours</h2><p>For sleep tracking, the useful question is whether the watch can comfortably survive a full day and night. A watch with slightly lower headline endurance can be better if it charges quickly during a short daily routine.</p>',
  'published',
  '[{"title":"Battery claims are not directly comparable"},{"title":"The display is one of the biggest variables"},{"title":"GPS and cellular change the equation"},{"title":"Think in charging cycles, not just hours"}]'::jsonb,
  184,
  5,
  '2026-09-01T09:00:00Z'
),
(
  'gps-vs-cellular-smartwatch',
  'GPS vs Cellular on a Smartwatch: Do You Actually Need Both?',
  'GPS and cellular solve completely different problems. Here is when each one matters and when paying extra makes little sense.',
  '<h2>GPS means location without your phone</h2><p>Onboard GPS lets the watch record routes, distance and pace during outdoor activities. It is especially valuable for runners, cyclists and hikers who want reliable tracking without carrying a phone.</p><h2>Cellular means communication without your phone</h2><p>Cellular connectivity is about network access: calls, messages, streaming and selected online functions while your phone is elsewhere. It normally requires a compatible carrier plan and adds both cost and power consumption.</p><h2>Most people do not need cellular</h2><p>If your phone is normally nearby, Bluetooth and Wi-Fi cover most everyday smartwatch tasks. GPS, however, can still be useful even when cellular is unnecessary.</p><h2>Choose based on your routine</h2><p>Prioritize GPS if outdoor training matters. Prioritize cellular if you regularly leave your phone behind and still need communication or connected services.</p>',
  'published',
  '[{"title":"GPS means location without your phone"},{"title":"Cellular means communication without your phone"},{"title":"Most people do not need cellular"},{"title":"Choose based on your routine"}]'::jsonb,
  165,
  5,
  '2026-08-29T09:00:00Z'
),
(
  'what-ecg-smartwatch-really-does',
  'What an ECG Smartwatch Actually Does',
  'ECG is one of the most misunderstood smartwatch features. Here is what the sensor measures and what it does not.',
  '<h2>ECG is electrical, not optical</h2><p>An ECG-capable watch uses electrodes to record electrical activity associated with the heartbeat. That is fundamentally different from optical heart-rate sensing, which estimates pulse using light.</p><h2>It can provide a useful snapshot</h2><p>A compatible ECG feature can help identify certain rhythm patterns and produce a recording that may be useful to discuss with a qualified clinician. It is not the same as continuous clinical monitoring.</p><h2>Availability depends on more than hardware</h2><p>A watch may contain the required electrodes while the feature remains limited by region, regulatory authorization, software version or phone compatibility.</p><h2>Treat it as a screening tool</h2><p>Smartwatch health features can be useful for awareness and screening, but they should not be treated as a diagnosis or a replacement for professional medical evaluation.</p>',
  'published',
  '[{"title":"ECG is electrical, not optical"},{"title":"It can provide a useful snapshot"},{"title":"Availability depends on more than hardware"},{"title":"Treat it as a screening tool"}]'::jsonb,
  174,
  6,
  '2026-08-27T09:00:00Z'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content_html = EXCLUDED.content_html,
  status = EXCLUDED.status,
  table_of_contents = EXCLUDED.table_of_contents,
  word_count = EXCLUDED.word_count,
  reading_minutes = EXCLUDED.reading_minutes,
  published_at = EXCLUDED.published_at,
  updated_at = now();
