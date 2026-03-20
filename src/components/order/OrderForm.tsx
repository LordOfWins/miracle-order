// src/components/order/OrderForm.tsx

'use client'

import { formatPhoneNumber } from '@/lib/format'
import { loadDaumPostcodeScript } from '@/lib/loadDaumPostcode'
import { orderSchema } from '@/lib/schemas/order'
import { useOrderStore } from '@/store/useOrderStore'
import type { PublicProductItem } from '@/types/order'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import CategoryTabs from './CategoryTabs'
import ImageUploader from './ImageUploader'
import ProductGrid from './ProductGrid'
import SelectedProductChips from './SelectedProductChips'

type FormValues = z.input<typeof orderSchema>

export default function OrderForm() {
  const {
    categories,
    selectedCategoryId,
    productMapByCategory,
    selectedProductMap,
    formData,
    images,
    isLoading,
    error,
    setCategories,
    setSelectedCategoryId,
    setProductsByCategory,
    toggleProduct,
    removeSelectedProduct,
    updateFormData,
    addImage,
    removeImage,
    setLoading,
    setError,
    resetOrder,
  } = useOrderStore()

  const [productLoading, setProductLoading] = useState(false)
  const [noticeText, setNoticeText] = useState<string | null>(null)
  const selectedProducts = useMemo(
    () => Array.from(selectedProductMap.values()),
    [selectedProductMap]
  )
  const selectedProductIds = useMemo(
    () => new Set(selectedProducts.map((product) => product.id)),
    [selectedProducts]
  )

  const currentProducts: PublicProductItem[] = useMemo(() => {
    if (!selectedCategoryId) return []
    return productMapByCategory[selectedCategoryId] || []
  }, [productMapByCategory, selectedCategoryId])

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      adminId: formData.adminId,
      productIds: [],
      requestNote: formData.requestNote,
      centerName: formData.centerName,
      writerPhone: formData.writerPhone,
      recipientName: formData.recipientName,
      gender: formData.gender === '' ? undefined : formData.gender,
      copayType: formData.copayType === '' ? null : formData.copayType,
      contactPhone1: formData.contactPhone1,
      contactPhone2: formData.contactPhone2,
      roadAddress: formData.roadAddress,
      detailAddress: formData.detailAddress,
      zipCode: formData.zipCode,
      tempImageIds: formData.tempImageIds,
    },
    mode: 'onChange',
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch('/api/categories?adminId=1')
        const result = await res.json()

        if (!result.success) {
          setError(result.error || '카테고리 조회 실패')
          return
        }

        setCategories(result.data)
      } catch {
        setError('네트워크 오류로 카테고리를 불러오지 못했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [setCategories, setError, setLoading])

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await fetch('/api/settings?adminId=1')
        const result = await res.json()
        if (result?.success) {
          setNoticeText(result.data?.noticeText ?? null)
        }
      } catch {
        setNoticeText(null)
      }
    }

    fetchNotice()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedCategoryId) return
      if (productMapByCategory[selectedCategoryId]) return

      try {
        setProductLoading(true)

        const res = await fetch(`/api/products?categoryId=${selectedCategoryId}`)
        const result = await res.json()

        if (!result.success) {
          alert(result.error || '제품 조회 실패')
          return
        }

        setProductsByCategory(selectedCategoryId, result.data)
      } catch {
        alert('네트워크 오류로 제품을 불러오지 못했습니다')
      } finally {
        setProductLoading(false)
      }
    }

    fetchProducts()
  }, [productMapByCategory, selectedCategoryId, setProductsByCategory])

  useEffect(() => {
    setValue(
      'productIds',
      selectedProducts.map((product) => product.id),
      { shouldValidate: true }
    )
  }, [selectedProducts, setValue])

  useEffect(() => {
    setValue('tempImageIds', images.map((image) => image.id), {
      shouldValidate: true,
    })
  }, [images, setValue])

  const writerPhone = watch('writerPhone')
  const contactPhone1 = watch('contactPhone1')
  const contactPhone2 = watch('contactPhone2')

  useEffect(() => {
    const subscription = watch((formValues) => {
      updateFormData({
        requestNote: formValues.requestNote || '',
        centerName: formValues.centerName || '',
        writerPhone: formValues.writerPhone || '',
        recipientName: formValues.recipientName || '',
        gender: (formValues.gender || '') as '남' | '여' | '',
        copayType: ((formValues.copayType || '') as '본부유' | '본부대체' | '본부50%할인' | ''),
        contactPhone1: formValues.contactPhone1 || '',
        contactPhone2: formValues.contactPhone2 || '',
        roadAddress: formValues.roadAddress || '',
        detailAddress: formValues.detailAddress || '',
        zipCode: formValues.zipCode || '',
        tempImageIds: images.map((image) => image.id),
      })
    })
    return () => subscription.unsubscribe()
  }, [watch, updateFormData, images])

  const handlePhoneChange = (
    field:
      | 'writerPhone'
      | 'contactPhone1'
      | 'contactPhone2',
    value: string
  ) => {
    const formatted = formatPhoneNumber(value)
    setValue(field, formatted, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const openAddressSearch = async () => {
    try {
      await loadDaumPostcodeScript()

      if (!window.daum?.Postcode) {
        alert('주소 검색 서비스를 불러오지 못했습니다')
        return
      }

      new window.daum.Postcode({
        oncomplete: (data) => {
          setValue('zipCode', data.zonecode, { shouldValidate: true })
          setValue('roadAddress', data.roadAddress, { shouldValidate: true })
        },
      }).open()
    } catch {
      alert('주소 검색 스크립트를 불러오지 못했습니다')
    }
  }

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true)
      setError(null)

      const payload = {
        ...values,
        requestNote: values.requestNote || '',
        copayType: values.copayType ?? null,
        contactPhone1: values.contactPhone1 || '',
        contactPhone2: values.contactPhone2 || '',
        roadAddress: values.roadAddress || '',
        detailAddress: values.detailAddress || '',
        zipCode: values.zipCode || '',
      }

      const parsed = orderSchema.safeParse(payload)
      if (!parsed.success) {
        const firstIssue = parsed.error.issues[0]
        setError(firstIssue?.message || '입력값을 확인해주세요')
        return
      }

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsed.data),
      })

      const result = await res.json()

      if (!result.success) {
        setError(result.error || '주문 접수 실패')
        return
      }

      alert('주문이 정상 접수되었습니다')

      resetOrder()
      reset({
        adminId: 1,
        productIds: [],
        requestNote: '',
        centerName: '',
        writerPhone: '',
        recipientName: '',
        gender: undefined,
        copayType: null,
        contactPhone1: '',
        contactPhone2: '',
        roadAddress: '',
        detailAddress: '',
        zipCode: '',
        tempImageIds: [],
      })

      if (categories.length > 0) {
        setSelectedCategoryId(categories[0].id)
      }
    } catch {
      setError('네트워크 오류로 주문 접수에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    const confirmed = confirm('입력한 주문 내용을 모두 삭제하시겠습니까')
    if (!confirmed) return

    resetOrder()
    reset({
      adminId: 1,
      productIds: [],
      requestNote: '',
      centerName: '',
      writerPhone: '',
      recipientName: '',
      gender: undefined,
      copayType: null,
      contactPhone1: '',
      contactPhone2: '',
      roadAddress: '',
      detailAddress: '',
      zipCode: '',
      tempImageIds: [],
    })

    if (categories.length > 0) {
      setSelectedCategoryId(categories[0].id)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {noticeText ? (
        <section
          aria-label="공지사항"
          className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-900"
        >
          <h2 className="text-base font-bold mb-2">공지사항</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
            {noticeText}
          </p>
        </section>
      ) : null}

      <CategoryTabs
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />

      <ProductGrid
        categoryId={selectedCategoryId}
        products={currentProducts}
        selectedProductIds={selectedProductIds}
        onToggle={toggleProduct}
        isLoading={productLoading}
      />

      <SelectedProductChips
        products={selectedProducts}
        onRemove={removeSelectedProduct}
      />

      <section aria-labelledby="request-note-title" className="space-y-3">
        <h2 id="request-note-title" className="text-xl font-bold text-gray-900">
          세부 요청사항
        </h2>
        <textarea
          {...register('requestNote')}
          rows={4}
          placeholder="요청사항이 있다면 자유롭게 입력해주세요"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-500 focus:border-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200"
        />
      </section>

      <section aria-labelledby="customer-info-title" className="space-y-4">
        <h2 id="customer-info-title" className="text-xl font-bold text-gray-900">
          주문자 정보
        </h2>

        <div className="space-y-2">
          <label htmlFor="centerName" className="block font-semibold text-gray-900">
            기관명 또는 센터명
          </label>
          <input
            id="centerName"
            type="text"
            {...register('centerName')}
            placeholder="예시 미라클복지센터"
            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-500 focus:border-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200"
          />
          {errors.centerName ? (
            <p className="text-base font-medium text-red-700">
              {errors.centerName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="writerPhone" className="block font-semibold text-gray-900">
            작성자 연락처
          </label>
          <input
            id="writerPhone"
            type="tel"
            inputMode="numeric"
            value={getValues('writerPhone')}
            onChange={(e) => handlePhoneChange('writerPhone', e.target.value)}
            placeholder="010-0000-0000"
            aria-invalid={!!errors.writerPhone}
            aria-describedby={errors.writerPhone ? 'writerPhone-error' : undefined}
            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-500 focus:border-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200"
          />
          {errors.writerPhone ? (
            <p className="text-base font-medium text-red-700">
              {errors.writerPhone.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="recipientName" className="block font-semibold text-gray-900">
            수급자 성함
          </label>
          <input
            id="recipientName"
            type="text"
            {...register('recipientName')}
            placeholder="수급자 성함 입력"
            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-500 focus:border-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200"
          />
          {errors.recipientName ? (
            <p className="text-base font-medium text-red-700">
              {errors.recipientName.message}
            </p>
          ) : null}
        </div>

        <fieldset className="space-y-2">
          <legend className="block font-semibold text-gray-900">성별</legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="cursor-pointer">
              <input
                type="radio"
                value="남"
                {...register('gender')}
                className="sr-only"
              />
              <div className={`rounded-2xl border px-4 py-4 text-center font-bold transition ${watch('gender') === '남'
                ? 'border-blue-700 bg-blue-700 text-white'
                : 'border-gray-300 bg-white text-gray-900'
                }`}>
                남
              </div>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                value="여"
                {...register('gender')}
                className="sr-only"
              />
              <div className={`rounded-2xl border px-4 py-4 text-center font-bold transition ${watch('gender') === '여'
                ? 'border-blue-700 bg-blue-700 text-white'
                : 'border-gray-300 bg-white text-gray-900'
                }`}>
                여
              </div>
            </label>
          </div>
          {errors.gender ? (
            <p className="text-base font-medium text-red-700">
              {errors.gender.message}
            </p>
          ) : null}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="block font-semibold text-gray-900">본인부담금 (선택)</legend>
          <input type="hidden" {...register('copayType')} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(['본부유', '본부대체', '본부50%할인'] as const).map((value) => {
              const selected = watch('copayType') === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setValue('copayType', selected ? null : value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }}
                  className={`rounded-2xl border px-4 py-4 text-center font-bold transition ${
                    selected
                      ? 'border-blue-700 bg-blue-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                  }`}
                  aria-pressed={selected}
                >
                  {value}
                </button>
              )
            })}
          </div>
          {errors.copayType ? (
            <p className="text-base font-medium text-red-700">
              {errors.copayType.message as string}
            </p>
          ) : null}
          {watch('copayType') ? (
            <button
              type="button"
              onClick={() =>
                setValue('copayType', null, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              className="text-sm font-semibold text-gray-700 underline underline-offset-4"
            >
              선택 해제
            </button>
          ) : null}
        </fieldset>

        <div className="space-y-2">
          <label htmlFor="contactPhone1" className="block font-semibold text-gray-900">
            연락처1
          </label>
          <input
            id="contactPhone1"
            type="tel"
            inputMode="numeric"
            value={contactPhone1 || ''}
            onChange={(event) => handlePhoneChange('contactPhone1', event.target.value)}
            placeholder="010-1234-5678"
            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-500 focus:border-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200"
          />
          {errors.contactPhone1 ? (
            <p className="text-base font-medium text-red-700">
              {errors.contactPhone1.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="contactPhone2" className="block font-semibold text-gray-900">
            연락처2
          </label>
          <input
            id="contactPhone2"
            type="tel"
            inputMode="numeric"
            value={contactPhone2 || ''}
            onChange={(event) => handlePhoneChange('contactPhone2', event.target.value)}
            placeholder="010-1234-5678"
            className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-500 focus:border-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200"
          />
          {errors.contactPhone2 ? (
            <p className="text-base font-medium text-red-700">
              {errors.contactPhone2.message}
            </p>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="address-title" className="space-y-4">
        <h2 id="address-title" className="text-xl font-bold text-gray-900">
          주소
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
          <input
            type="text"
            {...register('zipCode')}
            placeholder="우편번호"
            readOnly
            className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none"
          />
          <button
            type="button"
            onClick={openAddressSearch}
            className="rounded-2xl border border-blue-700 bg-white px-5 py-3 font-semibold text-blue-800 transition hover:bg-blue-50 focus-visible:ring-4 focus-visible:ring-blue-200"
          >
            주소 검색
          </button>
        </div>

        <input
          type="text"
          {...register('roadAddress')}
          placeholder="도로명주소"
          readOnly
          className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 outline-none"
        />

        <input
          type="text"
          {...register('detailAddress')}
          placeholder="상세주소 입력"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-500 focus:border-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200"
        />
      </section>

      <ImageUploader images={images} onAdd={addImage} onRemove={removeImage} />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-base font-semibold text-red-800">
          {error}
        </div>
      ) : null}

      {errors.productIds ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-base font-semibold text-red-800">
          {errors.productIds.message}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-2xl border border-gray-400 bg-white px-5 py-4 font-bold text-gray-900 transition hover:bg-gray-100 focus-visible:ring-4 focus-visible:ring-gray-200"
        >
          주문내용삭제
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-2xl border border-blue-700 bg-blue-700 px-5 py-4 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 focus-visible:ring-4 focus-visible:ring-blue-200"
        >
          {isLoading ? '주문 접수 중입니다' : '주문완료'}
        </button>
      </div>
    </form>
  )
}
