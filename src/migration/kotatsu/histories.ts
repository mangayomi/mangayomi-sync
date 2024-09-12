export type Histories = History[]

export interface History {
  manga_id: number
  created_at: number
  updated_at: number
  chapter_id: number
  page: number
  scroll: number
  percent: number
  chapters: number
  manga: Manga
}

export interface Manga {
  id: number
  title: string
  url: string
  public_url: string
  rating: number
  nsfw: boolean
  cover_url: string
  large_cover_url?: string
  state?: string
  author?: string
  source: string
  tags: Tag[]
  alt_title?: string
}

export interface Tag {
  id: number
  title: string
  key: string
  source: string
}
