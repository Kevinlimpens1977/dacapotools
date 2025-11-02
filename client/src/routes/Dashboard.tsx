import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getAllAppsGrouped } from '../lib/api'
import type { AppsGrouped } from '../lib/types'
import RowCarousel from '../components/RowCarousel'
import SearchBar from '../components/SearchBar'

export default function Dashboard() {
  const [grouped, setGrouped] = useState<AppsGrouped | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getAllAppsGrouped().then(setGrouped).catch(console.error)
  }, [])

  if (!grouped) return <div className="p-8 text-center text-gray-600">Loading...</div>

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      <SearchBar value={search} onChange={setSearch} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-[95rem] mx-auto py-8 space-y-8"
      >
        {/* Welkomstbericht */}
        <div className="px-4 sm:px-8 mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-light text-gray-800"
          >
            Welkom bij <span className="text-emerald-600 font-medium">DaCapo Tools</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-gray-500"
          >
            Kies een applicatie om te starten
          </motion.p>
        </div>

        {/* Categorieën */}
        <div className="space-y-2">
          <RowCarousel title="Personeel" items={filtered.Personeel} />
          <RowCarousel title="Administratie" items={filtered.Administratie} />
          <RowCarousel title="MT" items={filtered.MT} />
          <RowCarousel title="Overzicht" items={filtered.Overzicht} />
        </div>
      </motion.div>
    </div>
  )
}
