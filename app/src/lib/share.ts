/**
 * Client-side share link generator.
 *
 * Encodes the deliverable as a compact base64 payload in the URL hash.
 * Visitors to the link see a read-only version of the output.
 *
 * For production deployments, replace this with a real server-side share
 * endpoint that stores a snapshot and returns a short URL.
 */

export type ShareableKind =
  | 'curriculum'
  | 'idea'
  | 'research'
  | 'sales'
  | 'email'
  | 'pricing'
  | 'growth'
  | 'bundle'

export interface SharePayload {
  kind: ShareableKind
  title: string
  data: any
  createdAt: number
  app: 'test-with-abdulaziz'
}

// Unicode-safe base64 (handles Arabic)
const toBase64 = (s: string): string => {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const fromBase64 = (s: string): string => {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - (s.length % 4)) % 4)
  const bin = atob(padded)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

export const createShareLink = (kind: ShareableKind, title: string, data: any): string => {
  const payload: SharePayload = {
    kind,
    title,
    data,
    createdAt: Date.now(),
    app: 'test-with-abdulaziz',
  }
  const encoded = toBase64(JSON.stringify(payload))
  const origin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''
  return `${origin}#share=${encoded}`
}

export const parseShareLink = (): SharePayload | null => {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash
  const match = hash.match(/share=([^&]+)/)
  if (!match) return null
  try {
    const json = fromBase64(match[1])
    const payload = JSON.parse(json)
    if (payload?.app !== 'test-with-abdulaziz') return null
    return payload as SharePayload
  } catch {
    return null
  }
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.top = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    try {
      document.execCommand('copy')
      return true
    } finally {
      document.body.removeChild(ta)
    }
  }
}
