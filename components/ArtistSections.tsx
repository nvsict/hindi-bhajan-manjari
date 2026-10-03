"use client";

import { memo, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  FaChevronRight,
  FaEye,
  FaHeart,
  FaPenNib,
  FaPlayCircle,
  FaQuoteLeft,
  FaRegHeart,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';
import ScrollReveal from '@/components/ScrollReveal';
import { db } from '@/utils/db';

// ==========================================
// TYPES (shared with app/artist/[slug]/page.tsx)
// ==========================================
export interface ArtistWork {
  id: string | number;
  slug: string;
  title_hindi: string;
  title_hinglish: string;
  view_count: number;
  deity: string | null;
  isSinger: boolean;
  isWriter: boolean;
}

type RoleFilter = 'all' | 'singer' | 'writer';
type SortMode = 'popular' | 'az';

const compactNumber = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

// ==========================================
// 1. BIO CARD (full text stays in the HTML for SEO; CSS clamps it)
// ==========================================
export function ArtistBio({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = bio.length > 280;

  return (
    <div className="bg-white dark:bg-[#1a120b] p-6 sm:p-8 md:p-10 rounded-[2rem] shadow-xl shadow-orange-900/5 dark:shadow-black/30 border border-orange-100 dark:border-white/5 flex gap-5 md:gap-6 items-start">
      <FaQuoteLeft className="text-3xl md:text-4xl text-orange-500 dark:text-orange-500/80 shrink-0 hidden sm:block mt-1" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
          About the Artist
        </h2>
        <p
          className={`text-gray-700 dark:text-gray-300 text-base md:text-lg leading-[1.8] font-medium whitespace-pre-line break-words ${
            isLong && !expanded ? 'line-clamp-5' : ''
          }`}
        >
          {bio}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-3 inline-flex items-center min-h-[44px] text-sm font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 rounded-md"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. SINGLE BHAJAN ROW
// ==========================================
const WorkRow = memo(function WorkRow({
  work,
  rank,
  isSaved,
  onToggleSave,
}: {
  work: ArtistWork;
  rank: number;
  isSaved: boolean;
  onToggleSave: (work: ArtistWork) => void;
}) {
  const accent = work.isSinger ? 'bg-orange-500' : work.isWriter ? 'bg-blue-500' : 'bg-gray-300 dark:bg-white/20';

  return (
    <article className="group relative bg-white dark:bg-[#0c0804] rounded-[1.5rem] border border-gray-100 dark:border-white/5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-lg hover:shadow-orange-900/5 hover:border-orange-200 dark:hover:border-orange-900/50 transition-all duration-300 md:hover:-translate-y-0.5 overflow-hidden">
      {/* Persistent role accent (visible on touch devices too) */}
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${accent}`} aria-hidden="true" />

      <div className="flex items-center gap-3 sm:gap-4 pl-5 pr-3 sm:pl-6 sm:pr-4 py-4 sm:py-5">
        <span
          className="hidden sm:block w-7 shrink-0 text-center text-sm font-bold text-gray-300 dark:text-white/20 tabular-nums"
          aria-hidden="true"
        >
          {rank}
        </span>

        <div className="flex-1 min-w-0">
          {/* Stretched link: makes the whole row tappable without nesting a button inside <a> */}
          <Link
            href={`/bhajan/${work.slug}`}
            className="block after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            <h3 className="font-hindi text-lg md:text-xl font-black text-gray-900 dark:text-orange-50 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
              {work.title_hindi}
            </h3>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 line-clamp-1">
              {work.title_hinglish}
            </p>
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {work.isSinger && (
              <span className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border border-green-200/60 dark:border-green-900/30 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                <FaPlayCircle aria-hidden="true" /> Singer
              </span>
            )}
            {work.isWriter && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/30 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                <FaPenNib aria-hidden="true" /> Writer
              </span>
            )}
            {work.deity && (
              <span className="bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                {work.deity}
              </span>
            )}
            {work.view_count > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                <FaEye aria-hidden="true" className="text-gray-400 dark:text-gray-500" />
                {compactNumber.format(work.view_count)}
              </span>
            )}
          </div>
        </div>

        {/* Save to Sangrah (sits above the stretched link) */}
        <button
          type="button"
          onClick={() => onToggleSave(work)}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${work.title_hinglish} from Sangrah` : `Save ${work.title_hinglish} to Sangrah`}
          className="relative z-10 shrink-0 w-11 h-11 rounded-full bg-orange-50/80 dark:bg-white/5 border border-orange-100/60 dark:border-white/10 text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition-all duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          {isSaved ? <FaHeart className="text-red-500 text-base" /> : <FaRegHeart className="text-base" />}
        </button>

        <span
          className="hidden sm:flex w-10 h-10 shrink-0 rounded-full bg-orange-50 dark:bg-orange-900/10 items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 md:group-hover:translate-x-1"
          aria-hidden="true"
        >
          <FaChevronRight className="text-sm" />
        </span>
      </div>
    </article>
  );
});

// ==========================================
// 3. DISCOGRAPHY (search, role filter, sort)
// ==========================================
export function ArtistDiscography({ works }: { works: ArtistWork[] }) {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<RoleFilter>('all');
  const [sort, setSort] = useState<SortMode>('popular');

  // One live query for ALL saved slugs (instead of one query per row)
  const savedKeys = useLiveQuery(() => db.savedBhajans.toCollection().primaryKeys(), [], [] as unknown[]);
  const savedSet = useMemo(() => new Set((savedKeys ?? []).map(String)), [savedKeys]);

  const handleToggleSave = useCallback(
    async (work: ArtistWork) => {
      try {
        if (savedSet.has(work.slug)) {
          await db.savedBhajans.delete(work.slug);
        } else {
          await db.savedBhajans.put({
            slug: work.slug,
            title: work.title_hindi,
            folder: 'All',
            isPinned: 0,
            addedAt: new Date().toISOString(),
            deity: work.deity || 'Bhajan',
            lyrics_excerpt: 'संपूर्ण बोल अंदर पढ़ें',
          });
        }
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(30);
      } catch (err) {
        console.error('Failed to update Sangrah', err);
      }
    },
    [savedSet]
  );

  const singerCount = useMemo(() => works.filter((w) => w.isSinger).length, [works]);
  const writerCount = useMemo(() => works.filter((w) => w.isWriter).length, [works]);
  const showRoleFilter = singerCount > 0 && writerCount > 0;
  const showSearch = works.length > 6;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = works.filter((w) => {
      if (role === 'singer' && !w.isSinger) return false;
      if (role === 'writer' && !w.isWriter) return false;
      if (!q) return true;
      return (
        w.title_hindi.toLowerCase().includes(q) ||
        w.title_hinglish.toLowerCase().includes(q) ||
        (w.deity ?? '').toLowerCase().includes(q)
      );
    });

    return [...list].sort((a, b) =>
      sort === 'az'
        ? a.title_hinglish.localeCompare(b.title_hinglish, 'en')
        : b.view_count - a.view_count || a.title_hinglish.localeCompare(b.title_hinglish, 'en')
    );
  }, [works, query, role, sort]);

  const chipClass = (active: boolean) =>
    `shrink-0 min-h-[40px] px-4 rounded-full text-sm font-bold border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
      active
        ? 'bg-orange-600 border-orange-600 text-white shadow-sm'
        : 'bg-white dark:bg-[#1a120b] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400'
    }`;

  const hasControls = showSearch || showRoleFilter || works.length > 1;

  return (
    <div id="discography" className="scroll-mt-24">
      {hasControls && (
        <div className="sticky top-16 z-30 -mx-4 px-4 py-3 mb-5 bg-[#fffcf5]/95 dark:bg-[#0c0804]/95 border-b border-orange-100/70 dark:border-white/5">
          <div className="flex flex-col gap-3">
            {showSearch && (
              <div className="relative">
                <FaSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search this artist's bhajans…"
                  aria-label="Search this artist's bhajans"
                  // text-base (16px) prevents iOS Safari from zooming on focus
                  className="w-full h-12 pl-11 pr-11 rounded-full bg-white dark:bg-[#1a120b] border border-gray-200 dark:border-white/10 text-base text-gray-900 dark:text-orange-50 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all [&::-webkit-search-cancel-button]:appearance-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-600"
                  >
                    <FaTimes aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1">
                {showRoleFilter && (
                  <>
                    <button type="button" aria-pressed={role === 'all'} onClick={() => setRole('all')} className={chipClass(role === 'all')}>
                      All ({works.length})
                    </button>
                    <button type="button" aria-pressed={role === 'singer'} onClick={() => setRole('singer')} className={chipClass(role === 'singer')}>
                      Singer ({singerCount})
                    </button>
                    <button type="button" aria-pressed={role === 'writer'} onClick={() => setRole('writer')} className={chipClass(role === 'writer')}>
                      Writer ({writerCount})
                    </button>
                  </>
                )}
              </div>

              {works.length > 1 && (
                <label className="shrink-0 flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
                  <span className="sr-only sm:not-sr-only">Sort</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortMode)}
                    className="h-10 rounded-full bg-white dark:bg-[#1a120b] border border-gray-200 dark:border-white/10 pl-3 pr-8 text-sm font-bold text-gray-700 dark:text-gray-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="popular">Most read</option>
                    <option value="az">A – Z</option>
                  </select>
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite">
        Showing {visible.length} of {works.length} bhajans
      </p>

      {visible.length === 0 ? (
        <div className="bg-white dark:bg-[#1a120b] rounded-[2rem] p-10 text-center border border-dashed border-orange-200 dark:border-orange-900/40">
          <p className="text-gray-700 dark:text-gray-200 font-bold text-lg mb-1">No bhajans match your search</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">Try a different title, or clear the filters to see everything.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setRole('all');
            }}
            className="px-6 py-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all text-sm border border-transparent dark:border-orange-900/30"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4">
          {visible.map((work, idx) => (
            <ScrollReveal key={work.id} delay={(idx % 8) * 0.04} yOffset={20}>
              <WorkRow work={work} rank={idx + 1} isSaved={savedSet.has(work.slug)} onToggleSave={handleToggleSave} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}