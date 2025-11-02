export interface Category {
  id: number
  name: string
  description?: string
  created_at?: string
}

interface App {
  id: number
  category: string
  title: string
  description?: string
  image_url?: string
  link_url?: string
  created_at?: string
}

export type AppsGrouped = {
  [K in App['category']]: App[]
}
