import { useState } from 'react'
import type { Story } from '../types'
import StoryReader from './StoryReader'
import { useDarkMode } from '../hooks/useDarkMode'

const GENRE_THEME: Record<string, {
  glow: string
  badge: string
  bar: string
}> = {
  'Dark Fantasy':     { glow: '180,30,30',    bar: '#f87171', badge: 'text-rose-700 bg-rose-50 border-rose-200/80 dark:text-rose-300 dark:bg-rose-950/60 dark:border-rose-800/50' },
  'Epic Fantasy':     { glow: '200,130,0',    bar: '#fbbf24', badge: 'text-amber-700 bg-amber-50 border-amber-200/80 dark:text-amber-300 dark:bg-amber-950/60 dark:border-amber-800/50' },
  'Magical Realism':  { glow: '0,140,90',     bar: '#34d399', badge: 'text-emerald-700 bg-emerald-50 border-emerald-200/80 dark:text-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800/50' },
  'Arcane Mystery':   { glow: '0,160,180',    bar: '#22d3ee', badge: 'text-cyan-700 bg-cyan-50 border-cyan-200/80 dark:text-cyan-300 dark:bg-cyan-950/60 dark:border-cyan-800/50' },
  'Power Fantasy':    { glow: '210,100,0',    bar: '#fb923c', badge: 'text-orange-700 bg-orange-50 border-orange-200/80 dark:text-orange-300 dark:bg-orange-950/60 dark:border-orange-800/50' },
  'Mythic Adventure': { glow: '180,150,0',    bar: '#facc15', badge: 'text-yellow-700 bg-yellow-50 border-yellow-200/80 dark:text-yellow-300 dark:bg-yellow-950/60 dark:border-yellow-800/50' },
  'Enchanted Worlds': { glow: '110,60,240',   bar: '#a78bfa', badge: 'text-violet-700 bg-violet-50 border-violet-200/80 dark:text-violet-300 dark:bg-violet-950/60 dark:border-violet-800/50' },
}
const FALLBACK = GENRE_THEME['Enchanted Worlds']

function readingTime(n: number) { return `${Math.ceil(n / 250)} min read` }
function formatDate(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function FeaturedCard({ story }: { story: Story }) {
  const [open, setOpen] = useState(false)
  const dark = useDarkMode()
  const theme = GENRE_THEME[story.genre] ?? FALLBACK

  const shadow = dark
    ? `0 0 80px rgba(${theme.glow}, 0.08), 0 1px 0 rgba(255,255,255,0.04) inset`
    : `0 4px 32px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.9) inset`

  return (
    <article
      className="relative rounded-2xl overflow-hidden border border-black/[0.07] dark:border-white/[0.07] animate-fade-up"
      style={{ boxShadow: shadow }}
    >
      {/* ── Light mode background ── */}
      <div className="absolute inset-0 bg-white dark:hidden pointer-events-none" />
      <div
        className="absolute top-0 left-0 right-0 h-1 dark:hidden pointer-events-none"
        style={{ background: `linear-gradient(to right, ${theme.bar}, ${theme.bar}88)` }}
      />

      {/* ── Dark mode background ── */}
      <div className="absolute inset-0 hidden dark:block bg-gradient-to-br from-[#0d0a1e] via-[#090619] to-[#07050f] pointer-events-none" />
      <div
        className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full blur-[100px] opacity-[0.13] pointer-events-none hidden dark:block"
        style={{ background: `radial-gradient(circle, rgb(${theme.glow}) 0%, transparent 65%)` }}
      />

      {/* ── Content ── */}
      <div className="relative px-8 py-10 sm:px-12 sm:py-14">
        {/* Label */}
        <div className="flex items-center gap-3 mb-8">
          <span
            className="block h-px w-8 bg-black/20 dark:bg-white/20"
          />
          <span className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[--text-4]">
            Tonight's Tale
          </span>
        </div>

        {/* Genre badge */}
        <span className={`inline-flex items-center text-[11px] font-medium px-3 py-1 rounded-full border mb-5 ${theme.badge}`}>
          {story.genre}
        </span>

        {/* Title */}
        <h2 className="font-display text-3xl sm:text-4xl xl:text-[2.6rem] font-semibold text-[--text-1] leading-[1.15] mb-5 max-w-2xl">
          {story.title}
        </h2>

        {/* Meta */}
        <div className="flex items-center gap-2 text-[13px] text-[--text-4] font-light mb-7 tracking-wide">
          <span>{formatDate(story.date)}</span>
          <span className="opacity-40">·</span>
          <span>{readingTime(story.wordCount)}</span>
        </div>

        {/* Excerpt */}
        <p className="font-serif italic text-[--text-3] dark:text-[--text-4] text-[15px] leading-relaxed max-w-xl mb-9">
          {story.excerpt}
        </p>

        {/* CTA */}
        <button
          onClick={() => setOpen(v => !v)}
          className={[
            'group inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-200',
            open
              ? 'bg-black/[0.06] dark:bg-white/[0.08] text-[--text-3] hover:bg-black/[0.09] dark:hover:bg-white/[0.12]'
              : 'bg-[#18151f] text-white dark:bg-white dark:text-[#07050f] hover:opacity-90 shadow-lg shadow-black/20',
          ].join(' ')}
        >
          {open ? 'Collapse' : 'Read Full Story'}
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-90 opacity-60' : 'group-hover:translate-x-0.5'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d={open ? 'M19 9l-7 7-7-7' : 'M17 8l4 4m0 0l-4 4m4-4H3'} />
          </svg>
        </button>
      </div>

      {/* Reading panel */}
      {open && (
        <div className="relative border-t border-black/[0.06] dark:border-white/[0.05] bg-[#f9f8f6]/80 dark:bg-[#06040e]/70 px-8 sm:px-12 pt-10 pb-14 animate-slide-down">
          <StoryReader filename={story.filename} onClose={() => setOpen(false)} />
        </div>
      )}
    </article>
  )
}
