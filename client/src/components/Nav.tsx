import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
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
      <div className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 pt-4">
        <nav className="max-w-screen-2xl mx-auto bg-white/60 backdrop-blur-sm border-2 border-green-700 rounded-2xl shadow-lg" style={{ borderWidth: '2px' }}>
          <div className="px-4 sm:px-8 py-3 flex items-center justify-between">
            {/* Left section */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                className="w-12 h-12 flex items-center justify-center"
                whileHover={{ 
                  rotate: [0, -12, 12, -8, 8, -4, 4, 0],
                  scale: [1, 1.15, 1.1, 1.15, 1.1],
                  y: [0, -5, 0, -3, 0]
                }}
                transition={{ 
                  duration: 0.8,
                  ease: "easeInOut",
                  times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 1]
                }}
              >
                <motion.svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 200 200" 
                  className="w-12 h-12 drop-shadow-lg"
                  whileHover={{
                    filter: "drop-shadow(0 0 8px rgb(16 185 129))"
                  }}
                >
                  <defs>
                    <linearGradient id="grad3d" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
                    </linearGradient>
                    <filter id="shadow3d">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                      <feOffset dx="2" dy="2" result="offsetblur"/>
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.5"/>
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <rect x="20" y="20" width="160" height="160" rx="20" fill="url(#grad3d)" stroke="#065f46" strokeWidth="4" filter="url(#shadow3d)"/>
                  <rect x="25" y="25" width="150" height="150" rx="15" fill="none" stroke="#34d399" strokeWidth="2" opacity="0.3"/>
                  <text x="100" y="140" fontSize="120" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">D</text>
                </motion.svg>
              </motion.div>
              <motion.span 
                className="text-2xl font-black bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent" 
                style={{ lineHeight: '1.5', transform: 'scaleY(1.5)', transformOrigin: 'center', display: 'inline-block' }}
                whileHover={{ 
                  scale: 1.08,
                  y: -4,
                  letterSpacing: "0.05em"
                }}
                transition={{ 
                  duration: 0.5,
                  ease: "easeOut"
                }}
              >
                DaCapo Tools
              </motion.span>
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
                  <motion.div
                    whileHover={{
                      backgroundColor: "rgb(249 115 22)",
                      borderColor: "rgb(234 88 12)",
                      boxShadow: "0 0 25px rgba(249, 115, 22, 0.6)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut"
                    }}
                    className="rounded-full bg-white/90 backdrop-blur-sm border-orange-500 shadow-lg group"
                    style={{ borderWidth: '3px' }}
                  >
                    <Link 
                      to="/admin" 
                      className="px-6 py-2.5 flex items-center gap-2 font-medium"
                    >
                      <svg className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="none">
                        <path d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                      <span className="text-orange-600 group-hover:text-white transition-colors duration-300">Administrator</span>
                    </Link>
                  </motion.div>
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{
                      backgroundColor: "rgb(249 115 22)",
                      borderColor: "rgb(234 88 12)",
                      boxShadow: "0 0 25px rgba(249, 115, 22, 0.6)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut"
                    }}
                    className="px-6 py-2.5 rounded-full bg-white/90 backdrop-blur-sm border-orange-500 shadow-lg font-medium group"
                    style={{ borderWidth: '3px' }}
                  >
                    <span className="text-orange-600 group-hover:text-white transition-colors duration-300">Logout</span>
                  </motion.button>
                </>
              ) : (
                <motion.div
                  whileHover={{
                    backgroundColor: "rgb(249 115 22)",
                    borderColor: "rgb(234 88 12)",
                    boxShadow: "0 0 25px rgba(249, 115, 22, 0.6)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut"
                  }}
                  className="rounded-full bg-white/90 backdrop-blur-sm border-orange-500 shadow-lg group"
                  style={{ borderWidth: '3px' }}
                >
                  <Link 
                    to="/login" 
                    className="px-6 py-2.5 flex items-center gap-2 font-medium"
                  >
                    <svg className="w-5 h-5 text-orange-600 group-hover:text-white transition-colors duration-300" viewBox="0 0 24 24" fill="none">
                      <path d="M12 4a4 4 0 100 8 4 4 0 000-8zM6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    <span className="text-orange-600 group-hover:text-white transition-colors duration-300">Login</span>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </nav>
      </div>
      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-20"></div>
    </>
  )
}
