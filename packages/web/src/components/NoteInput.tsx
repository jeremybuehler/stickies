import { useState, useRef, useEffect } from 'react'

interface Props {
  onSubmit: (content: string) => void
  disabled?: boolean
}

export function NoteInput({ onSubmit, disabled }: Props) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="What's on your mind?"
        className="w-full p-4 pr-12 text-lg rounded-xl border-2 border-amber-200
                   focus:border-amber-400 focus:outline-none resize-none
                   bg-white shadow-sm placeholder:text-amber-300"
        rows={2}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="absolute right-3 bottom-3 p-2 rounded-lg
                   bg-amber-400 text-white hover:bg-amber-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}
