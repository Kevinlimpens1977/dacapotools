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
    <div className="min-h-screen bg-gray-50">
      <SearchBar value={search} onChange={setSearch} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-12 space-y-16"
      >
        <RowCarousel title="Personeel" items={filtered.Personeel} />
        <RowCarousel title="Administratie" items={filtered.Administratie} />
        <RowCarousel title="MT" items={filtered.MT} />
        <RowCarousel title="Overzicht" items={filtered.Overzicht} />
      </motion.div>
    </div>
  )
}
