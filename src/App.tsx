import { useEffect, useState } from 'react'
import type { Story, Genre } from './types'
import FeaturedCard from './components/FeaturedCard'
import StoryCard from './components/StoryCard'
import FilterBar from './components/FilterBar'

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin text-[--text-4]" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-60" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  )
}

export default function App() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<Genre>('All')

  useEffect(() => {
    fetch('/stories/index.json')
      .then((r) => { if (!r.ok) throw new Error(); return r.json() as Promise<Story[]> })
      .then(setStories)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const featured = stories[0] ?? null
  const archive  = stories.slice(1)

  const genreCounts = archive.reduce<Record<string, number>>((acc, s) => {
    acc[s.genre] = (acc[s.genre] ?? 0) + 1
    return acc
  }, {})

  const filtered = filter === 'All' ? archive : archive.filter(s => s.genre === filter)

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Header ───────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-black/[0.06] dark:border-white/[0.05] bg-[--bg]/85 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <span className="text-lg leading-none">🌙</span>
            <span className="font-display text-[15px] font-semibold text-[--text-1] tracking-wide">
              Nightly Tales
            </span>
          </a>

          <div className="flex items-center gap-3">
            {loading && <Spinner />}
            {!loading && stories.length > 0 && (
              <span className="text-[11px] text-[--text-4] tabular-nums font-light">
                {stories.length} {stories.length === 1 ? 'story' : 'stories'}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 sm:px-8 py-12">

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-64 rounded-2xl bg-black/[0.04] dark:bg-white/[0.025]" />
            <div className="h-24 rounded-xl bg-black/[0.03] dark:bg-white/[0.02]" />
            <div className="h-24 rounded-xl bg-black/[0.03] dark:bg-white/[0.02]" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
            <span className="text-3xl">📂</span>
            <p className="text-[--text-3] text-sm">
              Could not load{' '}
              <code className="font-mono text-xs text-ink-600 dark:text-ink-400/60 bg-ink-50 dark:bg-ink-950/40 px-1.5 py-0.5 rounded">
                stories/index.json
              </code>
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && stories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-36 gap-4 text-center animate-fade-up">
            <div className="text-5xl mb-2 opacity-50">🌙</div>
            <h2 className="font-display text-2xl font-semibold text-[--text-1]">The first tale is coming</h2>
            <p className="text-[--text-3] text-sm max-w-xs leading-relaxed">
              Stories are generated every night at midnight UTC.<br />Check back soon.
            </p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && stories.length > 0 && (
          <div className="space-y-12">

            {featured && (
              <section>
                <FeaturedCard story={featured} />
              </section>
            )}

            {archive.length > 0 && (
              <section className="space-y-5">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[--text-4]">
                    The Archive
                  </span>
                  <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
                </div>

                <FilterBar selected={filter} onChange={setFilter} counts={genreCounts} />

                {filtered.length > 0 ? (
                  <div className="space-y-2 animate-fade-up">
                    {filtered.map(story => (
                      <StoryCard key={story.filename} story={story} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[--text-3] text-sm py-8 text-center">
                    No archived stories in <span className="text-[--text-2]">{filter}</span> yet.
                  </p>
                )}
              </section>
            )}

          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-black/[0.05] dark:border-white/[0.04] mt-auto">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
          <span className="text-[11px] text-[--text-4]">
            Stories Generated with Gemini 2.5 Flash · Works of fiction
          </span>
          <span className="text-[11px] text-[--text-4]">🌙</span>
        </div>
      </footer>
    </div>
  )
}
