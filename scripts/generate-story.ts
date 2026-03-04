import { GoogleGenerativeAI } from '@google/generative-ai'
import { Resend } from 'resend'
import * as fs from 'fs'
import * as path from 'path'

// ── Config ──────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const RESEND_API_KEY = process.env.RESEND_API_KEY
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL

if (!GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY env variable')

const GENRES = [
  'Dark Fantasy',
  'Epic Fantasy',
  'Magical Realism',
  'Arcane Mystery',
  'Power Fantasy',
  'Mythic Adventure',
  'Enchanted Worlds',
] as const

type Genre = typeof GENRES[number]

// Path to stories/ relative to this script (one level up from scripts/)
const STORIES_DIR = path.join(__dirname, '..', 'stories')
const INDEX_PATH = path.join(STORIES_DIR, 'index.json')

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomWordCount(): number {
  // Weighted towards mid-range (2k–6k) but can go 1k–10k
  const ranges = [
    { min: 1000, max: 2000 },
    { min: 2000, max: 4000 },
    { min: 2000, max: 4000 }, // doubled weight
    { min: 4000, max: 7000 },
    { min: 7000, max: 10000 },
  ]
  const range = pick(ranges)
  return Math.floor(Math.random() * (range.max - range.min) + range.min)
}

function today(): string {
  return new Date().toISOString().split('T')[0] // YYYY-MM-DD
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '-').trim()
}

function extractTitle(text: string): string {
  const firstLine = text.split('\n')[0].trim()
  // Strip markdown heading markers if present
  return firstLine.replace(/^#+\s*/, '').replace(/[*_]/g, '').trim() || 'Untitled'
}

function stripTitle(text: string): string {
  // Remove the first line (title) from the body
  const lines = text.split('\n')
  const bodyStart = lines.findIndex((l, i) => i > 0 && l.trim().length > 0)
  return lines.slice(bodyStart === -1 ? 1 : bodyStart).join('\n').trim()
}

function makeExcerpt(text: string, maxChars = 300): string {
  const clean = text.replace(/\n+/g, ' ').trim()
  if (clean.length <= maxChars) return clean
  return clean.slice(0, maxChars).replace(/\s+\S*$/, '') + '…'
}

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPrompt(genre: Genre, targetWords: number): string {
  const genreGuides: Record<Genre, string> = {
    'Dark Fantasy': 'a world where power comes at a price — corrupting kingdoms, ancient curses, or forbidden magic that twists the user. Explore the cost of ambition, the seduction of dark power, and the thin line between hero and monster.',
    'Epic Fantasy': 'a grand, sweeping world with ancient prophecies, legendary powers, and heroes who must master extraordinary abilities to reshape the fate of nations. Think vast magic systems, chosen ones, and world-altering stakes.',
    'Magical Realism': 'a story where magic bleeds quietly into the everyday — enchanted objects, people with inexplicable gifts, or the boundary between worlds growing thin. The magic is subtle, personal, and deeply woven into ordinary life.',
    'Arcane Mystery': 'a world of hidden knowledge, secret magical orders, and mysteries that unravel into deeper conspiracies. Magic is rare, dangerous, and guarded. The protagonist uncovers truths that powerful people would kill to keep buried.',
    'Power Fantasy': 'a protagonist who discovers or awakens a tremendous, singular power — and must learn to master it, control it, and decide whether to use it for dominance or justice. Explore the intoxicating feeling of becoming something greater.',
    'Mythic Adventure': 'a story that draws from the feel of ancient myth — gods, legendary beasts, heroes on impossible quests, sacred relics, and divine trials. The world has a timeless, legendary quality.',
    'Enchanted Worlds': 'a realm where magic is the fabric of reality — floating cities, sentient forests, creatures of pure sorcery, and civilizations built entirely on arcane foundations. Show us a world unlike anything mundane.',
  }

  return `You are a master storyteller specializing in ${genre} fiction. Write an immersive, original, long-form story.

Genre direction: Write ${genreGuides[genre]}

Requirements:
- Begin with a title on the very first line, formatted as: # Title Here
- Target approximately ${targetWords} words for the story body (after the title)
- Open with a vivid, gripping scene that immediately establishes the world and stakes
- Develop at least one well-drawn protagonist with clear motivations
- Include rich world-building details, sensory descriptions, and atmospheric prose
- Build tension progressively toward a meaningful climax and resolution
- Write in clear, flowing prose — immersive but not overwrought
- No meta-commentary, no author notes, no preamble — begin directly with the title

Begin now:`
}

// ── Email ─────────────────────────────────────────────────────────────────────

async function sendEmail(
  title: string,
  genre: Genre,
  date: string,
  storyText: string,
  wordCount: number,
): Promise<void> {
  if (!RESEND_API_KEY || !RECIPIENT_EMAIL) {
    console.log('⚠️  Email skipped (RESEND_API_KEY or RECIPIENT_EMAIL not set)')
    return
  }

  const resend = new Resend(RESEND_API_KEY)

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Georgia, serif; background: #0a0812; color: #cbd5e1; margin: 0; padding: 0; }
    .wrap { max-width: 680px; margin: 0 auto; padding: 40px 24px; }
    .header { border-bottom: 1px solid #1e1433; padding-bottom: 24px; margin-bottom: 32px; }
    .moon { font-size: 32px; margin-bottom: 8px; }
    .site { font-family: sans-serif; font-size: 12px; color: #4a3f6b; letter-spacing: 0.1em; text-transform: uppercase; }
    h1 { font-size: 28px; color: #fff; margin: 0 0 8px; font-weight: 600; line-height: 1.3; }
    .meta { font-family: sans-serif; font-size: 12px; color: #64748b; margin: 0; }
    .genre-badge { display: inline-block; font-family: sans-serif; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 99px; background: rgba(124,92,252,0.15); color: #a78bfa; border: 1px solid rgba(124,92,252,0.3); margin-bottom: 8px; }
    .story { line-height: 1.9; font-size: 16px; color: #94a3b8; }
    .story p { margin: 0 0 20px; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #1e1433; font-family: sans-serif; font-size: 11px; color: #2d2440; text-align: center; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="moon">🌙</div>
      <div class="site">Nightly Tales</div>
    </div>
    <div class="genre-badge">${genre}</div>
    <h1>${title}</h1>
    <p class="meta">${new Date(date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · ${wordCount.toLocaleString()} words</p>
    <div class="story" style="margin-top: 32px;">
      ${storyText
        .split(/\n\n+/)
        .filter((p) => p.trim())
        .map((p) => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`)
        .join('\n      ')}
    </div>
    <div class="footer">Generated by Gemini 2.5 Flash · Nightly Tales · This is a work of fiction</div>
  </div>
</body>
</html>`

  const { error } = await resend.emails.send({
    from: 'Nightly Tales <onboarding@resend.dev>',
    to: RECIPIENT_EMAIL,
    subject: `🌙 Tonight's Tale: "${title}" (${genre})`,
    html: htmlBody,
  })

  if (error) {
    console.error('❌ Email failed:', error)
  } else {
    console.log(`📧 Story emailed to ${RECIPIENT_EMAIL}`)
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const genre = pick(GENRES)
  const targetWords = randomWordCount()
  const dateStr = today()

  console.log(`\n🌙 Nightly Tales — ${dateStr}`)
  console.log(`📖 Genre: ${genre}`)
  console.log(`📝 Target: ~${targetWords.toLocaleString()} words\n`)

  // Generate story via Gemini
  const genai = new GoogleGenerativeAI(GEMINI_API_KEY!)
  const model = genai.getGenerativeModel({ model: 'gemini-2.5-flash' })

  console.log('✨ Generating story with Gemini 2.5 Flash…')
  const result = await model.generateContent(buildPrompt(genre, targetWords))
  const fullText = result.response.text()

  if (!fullText || fullText.trim().length < 100) {
    throw new Error('Gemini returned empty or too-short response')
  }

  // Parse title + body
  const title = extractTitle(fullText)
  const body = stripTitle(fullText)
  const actualWords = body.split(/\s+/).filter(Boolean).length
  const excerpt = makeExcerpt(body)

  console.log(`✅ Generated: "${title}" (${actualWords.toLocaleString()} words)`)

  // Build filename
  const safeTitle = sanitizeFilename(title)
  const filename = `${safeTitle} (${genre}) - ${dateStr}.txt`
  const filePath = path.join(STORIES_DIR, filename)

  // Ensure stories/ dir exists
  if (!fs.existsSync(STORIES_DIR)) {
    fs.mkdirSync(STORIES_DIR, { recursive: true })
  }

  // Write .txt file
  const fileContent = `${title}\n${'='.repeat(title.length)}\n\nGenre: ${genre}\nDate: ${dateStr}\nWords: ${actualWords.toLocaleString()}\n\n${'─'.repeat(60)}\n\n${body}`
  fs.writeFileSync(filePath, fileContent, 'utf8')
  console.log(`💾 Saved: stories/${filename}`)

  // Update index.json
  let index: object[] = []
  if (fs.existsSync(INDEX_PATH)) {
    try {
      index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'))
    } catch {
      index = []
    }
  }

  const entry = {
    filename,
    title,
    genre,
    date: dateStr,
    wordCount: actualWords,
    excerpt,
  }

  // Prepend newest story, avoid duplicates for same filename
  index = [entry, ...index.filter((s: any) => s.filename !== filename)]
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), 'utf8')
  console.log(`📋 Updated stories/index.json (${index.length} total stories)`)

  // Send email
  await sendEmail(title, genre, dateStr, body, actualWords)

  console.log('\n🎉 Done!\n')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
