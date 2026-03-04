export interface Story {
  filename: string
  title: string
  genre: string
  date: string
  wordCount: number
  excerpt: string
}

export type Genre =
  | 'Dark Fantasy'
  | 'Epic Fantasy'
  | 'Magical Realism'
  | 'Arcane Mystery'
  | 'Power Fantasy'
  | 'Mythic Adventure'
  | 'Enchanted Worlds'
  | 'All'
