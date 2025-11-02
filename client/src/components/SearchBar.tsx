import { useState } from 'react'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-[95rem] mx-auto px-4 sm:px-8 py-4">
        <div className="relative max-w-2xl mx-auto">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Zoek apps..."
            className="w-full pl-12 pr-6 py-3 bg-white/50 hover:bg-white focus:bg-white border border-gray-200 rounded-xl 
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                     transition-all duration-200 text-base placeholder-gray-400"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
