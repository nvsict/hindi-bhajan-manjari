# CODEBASE_MAP.md — hindi-bhajan-manjari

Generated 2026-10-14 from directory tree + 12 targeted file reads. Regenerate only if the structure materially changes.
Files NOT read (inferred from names only): most components, actions, API routes, lib/publication.

## Entry points
- `app/layout.tsx` — root layout: AdSense meta+script, fonts (Hind), header/footer, analytics, global overlays
- `app/page.tsx` — homepage
- `proxy.ts` — Next 16 middleware; protects `/admin/*` (except `/admin/login`) with Supabase `auth.getUser()`
- `next.config.ts` — security headers incl. permissive CSP (`script-src https:`), `images.unoptimized`, remote image hosts
- `app/robots.ts` — allows `/`, disallows `/admin/ /api/ /login /widget/`
- `app/sitemap.ts` — static routes + categories, deities, artists, articles, all bhajans (batched 1000 from `mv_bhajan_details`), revalidate 24h
- `public/ads.txt` — `google.com, pub-9765995147902028, DIRECT, f08c47fec0942fa0`

## Public routes (app/)
| Route | Purpose |
|---|---|
| `/bhajan`, `/bhajan/[slug]` | Lyrics list / detail (server-rendered, JSON-LD graph, FAQ, Bhavarth, comments, related) |
| `/category/[slug]`, `/deity/[slug]`, `/artist/[slug]`, `/author/[slug]` | Browse pages |
| `/gyan`, `/gyan/[slug]`, `/en/gyan/*` | Articles (Hindi + English) |
| `/mere-vichar`, `/mere-vichar/[slug]` | Personal thoughts/blog |
| `/bhagavad-gita/chapter/[n]/verse/[n]` | Gita chapters and verses |
| `/shabdkosh`, `/shabdkosh/[slug]` | Dictionary |
| `/ebook/[slug]`, `/publication-test` | Ebook pages; custom PDF "bhajan diary" builder (client-only, paid) |
| `/about /contact /privacy /terms /dmca /disclaimer` | Trust/legal pages |
| `/donate`, `/donate-for-humanity`, `/supporters`, `/advertise`, `/submit`, `/developers`, `/saved`, `/search` | Monetization, community, utility |
| `/widget/*` | Embeddable widgets (daily-bhajan, embed-lyrics, jaap-mala, mini-search, panchang, whatsapp-status) |
| `/feed.xml`, `/llms.txt`, `manifest.ts` | Feeds / metadata |

## API routes (app/api/)
`admin/generate-pdf`, `auth/login`, `cashfree/{order,redirect}`, `razorpay/{order,verify,webhook,success-redirect}`, `webhooks/cashfree`, `export/pdf`, `fetch-amazon`, `og` (+`og/articles`), `push/{subscribe,broadcast,auto-notify}`, `search`, `supporters/update`

## Admin (app/admin/*)
Bhajan add/edit, articles, artists, affiliates, ebooks, campaigns, newsletter/broadcast, dictionary, supporters, pending submissions, mere-vichar. Server actions in `app/actions/*.ts` and `app/admin/actions.ts`.

## Data layer
- `utils/supabase.ts` (client), `utils/db.ts` (pg), `utils/analytics.ts`
- Tables/views seen in code: `mv_bhajan_details` (bhajan + deity + categories + tags + artists + faqs, pre-joined), `categories`, `deities`, `artists`, `articles`, `subscribers`, `campaign_settings`, `supporters`
- Bhajan fields used: title_hindi, title_hinglish, lyrics_hindi, lyrics_hinglish, explanation, faqs, meta_description, seo_title, alt_queries, video_embed_url, tarj_parody, deity_id

## Key components
Layout/chrome: Header, Footer, ConditionalHeader/Footer, AnnouncementStrip, Sidebar, Breadcrumbs
Lyrics page: LyricsViewer, BhaktiStudio, ReadingTracker, ViewCounter, CommentsSection, CommunityWall, RelatedContent, AuthorBox, AffiliateSlot
Overlays/prompts: CampaignModal, ExitFeedbackManager, DivinePeek, PushPrompt, SlideInPrompt
Tracking: AnalyticsWrapper (GA), ClarityAnalytics, MetaPixel, EngagementTracker

## PDF pipeline
`lib/publication/` — content/selector.ts (builds document), processors/textProcessor.ts, renderers/pdf/{puppeteerRenderer,browserPool,htmlTemplate,theme}.ts, types.ts

## Dependencies (notable)
next 16, react 19, @supabase/ssr, razorpay, @cashfreepayments/cashfree-js, puppeteer, pdf-lib, framer-motion, lenis, tone, web-push, dexie, fuse.js, sanscript
