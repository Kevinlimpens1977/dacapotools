import axios from 'axios'
import type { AppsGrouped, App } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
})

// Add auth token to requests if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface LoginResponse {
  token: string;
}

export async function login(password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/login', { password })
  return res.data
}

export async function getAppsByCategory(category: string): Promise<App[]> {
  const res = await api.get<App[]>(`/apps?category=${category}`)
  return res.data
}

export async function getAllAppsGrouped(): Promise<AppsGrouped> {
  const res = await api.get<AppsGrouped>('/apps/all')
  // Zorg ervoor dat het response object altijd alle categorieën heeft
  const data = res.data || {};
  return {
    Personeel: Array.isArray(data.Personeel) ? data.Personeel : [],
    Administratie: Array.isArray(data.Administratie) ? data.Administratie : [],
    MT: Array.isArray(data.MT) ? data.MT : [],
    Overzicht: Array.isArray(data.Overzicht) ? data.Overzicht : []
  };
}

export async function createApp(data: FormData): Promise<App> {
  const res = await api.post<App>('/apps', data, {
    headers: { 
      'Content-Type': 'multipart/form-data'
    }
  })
  return res.data
}

interface PasteImageResponse {
  imageUrl: string;
}

export async function pasteImage(base64: string, filename?: string): Promise<PasteImageResponse> {
  const res = await api.post<PasteImageResponse>('/paste-image', { base64, filename })
  return res.data
}

export async function updateApp(id: number, data: FormData): Promise<App> {
  const res = await api.put<App>(`/apps/${id}`, data, {
    headers: { 
      'Content-Type': 'multipart/form-data'
    }
  })
  return res.data
}

export async function deleteApp(id: number): Promise<void> {
  await api.delete(`/apps/${id}`)
}
