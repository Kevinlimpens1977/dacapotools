import { motion } from 'framer-motion'
import type { App } from '../lib/types'

interface AppTileProps {
  app: App;
  onMouseEnter?: () => void;
}

export default function AppTile({ app, onMouseEnter }: AppTileProps) {
  return (
    <motion.a
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex-shrink-0 w-48 sm:w-56 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border-2 border-emerald-600/30 hover:border-emerald-500/50"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={onMouseEnter}
    >
      <div className="aspect-video w-full bg-gray-100 relative">
        {app.thumbnail ? (
          <img
            src={app.thumbnail}
            alt={app.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {app.icon ? (
              <img
                src={app.icon}
                alt={app.title}
                className="w-12 h-12 opacity-50"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xl font-medium text-gray-400">
                  {app.title.charAt(0)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{app.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2">{app.description}</p>
      </div>
    </motion.a>
  );
}
