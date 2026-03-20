// src/components/order/ImageUploader.tsx

'use client'

import type { TempUploadItem } from '@/types/order'
import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'

interface ImageUploaderProps {
  images: TempUploadItem[]
  onAdd: (image: TempUploadItem) => void
  onRemove: (imageId: string) => void
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']
const MAX_SIZE = 5 * 1024 * 1024
const MAX_COUNT = 5

export default function ImageUploader({
  images,
  onAdd,
  onRemove,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  // [수정] 에러 상태 추가 (alert 대신 인라인 에러 표시)
  const [error, setError] = useState<string | null>(null)

  // [수정] useCallback으로 메모이제이션
  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setError(null)

    const remainCount = MAX_COUNT - images.length
    if (remainCount <= 0) {
      setError('이미지는 최대 5장까지 첨부할 수 있습니다')
      return
    }

    const files = Array.from(fileList).slice(0, remainCount)

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('JPG 또는 PNG 파일만 업로드 가능합니다')
        continue
      }

      if (file.size > MAX_SIZE) {
        setError('파일 크기는 5MB 이하여야 합니다')
        continue
      }

      try {
        setUploading(true)

        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload/temp', {
          method: 'POST',
          body: formData,
        })

        const result = await res.json()

        if (!result.success) {
          setError(result.error || '이미지 업로드 실패')
          continue
        }

        onAdd(result.data)
      } catch {
        setError('네트워크 오류로 업로드에 실패했습니다')
      } finally {
        setUploading(false)
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      }
    }
  }, [images.length, onAdd])

  // [수정] 드래그 앤 드롭 지원
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  return (
    <section aria-labelledby="image-upload-title" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="image-upload-title" className="text-xl font-bold text-gray-900">
          서류 사진 첨부
        </h2>
        {/* [수정] text-base로 확대 */}
        <span className="text-base font-medium text-gray-600">
          {images.length}/{MAX_COUNT}장
        </span>
      </div>

      <div
        className={`rounded-2xl border bg-white p-4 transition ${
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        // [수정] 드래그 앤 드롭 이벤트
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          multiple
          className="sr-only"
          // [수정] id + aria-describedby 추가
          id="image-upload-input"
          aria-describedby="image-upload-help"
          onChange={(event) => handleFiles(event.target.files)}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || images.length >= MAX_COUNT}
          // [수정] py-3.5로 터치 영역 확대 + text-lg 확대
          className="w-full rounded-2xl border border-blue-700 bg-blue-700 px-4 py-3.5 text-lg font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 focus-visible:ring-4 focus-visible:ring-blue-200"
          style={{ minHeight: '52px' }}
          aria-label={uploading ? '업로드 중' : '서류 사진 선택하기'}
        >
          {uploading ? '업로드 중입니다' : '사진 선택하기'}
        </button>

        {/* [수정] text-base로 확대 */}
        <p id="image-upload-help" className="mt-3 text-base leading-6 text-gray-600">
          JPG JPEG PNG 형식만 가능하며 각각 5MB 이하만 업로드됩니다
        </p>

        {/* [수정] 인라인 에러 표시 (alert 대신) */}
        {error ? (
          <div
            className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-base font-medium text-red-700"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {images.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3" role="list" aria-label="첨부된 이미지 목록">
            {images.map((image) => (
              <div
                key={image.id}
                role="listitem"
                className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.imageUrl}
                    alt="첨부 이미지 미리보기"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                    // [수정] lazy loading 명시
                    loading="lazy"
                    unoptimized
                  />
                </div>
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => onRemove(image.id)}
                    // [수정] py-2.5로 터치 영역 확대 + text-lg
                    className="w-full rounded-xl border border-red-200 bg-white px-3 py-2.5 text-lg font-semibold text-red-700 transition hover:bg-red-50 focus-visible:ring-4 focus-visible:ring-red-200"
                    style={{ minHeight: '48px' }}
                    aria-label={`${image.fileName} 삭제`}
                  >
                    개별 삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
