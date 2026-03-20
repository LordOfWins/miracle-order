// src/lib/loadDaumPostcode.ts

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: {
          zonecode: string
          roadAddress: string
          jibunAddress: string
          buildingName: string
          apartment: string
        }) => void
      }) => {
        open: () => void
      }
    }
  }
}

let scriptLoadingPromise: Promise<void> | null = null

export async function loadDaumPostcodeScript(): Promise<void> {
  if (typeof window === 'undefined') return
  if (window.daum?.Postcode) return

  if (scriptLoadingPromise) {
    return scriptLoadingPromise
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-daum-postcode="true"]'
    ) as HTMLScriptElement | null

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('주소 스크립트 로드 실패')), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.src =
      'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    script.defer = true
    script.dataset.daumPostcode = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('주소 스크립트 로드 실패'))
    document.body.appendChild(script)
  })

  return scriptLoadingPromise
}
