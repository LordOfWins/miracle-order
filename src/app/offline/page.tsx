// src/app/offline/page.tsx

import OfflineContent from '@/components/OfflineContent'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '오프라인 - 미라클복지용구',
}

export default function OfflinePage() {
  return <OfflineContent />
}
