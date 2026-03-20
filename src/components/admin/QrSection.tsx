// src/components/admin/QrSection.tsx

'use client'

import { useCallback, useEffect, useState } from 'react'

interface QrData {
  orderUrl: string
  qrDataUrl: string
}

export default function QrSection() {
  const [qrData, setQrData] = useState<QrData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPreview = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/qr/preview')
      const json = await res.json()
      if (json.success) {
        setQrData(json.data)
      } else {
        setError(json.error || 'QR 로드 실패')
      }
    } catch {
      setError('QR 미리보기를 불러올 수 없습니다')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPreview()
  }, [fetchPreview])

  const handleDownload = async () => {
    try {
      const res = await fetch('/api/admin/qr')
      if (!res.ok) throw new Error('다운로드 실패')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'miracle-order-qr.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setError('QR 다운로드에 실패했습니다')
    }
  }

  const handleCopyUrl = async () => {
    if (!qrData?.orderUrl) return
    try {
      await navigator.clipboard.writeText(qrData.orderUrl)
      alert('주문서 URL이 복사되었습니다')
    } catch {
      // fallback
      const input = document.createElement('input')
      input.value = qrData.orderUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      alert('주문서 URL이 복사되었습니다')
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <h2 className="mb-4 text-xl font-bold text-gray-900">주문서 QR 코드</h2>

      {loading && (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>
      )}

      {qrData && !loading && (
        <div className="space-y-4">
          {/* QR 미리보기 */}
          <div className="flex justify-center">
            <img
              src={qrData.qrDataUrl}
              alt="주문서 QR 코드"
              width={256}
              height={256}
              className="rounded-xl border border-gray-200"
            />
          </div>

          {/* 주문서 URL */}
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="mb-1 text-sm font-medium text-gray-500">주문서 URL</p>
            <p className="break-all text-sm text-gray-900">{qrData.orderUrl}</p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-700 active:scale-[0.98]"
            >
              QR 다운로드
            </button>
            <button
              onClick={handleCopyUrl}
              className="flex-1 rounded-xl bg-gray-200 py-3 text-base font-semibold text-gray-800 transition hover:bg-gray-300 active:scale-[0.98]"
            >
              URL 복사
            </button>
          </div>

          <p className="text-center text-sm text-gray-500">
            이 QR코드를 인쇄하거나 공유하면 고객이 바로 주문서에 접속할 수 있습니다
          </p>
        </div>
      )}
    </div>
  )
}
