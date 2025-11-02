import { useState } from 'react'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-6">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search apps..."
          className="w-full max-w-2xl mx-auto px-6 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-accent-500 transition-shadow text-lg"
        />
      </div>
    </div>
  )
}
