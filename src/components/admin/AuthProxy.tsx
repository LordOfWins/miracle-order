// src/components/admin/AuthProxy.tsx

'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthProxy({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 설정 API를 이용해 인증 상태 확인 (JWT 쿠키 검증 포함)
        const res = await fetch('/api/admin/me')
        const result = await res.json()

        if (result.success) {
          setAuthorized(true)
        } else {
          router.replace('/admin/login')
        }
      } catch {
        router.replace('/admin/login')
      } finally {
        setChecking(false)
      }
    }

    checkAuth()
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400 text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!authorized) return null

  return <>{children}</>
}
