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
      .then((data: AppsGrouped) => setGrouped(data))
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
    Personeel: grouped.Personeel.filter(matchSearch),
    Administratie: grouped.Administratie.filter(matchSearch),
    MT: grouped.MT.filter(matchSearch),
    Overzicht: grouped.Overzicht.filter(matchSearch)
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
              className="absolute -top-3 -right-3 z-10 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl transition-all border-3 border-red-400 hover:scale-110"
              style={{ borderWidth: '3px' }}
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-[95rem] mx-auto py-8"
      >
        {/* Categories */}
        <div className="space-y-6">
          <RowCarousel title="Personeel" items={filtered.Personeel} onPreview={setPreviewApp} />
          <RowCarousel title="Administratie" items={filtered.Administratie} onPreview={setPreviewApp} />
          <RowCarousel title="MT" items={filtered.MT} onPreview={setPreviewApp} />
          <RowCarousel title="Overzicht" items={filtered.Overzicht} onPreview={setPreviewApp} />
        </div>
      </motion.div>
    </div>
  )
}
