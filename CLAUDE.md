# CLAUDE.md — hindibhajanmanjari.com

Hindi devotional lyrics site (bhajan, aarti, chalisa) with meanings, PDF export, donations, admin panel.
Operator: Mohit (sole developer). Detailed map: `CODEBASE_MAP.md` — read it instead of re-scanning the repo.

## Stack
- Next.js 16 (App Router) + React 19 + Tailwind 4, TypeScript (`ignoreBuildErrors: true` in next.config.ts)
- Supabase (data via `utils/supabase.ts`; pg client in `utils/db.ts`). Main read model: materialized view `mv_bhajan_details`
- Payments: Razorpay + Cashfree. PDF export: Puppeteer (`lib/publication/`)
- Analytics: GA (`G-LVXN7TD3JB`), Clarity, Meta Pixel. Deploy: GitHub Actions (`.github/workflows/deploy.yml`)

## Conventions
- Public content pages are server components with `revalidate` (bhajan: 3600s). Admin is under `/admin/*`, guarded in `proxy.ts` (Next 16 middleware name) via Supabase auth.
- Global overlays mounted in `app/layout.tsx`: AnnouncementStrip, CampaignModal, ExitFeedbackManager, DivinePeek, PushPrompt/SlideInPrompt (check before adding more).
- Never read: node_modules, .next, .env*, public/images, package-lock.json.

## AdSense status (audited 2026-10-14)
- OK: ads.txt, `google-adsense-account` meta + script in layout, robots.ts, sitemap.ts, footer links to About/Contact/Privacy/Terms/DMCA/Disclaimer, privacy policy AdSense section.
- Open risks: lyrics-only pages when `bhajan.explanation` is empty (`app/bhajan/[slug]/page.tsx`); no consent management platform (CMP) in layout; full-screen CampaignModal + promo strip on every page; `/publication-test` renders nothing server-side and is linked site-wide.
