import { Link, useNavigate } from 'react-router-dom'

export default function Nav() {
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-gray-900">
          DaCapo Tools
        </Link>
        <div className="flex items-center gap-4">
          {token ? (
            <>
              <Link to="/admin" className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors">
                Admin
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-accent-600 text-white rounded-xl font-semibold hover:bg-accent-700 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-accent-600 text-white rounded-xl font-semibold hover:bg-accent-700 transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
