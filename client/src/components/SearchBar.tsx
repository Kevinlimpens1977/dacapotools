import { useState } from 'react'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Zoek apps..."
        className="w-full pl-10 pr-4 py-2 bg-white border-2 border-emerald-700 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent
                  transition-all duration-200 text-sm text-gray-900 placeholder-gray-500"
      />
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-700"
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
  )
}
