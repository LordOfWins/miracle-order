// src/components/admin/SettingsManager.tsx

'use client'

import { useAdminStore } from '@/store/admin'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import QRCodeSection from './QRCodeSection'

const settingsSchema = z.object({
  receivePhone: z
    .string()
    .min(10, '올바른 전화번호를 입력해주세요')
    .max(20)
    .regex(/^[0-9-]+$/, '숫자와 하이픈(-)만 입력 가능합니다'),
  noticeText: z.string().max(10000, '공지사항은 10000자 이내로 입력해주세요').optional(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function SettingsManager() {
  const { setting, setSetting } = useAdminStore()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings')
        const result = await res.json()
        if (result.success) {
          setSetting(result.data)
          reset({
            receivePhone: result.data.receivePhone,
            noticeText: result.data.noticeText || '',
          })
        }
      } catch {
        console.error('설정 로딩 실패')
      }
    }
    fetchSettings()
  }, [setSetting, reset])

  const onSubmit = async (data: SettingsFormData) => {
    setLoading(true)
    setError('')
    setSaved(false)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (result.success) {
        setSetting(result.data)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(result.error || '저장 실패')
      }
    } catch {
      setError('네트워크 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">설정</h1>

      {/* 수신번호 설정 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-lg">
        <h2 className="text-lg font-semibold mb-4">수신 연락처</h2>
        <p className="text-sm text-gray-500 mb-5">
          주문서가 전송될 수신 번호를 설정합니다
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="receivePhone" className="block text-sm font-medium text-gray-700 mb-1">
              수신번호
            </label>
            <input
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="010-0000-0000"
              {...register('receivePhone')}
            />
            {errors.receivePhone && (
              <p className="mt-1 text-sm text-red-500">
                {errors.receivePhone.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="noticeText" className="block text-sm font-medium text-gray-700 mb-1">
              공지사항
            </label>
            <textarea
              id="noticeText"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="주문서 상단에 표시될 공지/참고사항을 입력하세요"
              {...register('noticeText')}
            />
            {errors.noticeText && (
              <p className="mt-1 text-sm text-red-500">
                {errors.noticeText.message}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm" role="alert">
              {error}
            </div>
          )}

          {saved && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm" role="status">
              저장되었습니다
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition font-medium"
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </form>
      </div>

      {/* QR 코드 섹션 */}
      <QRCodeSection />
    </div>
  )
}
