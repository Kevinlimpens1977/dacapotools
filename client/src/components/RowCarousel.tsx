import { motion } from 'framer-motion'
import type { App } from '../lib/types'
import AppTile from './AppTile'

interface RowCarouselProps {
  title: string
  items: App[]
}

export default function RowCarousel({ title, items }: RowCarouselProps) {
  if (!items.length) return null

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4 px-2">{title}</h2>
      <motion.div
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        style={{ cursor: 'grab' }}
      >
        {items.map((app) => (
          <AppTile key={app.id} app={app} />
        ))}
      </motion.div>
    </div>
  )
}
