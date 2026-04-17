/**
 * Claude API client with graceful fallback to mockAI.
 *
 * To enable real AI:
 *   1. Create a server endpoint that proxies to Anthropic's Messages API
 *      (NEVER expose API keys in the browser).
 *   2. Set VITE_CLAUDE_PROXY_URL in .env.local:
 *        VITE_CLAUDE_PROXY_URL=https://your-api.example.com/claude
 *   3. Optionally set VITE_CLAUDE_MODEL (default: claude-opus-4-6)
 *
 * The proxy should accept { prompt, system, temperature, maxTokens } and
 * return { text } OR Anthropic's native Messages shape { content: [{text}] }.
 */

const PROXY = (import.meta as any).env?.VITE_CLAUDE_PROXY_URL as string | undefined
const MODEL = (import.meta as any).env?.VITE_CLAUDE_MODEL || 'claude-opus-4-6'

export interface ClaudeCallOptions {
  system?: string
  prompt: string
  temperature?: number
  maxTokens?: number
}

export const isClaudeConfigured = (): boolean => !!PROXY

export const callClaude = async (opts: ClaudeCallOptions): Promise<string> => {
  if (!PROXY) {
    throw new Error('Claude proxy not configured — falling back to mock')
  }
  const res = await fetch(PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      system: opts.system,
      prompt: opts.prompt,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 2048,
    }),
  })
  if (!res.ok) throw new Error(`Claude proxy error: ${res.status}`)
  const data = await res.json()
  // Support both { text } and Anthropic native shapes
  if (typeof data.text === 'string') return data.text
  if (Array.isArray(data.content) && data.content[0]?.text) return data.content[0].text
  throw new Error('Unexpected Claude response shape')
}

/**
 * Wrapper: try Claude, fall back to the provided mock function on any failure.
 * Keeps the UX identical whether or not the API is wired.
 */
export const withClaudeFallback = async <T>(
  claudeFn: () => Promise<T>,
  mockFn: () => Promise<T>
): Promise<T> => {
  if (!isClaudeConfigured()) return mockFn()
  try {
    return await claudeFn()
  } catch (e) {
    console.warn('[claude] fallback to mock:', e)
    return mockFn()
  }
}
