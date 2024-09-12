export type BookmarkItems = BookmarkItem[]

export interface BookmarkItem {
  manga: Manga
  tags: Tag[]
  bookmarks: Bookmark[]
}

export interface Manga {
  id: number
  title: string
  url: string
  public_url: string
  rating: number
  nsfw: boolean
  cover_url: string
  state: string
  author: string
  source: string
}

export interface Tag {
  id: number
  title: string
  key: string
  source: string
}

export interface Bookmark {
  manga_id: number
  page_id: number
  chapter_id: number
  page: number
  scroll: number
  image_url: string
  created_at: number
  percent: number
}
