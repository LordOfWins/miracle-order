// src/components/admin/LoginForm.tsx

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const loginSchema = z.object({
  loginId: z.string().min(1, '아이디를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!result.success) {
        setError(result.error || '로그인에 실패했습니다')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('네트워크 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">
          관리자 로그인
        </h1>

        {/* [수정] noValidate 추가 - 브라우저 기본 유효성 비활성화 후 zod에 위임 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            {/* [수정] text-base로 확대 (admin이지만 통일성) */}
            <label htmlFor="loginId" className="block text-base font-medium text-gray-700 mb-1">
              아이디
            </label>
            <input
              id="loginId"
              type="text"
              autoComplete="username"
              // [수정] text-base 유지 + aria-invalid 추가
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base"
              placeholder="아이디를 입력하세요"
              aria-invalid={!!errors.loginId}
              aria-describedby={errors.loginId ? 'loginId-error' : undefined}
              {...register('loginId')}
            />
            {errors.loginId && (
              // [수정] text-sm -> text-base로 확대 + id 추가
              <p id="loginId-error" className="mt-1 text-base text-red-500" role="alert">
                {errors.loginId.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base"
              placeholder="비밀번호를 입력하세요"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-base text-red-500" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* [수정] 서버 에러도 role="alert" 추가 + 폰트 확대 */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-base font-medium" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            // [수정] py-3.5로 터치 영역 확대
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3.5 rounded-xl transition text-lg"
            style={{ minHeight: '52px' }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
