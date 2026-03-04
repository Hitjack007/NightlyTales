import type { Genre } from '../types'

const GENRES: Genre[] = [
  'All',
  'Dark Fantasy',
  'Epic Fantasy',
  'Magical Realism',
  'Arcane Mystery',
  'Power Fantasy',
  'Mythic Adventure',
  'Enchanted Worlds',
]

interface FilterBarProps {
  selected: Genre
  onChange: (genre: Genre) => void
  counts: Record<string, number>
}

export default function FilterBar({ selected, onChange, counts }: FilterBarProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {GENRES.map((genre) => {
        const count = genre === 'All' ? total : (counts[genre] ?? 0)
        const active = selected === genre
        if (genre !== 'All' && count === 0) return null

        return (
          <button
            key={genre}
            onClick={() => onChange(genre)}
            className={[
              'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150 border',
              active
                ? [
                    'bg-ink-600/20 border-ink-500/30 text-ink-600',
                    'dark:bg-ink-600/30 dark:border-ink-500/50 dark:text-ink-200',
                  ].join(' ')
                : [
                    'bg-black/[0.04] border-black/[0.07] text-[--text-3] hover:bg-black/[0.07] hover:text-[--text-2] hover:border-black/[0.12]',
                    'dark:bg-white/[0.03] dark:border-white/[0.06] dark:hover:bg-white/[0.06] dark:hover:border-white/[0.1]',
                  ].join(' '),
            ].join(' ')}
          >
            {genre}
            {count > 0 && (
              <span className={`text-[10px] tabular-nums ${active ? 'text-ink-500/70 dark:text-ink-300/70' : 'text-[--text-4]'}`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
