# SmartwatchTimeline

Adapted from [EarbudsTimeline](https://earbudstimeline.com)'s architecture. Three deliberate differences, agreed before writing any code:

1. **English-only.** No next-intl, no `[locale]` route segment, no bilingual content objects. Admin/back-office can stay in French if that's faster to build — the public site has no language dimension at all.
2. **One guide system, not two.** EarbudsTimeline grew a hand-coded static page per "pillar" guide (`app/[locale]/guides/<slug>/page.js`) alongside a generic `GUIDE_PAGES` array, and the two silently duplicated each other's search intent on **6 separate guides** before being caught. Here, `lib/guidePages.js` is the only guide system, from the first guide onward.
3. **Multi-vendor "Check Price" buttons.** `product_links` is a proper one-to-many table (model → vendor) from the start, not a single `buy_url` column retrofitted later. See `components/VendorButtons.js`.

## What's included

- Supabase schema (`supabase/schema.sql`) + seed data for 9 real models across 6 brands (`supabase/seed.sql`)
- Model detail pages with full spec tables and multi-vendor buy buttons
- Brand hub pages
- Unified guide system with 8 starter guides sourced from real SEMrush keyword data (price tiers, running, sleep tracking, seniors, rugged, and an Apple Watch vs Galaxy Watch editorial comparison)
- A comparison tool (`/comparisons/[a]-vs-[b]`) — **bounded by design**, see below
- A simple chronological timeline (`/timeline`)
- A simple two-model compare picker (`/compare`)
- Sitemap, robots.txt (blocks the same AI-crawler list as EarbudsTimeline), JSON-LD (Product, Article, CollectionPage)

## The comparison-route fix, baked in from day one

While auditing EarbudsTimeline this same week, we found its comparison route had no `generateStaticParams` and accepted *any* two model IDs as a valid pair, rendered fresh on first request. With ~2,000 pairs reachable via internal links, crawlers alone generated hundreds of thousands of cold server-side renders — nothing to do with real visitors, but very real Vercel usage cost.

Here, `lib/comparisonPairs.js` computes a bounded set of valid pairs (adjacent generations within the same product line, plus any manually curated cross-brand rivalries you add) at build time, and `app/comparisons/[slug]/page.js` sets `dynamicParams = false`. Any pair outside that set 404s instead of rendering. Add real rivalries (e.g. current-flagship vs current-flagship) to `RIVALRY_PAIRS` in that file as they become editorially worth a page.

## What's deliberately NOT included (v2 candidates, not oversights)

- **Rich interactive timeline charts.** EarbudsTimeline's `/timeline` has an `EvolutionExplorer` and `BrandComparisonChart` (client components charting battery/weight/price trends over time). This scaffold's `/timeline` is a plain chronological list — genuinely useful, but building interactive charts against 9 seed rows isn't a good use of time. Worth porting once there's real catalog depth.
- **Quiz-style finder tool.** EarbudsTimeline's `TimelineIntelligenceFinder` is ~480 lines of guided recommendation logic. `/compare` here is a straightforward two-model picker. A real recommendation engine is a good v2, tuned against real data rather than placeholders.
- **Blog / CMS / admin dashboard / newsletter / search.** EarbudsTimeline has all of these; none are in this scaffold. Add them the same way they were built there once the core catalog is populated and worth writing about.
- **Analytics / ad scripts.** `app/layout.js` has a comment marking where these go — no placeholder tracking IDs, since a fake ID fails silently instead of erroring, which is worse than just not having it yet.
- **Custom image loader.** EarbudsTimeline needed one after hitting Vercel's free Image Optimization quota (1,000 source images/month) once real traffic arrived. Not built preemptively here against zero real images — see the comment in `next.config.mjs` for the pointer if/when it's needed.

## Vendor links: what to check before going live

`components/VendorButtons.js` has built-in styling for Amazon, Best Buy, Walmart, Garmin Store, Samsung Store, and Apple Store. Before wiring up anything beyond Amazon:

- Best Buy and Walmart affiliate programs run through Impact/Rakuten and typically require a US bank account or tax ID for payout — confirm eligibility before building UI around a vendor you can't actually get paid by.
- Garmin and Samsung both run their own affiliate programs, usually via Awin or CJ.
- `product_links.rel_sponsored` defaults to `true`, which sets `rel="sponsored"` on every vendor link — required by Google's guidelines for paid/affiliate links, already handled for you.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key
# run supabase/schema.sql then supabase/seed.sql in the Supabase SQL editor
npm run dev
```

## A note on the Next.js version

Pinned to `14.2.35`, the patched release for the December 2025 Next.js/React Server Components security advisories — not copied from EarbudsTimeline's `14.2.15`, which predates the patch and was flagged with a known vulnerability during that project's own `npm install`.
# smartwatchtimeline
