// src/components/OfflineContent.tsx

'use client'

export default function OfflineContent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
          <svg
            className="h-12 w-12 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4m0 4h.01"
            />
          </svg>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          인터넷 연결 없음
        </h1>
        <p className="mb-6 text-lg text-gray-600">
          네트워크 연결을 확인한 후 다시 시도해주세요
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-2xl bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
        >
          다시 시도
        </button>
      </div>
    </main>
  )
}
