import { useState, useRef, useEffect } from 'react'
import type { SearchResult } from '@stickies/core'
import { RelatedNotes } from './RelatedNotes'

interface Props {
  onSubmit: (content: string, source?: 'text' | 'voice') => void
  disabled?: boolean
  inputRef?: React.RefObject<HTMLTextAreaElement>
  // Context matching props
  relatedNotes?: SearchResult[]
  relatedLoading?: boolean
  onInputChange?: (value: string) => void
  onLinkNote?: (noteId: string) => void
  onViewNote?: (noteId: string) => void
}

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function NoteInput({
  onSubmit,
  disabled,
  inputRef: externalRef,
  relatedNotes = [],
  relatedLoading = false,
  onInputChange,
  onLinkNote,
  onViewNote,
}: Props) {
  const [value, setValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [showRelated, setShowRelated] = useState(true)
  const internalRef = useRef<HTMLTextAreaElement>(null)
  const inputRef = externalRef || internalRef
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
    // Check if speech recognition is supported
    setSpeechSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  }, [])

  const handleSubmit = (source: 'text' | 'voice' = 'text') => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed, source)
    setValue('')
    onInputChange?.('')
    setShowRelated(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onInputChange?.(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit('text')
    }
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        setValue((prev) => prev + finalTranscript)
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const handleVoiceSubmit = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }
    if (value.trim()) {
      handleSubmit('voice')
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled || isListening}
        placeholder={isListening ? 'Listening...' : "What's on your mind?"}
        className={`w-full p-4 pr-24 text-lg rounded-xl border-2
                   focus:outline-none resize-none
                   bg-white shadow-sm placeholder:text-amber-300
                   ${isListening ? 'border-red-400 bg-red-50' : 'border-amber-200 focus:border-amber-400'}`}
        rows={2}
      />
      <div className="absolute right-3 bottom-3 flex gap-2">
        {speechSupported && (
          <button
            onClick={isListening ? handleVoiceSubmit : toggleListening}
            disabled={disabled}
            className={`p-2 rounded-lg transition-colors
                       ${isListening
                         ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                         : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
                       disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isListening ? 'Stop and save' : 'Start voice input'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </button>
        )}
        <button
          onClick={() => handleSubmit(isListening ? 'voice' : 'text')}
          disabled={disabled || !value.trim()}
          className="p-2 rounded-lg
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

      {/* Related notes suggestions */}
      {showRelated && (relatedNotes.length > 0 || relatedLoading) && (
        <RelatedNotes
          results={relatedNotes}
          loading={relatedLoading}
          onLinkNote={onLinkNote}
          onViewNote={onViewNote}
          onDismiss={() => setShowRelated(false)}
        />
      )}
    </div>
  )
}
