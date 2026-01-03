import { useState } from 'react'

interface Props {
  onSearch: (query: string) => void
  onClear: () => void
  loading?: boolean
}

export function SearchBar({ onSearch, onClear, loading }: Props) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  const handleClear = () => {
    setQuery('')
    onClear()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-amber-200
                     focus:border-amber-400 focus:outline-none bg-white"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-2 text-amber-600 hover:text-amber-800"
        >
          Clear
        </button>
      )}
      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="px-4 py-2 bg-amber-400 text-white rounded-lg
                   hover:bg-amber-500 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}
