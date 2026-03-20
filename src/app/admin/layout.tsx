// [원인] flex 레이아웃에서 사이드바가 모바일에서도 w-64로 렌더되어 main이 찌그러짐 + p-8이 모바일에서 너무 넓음
// [수정] 모바일에서 상단 헤더(60px) 만큼 padding-top 추가 + 패딩 반응형 처리

// src/app/admin/layout.tsx

'use client'

import AdminSidebar from '@/components/admin/AdminSidebar'
import AuthProxy from '@/components/admin/AuthProxy'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AuthProxy>
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        {/*
          모바일: pt-[76px]는 상단 헤더 60px + 여유 16px
          모바일: px-4 py-4로 좁은 패딩
          데스크톱: md:pt-8 md:px-8 md:py-8 원래 패딩
        */}
        <main className="flex-1 min-w-0 px-4 pt-[76px] pb-4 md:p-8 md:pt-8">
          {children}
        </main>
      </div>
    </AuthProxy>
  )
}
