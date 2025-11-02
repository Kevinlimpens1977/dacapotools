import { motion } from 'framer-motion'
import { useState } from 'react'
import type { App } from '../lib/types'

interface AppTileProps {
  app: App
}

export default function AppTile({ app }: AppTileProps) {
  const [hover, setHover] = useState(false)

  function handleClick() {
    if (app.link_url) {
      window.open(app.link_url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <motion.div
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="relative flex-shrink-0 w-72 h-48 bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group"
      tabIndex={0}
      role="button"
      aria-label={app.title}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleClick()
      }}
    >
      {app.image_url && (
        <img
          src={app.image_url}
          alt={app.title}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <h3 className="text-white font-semibold text-lg">{app.title}</h3>
      </div>
      {hover && app.description && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/70 text-white p-6 flex items-center justify-center"
        >
          <p className="text-center">{app.description}</p>
        </motion.div>
      )}
    </motion.div>
  )
}
