import { Outlet, useOutletContext } from 'react-router-dom'
import Nav from '../components/Nav'
import { useState } from 'react'

type ContextType = { search: string; setSearch: (value: string) => void }

export default function App() {
  const [search, setSearch] = useState('')

  return (
    <div className="min-h-screen flex flex-col">
      <Nav search={search} onSearchChange={setSearch} />
      <main className="flex-1">
        <Outlet context={{ search, setSearch }} />
      </main>
    </div>
  )
}

export function useSearch() {
  return useOutletContext<ContextType>()
}
