export interface App {
  id: number
  category: 'Personeel' | 'Administratie' | 'MT' | 'Overzicht'
  title: string
  description?: string
  image_url?: string
  link_url?: string
  created_at?: string
}

export type AppsGrouped = {
  [K in App['category']]: App[]
}
