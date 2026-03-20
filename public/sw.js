// public/sw.js
// 미라클복지용구 주문서 PWA Service Worker
// CacheFirst(정적) + NetworkFirst(API) + 오프라인 fallback

const CACHE_NAME = 'miracle-v1'
const STATIC_CACHE = `miracle-static-${/* build hash */}` 
const DYNAMIC_CACHE = 'miracle-dynamic-v1'

// 프리캐시할 정적 자원
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// install: 정적 자원 프리캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    })
  )
  self.skipWaiting()
})

// activate: 구버전 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// fetch 핸들러
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 같은 origin만 처리
  if (url.origin !== self.location.origin) return

  // API 요청: NetworkFirst
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request))
    return
  }

  // Next.js 내부 데이터 요청: NetworkFirst
  if (url.pathname.startsWith('/_next/data/')) {
    event.respondWith(networkFirst(request))
    return
  }

  // 정적 자원 (_next/static, icons, manifest): CacheFirst
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // HTML 네비게이션 요청: NetworkFirst + 오프라인 fallback
  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request))
    return
  }

  // 나머지: NetworkFirst
  event.respondWith(networkFirst(request))
})

// CacheFirst 전략
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

// NetworkFirst 전략
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached || new Response('Offline', { status: 503 })
  }
}

// 네비게이션 핸들러: 네트워크 우선 + /offline fallback
async function navigationHandler(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    // 오프라인 fallback 페이지
    const offlinePage = await caches.match('/offline')
    return offlinePage || new Response('오프라인 상태입니다', {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}
