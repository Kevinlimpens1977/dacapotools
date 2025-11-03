import { motion } from 'framer-motion'
import type { App } from '../lib/types'

interface AppTileProps {
  app: App;
  onMouseEnter?: () => void;
  onClick?: () => void;
  preview?: boolean;
}

export default function AppTile({ app, onMouseEnter, onClick, preview = false }: AppTileProps) {
  const handleClick = () => {
    if (preview) return;
    if (onClick) {
      onClick();
    } else if (app.link_url) {
      window.open(app.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      className={`flex-shrink-0 ${preview ? 'w-96' : 'w-48 sm:w-56'} bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border-2 border-emerald-600/30 hover:border-emerald-500/50 ${preview ? '' : 'cursor-pointer'}`}
      whileHover={preview ? undefined : { scale: 1.02, y: -2 }}
      whileTap={preview ? undefined : { scale: 0.98 }}
      onMouseEnter={onMouseEnter}
      onClick={handleClick}
    >
      <div className="aspect-video w-full bg-gray-100 relative flex items-center justify-center">
        {app.image_url ? (
          <img
            src={app.image_url}
            alt={app.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load image:', app.image_url);
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span class="text-2xl font-medium text-emerald-600">
                      ${app.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                `;
                parent.classList.add('flex', 'items-center', 'justify-center');
                parent.classList.remove('relative');
              }
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-2xl font-medium text-emerald-600">
              {app.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{app.title}</h3>
        <p className={`text-sm text-gray-500 ${preview ? '' : 'line-clamp-2'}`}>{app.description}</p>
        {preview && app.link_url && (
          <a 
            href={app.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-emerald-600 hover:text-emerald-700"
          >
            Open applicatie →
          </a>
        )}
      </div>
    </motion.div>
  );
}
