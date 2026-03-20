// src/app/page.tsx

import OrderForm from '@/components/order/OrderForm'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <header className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100 sm:p-7">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            미라클복지용구 주문서
          </h1>
          <p className="mt-3 text-lg leading-8 text-gray-700">
            필요한 제품을 선택한 뒤 주문 정보를 입력해주세요
          </p>
        </header>

        <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-6">
          <OrderForm />
        </section>
      </div>
    </main>
  )
}
