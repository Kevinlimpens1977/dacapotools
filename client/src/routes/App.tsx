import { Outlet } from 'react-router-dom'
import Nav from '../components/Nav'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
