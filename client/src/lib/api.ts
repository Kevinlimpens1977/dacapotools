import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function login(password: string) {
  const res = await api.post('/login', { password })
  return res.data
}

export async function getAppsByCategory(category: string) {
  const res = await api.get(`/apps?category=${category}`)
  return res.data
}

export async function getAllAppsGrouped() {
  const res = await api.get('/apps/all')
  return res.data
}

export async function createApp(data: FormData) {
  const res = await api.post('/apps', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function pasteImage(base64: string, filename?: string) {
  const res = await api.post('/paste-image', { base64, filename })
  return res.data
}

export async function updateApp(id: number, data: FormData) {
  const res = await api.put(`/apps/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function deleteApp(id: number) {
  await api.delete(`/apps/${id}`)
}
