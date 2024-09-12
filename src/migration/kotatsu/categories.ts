export type Categories = Category[]

export interface Category {
  category_id: number
  created_at: number
  sort_key: number
  title: string
  order: string
  track: boolean
  show_in_lib: boolean
}
