import { motion } from 'framer-motion'
import type { App } from '../lib/types'

interface AppTileProps {
  app: App;
  onMouseEnter?: () => void;
  onClick?: () => void;
  preview?: boolean;
  onClose?: () => void;
}

export default function AppTile({ app, onMouseEnter, onClick, preview = false, onClose }: AppTileProps) {
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
      className={`flex-shrink-0 ${preview ? 'w-full' : 'w-48 sm:w-56'} bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2 border-orange-300/60 hover:border-orange-400/80 ${preview ? '' : 'cursor-pointer'}`}
      style={{ borderWidth: '2px' }}
      whileHover={preview ? undefined : { scale: 1.02, y: -2 }}
      whileTap={preview ? undefined : { scale: 0.98 }}
      onMouseEnter={onMouseEnter}
      onClick={handleClick}
    >
      <div className={`${preview ? 'aspect-video' : 'aspect-video'} w-full bg-gradient-to-br from-orange-50 to-amber-50 relative flex items-center justify-center`}>
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
                  <div class="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-300">
                    <span class="text-2xl font-medium text-orange-600">
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
          <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center">
            <span className="text-2xl font-medium text-orange-600">
              {app.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className={`${preview ? 'p-6 bg-gradient-to-br from-orange-50/50 to-amber-50/50' : 'p-4 bg-gradient-to-br from-orange-50/30 to-amber-50/30'}`}>
        <h3 className={`font-medium text-gray-900 mb-2 ${preview ? 'text-2xl' : 'line-clamp-1'}`}>
          {app.title}
        </h3>
        <p className={`text-sm text-gray-600 ${preview ? 'whitespace-pre-wrap break-words' : 'line-clamp-2'}`}>
          {app.description}
        </p>
        {preview && app.link_url && (
          <a 
            href={app.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors border-2 border-orange-400 shadow-md"
          >
            Open applicatie →
          </a>
        )}
      </div>
    </motion.div>
  );
}
