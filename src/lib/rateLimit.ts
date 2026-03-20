
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

interface RateLimitOptions {
  windowMs: number  // 시간 윈도우 (밀리초)
  maxRequests: number  // 윈도우 내 최대 요청 수
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true }
  }

  if (entry.count >= options.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfter }
  }

  entry.count++
  return { allowed: true }
}

// 주기적 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(key)
  }
}, 60_000)
