// [원인] 탭 선택 시 scrollIntoView 호출이 없어서 "수동휠체어"처럼 긴 이름의 탭이 스크롤 영역 밖에서 잘리거나 밀림 + sm:flex-wrap이 모바일에서 의도치 않게 줄바꿈 유발
// [수정] 탭 클릭 시 scrollIntoView({ inline: 'center' }) 자동 호출 + sm:flex-wrap 제거하고 항상 가로 스크롤 + snap-x mandatory 적용

// src/components/order/CategoryTabs.tsx

'use client'

import type { PublicCategoryItem } from '@/types/order'
import { useCallback, useEffect, useRef } from 'react'

interface CategoryTabsProps {
  categories: PublicCategoryItem[]
  selectedCategoryId: number | null
  onSelect: (categoryId: number) => void
}

export default function CategoryTabs({
  categories,
  selectedCategoryId,
  onSelect,
}: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  // 선택된 탭이 바뀔 때마다 해당 탭을 뷰포트 중앙으로 스크롤
  useEffect(() => {
    if (selectedCategoryId == null) return
    const btn = tabRefs.current.get(selectedCategoryId)
    if (btn) {
      // requestAnimationFrame으로 iOS Safari 렌더 타이밍 보정
      requestAnimationFrame(() => {
        btn.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      })
    }
  }, [selectedCategoryId])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex = index
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        nextIndex = (index + 1) % categories.length
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        nextIndex = (index - 1 + categories.length) % categories.length
      } else if (e.key === 'Home') {
        e.preventDefault()
        nextIndex = 0
      } else if (e.key === 'End') {
        e.preventDefault()
        nextIndex = categories.length - 1
      } else {
        return
      }

      onSelect(categories[nextIndex].id)

      const btn = tabRefs.current.get(categories[nextIndex].id)
      btn?.focus()
    },
    [categories, onSelect],
  )

  const setTabRef = useCallback(
    (id: number) => (el: HTMLButtonElement | null) => {
      if (el) {
        tabRefs.current.set(id, el)
      } else {
        tabRefs.current.delete(id)
      }
    },
    [],
  )

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-6 text-center text-lg text-gray-600">
        등록된 카테고리가 없습니다
      </div>
    )
  }

  return (
    <section aria-labelledby="category-section-title" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="category-section-title"
          className="text-xl font-bold text-gray-900"
        >
          제품 분류 선택
        </h2>
        <span className="text-base font-medium text-gray-600">
          {categories.length}개 분류
        </span>
      </div>

      {/*
        핵심 수정 포인트:
        1. sm:flex-wrap sm:overflow-x-visible 제거 → 항상 가로 스크롤
        2. snap-x snap-mandatory 추가 → 탭이 정확한 위치에 멈춤
        3. -webkit-overflow-scrolling: touch → iOS Safari 관성 스크롤
        4. overscroll-x-contain → 스크롤 전파 방지
      */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide overscroll-x-contain snap-x snap-mandatory"
        role="tablist"
        aria-label="카테고리 목록"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {categories.map((category, index) => {
          const selected = selectedCategoryId === category.id

          return (
            <button
              key={category.id}
              ref={setTabRef(category.id)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`category-panel-${category.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onSelect(category.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`flex-shrink-0 snap-center whitespace-nowrap rounded-2xl border px-5 py-3.5 text-lg font-semibold transition outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${
                selected
                  ? 'border-blue-700 bg-blue-700 text-white'
                  : 'border-gray-300 bg-white text-gray-900 hover:border-blue-400 hover:bg-blue-50'
              }`}
              style={{ minHeight: '52px', minWidth: '52px' }}
            >
              {category.name}
            </button>
          )
        })}
      </div>
    </section>
  )
}
