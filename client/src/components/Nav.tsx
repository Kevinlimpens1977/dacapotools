import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import SearchBar from './SearchBar'

interface NavProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function Nav({ search, onSearchChange }: NavProps) {
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          {/* Left section */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">DaCapo Toolbox</span>
          </Link>

          {/* Center section */}
          <div className="flex-1 flex justify-center">
            <div className="w-96">
              <SearchBar value={search} onChange={onSearchChange} />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {token ? (
              <>
                <Link 
                  to="/admin" 
                  className="px-6 py-2.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Administrator
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all duration-200 shadow-sm hover:shadow"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Login
              </Link>
            )}
          </div>
        </div>
        <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-b-lg"></div>
      </nav>
      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16"></div>
    </>
  )
}
