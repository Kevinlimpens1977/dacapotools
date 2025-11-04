import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getAllAppsGrouped } from '../lib/api'
import type { AppsGrouped, App } from '../lib/types'
import RowCarousel from '../components/RowCarousel'
import AppTile from '../components/AppTile'
import { useSearch } from './App'

export default function Dashboard() {
  const [grouped, setGrouped] = useState<AppsGrouped | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { search } = useSearch()
  const [previewApp, setPreviewApp] = useState<App | null>(null)

  useEffect(() => {
    getAllAppsGrouped()
      .then((data: AppsGrouped) => {
        // Zorg ervoor dat alle categorieën bestaan als arrays
        const safeData: AppsGrouped = {
          Personeel: data.Personeel || [],
          Administratie: data.Administratie || [],
          MT: data.MT || [],
          Overzicht: data.Overzicht || []
        };
        setGrouped(safeData);
      })
      .catch(err => {
        console.error('Error fetching apps:', err);
        setError(err instanceof Error ? err.message : 'Failed to load apps');
      });
  }, [])

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!grouped) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  const filtered = !search ? grouped : {
    Personeel: (grouped.Personeel || []).filter(matchSearch),
    Administratie: (grouped.Administratie || []).filter(matchSearch),
    MT: (grouped.MT || []).filter(matchSearch),
    Overzicht: (grouped.Overzicht || []).filter(matchSearch)
  }

  function matchSearch(app: any) {
    const q = search.toLowerCase()
    return app.title.toLowerCase().includes(q) || (app.description || '').toLowerCase().includes(q)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-white px-4 sm:px-8">
      
      {/* Preview Modal */}
      {previewApp && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewApp(null)}
        >
          <div
            className="max-w-2xl w-full relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setPreviewApp(null)}
              className="absolute -top-3 -right-3 z-10 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl transition-all border-2 border-red-400 hover:scale-110"
              style={{ borderWidth: '2px' }}
              aria-label="Sluiten"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <AppTile app={previewApp} preview onClose={() => setPreviewApp(null)} />
          </div>
        </div>
      )}

      <div className="flex gap-4 py-8">
        {/* Main content area - takes remaining space */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-1 min-w-0"
        >
          {/* Categories */}
          <div className="space-y-6">
            <RowCarousel title="Personeel" items={filtered.Personeel} onPreview={setPreviewApp} />
            <RowCarousel title="Administratie" items={filtered.Administratie} onPreview={setPreviewApp} />
            <RowCarousel title="MT" items={filtered.MT} onPreview={setPreviewApp} />
            <RowCarousel title="Overzicht" items={filtered.Overzicht} onPreview={setPreviewApp} />
          </div>
        </motion.div>

        {/* Mascotte - Sidebar on the right */}
        <div className="hidden xl:block flex-shrink-0 w-72">
          <motion.div
            className="bg-white border-4 border-orange-500 rounded-2xl p-4 shadow-2xl sticky bottom-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            style={{ marginTop: 'auto' }}
          >
            <h3 className="text-black font-bold text-base mb-2 text-center">DaCapo Tools</h3>
            <img
              src="/images/mascotte.png"
              alt="DaCapo Tools Mascotte"
              className="w-40 h-40 object-contain mx-auto"
            />
          </motion.div>
        </div>

        {/* Mascotte - Fixed bottom-right for smaller screens */}
        <div className="xl:hidden fixed bottom-0 right-0 z-40 max-w-[35vw] sm:max-w-[30vw] md:max-w-[28vw] lg:max-w-[25vw]">
          <motion.div
            className="bg-white border-3 border-orange-500 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 md:p-3 shadow-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <h3 className="text-black font-bold text-[10px] sm:text-xs md:text-sm mb-1 text-center">DaCapo Tools</h3>
            <img
              src="/images/mascotte.png"
              alt="DaCapo Tools Mascotte"
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 object-contain"
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
