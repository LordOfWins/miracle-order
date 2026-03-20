// src/components/order/SelectedProductChips.tsx

'use client'

import { formatPrice } from '@/lib/format'
import type { OrderSelectedProduct } from '@/types/order'

interface SelectedProductChipsProps {
  products: OrderSelectedProduct[]
  onRemove: (productId: number) => void
}

export default function SelectedProductChips({
  products,
  onRemove,
}: SelectedProductChipsProps) {
  return (
    <section aria-labelledby="selected-products-title" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="selected-products-title" className="text-xl font-bold text-gray-900">
          선택한 제품
        </h2>
        {/* [수정] text-base로 확대 */}
        <span className="text-base font-medium text-gray-600">
          총 {products.length}개
        </span>
      </div>

      {products.length === 0 ? (
        // [수정] text-lg로 확대
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-lg text-gray-600">
          아직 선택한 제품이 없습니다
        </div>
      ) : (
        // [수정] 리스트 역할 추가 + gap 유지
        <div className="flex flex-wrap gap-3" role="list" aria-label="선택된 제품 목록">
          {products.map((product) => (
            <div
              key={product.id}
              role="listitem"
              // [수정] py-2 -> py-2.5 터치 영역 확보 + text-lg로 확대
              className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-lg text-blue-900"
            >
              <span className="font-semibold">
                {product.name}
              </span>
              {/* [수정] text-base로 확대 */}
              <span className="text-base text-blue-700">
                {product.price > 0 ? formatPrice(product.price) : '가격 문의'}
              </span>
              <button
                type="button"
                onClick={() => onRemove(product.id)}
                // [수정] 터치 타겟 48px 이상으로 확대 (h-10 w-10 = 40px + p-1 여유)
                className="inline-flex h-11 min-h-0 w-11 items-center justify-center rounded-full bg-white text-blue-800 transition hover:bg-blue-100 focus-visible:ring-4 focus-visible:ring-blue-200"
                aria-label={`${product.name} 삭제`}
              >
                {/* [수정] 삭제 아이콘 크기 확대 */}
                <span className="text-xl font-bold" aria-hidden="true">×</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
