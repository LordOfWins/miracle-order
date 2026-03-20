// src/components/admin/QRCodeSection.tsx

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export default function QRCodeSection() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [orderUrl, setOrderUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const qrUrlRef = useRef<string | null>(null)

  const loadQR = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/qr', { cache: 'no-store' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'QR 코드 로드 실패')
      }

      const blob = await res.blob()
      // 이전 URL revoke
      if (qrUrlRef.current) {
        URL.revokeObjectURL(qrUrlRef.current)
      }
      const dataUrl = URL.createObjectURL(blob)
      qrUrlRef.current = dataUrl
      setQrDataUrl(dataUrl)

      const settingsRes = await fetch('/api/admin/settings')
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        if (settingsData.success && settingsData.data?.orderUrl) {
          setOrderUrl(settingsData.data.orderUrl)
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'QR 코드 로드 실패'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadQR()
    return () => {
      if (qrUrlRef.current) {
        URL.revokeObjectURL(qrUrlRef.current)
      }
    }
  }, [loadQR])

  const handleDownload = async () => {
    try {
      const res = await fetch('/api/admin/qr', { method: 'POST' })
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
    } catch (err) {
      alert(err instanceof Error ? err.message : '다운로드 실패')
    }
  }

  const handleCopyUrl = async () => {
    if (!orderUrl) return
    try {
      await navigator.clipboard.writeText(orderUrl)
      alert('주문서 URL이 복사되었습니다')
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = orderUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('주문서 URL이 복사되었습니다')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">주문서 QR 코드</h2>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-600 mb-3">{error}</p>
          <button
            onClick={loadQR}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      )}

      {!loading && !error && qrDataUrl && (
        <div className="flex flex-col items-stretch gap-4">
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-white self-center">
            <img
              src={qrDataUrl}
              alt="주문서 QR 코드"
              width={256}
              height={256}
              className="block"
            />
          </div>

          {orderUrl && (
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주문서 URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={orderUrl}
                  className="min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600 truncate"
                />
                <button
                  onClick={handleCopyUrl}
                  className="shrink-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 whitespace-nowrap"
                  style={{ minHeight: '44px' }}
                >
                  복사
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              QR 이미지 다운로드
            </button>
            <button
              onClick={loadQR}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              새로고침
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center self-center">
            이 QR을 스캔하면 고객이 주문서 페이지로 이동합니다
            <br />
            인쇄하여 매장에 비치하거나 카카오톡으로 공유하세요
          </p>
        </div>
      )}
    </div>
  )
}
