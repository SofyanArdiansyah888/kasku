import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { formatNumericInput, parseNumericInput } from '../../lib/numeric'

interface NumericInputProps {
  value: number
  onChange: (value: number) => void
  className?: string
  placeholder?: string
  required?: boolean
  id?: string
}

function countDigitsBefore(text: string, cursorPos: number): number {
  return text.slice(0, cursorPos).replace(/\D/g, '').length
}

function cursorAfterDigits(formatted: string, digitCount: number): number {
  if (digitCount <= 0) return 0
  let seen = 0
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) seen++
    if (seen >= digitCount) return i + 1
  }
  return formatted.length
}

export function NumericInput({
  value,
  onChange,
  className = 'form-input',
  placeholder,
  required,
  id,
}: NumericInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const focusedRef = useRef(false)
  const pendingCursor = useRef<number | null>(null)
  const [display, setDisplay] = useState(() => formatNumericInput(value))

  // Sinkron dari prop saat tidak fokus (mis. buka modal edit)
  useEffect(() => {
    if (!focusedRef.current) {
      setDisplay(formatNumericInput(value))
    }
  }, [value])

  useLayoutEffect(() => {
    if (pendingCursor.current === null || !inputRef.current || !focusedRef.current) return
    const pos = pendingCursor.current
    pendingCursor.current = null
    inputRef.current.setSelectionRange(pos, pos)
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const cursorPos = e.target.selectionStart ?? raw.length
    const digitsOnly = raw.replace(/\D/g, '')
    const parsed = digitsOnly === '' ? 0 : parseNumericInput(digitsOnly)
    const formatted = digitsOnly === '' ? '' : formatNumericInput(parsed)

    pendingCursor.current = cursorAfterDigits(formatted, countDigitsBefore(raw, cursorPos))
    setDisplay(formatted)
    onChange(parsed)
  }

  const handleFocus = () => {
    focusedRef.current = true
  }

  const handleBlur = () => {
    focusedRef.current = false
    const formatted = formatNumericInput(value)
    setDisplay(formatted)
  }

  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      inputMode="numeric"
      className={className}
      placeholder={placeholder}
      required={required}
      value={display}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  )
}
