import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllAppsGrouped, createApp, pasteImage, deleteApp } from '../lib/api'
import type { App, AppsGrouped } from '../lib/types'

interface Category {
  id: number;
  name: string;
  description?: string;
}

export default function Admin() {
  const [grouped, setGrouped] = useState<AppsGrouped | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<string>('Personeel');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [pastedUrl, setPastedUrl] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [selectedApps, setSelectedApps] = useState<number[]>([])
  const pasteAreaRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchApps()
  }, [navigate])

  async function fetchApps() {
    try {
      const data = await getAllAppsGrouped()
      // Zorg ervoor dat alle categorieën bestaan als arrays
      const safeData: AppsGrouped = {
        Personeel: data.Personeel || [],
        Administratie: data.Administratie || [],
        MT: data.MT || [],
        Overzicht: data.Overzicht || []
      };
      setGrouped(safeData)
    } catch (e) {
      console.error(e)
    }
  }

  async function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const items = e.clipboardData?.items
    if (!items) return
    
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile()
        if (!blob) continue
        
        // Maak preview
        const reader = new FileReader()
        reader.onload = () => {
          setImagePreview(reader.result as string)
          setImageFile(blob)
          setPastedUrl(null)
          setMessage('✓ Afbeelding geplakt! Klaar om op te slaan.')
        }
        reader.readAsDataURL(blob)
        return
      }
    }
    setMessage('Geen afbeelding gevonden op klembord')
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImageFile(file)
    
    // Maak preview
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
      setPastedUrl(null)
    }
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    setPastedUrl(null)
    setMessage('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !linkUrl) {
      setMessage('❌ Titel en URL zijn verplicht')
      return
    }
    
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('category', category)
      fd.append('title', title)
      fd.append('description', description)
      fd.append('url', linkUrl)
      
      if (imageFile) {
        fd.append('image', imageFile)
      } else if (pastedUrl) {
        fd.append('image_url', pastedUrl)
      }
      
      await createApp(fd)
      setMessage('✅ App succesvol aangemaakt!')
      
      // Reset form
      setTitle('')
      setDescription('')
      setLinkUrl('')
      clearImage()
      fetchApps()
      
      // Clear message na 3 seconden
      setTimeout(() => setMessage(''), 3000)
    } catch (err: any) {
      console.error('Create error:', err)
      setMessage('❌ Fout bij aanmaken: ' + (err.message || 'Onbekende fout'))
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete app?')) return
    try {
      await deleteApp(id)
      fetchApps()
      setMessage('Deleted')
    } catch (err) {
      setMessage('Delete failed')
    }
  }

  function toggleSelectApp(id: number) {
    setSelectedApps(prev => 
      prev.includes(id) 
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    )
  }

  function toggleSelectAll() {
    if (selectedApps.length === allApps.length) {
      setSelectedApps([])
    } else {
      setSelectedApps(allApps.map(app => app.id))
    }
  }

  async function handleBulkDelete() {
    if (selectedApps.length === 0) {
      setMessage('❌ Geen items geselecteerd')
      return
    }
    
    if (!confirm(`Weet je zeker dat je ${selectedApps.length} app(s) wilt verwijderen?`)) return
    
    try {
      await Promise.all(selectedApps.map(id => deleteApp(id)))
      setSelectedApps([])
      fetchApps()
      setMessage('✅ Apps succesvol verwijderd')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage('❌ Fout bij verwijderen')
    }
  }

  if (!grouped) return <div className="p-8">Loading admin...</div>

  const allApps = [
    ...(grouped.Personeel || []), 
    ...(grouped.Administratie || []), 
    ...(grouped.MT || []), 
    ...(grouped.Overzicht || [])
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-white">
      <div className="max-w-screen-xl mx-auto px-4 py-12 space-y-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">Admin Panel</h1>

        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-700" style={{ borderWidth: '2px' }}>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New App</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as App['category'])}
                className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
              >
                <option>Personeel</option>
                <option>Administratie</option>
                <option>MT</option>
                <option>Overzicht</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
                rows={3}
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Link URL</label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Afbeelding (Upload of Plakken)</label>
            
              {/* Image Preview */}
              <AnimatePresence>
                {(imagePreview || pastedUrl) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative mb-4 inline-block"
                  >
                    <img 
                      src={imagePreview || pastedUrl || ''} 
                      alt="Preview" 
                      className="max-h-48 rounded-xl border-2 border-green-700 shadow-lg"
                      style={{ borderWidth: '2px' }}
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors border-2 border-red-400"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Upload Input */}
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-700
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-2 file:border-green-700
                    file:text-sm file:font-semibold
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100
                    cursor-pointer"
                />
                
                {/* Paste Area */}
                <div
                  ref={pasteAreaRef}
                  onPaste={handlePaste}
                  tabIndex={0}
                  className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center text-gray-600 hover:border-green-500 transition-colors cursor-pointer focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-green-50/30"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-medium">Klik hier en druk Ctrl+V</p>
                    <p className="text-sm">om een afbeelding van je klembord te plakken</p>
                  </div>
                </div>
              </div>
            </div>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl ${
                  message.startsWith('✅') ? 'bg-green-50 text-green-700' : 
                  message.startsWith('❌') ? 'bg-red-50 text-red-700' : 
                  'bg-blue-50 text-blue-700'
                }`}
              >
                {message}
              </motion.div>
            )}
            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-green-600 text-white rounded-xl px-4 py-3 font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2 border-green-700 shadow-lg hover:shadow-xl"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Bezig met opslaan...
                </>
              ) : (
                'App Aanmaken'
              )}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-700 space-y-4" style={{ borderWidth: '2px' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">All Apps</h2>
            <div className="flex items-center gap-3">
              {selectedApps.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors border-2 border-red-500 font-semibold shadow hover:shadow-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Verwijder ({selectedApps.length})
                </motion.button>
              )}
              <button
                onClick={toggleSelectAll}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors border-2 border-green-300 font-semibold shadow"
              >
                {selectedApps.length === allApps.length ? 'Deselecteer alles' : 'Selecteer alles'}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {allApps.map((app) => (
              <div key={app.id} className="flex items-center gap-4 border-b-2 border-green-200 pb-2">
                <input
                  type="checkbox"
                  checked={selectedApps.includes(app.id)}
                  onChange={() => toggleSelectApp(app.id)}
                  className="w-5 h-5 text-green-600 border-2 border-green-300 rounded focus:ring-green-500 cursor-pointer"
                />
                {app.image_url && <img src={app.image_url} alt={app.title} className="w-16 h-16 rounded-xl object-cover border-2 border-green-300 shadow" />}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{app.title}</p>
                  <p className="text-sm text-gray-600">{app.category}</p>
                </div>
                <button
                  onClick={() => handleDelete(app.id)}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors border-2 border-orange-300 font-semibold shadow hover:shadow-lg"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
