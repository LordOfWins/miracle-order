// [원인] 사이드바가 w-64 고정이라 모바일에서 화면 전체를 차지하면서 콘텐츠를 밀어냄 → 글자 세로 찍힘
// [수정] 모바일에서 오버레이 드로어로 전환 + 햄버거 버튼 + 바깥 터치/ESC로 닫기

// src/components/admin/AdminSidebar.tsx

'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

const menuItems = [
  { label: '카테고리 관리', href: '/admin', icon: '📂' },
  { label: '제품 관리', href: '/admin/products', icon: '📦' },
  { label: '설정', href: '/admin/settings', icon: '⚙️' },
]

export default function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // 페이지 전환 시 모바일 드로어 닫기
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // ESC 키로 드로어 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    if (mobileOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // 모바일 드로어 열렸을 때 body 스크롤 방지
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch {
      setLoggingOut(false)
    }
  }

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href)
      setMobileOpen(false)
    },
    [router],
  )

  // 사이드바 내부 콘텐츠 (데스크톱/모바일 공용)
  const sidebarContent = (
    <>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">미라클복지용구</h2>
        <p className="text-sm text-gray-500 mt-1">관리자 패널</p>
      </div>

      <nav className="flex-1 p-4 space-y-1" aria-label="관리자 메뉴">
        {menuItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)

          return (
            <button
              key={item.href}
              onClick={() => handleNavigate(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition text-lg ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ minHeight: '52px' }}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition text-lg"
          style={{ minHeight: '52px' }}
        >
          <span>🚪</span>
          <span>{loggingOut ? '로그아웃 중...' : '로그아웃'}</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ===== 모바일 상단 헤더 (md 미만에서만 표시) ===== */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-white border-b border-gray-200 px-4 md:hidden" style={{ height: '60px' }}>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center rounded-xl text-gray-700 hover:bg-gray-100 transition"
          style={{ width: '52px', height: '52px' }}
          aria-label="메뉴 열기"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="text-lg font-bold text-gray-900">미라클복지용구</span>
        {/* 오른쪽 빈 공간 (레이아웃 균형용) */}
        <div style={{ width: '52px' }} />
      </header>

      {/* ===== 모바일 오버레이 드로어 (md 미만) ===== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* 백드롭 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* 드로어 패널 */}
          <aside
            className="absolute top-0 left-0 bottom-0 w-72 bg-white flex flex-col shadow-xl animate-slide-in-left"
            role="dialog"
            aria-modal="true"
            aria-label="관리자 메뉴"
          >
            {/* 닫기 버튼 */}
            <div className="flex items-center justify-end p-2">
              <button
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition"
                style={{ width: '52px', height: '52px' }}
                aria-label="메뉴 닫기"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ===== 데스크톱 고정 사이드바 (md 이상에서만 표시) ===== */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 min-h-screen flex-col flex-shrink-0">
        {sidebarContent}
      </aside>
    </>
  )
}
