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
        <nav className="max-w-screen-2xl mx-auto bg-white/60 backdrop-blur-sm border-3 border-green-700 rounded-2xl shadow-lg" style={{ borderWidth: '3px' }}>
          <div className="px-4 sm:px-8 py-3 flex items-center justify-between">
            {/* Left section */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FF6B35;stop-opacity:1'/%3E%3Cstop offset='100%25' style='stop-color:%23F7931E;stop-opacity:1'/%3E%3C/linearGradient%3E%3ClinearGradient id='grad2' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238B4513;stop-opacity:1'/%3E%3Cstop offset='100%25' style='stop-color:%23A0522D;stop-opacity:1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='800' fill='white'/%3E%3Ccircle cx='400' cy='200' r='100' fill='url(%23grad2)'/%3E%3Cpath d='M 350 180 Q 350 160 370 160 Q 390 160 390 180' fill='none' stroke='%23000' stroke-width='3'/%3E%3Cpath d='M 410 180 Q 410 160 430 160 Q 450 160 450 180' fill='none' stroke='%23000' stroke-width='3'/%3E%3Ccircle cx='370' cy='190' r='8' fill='%23000'/%3E%3Ccircle cx='430' cy='190' r='8' fill='%23000'/%3E%3Cellipse cx='400' cy='210' rx='8' ry='12' fill='%23FFA07A'/%3E%3Cpath d='M 380 230 Q 400 250 420 230' fill='none' stroke='%23000' stroke-width='3' stroke-linecap='round'/%3E%3Crect x='200' y='350' width='400' height='350' rx='40' fill='url(%23grad1)'/%3E%3Crect x='240' y='390' width='140' height='140' rx='20' fill='%234FC3F7'/%3E%3Crect x='420' y='390' width='140' height='140' rx='20' fill='%234FC3F7'/%3E%3Crect x='240' y='560' width='140' height='140' rx='20' fill='%234FC3F7'/%3E%3Crect x='420' y='560' width='140' height='140' rx='20' fill='%234FC3F7'/%3E%3Cpath d='M 270 430 L 310 460 L 350 410' fill='none' stroke='white' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ctext x='450' y='470' font-family='Arial' font-size='60' fill='white' font-weight='bold'%3E✓%3C/text%3E%3C/svg%3E"
                  alt="DaCapo Tools Logo" 
                  className="w-12 h-12 object-contain drop-shadow-lg"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">DaCapo Tools</span>
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
