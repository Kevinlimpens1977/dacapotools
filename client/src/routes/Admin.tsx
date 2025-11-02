import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [pastedUrl, setPastedUrl] = useState<string | null>(null)
  const [message, setMessage] = useState('')
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
      setGrouped(data)
    } catch (e) {
      console.error(e)
    }
  }

  async function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile()
        if (!blob) continue
        const reader = new FileReader()
        reader.onload = async () => {
          try {
            const res = await pasteImage(reader.result as string, 'clipboard.png')
            setPastedUrl(res.imageUrl)
            setMessage('Image pasted! Ready to save.')
          } catch (err) {
            setMessage('Paste image failed')
          }
        }
        reader.readAsDataURL(blob)
        return
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const fd = new FormData()
      fd.append('category', category)
      fd.append('title', title)
      fd.append('description', description)
      fd.append('link_url', linkUrl)
      // Use pastedUrl if available, else imageFile
      if (pastedUrl) {
        fd.append('image_url', pastedUrl)
      } else if (imageFile) {
        fd.append('image', imageFile)
      }
      await createApp(fd)
      setMessage('App created!')
      setTitle('')
      setDescription('')
      setLinkUrl('')
      setImageFile(null)
      setPastedUrl(null)
      fetchApps()
    } catch (err) {
      setMessage('Create failed')
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

  if (!grouped) return <div className="p-8">Loading admin...</div>

  const allApps = [...grouped.Personeel, ...grouped.Administratie, ...grouped.MT, ...grouped.Overzicht]

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>

      <div className="bg-white rounded-2xl p-8 shadow space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Add New App</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as App['category'])}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Link URL</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Image (Upload or Paste)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="mb-2"
            />
            <div
              onPaste={handlePaste}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500 hover:border-accent-500 transition-colors"
            >
              {pastedUrl ? (
                <img src={pastedUrl} alt="Pasted preview" className="max-h-48 mx-auto rounded-lg" />
              ) : (
                'Click here and press Ctrl+V to paste an image'
              )}
            </div>
          </div>
          {message && <p className="text-sm text-green-600">{message}</p>}
          <button
            type="submit"
            className="w-full bg-accent-600 text-white rounded-xl px-4 py-3 font-semibold hover:bg-accent-700 transition-colors"
          >
            Create App
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">All Apps</h2>
        <div className="space-y-2">
          {allApps.map((app) => (
            <div key={app.id} className="flex items-center gap-4 border-b pb-2">
              {app.image_url && <img src={app.image_url} alt={app.title} className="w-16 h-16 rounded object-cover" />}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{app.title}</p>
                <p className="text-sm text-gray-600">{app.category}</p>
              </div>
              <button
                onClick={() => handleDelete(app.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
