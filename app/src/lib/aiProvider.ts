/**
 * Unified AI provider. Supports:
 *   - Gemini (Google AI Studio, REST API v1beta)
 *   - Claude (Anthropic, via browser-friendly proxy)
 *   - Custom proxy (any backend returning { text } or Anthropic-native shape)
 *
 * The user sets their provider + API key in Settings (stored in localStorage).
 * For Gemini, the key is used directly in the browser (it's designed for
 * client-side use in AI Studio demos). For Claude, we recommend a proxy but
 * also support `dangerouslyAllowBrowser` for rapid prototyping.
 *
 * Whenever the API fails or no provider is configured, callers fall back to
 * the deterministic mock generators in `lib/mockAI.ts`.
 */

export type AIProvider = 'mock' | 'gemini' | 'claude' | 'proxy'

export interface AISettings {
  provider: AIProvider
  geminiKey?: string
  geminiModel?: string
  anthropicKey?: string
  anthropicModel?: string
  proxyUrl?: string
  proxyModel?: string
}

const STORAGE_KEY = 'ai-provider-settings-v1'

export const loadAISettings = (): AISettings => {
  if (typeof localStorage === 'undefined') return { provider: 'mock' }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { provider: 'mock' }
    return JSON.parse(raw)
  } catch {
    return { provider: 'mock' }
  }
}

export const saveAISettings = (settings: AISettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export const isProviderConfigured = (s: AISettings = loadAISettings()): boolean => {
  if (s.provider === 'gemini' && s.geminiKey) return true
  if (s.provider === 'claude' && s.anthropicKey) return true
  if (s.provider === 'proxy' && s.proxyUrl) return true
  return false
}

export interface CallOptions {
  system?: string
  prompt: string
  temperature?: number
  maxTokens?: number
  json?: boolean // request JSON-mode output when supported
}

// --------------------------------------------------------------------
// Gemini (Google AI Studio) — free tier key works directly in browser.
// Model examples: gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash
// --------------------------------------------------------------------
const callGemini = async (settings: AISettings, opts: CallOptions): Promise<string> => {
  const model = settings.geminiModel || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.geminiKey}`

  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: opts.prompt }],
      },
    ],
    systemInstruction: opts.system
      ? { parts: [{ text: opts.system }] }
      : undefined,
    generationConfig: {
      temperature: opts.temperature ?? 0.7,
      maxOutputTokens: opts.maxTokens ?? 4096,
      ...(opts.json ? { responseMimeType: 'application/json' } : {}),
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned an empty response')
  return text
}

// --------------------------------------------------------------------
// Claude (Anthropic)
// Browser-side needs anthropic-dangerous-direct-browser-access header
// --------------------------------------------------------------------
const callClaude = async (settings: AISettings, opts: CallOptions): Promise<string> => {
  const model = settings.anthropicModel || 'claude-opus-4-6'
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.anthropicKey!,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: opts.maxTokens ?? 4096,
      system: opts.system,
      messages: [{ role: 'user', content: opts.prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  const text = data.content?.[0]?.text
  if (!text) throw new Error('Claude returned an empty response')
  return text
}

// --------------------------------------------------------------------
// Custom proxy
// --------------------------------------------------------------------
const callProxy = async (settings: AISettings, opts: CallOptions): Promise<string> => {
  const res = await fetch(settings.proxyUrl!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: settings.proxyModel || 'claude-opus-4-6',
      system: opts.system,
      prompt: opts.prompt,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 4096,
    }),
  })

  if (!res.ok) throw new Error(`Proxy error ${res.status}`)
  const data = await res.json()
  if (typeof data.text === 'string') return data.text
  if (Array.isArray(data.content) && data.content[0]?.text) return data.content[0].text
  throw new Error('Unexpected proxy response shape')
}

// --------------------------------------------------------------------
// Dispatcher
// --------------------------------------------------------------------
export const callAI = async (opts: CallOptions): Promise<string> => {
  const settings = loadAISettings()
  if (!isProviderConfigured(settings)) {
    throw new Error('No AI provider configured — fall back to mock')
  }
  switch (settings.provider) {
    case 'gemini':
      return callGemini(settings, opts)
    case 'claude':
      return callClaude(settings, opts)
    case 'proxy':
      return callProxy(settings, opts)
    default:
      throw new Error('Unknown AI provider')
  }
}

/**
 * Extract JSON safely from a model response that may wrap it in prose or code fences.
 */
export const extractJSON = <T = any>(raw: string): T => {
  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fencedMatch ? fencedMatch[1] : raw
  const objMatch = candidate.match(/\{[\s\S]*\}/)
  if (!objMatch) throw new Error('No JSON object found in response')
  return JSON.parse(objMatch[0])
}

/**
 * Run a Claude-or-mock function with graceful fallback.
 * If the real provider fails, use the mock, optionally notifying via onFallback.
 */
export const withAIFallback = async <T>(
  aiFn: () => Promise<T>,
  mockFn: () => Promise<T>,
  onFallback?: (err: Error) => void
): Promise<T> => {
  const settings = loadAISettings()
  if (!isProviderConfigured(settings)) return mockFn()
  try {
    return await aiFn()
  } catch (e) {
    console.warn('[AI] fallback to mock:', e)
    onFallback?.(e as Error)
    return mockFn()
  }
}
