import { useState } from 'react'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Zoek apps..."
        className={`w-full pl-11 pr-4 py-3 glass-card rounded-2xl
                  focus:outline-none transition-all duration-300 text-sm text-gray-800 placeholder-gray-400
                  ${isFocused ? 'shadow-apple-lg shadow-glow scale-[1.02]' : 'shadow-apple hover:shadow-apple-lg'}
                  ${!isFocused && !value ? 'animate-breathe' : ''}`}
      />
      <svg
        className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300
                   ${isFocused ? 'text-apple-400' : 'text-gray-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  )
}
