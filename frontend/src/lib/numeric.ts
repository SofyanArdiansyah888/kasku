/** Format angka untuk tampilan input (pemisah ribuan id-ID). */
export function formatNumericInput(value: number | undefined | null): string {
  if (value === undefined || value === null || Number.isNaN(value) || value === 0) return ''
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value)
}

/** Parse string input (dengan/tanpa pemisah ribuan) ke number bulat. */
export function parseNumericInput(raw: string): number {
  const cleaned = raw.replace(/\./g, '').replace(/,/g, '').replace(/\D/g, '')
  if (!cleaned) return 0
  const n = parseInt(cleaned, 10)
  return Number.isNaN(n) ? 0 : n
}
