export type Sources = Source[]

export interface Source {
  source: string
  enabled: boolean
  sort_key: number
  added_in: number
  used_at: number
  pinned: boolean
}
