import { useEffect, useState } from 'react'

interface StoryReaderProps {
  filename: string
  onClose: () => void
}

export default function StoryReader({ filename, onClose }: StoryReaderProps) {
  const [text, setText] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setText(null)
    setError(false)
    fetch(`/stories/${encodeURIComponent(filename)}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.text() })
      .then(setText)
      .catch(() => setError(true))
  }, [filename])

  // Skip the file header block — everything up to and including the ─── divider
  const bodyText = text
    ? text.replace(/^[\s\S]*?─{10,}\n\n/, '').trim()
    : null

  const paragraphs = bodyText
    ? bodyText.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
    : []

  return (
    <div>
      {/* Close row */}
      <div className="flex items-center justify-between mb-8">
        <div className="h-px flex-1 bg-black/[0.06] dark:bg-white/[0.05]" />
        <button
          onClick={onClose}
          className="ml-4 flex items-center gap-2 text-[12px] text-[--text-4] hover:text-[--text-2] transition-colors font-medium"
        >
          Close
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Loading */}
      {!text && !error && (
        <div className="flex items-center gap-3 text-[--text-4] py-8">
          <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-[13px]">Loading…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500/70 dark:text-red-400/70 text-[13px] py-4">
          Could not load this story. Make sure the file exists in{' '}
          <code className="font-mono text-[11px]">stories/</code>.
        </p>
      )}

      {/* Story body */}
      {paragraphs.length > 0 && (
        <div className="prose-story animate-fade-in">
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}
    </div>
  )
}
