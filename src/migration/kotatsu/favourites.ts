export type Favourites = Favourite[]

export interface Favourite {
  manga_id: number
  category_id: number
  sort_key: number
  created_at: number
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
