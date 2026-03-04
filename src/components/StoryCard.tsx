import { useState } from 'react'
import type { Story } from '../types'
import StoryReader from './StoryReader'

const GENRE_ACCENT: Record<string, { bar: string; badge: string }> = {
  'Dark Fantasy':     { bar: 'bg-rose-500',    badge: 'text-rose-700 bg-rose-50 border-rose-200/70 dark:text-rose-400/80 dark:bg-rose-950/40 dark:border-rose-900/40' },
  'Epic Fantasy':     { bar: 'bg-amber-500',   badge: 'text-amber-700 bg-amber-50 border-amber-200/70 dark:text-amber-400/80 dark:bg-amber-950/40 dark:border-amber-900/40' },
  'Magical Realism':  { bar: 'bg-emerald-500', badge: 'text-emerald-700 bg-emerald-50 border-emerald-200/70 dark:text-emerald-400/80 dark:bg-emerald-950/40 dark:border-emerald-900/40' },
  'Arcane Mystery':   { bar: 'bg-cyan-500',    badge: 'text-cyan-700 bg-cyan-50 border-cyan-200/70 dark:text-cyan-400/80 dark:bg-cyan-950/40 dark:border-cyan-900/40' },
  'Power Fantasy':    { bar: 'bg-orange-500',  badge: 'text-orange-700 bg-orange-50 border-orange-200/70 dark:text-orange-400/80 dark:bg-orange-950/40 dark:border-orange-900/40' },
  'Mythic Adventure': { bar: 'bg-yellow-500',  badge: 'text-yellow-700 bg-yellow-50 border-yellow-200/70 dark:text-yellow-400/80 dark:bg-yellow-950/40 dark:border-yellow-900/40' },
  'Enchanted Worlds': { bar: 'bg-violet-500',  badge: 'text-violet-700 bg-violet-50 border-violet-200/70 dark:text-violet-400/80 dark:bg-violet-950/40 dark:border-violet-900/40' },
}
const FALLBACK = { bar: 'bg-ink-400', badge: 'text-ink-700 bg-ink-50 border-ink-200/70 dark:text-ink-300/80 dark:bg-ink-950/40 dark:border-ink-900/40' }

function readingTime(n: number) { return `${Math.ceil(n / 250)} min read` }
function formatDate(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function StoryCard({ story }: { story: Story }) {
  const [open, setOpen] = useState(false)
  const accent = GENRE_ACCENT[story.genre] ?? FALLBACK

  const cardBase = [
    'group relative flex rounded-xl overflow-hidden transition-all duration-200',
    'border border-black/[0.07] dark:border-white/[0.07]',
    'bg-white dark:bg-white/[0.025]',
    open
      ? 'shadow-sm dark:border-ink-500/40 dark:[box-shadow:0_0_0_1px_rgba(124,92,252,0.12)]'
      : 'hover:bg-[#faf9f7] dark:hover:bg-white/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-none hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)] dark:hover:shadow-none',
  ].join(' ')

  return (
    <article className={cardBase}>
      {/* Left genre accent bar */}
      <div className={`w-[3px] shrink-0 ${accent.bar} opacity-40 group-hover:opacity-60 transition-opacity`} />

      {/* Card body */}
      <div className="flex-1 min-w-0 px-5 py-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <h3 className="font-display text-[1.05rem] font-semibold text-[--text-1] leading-snug">
            {story.title}
          </h3>
          <span className={`shrink-0 text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${accent.badge}`}>
            {story.genre}
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-1.5 text-[12px] text-[--text-4] mb-3 font-light">
          <span>{formatDate(story.date)}</span>
          <span className="opacity-50">·</span>
          <span>{readingTime(story.wordCount)}</span>
        </div>

        {/* Excerpt */}
        <p className="text-[13px] text-[--text-3] leading-relaxed line-clamp-2 mb-3.5">
          {story.excerpt}
        </p>

        {/* Read button */}
        <button
          onClick={() => setOpen(v => !v)}
          className={[
            'inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors',
            open
              ? 'text-ink-600 dark:text-ink-400'
              : 'text-[--text-4] group-hover:text-ink-600 dark:group-hover:text-ink-400/80',
          ].join(' ')}
        >
          {open ? 'Close' : 'Read story'}
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expanded reader */}
        {open && (
          <div className="mt-6 pt-6 border-t border-black/[0.06] dark:border-white/[0.05] animate-slide-down">
            <StoryReader filename={story.filename} onClose={() => setOpen(false)} />
          </div>
        )}
      </div>
    </article>
  )
}
