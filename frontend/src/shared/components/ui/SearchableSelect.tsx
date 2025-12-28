/**
 * Componente SearchableSelect - Combobox con búsqueda
 */
import { useState, useRef, useEffect, useMemo } from 'react'

export interface SearchableSelectOption {
  value: string | number
  label: string
  sublabel?: string
}

interface SearchableSelectProps {
  label?: string
  options: SearchableSelectOption[]
  value: string | number | null
  onChange: (value: string | number | null) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  searchPlaceholder?: string
  noResultsText?: string
  className?: string
}

export default function SearchableSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  error,
  disabled = false,
  required = false,
  searchPlaceholder = 'Buscar...',
  noResultsText = 'Sin resultados',
  className = ''
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Find selected option
  const selectedOption = useMemo(() => {
    return options.find(opt => opt.value === value)
  }, [options, value])

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options
    const term = searchTerm.toLowerCase()
    return options.filter(opt =>
      opt.label.toLowerCase().includes(term) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(term))
    )
  }, [options, searchTerm])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setSearchTerm('')
      }
    }
  }

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setSearchTerm('')
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-4 py-2.5 
          text-left bg-white border rounded-xl transition-all
          ${error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }
          ${disabled 
            ? 'bg-gray-100 cursor-not-allowed text-gray-500' 
            : 'hover:border-gray-400 cursor-pointer'
          }
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
        `}
      >
        <span className={`flex-1 truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              <span>{selectedOption.label}</span>
              {selectedOption.sublabel && (
                <span className="text-xs text-gray-500 font-mono">{selectedOption.sublabel}</span>
              )}
            </span>
          ) : (
            placeholder
          )}
        </span>
        
        <div className="flex items-center gap-1 ml-2">
          {/* Clear button */}
          {selectedOption && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {/* Chevron */}
          <svg 
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <svg className="h-8 w-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">{noResultsText}</p>
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors
                    flex items-center justify-between
                    ${option.value === value ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${option.value === value ? 'text-blue-700' : 'text-gray-900'}`}>
                      {option.label}
                    </p>
                    {option.sublabel && (
                      <p className="text-xs text-gray-500 font-mono truncate">
                        {option.sublabel}
                      </p>
                    )}
                  </div>
                  {option.value === value && (
                    <svg className="h-5 w-5 text-blue-600 flex-shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
