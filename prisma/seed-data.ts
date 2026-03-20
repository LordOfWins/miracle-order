// prisma/seed-data.ts

export const categories = [
  { name: "전동침대", sortOrder: 1 },
  { name: "수동휠체어", sortOrder: 2 },
  { name: "욕창예방매트리스", sortOrder: 3 },
  { name: "이동욕조", sortOrder: 4 },
  { name: "목욕의자", sortOrder: 5 },
  { name: "이동변기", sortOrder: 6 },
  { name: "성인용보행기", sortOrder: 7 },
  { name: "욕창예방방석", sortOrder: 8 },
  { name: "자세변환용구", sortOrder: 9 },
  { name: "미끄럼방지양말", sortOrder: 10 },
  { name: "미끄럼방지용품", sortOrder: 11 },
  { name: "안전손잡이", sortOrder: 12 },
  { name: "경사로", sortOrder: 13 },
  { name: "요실금팬티", sortOrder: 14 },
  { name: "지팡이", sortOrder: 15 },
  { name: "간이변기", sortOrder: 16 },
];

export const products = [
  // ===== 전동침대 (p.05~06) =====
  {
    category: "전동침대",
    name: "JB920LITE",
    imageUrl: "/uploads/products/jb920lite.webp",
    price: 70400,
    description: "제품번호: S030900035103 / 제조사: 폴리텍 / 무게: 82Kg / 안전동작하중: 170Kg / 모터: 3개 / 매트리스: 스펀지(방염)",
    note: "대여 / 월대여료 70,400원 / 본인부담금 15%: 10,560 / 9%: 6,330 / 6%: 4,220"
  },
  {
    category: "전동침대",
    name: "JB920",
    imageUrl: "/uploads/products/jb920.webp",
    price: 74100,
    description: "제품번호: S030900035009 / 제조사: 폴리텍 / 무게: 100Kg / 안전동작하중: 170Kg / 모터: 3개 / 매트리스: 스펀지(방염)",
    note: "대여 / 월대여료 74,100원 / 본인부담금 15%: 11,110 / 9%: 6,660 / 6%: 4,440"
  },
  {
    category: "전동침대",
    name: "JB-910",
    imageUrl: "/uploads/products/jb-910.webp",
    price: 72800,
    description: "제품번호: S030900030005 / 제조사: 폴리텍 / 무게: 95Kg / 안전동작하중: 170Kg / 모터: 3개 / 매트리스: 스펀지(방염)",
    note: "대여 / 월대여료 72,800원 / 본인부담금 15%: 10,920 / 9%: 6,550 / 6%: 4,360"
  },
  {
    category: "전동침대",
    name: "DM-A30",
    imageUrl: "/uploads/products/dm-a30.webp",
    price: 72200,
    description: "제품번호: S030901/8001 / 제조사: 에이(원의료기) / 무게: 98Kg / 안전동작하중: 200Kg / 모터: 3개 / 매트리스: 스펀지(지방염)",
    note: "대여 / 월대여료 72,200원 / 본인부담금 15%: 10,830 / 9%: 6,490 / 6%: 4,330"
  },
  {
    category: "전동침대",
    name: "DM-A50",
    imageUrl: "/uploads/products/dm-a50.webp",
    price: 74600,
    description: "제품번호: S030901/8002 / 제조사: 에이의료기 / 무게: 98Kg / 안전동작하중: 200Kg / 모터: 3개 / 매트리스: 스펀지(지방염)",
    note: "대여 / 월대여료 74,600원 / 본인부담금 15%: 11,190 / 9%: 6,710 / 6%: 4,470"
  },
  {
    category: "전동침대",
    name: "MSP-0005 (안전손잡이)",
    imageUrl: "/uploads/products/msp-0005-안전손잡이.webp",
    price: 231000,
    description: "제품번호: F18030175001 / 제조사: (주)명성실버케어 / 무게: 7.87Kg / 안전동작하중: 80Kg / 사이즈: 40×199~250cm / 재질: PVC, PIPE 등",
    note: "구입 / 구입금액 231,000원 / 본인부담금 15%: 34,650 / 9%: 20,790 / 6%: 13,860"
  },

  // ===== 수동휠체어 (p.07~08) =====
  {
    category: "수동휠체어",
    name: "MIRAGE7(22D)-B",
    imageUrl: "/uploads/products/mirage722d-b.webp",
    price: 34300,
    description: "제품번호: M180300/43014 / 제조사: (주)미키코리아 / 무게: 15.5Kg / 재질: 폴리에틸렌, 고무, EVA / 안전동작하중: 100Kg+α",
    note: "대여 / 고급형 / 월대여료 34,300원 / 본인부담금 15%: 5,140 / 9%: 3,060 / 6%: 2,050"
  },
  {
    category: "수동휠체어",
    name: "MF-22D",
    imageUrl: "/uploads/products/mf-22d.webp",
    price: 28200,
    description: "제품번호: M18030043104 / 제조사: (주)미키코리아 / 재질: 폴리에틸렌, 고무, EVA / 무게: 10.6Kg / 안전동작하중: 100Kg+α",
    note: "대여 / 경량형 / 월대여료 28,200원 / 본인부담금 15%: 4,230 / 9%: 2,530 / 6%: 1,690"
  },
  {
    category: "수동휠체어",
    name: "HAL-48(22D)",
    imageUrl: "/uploads/products/hal-4822d.webp",
    price: 44600,
    description: "제품번호: M18030043002 / 제조사: (주)미키코리아 / 재질: 폴리에틸렌, 고무, EVA / 무게: 17.5Kg / 안전동작하중: 100Kg+α",
    note: "대여 / 침대형 / 월대여료 44,600원 / 본인부담금 15%: 6,690 / 9%: 4,010 / 6%: 2,670"
  },
  {
    category: "수동휠체어",
    name: "MIRAGE7(22D)",
    imageUrl: "/uploads/products/mirage722d.webp",
    price: 33100,
    description: "제품번호: M180300/43001 / 제조사: (주)미키코리아 / 재질: 폴리에틸렌, 고무, EVA / 무게: 15.5Kg / 안전동작하중: 100Kg+α",
    note: "대여 / 고급형 / 월대여료 33,100원 / 본인부담금 15%: 4,960 / 9%: 2,970 / 6%: 1,980"
  },

  // ===== 욕창예방매트리스 (p.09) =====
  {
    category: "욕창예방매트리스",
    name: "YH-0302TPU",
    imageUrl: "/uploads/products/yh-0302tpu.webp",
    price: 281000,
    description: "제품번호: H12060031101 / 제조사: 영화의료기 / 재질: 폴리우레탄 / 무게: 1.4Kg / 안전동작하중: 150Kg+α",
    note: "내구연한 3년 / 대여 또는 구입 / 대여-월대여료 23,400원 본인부담금 15%: 3,510 / 9%: 2,100 / 6%: 1,400 / 구입-구입금액 281,000원 본인부담금 15%: 42,150 / 9%: 25,290 / 6%: 16,860"
  },
  {
    category: "욕창예방매트리스",
    name: "YB-1104A",
    imageUrl: "/uploads/products/yb-1104a.webp",
    price: 241000,
    description: "제품번호: H12060031003 / 제조사: 영화의료기 / 재질: 폴리우레탄 / 무게: 1.5Kg / 안전동작하중: 150Kg+α",
    note: "내구연한 3년 / 대여 또는 구입 / 대여-월대여료 20,100원 본인부담금 15%: 3,010 / 9%: 1,800 / 6%: 1,200 / 구입-구입금액 241,000원 본인부담금 15%: 36,150 / 9%: 21,690 / 6%: 14,460"
  },
  {
    category: "욕창예방매트리스",
    name: "AD-1300 MUTE Bio Double",
    imageUrl: "/uploads/products/ad-1300-mute-bio-double.webp",
    price: 271000,
    description: "제품번호: H12060030016 / 제조사: (주)영원메디칼 / 재질: 항균 PVC / 무게: 4.2Kg / 안전동작하중: 140Kg+α",
    note: "내구연한 3년 / 구입 수면모드 / 구입금액 271,000원 / 본인부담금 15%: 40,650 / 9%: 24,390 / 6%: 16,260"
  },
  {
    category: "욕창예방매트리스",
    name: "AD-1300 MUTE FOAM",
    imageUrl: "/uploads/products/ad-1300-mute-foam.webp",
    price: 454000,
    description: "제품번호: H12060030015 / 제조사: (주)영원메디칼 / 재질: 항균 PVC / 무게: 4.5Kg / 안전동작하중: 100Kg+α",
    note: "내구연한 3년 / 구입 수면모드 / 구입금액 454,000원 / 본인부담금 15%: 68,100 / 9%: 40,860 / 6%: 27,240"
  },
  {
    category: "욕창예방매트리스",
    name: "GR-1004H",
    imageUrl: "/uploads/products/gr-1004h.webp",
    price: 273000,
    description: "제품번호: H12060196001 / 제조사: 그린케기(주) / 재질: 항균 PVC / 무게: 1.4Kg / 안전동작하중: 100Kg+α",
    note: "내구연한 3년 / 구입 보온기능 / 구입금액 273,000원 / 본인부담금 15%: 40,950 / 9%: 24,570 / 6%: 16,380"
  },
  {
    category: "욕창예방매트리스",
    name: "YH-0102BB",
    imageUrl: "/uploads/products/yh-0102bb.webp",
    price: 100000,
    description: "제품번호: 20180223-001 / 제조사: 영화의료기 / 재질: 폴리우레탄 / 무게: 1.5Kg / 안전동작하중: 150Kg+α",
    note: "비급여 / 판매금액 100,000원"
  },

  // ===== 이동욕조 (p.10) =====
  {
    category: "이동욕조",
    name: "YH-2002",
    imageUrl: "/uploads/products/yh-2002.webp",
    price: 33400,
    description: "제품번호: B030030031001 / 제조사: 영화의료기 / 재질: 항균 PVC / 무게: 6.2Kg / 안전동작하중: 250Kg+α",
    note: "대여 / 월대여료 33,400원 / 본인부담금 15%: 5,010 / 9%: 3,000 / 6%: 2,000"
  },
  {
    category: "이동욕조",
    name: "YH-2013",
    imageUrl: "/uploads/products/yh-2013.webp",
    price: 26700,
    description: "제품번호: B030030031002 / 제조사: 영화의료기 / 재질: 항균 PVC / 무게: 4.8Kg / 안전동작하중: 250Kg+α",
    note: "대여 / 월대여료 26,700원 / 본인부담금 15%: 4,000 / 9%: 1,600 / 6%: 1,600"
  },

  // ===== 목욕의자 (p.11) =====
  {
    category: "목욕의자",
    name: "BOFEEL8",
    imageUrl: "/uploads/products/bofeel8.webp",
    price: 178000,
    description: "제품번호: B03180025104 / 제조사: (주)보필 / 무게: 5.3Kg / 재질: 폴리에틸렌, 고무, EVA / 안전동작하중: 100Kg",
    note: "내구연한 5년 / 구입 / 구입금액 178,000원 / 본인부담금 15%: 26,700 / 9%: 16,020 / 6%: 10,680"
  },
  {
    category: "목욕의자",
    name: "BOFEEL11",
    imageUrl: "/uploads/products/bofeel11.webp",
    price: 187000,
    description: "제품번호: B03180025014 / 제조사: 보필 / 무게: 5.8Kg / 재질: 폴리에틸렌, 고무, EVA / 안전동작하중: 95Kg",
    note: "내구연한 5년 / 급여비용 / 구입금액 187,000원 / 본인부담금(급) 15%: 28,050 / 9%: 16,830 / 6%: 11,220"
  },
  {
    category: "목욕의자",
    name: "BOFEEL10",
    imageUrl: "/uploads/products/bofeel10.webp",
    price: 171000,
    description: "제품번호: B03180025012 / 제조사: 보필 / 무게: 5Kg / 재질: 알루미늄, EVA / 안전동작하중: 95Kg",
    note: "내구연한 5년 / 구입 / 구입금액 171,000원 / 본인부담금 15%: 25,650 / 9%: 15,390 / 6%: 10,260"
  },
  {
    category: "목욕의자",
    name: "ASC-502",
    imageUrl: "/uploads/products/asc-502.webp",
    price: 186000,
    description: "제품번호: B03180060004 / 제조사: 아시아엘이 / 무게: 4.5Kg / 재질: 알루미늄, 폴리우레탄 / 안전동작하중: 95Kg",
    note: "내구연한 5년 / 구입 / 구입금액 186,000원 / 본인부담금 15%: 27,900 / 9%: 16,740 / 6%: 11,160"
  },
  {
    category: "목욕의자",
    name: "BOFEEL9",
    imageUrl: "/uploads/products/bofeel9.webp",
    price: 157000,
    description: "제품번호: B03180025013 / 제조사: 보필 / 무게: 4.9Kg / 재질: 폴리에틸렌, 고무, EVA / 안전동작하중: 100Kg",
    note: "내구연한 5년 / 구입 / 구입금액 157,000원 / 본인부담금 15%: 23,550 / 9%: 14,130 / 6%: 9,420"
  },
  {
    category: "목욕의자",
    name: "PT-300",
    imageUrl: "/uploads/products/pt-300.webp",
    price: 500000,
    description: "제품번호: B03180043004 / 제조사: 미카코리아 / 무게: 9.0Kg / 재질: 알루미늄, 폴리우레탄 / 안전동작하중: 95Kg",
    note: "내구연한 5년 / 구입 / 구입금액 500,000원 / 본인부담금 15%: 75,000 / 9%: 45,000 / 6%: 30,000"
  },

  // ===== 이동변기 (p.12) =====
  {
    category: "이동변기",
    name: "APT-101 (목재형)",
    imageUrl: "/uploads/products/apt-101-목재형.webp",
    price: 306000,
    description: "제품번호: T03030025009 / 제조사: (주)에이엠이 / 무게: 16.2Kg / 재질: 알루미늄, PP, PJ, 고무 / 안전동작하중: 100Kg+α",
    note: "내구연한 5년 / 구입 / 구입금액 306,000원 / 본인부담금 15%: 45,900 / 9%: 27,540 / 6%: 18,360"
  },
  {
    category: "이동변기",
    name: "BFMB4 (목재형)",
    imageUrl: "/uploads/products/bfmb4-목재형.webp",
    price: 321000,
    description: "제품번호: T03330025104 / 제조사: 보필 / 무게: 15Kg / 재질: 알루미늄, PP, PJ, 고무 / 안전동작하중: 100Kg+α",
    note: "내구연한 5년 / 구입 / 구입금액 321,000원 / 본인부담금 15%: 48,150 / 9%: 28,890 / 6%: 19,260"
  },
  {
    category: "이동변기",
    name: "BFMB5 (접이식)",
    imageUrl: "/uploads/products/bfmb5-접이식.webp",
    price: 230000,
    description: "제품번호: T03030025105 / 제조사: 보필 / 무게: 5.9Kg / 재질: 알루미늄, PP/PJ, 고무 / 안전동작하중: 100Kg+α",
    note: "내구연한 5년 / 구입 / 구입금액 230,000원 / 본인부담금 15%: 34,500 / 9%: 20,700 / 6%: 13,800"
  },
  {
    category: "이동변기",
    name: "BFMB20 (접이식)",
    imageUrl: "/uploads/products/bfmb20-접이식.webp",
    price: 228000,
    description: "제품번호: T03030025009 / 제조사: 보필 / 무게: 6.9Kg / 재질: 알루미늄, PP/PJ, 고무 / 안전동작하중: 100Kg+α",
    note: "내구연한 5년 / 구입 / 구입금액 228,000원 / 본인부담금 15%: 34,200 / 9%: 20,520 / 6%: 13,800"
  },
  {
    category: "이동변기",
    name: "SAMB",
    imageUrl: "/uploads/products/samb.webp",
    price: 122000,
    description: "제품번호: T03030025001 / 무게: 4.9Kg / 재질: 알루미늄, PP, PJ, 고무 / 안전동작하중: 100Kg+α",
    note: "내구연한 5년 / 구입 / 구입금액 122,000원 / 본인부담금 15%: 18,300 / 9%: 10,980 / 6%: 7,320"
  },
  {
    category: "이동변기",
    name: "PT-100",
    imageUrl: "/uploads/products/pt-100.webp",
    price: 416000,
    description: "제품번호: T03030043002 / 제조사: 미카코리아 / 무게: 8Kg / 재질: 알루미늄, 폴리우레탄등 / 안전동작하중: 95Kg",
    note: "내구연한 5년 / 구입 / 구입금액 416,000원 / 본인부담금 15%: 62,400 / 9%: 37,440 / 6%: 24,960"
  },
  {
    category: "이동변기",
    name: "BFMB8",
    imageUrl: "/uploads/products/bfmb8.webp",
    price: 292000,
    description: "제품번호: T03030025008 / 제조사: 보필 / 무게: 11.5Kg / 재질: 알루미늄, 합성목, 합성피혁 / 안전동작하중: 100Kg+α",
    note: "내구연한 5년 / 구입 / 구입금액 292,000원 / 본인부담금 15%: 43,800 / 9%: 26,280 / 6%: 17,520"
  },
  {
    category: "이동변기",
    name: "APT-103",
    imageUrl: "/uploads/products/apt-103.webp",
    price: 321000,
    description: "제품번호: T03030030005 / 제조사: (주)케어이 / 무게: 17Kg / 재질: 목재, 합성, 알루미늄, EVA / 안전동작하중: 100Kg+α",
    note: "내구연한 5년 / 구입 / 구입금액 321,000원 / 본인부담금 15%: 48,150 / 9%: 28,890 / 6%: 19,260"
  },

  // ===== 성인용보행기 (p.13~14) =====
  {
    category: "성인용보행기",
    name: "동행 (SK-130)",
    imageUrl: "/uploads/products/동행-sk-130.webp",
    price: 220000,
    description: "제품번호: M06090158003 / 제조사: 서진시스템 / 무게: 6Kg / 재질: 알루미늄합금, 고무 / 안전동작하중: 100Kg+α",
    note: "내구연한 5년 / 2개 구매가능 / 구입금액 220,000원 / 본인부담금 15%: 33,000 / 9%: 19,800 / 6%: 13,200"
  },
  {
    category: "성인용보행기",
    name: "장수 (SK-120)",
    imageUrl: "/uploads/products/장수-sk-120.webp",
    price: 200000,
    description: "제품번호: M06090158001 / 제조사: 서진시스템 / 무게: 6.5Kg / 재질: 알루미늄, PP, EVA / 안전동작하중: 80Kg",
    note: "내구연한 5년 / 2개 구매가능 / 구입금액 200,000원 / 본인부담금 15%: 30,000 / 9%: 18,000 / 6%: 12,000"
  },
  {
    category: "성인용보행기",
    name: "BFSC-01",
    imageUrl: "/uploads/products/bfsc-01.webp",
    price: 270000,
    description: "제품번호: M06090025002 / 제조사: 보필 / 무게: 8.2Kg / 재질: 알루미늄, PJ, PP / 안전동작하중: 100Kg",
    note: "내구연한 5년 / 2개 구매가능 / 구입금액 270,000원 / 본인부담금 15%: 40,500 / 9%: 24,300 / 6%: 16,200"
  },
  {
    category: "성인용보행기",
    name: "실버카 KS-130",
    imageUrl: "/uploads/products/실버카-ks-130.webp",
    price: 167000,
    description: "제품번호: M06090005005 / 제조사: 삼주유니르르 / 무게: 4.8Kg / 재질: 알루미늄 / 안전동작하중: 100Kg",
    note: "내구연한 5년 / 2개 구매가능 / 구입금액 167,000원 / 본인부담금 15%: 25,050 / 9%: 15,030 / 6%: 10,020"
  },
  {
    category: "성인용보행기",
    name: "실버카단비",
    imageUrl: "/uploads/products/실버카단비.webp",
    price: 308000,
    description: "제품번호: M06090005015 / 제조사: 삼주유니르르 / 무게: 7.6Kg / 재질: 알루미늄, 폴리 / 안전동작하중: 100Kg 이상",
    note: "내구연한 5년 / 2개 구매가능 / 구입금액 308,000원 / 본인부담금 15%: 46,200 / 9%: 27,720 / 6%: 18,480"
  },
  {
    category: "성인용보행기",
    name: "DREAM (드림)",
    imageUrl: "/uploads/products/dream-드림.webp",
    price: 525000,
    description: "제품번호: M06061224601 / 제조사: 에코드림 / 무게: 6.15Kg / 재질: 카본, PVC, TPR 등 / 안전동작하중: 120Kg",
    note: "내구연한 5년 / 2개 구매가능 / 구입금액 525,000원 / 본인부담금 15%: 78,750 / 9%: 47,250 / 6%: 31,500"
  },
  {
    category: "성인용보행기",
    name: "SKB-101W",
    imageUrl: "/uploads/products/skb-101w.webp",
    price: 239000,
    description: "제품번호: M06060006003 / 제조사: 삼원스카이 / 무게: 13Kg / 재질: 스틸 CR 포먼처런 / 안전동작하중: 100Kg",
    note: "내구연한 5년 / 2개 구매가능 / 구입금액 239,000원 / 본인부담금 15%: 35,850 / 9%: 21,510 / 6%: 14,340"
  },
  {
    category: "성인용보행기",
    name: "SLT-10",
    imageUrl: "/uploads/products/slt-10.webp",
    price: 205000,
    description: "제품번호: M06090217501 / 제조사: (주)이라클메디 / 무게: 6.6Kg / 재질: 알루미늄 외 / 안전동작하중: 80Kg+α",
    note: "내구연한 5년 / 2개 구매가능 / 구입금액 205,000원 / 본인부담금 15%: 30,750 / 9%: 18,450 / 6%: 12,300"
  },
  {
    category: "성인용보행기",
    name: "코지워커 P02",
    imageUrl: "/uploads/products/코지워커-p02.webp",
    price: 249000,
    description: "제품번호: M06060147001 / 제조사: 코지케어 / 무게: 8Kg / 재질: 알루미늄 / 안전동작하중: 80Kg+α",
    note: "내구연한 5년 / 2개 구매가능 / 구입금액 249,000원 / 본인부담금 15%: 37,350 / 9%: 22,410 / 6%: 14,940"
  },
  {
    category: "성인용보행기",
    name: "CK-07",
    imageUrl: "/uploads/products/ck-07.webp",
    price: 57000,
    description: "제품번호: M06060162501 / 제조사: 세원케어 / 무게: 3.2Kg / 재질: 알루미늄 / 안전동작하중: 100Kg",
    note: "내구연한 5년 / 2개 구매가능 / 구입금액 57,000원 / 본인부담금 15%: 8,550 / 9%: 5,130 / 6%: 3,420"
  },
  {
    category: "성인용보행기",
    name: "JW-100",
    imageUrl: "/uploads/products/jw-100.webp",
    price: 49500,
    description: "제품번호: M06061133603 / 제조사: 제이피테크 / 무게: 3.2Kg / 재질: 알루미늄 / 안전동작하중: 100Kg",
    note: "내구연한 5년 / 2개 구매가능 / 구입금액 49,500원 / 본인부담금 15%: 7,420 / 9%: 4,450 / 6%: 2,970"
  },
  {
    category: "성인용보행기",
    name: "AWT-501",
    imageUrl: "/uploads/products/awt-501.webp",
    price: 405000,
    description: "제품번호: M06060060001 / 제조사: 아시아엘이 / 무게: 13.3Kg / 재질: 스틸 / 안전동작하중: 125Kg",
    note: "내구연한 5년 / 2개 구매가능 / 구입금액 405,000원 / 본인부담금 15%: 60,750 / 9%: 36,450 / 6%: 24,300"
  },

  // ===== 욕창예방방석 (p.15) =====
  {
    category: "욕창예방방석",
    name: "BLESSON 1",
    imageUrl: "/uploads/products/blesson-1.webp",
    price: 238000,
    description: "제품번호: H12030030007 / 제조사: 원원메디칼 / 재질: 천연고무 / 무게: 1.84Kg+1.56Kg / 안전동작하중: 120Kg",
    note: "내구연한 3년 / 구입 / 구입금액 238,000원 / 본인부담금 15%: 35,700 / 9%: 21,420 / 6%: 14,280"
  },
  {
    category: "욕창예방방석",
    name: "CD-07",
    imageUrl: "/uploads/products/cd-07.webp",
    price: 221000,
    description: "제품번호: H12031082102 / 제조사: 제이케이 다울 / 재질: EPDM / 무게: 1.9Kg / 안전동작하중: 130Kg",
    note: "내구연한 3년 / 구입 / 구입금액 221,000원 / 본인부담금 15%: 33,150 / 9%: 19,890 / 6%: 13,260"
  },
  {
    category: "욕창예방방석",
    name: "LBC4040",
    imageUrl: "/uploads/products/lbc4040.webp",
    price: 168000,
    description: "제품번호: H12031122101 / 제조사: (주)러비켓 / 재질: TPU, 폴리우레탄 / 무게: 1.2Kg / 안전동작하중: 100Kg",
    note: "내구연한 3년 / 구입 / 구입금액 168,000원 / 본인부담금 15%: 25,200 / 9%: 15,120 / 6%: 10,080"
  },
  {
    category: "욕창예방방석",
    name: "NSBS-4WAY88",
    imageUrl: "/uploads/products/nsbs-4way88.webp",
    price: 278000,
    description: "제품번호: H12030149005 / 제조사: 인에스바이에스 / 재질: TPU / 무게: 2Kg / 안전동작하중: 130Kg",
    note: "내구연한 3년 / 구입 / 구입금액 278,000원 / 본인부담금 15%: 41,700 / 9%: 25,020 / 6%: 16,680"
  },

  // ===== 자세변환용구 (p.16) =====
  {
    category: "자세변환용구",
    name: "SW-J1",
    imageUrl: "/uploads/products/sw-j1.webp",
    price: 39600,
    description: "제품번호: M30031091101 / 제조사: 세원케어 / 재질: 폴리우레탄 폼, 폴리에스테르 (메쉬타입) / 무게: 640g",
    note: "연간 5개 구입가능 / 구입금액 39,600원 / 본인부담금 15%: 5,940 / 9%: 3,560 / 6%: 2,370"
  },
  {
    category: "자세변환용구",
    name: "SW-J2",
    imageUrl: "/uploads/products/sw-j2.webp",
    price: 58600,
    description: "제품번호: M30031091102 / 제조사: 세원케어 / 재질: 폴리우레탄 폼, 폴리에스테르 (메쉬타입) / 무게: 690g",
    note: "연간 5개 구입가능 / 구입금액 58,600원 / 본인부담금 15%: 8,790 / 9%: 5,270 / 6%: 3,510"
  },
  {
    category: "자세변환용구",
    name: "YH-LA31",
    imageUrl: "/uploads/products/yh-la31.webp",
    price: 38400,
    description: "제품번호: M0030031005 / 제조사: 영화의료기 / 무게: 1.25Kg / 재질: 라텍스, 천, 면",
    note: "연간 5개 구입가능 / 구입금액 38,400원 / 본인부담금 15%: 5,760 / 9%: 3,450 / 6%: 2,300"
  },
  {
    category: "자세변환용구",
    name: "YH-LA32",
    imageUrl: "/uploads/products/yh-la32.webp",
    price: 37600,
    description: "제품번호: M0030031006 / 제조사: 영화의료기 / 무게: 1.5Kg / 재질: 라텍스, 천, 면",
    note: "연간 5개 구입가능 / 구입금액 37,600원 / 본인부담금 15%: 5,640 / 9%: 3,380 / 6%: 2,250"
  },
  {
    category: "자세변환용구",
    name: "MPG-06",
    imageUrl: "/uploads/products/mpg-06.webp",
    price: 81800,
    description: "제품번호: M00300078105 / 제조사: 삼인양밀 / 무게: 2.6Kg / 재질: 라텍스, 합성섬유편, 폴리에스테르",
    note: "연간 5개 구입가능 / 구입금액 81,800원 / 본인부담금 15%: 12,270 / 9%: 7,360 / 6%: 4,900"
  },
  {
    category: "자세변환용구",
    name: "SW-J3",
    imageUrl: "/uploads/products/sw-j3.webp",
    price: 66000,
    description: "제품번호: M00030162001 / 제조사: 세원케어 / 무게: 1.2Kg / 재질: 폴리/솜/면, 우레탄, 폴리에스테르",
    note: "연간 5개 구입가능 / 구입금액 66,000원 / 본인부담금 15%: 9,900 / 9%: 5,940 / 6%: 3,960"
  },
  {
    category: "자세변환용구",
    name: "SW-J4",
    imageUrl: "/uploads/products/sw-j4.webp",
    price: 84800,
    description: "제품번호: M00030162002 / 제조사: 세원케어 / 무게: 1.5Kg / 재질: 폴리/솜/면, 우레탄, 폴리에스테르",
    note: "연간 5개 구입가능 / 구입금액 84,800원 / 본인부담금 15%: 12,720 / 9%: 7,630 / 6%: 5,080"
  },
  {
    category: "자세변환용구",
    name: "SJ-4",
    imageUrl: "/uploads/products/sj-4.webp",
    price: 82600,
    description: "제품번호: M00030174004 / 제조사: 에스엔에프 / 무게: 500g / 재질: 라텍스, 합성섬유편, 폴리에스테르",
    note: "연간 5개 구입가능 / 구입금액 82,600원 / 본인부담금 15%: 12,420 / 9%: 7,450 / 6%: 4,960"
  },

  // ===== 미끄럼방지양말 (p.17~18) =====
  {
    category: "미끄럼방지양말",
    name: "위풋 논슬립 돌돌이 양말 양면",
    imageUrl: "/uploads/products/위풋-논슬립-돌돌이-양말-양면.webp",
    price: 6500,
    description: "제품번호: F30090204002 / 재질: 폴리에스터, 폴리우레탄 / 제조사: 위풋 / 사이즈: S, M 남녀공용 / 특징: 발목 밴드 없음",
    note: "연간 6켤레 구입가능 / 구입금액 6,500원 / 본인부담금 15%: 970 / 9%: 580 / 6%: 390"
  },
  {
    category: "미끄럼방지양말",
    name: "위풋 자석 덧신 양면",
    imageUrl: "/uploads/products/위풋-자석-덧신-양면.webp",
    price: 6000,
    description: "제품번호: F30090204001 / 재질: 폴리에스, 면, 폴리우레탄 / 제조사: 위풋 / 사이즈: S, M 남녀공용 / 특징: 발목 밴드 없음",
    note: "연간 6켤레 구입가능 / 구입금액 6,000원 / 본인부담금 15%: 900 / 9%: 540 / 6%: 360"
  },
  {
    category: "미끄럼방지양말",
    name: "NEO-1 남성용(면)",
    imageUrl: "/uploads/products/neo-1-남성용면.webp",
    price: 3200,
    description: "제품번호: F30091010101 / 재질: 면, 폴리우레탄, 폴리에스터 / 제조사: 네오텍 / 색상: 곤색, 회색 / 사이즈: 남성용",
    note: "연간 6켤레 구입가능 / 구입금액 3,200원 / 본인부담금 15%: 480 / 9%: 280 / 6%: 190"
  },
  {
    category: "미끄럼방지양말",
    name: "NEO-2 여성용(면)",
    imageUrl: "/uploads/products/neo-2-여성용면.webp",
    price: 3100,
    description: "제품번호: F30091010102 / 재질: 면, 폴리우레탄 / 제조사: 네오텍 / 색상: 보홍색, 안버라색 / 사이즈: 여성용",
    note: "연간 6켤레 구입가능 / 구입금액 3,100원 / 본인부담금 15%: 460 / 9%: 270 / 6%: 180"
  },
  {
    category: "미끄럼방지양말",
    name: "NEO-3 남성용(면)",
    imageUrl: "/uploads/products/neo-3-남성용면.webp",
    price: 3200,
    description: "제품번호: F30091010103 / 재질: 면, 폴리우레탄, 폴리에스테르 / 제조사: 네오텍 / 색상: 곤색, 회색 / 사이즈: 남성용",
    note: "연간 6켤레 구입가능 / 구입금액 3,200원 / 본인부담금 15%: 480 / 9%: 290 / 6%: 190"
  },
  {
    category: "미끄럼방지양말",
    name: "NEO-4 여성용(면)",
    imageUrl: "/uploads/products/neo-4-여성용면.webp",
    price: 3100,
    description: "제품번호: F30091010104 / 재질: 면, 폴리우레탄, 폴리에스테르 / 제조사: 네오텍 / 사이즈: 여성용",
    note: "연간 6켤레 구입가능 / 구입금액 3,100원 / 본인부담금 15%: 460 / 9%: 270 / 6%: 180"
  },
  {
    category: "미끄럼방지양말",
    name: "NEO-5 남녀공용(수면)",
    imageUrl: "/uploads/products/neo-5-남녀공용수면.webp",
    price: 3300,
    description: "제품번호: F30091010105 / 재질: 면, 폴리우레탄 / 제조사: 네오텍 / 사이즈: 남녀공용",
    note: "연간 6켤레 구입가능 / 구입금액 3,300원 / 본인부담금 15%: 490 / 9%: 290 / 6%: 190"
  },
  {
    category: "미끄럼방지양말",
    name: "NEO-6 여성용(두꺼운면)",
    imageUrl: "/uploads/products/neo-6-여성용두꺼운면.webp",
    price: 3100,
    description: "제품번호: F30091010106 / 재질: 면, 폴리우레탄, 스판, 고무사 / 제조사: 네오텍 / 색상: 회색, 검정 / 사이즈: 남녀공용",
    note: "연간 6켤레 구입가능 / 구입금액 3,100원 / 본인부담금 15%: 460 / 9%: 270 / 6%: 180"
  },
  {
    category: "미끄럼방지양말",
    name: "KH-101 여성용(면)",
    imageUrl: "/uploads/products/kh-101-여성용면.webp",
    price: 3900,
    description: "제품번호: F30091120107 / 재질: 면, 폴리우레탄, 폴리에스터 / 제조사: 금하양맘 / 사이즈: 여성용",
    note: "연간 6켤레 구입가능 / 구입금액 3,900원 / 본인부담금 15%: 580 / 9%: 350 / 6%: 230"
  },
  {
    category: "미끄럼방지양말",
    name: "KH-102 남성용(면)",
    imageUrl: "/uploads/products/kh-102-남성용면.webp",
    price: 3700,
    description: "제품번호: F30091120102 / 재질: 폴리우레탄, 폴리에스터 / 제조사: 금하양맘 / 색상: 감정색 / 사이즈: 남성용",
    note: "연간 6켤레 구입가능 / 구입금액 3,700원 / 본인부담금 15%: 550 / 9%: 330 / 6%: 220"
  },
  {
    category: "미끄럼방지양말",
    name: "KH-103 여성용(수면)",
    imageUrl: "/uploads/products/kh-103-여성용수면.webp",
    price: 3900,
    description: "제품번호: F30091120103 / 재질: 터덕시, 폴라쿠션, 폴리우레탄 / 제조사: 금하양맘 / 사이즈: 여성용 / 특징: 발목 밴드 없음",
    note: "연간 6켤레 구입가능 / 구입금액 3,900원 / 본인부담금 15%: 580 / 9%: 350 / 6%: 230"
  },
  {
    category: "미끄럼방지양말",
    name: "KH-104 (두꺼운여성용)",
    imageUrl: "/uploads/products/kh-104-두꺼운여성용.webp",
    price: 3900,
    description: "제품번호: F30091120104 / 재질: 터멜시, 동도전사 / 제조사: 금하양맘 / 폴리우레탄, 폴리에스터 / 사이즈: 여성용",
    note: "연간 6켤레 구입가능 / 구입금액 3,900원 / 본인부담금 15%: 580 / 9%: 350 / 6%: 230"
  },
  {
    category: "미끄럼방지양말",
    name: "KH-105 (두꺼운남성용)",
    imageUrl: "/uploads/products/kh-105-두꺼운남성용.webp",
    price: 4000,
    description: "제품번호: F30091120101 / 재질: 면, 폴리우레탄, 폴리에스터 / 제조사: 금하양맘 / 사이즈: 남성용",
    note: "연간 6켤레 구입가능 / 구입금액 4,000원 / 본인부담금 15%: 600 / 9%: 360 / 6%: 240"
  },
  {
    category: "미끄럼방지양말",
    name: "KH-108 여성용(면)",
    imageUrl: "/uploads/products/kh-108-여성용면.webp",
    price: 3900,
    description: "제품번호: F30091120106 / 재질: 면 / 제조사: 근세너론 / 폴리우레탄, 폴리에스터 / 사이즈: 여성용",
    note: "연간 6켤레 구입가능 / 구입금액 3,900원 / 본인부담금 15%: 580 / 9%: 350 / 6%: 230"
  },
  {
    category: "미끄럼방지양말",
    name: "NEO-8 여성용(면)",
    imageUrl: "/uploads/products/neo-8-여성용면.webp",
    price: 3100,
    description: "제품번호: F30091010108 / 제조사: 네오텍 / 재질: 면 / 사이즈: 여성용",
    note: "연간 6켤레 구입가능 / 구입금액 3,100원 / 본인부담금 15%: 460 / 9%: 270 / 6%: 180"
  },
  {
    category: "미끄럼방지양말",
    name: "KH-109 남성용(면)",
    imageUrl: "/uploads/products/kh-109-남성용면.webp",
    price: 3300,
    description: "제품번호: F30091120106 / 제조사: 금하양맘 / 재질: 면, 폴리우레탄, 폴리에스터 / 사이즈: 남성용",
    note: "연간 6켤레 구입가능 / 구입금액 3,300원 / 본인부담금 15%: 580 (이미지) / 9%: 350 / 6%: 230"
  },
  {
    category: "미끄럼방지양말",
    name: "YH-004 여성용(면)",
    imageUrl: "/uploads/products/yh-004-여성용면.webp",
    price: 3000,
    description: "제품번호: F30091039103 / 제조사: 봉화 / 사이즈: 여성용 / 재질: 면",
    note: "연간 6켤레 구입가능 / 구입금액 3,000원 / 본인부담금 15%: 450 / 9%: 270 / 6%: 180"
  },
  {
    category: "미끄럼방지양말",
    name: "4DM-301 남성용(수면)",
    imageUrl: "/uploads/products/4dm-301-남성용수면.webp",
    price: 3900,
    description: "제품번호: F30091078104 / 제조사: 모디엔 / 사이즈: 남성용 / 재질: 나일론, 폴리에스터, 폴리우레탄",
    note: "연간 6켤레 구입가능 / 구입금액 3,900원 / 본인부담금 15%: 580 / 9%: 350 / 6%: 230"
  },

  // ===== 미끄럼방지용품 (p.20) =====
  {
    category: "미끄럼방지용품",
    name: "SW-M260",
    imageUrl: "/uploads/products/sw-m260.webp",
    price: 44000,
    description: "제품번호: F30031091104 / 제조사: 세원케어 / 사이즈: 260×100cm / 무게: 7.7Kg / 재질: PVC / 색상: 녹색, 회색",
    note: "연간 5장 구입가능 / 구입금액 44,000원 / 본인부담금 15%: 6,600 / 9%: 3,960 / 6%: 2,640"
  },
  {
    category: "미끄럼방지용품",
    name: "바이오 스타 논슬립매트-Ⅲ",
    imageUrl: "/uploads/products/바이오-스타-논슬립매트.webp",
    price: 36500,
    description: "제품번호: F30090030004 / 제조사: 엔원메디감 / 사이즈: 114.6×52.8cm / 무게: 2Kg / 재질: 실리콘, 축광안료 / 색상: 핑크아이보리",
    note: "연간 5장 구입가능 / 구입금액 36,500원 / 본인부담금 15%: 5,470 / 9%: 3,280 / 6%: 2,190"
  },
  {
    category: "미끄럼방지용품",
    name: "NSAM-0190",
    imageUrl: "/uploads/products/nsam-0190.webp",
    price: 33200,
    description: "제품번호: F30031087001 / 제조사: 원플라시스 / 사이즈: 90.2×60.1cm / 무게: 2Kg / 재질: 실리콘 / 색상: 녹색",
    note: "연간 5장 구입가능 / 구입금액 33,200원 / 본인부담금 15%: 4,980 / 9%: 2,960 / 6%: 1,990"
  },
  {
    category: "미끄럼방지용품",
    name: "나이팅게일-B",
    imageUrl: "/uploads/products/나이팅게일-b.webp",
    price: 21000,
    description: "제품번호: F30031067108 / 제조사: 대성롱테크 / 사이즈: 70×45cm / 무게: 0.6Kg / 재질: 실리콘 / 색상: 파랑색",
    note: "연간 5장 구입가능 / 구입금액 21,000원 / 본인부담금 15%: 3,150 / 9%: 1,890 / 6%: 1,260"
  },
  {
    category: "미끄럼방지용품",
    name: "SW-지압plus",
    imageUrl: "/uploads/products/sw-지압plus.webp",
    price: 60600,
    description: "제품번호: F30031091108 / 제조사: 세원케어 / 사이즈: 185×92cm / 무게: 7.1Kg / 재질: PVC / 색상: 회색, 녹색",
    note: "연간 5장 구입가능 / 구입금액 60,600원 / 본인부담금 15%: 9,090 / 9%: 5,450 / 6%: 3,630"
  },
  {
    category: "미끄럼방지용품",
    name: "논슬립200",
    imageUrl: "/uploads/products/논슬립200.webp",
    price: 46900,
    description: "제품번호: F30031091109 / 제조사: 세원케어 / 사이즈: 200×91cm / 무게: 5Kg / 재질: PVC / 색상: 녹색",
    note: "연간 5장 구입가능 / 구입금액 46,900원 / 본인부담금 15%: 7,030 / 9%: 4,220 / 6%: 2,810"
  },

  // ===== 안전손잡이 (p.21~22) =====
  {
    category: "안전손잡이",
    name: "CL300 (세로형)",
    imageUrl: "/uploads/products/cl300-세로형.webp",
    price: 42100,
    description: "제품번호: F18031026101 / 제조사: 세비앙 / 사이즈: 30×3cm / 재질: 참나무원목, 크롬도금 브라켓, 아랑띠 적용",
    note: "연간 10개 구입가능 / 구입금액 42,100원 / 본인부담금 15%: 6,310 / 9%: 3,780 / 6%: 2,520"
  },
  {
    category: "안전손잡이",
    name: "CL600 (세로형)",
    imageUrl: "/uploads/products/cl600-세로형.webp",
    price: 44100,
    description: "제품번호: F18031026102 / 제조사: 세비앙 / 사이즈: 60×3cm / 재질: 참나무원목, 크롬도금 브라켓, 아랑띠 적용",
    note: "연간 10개 구입가능 / 구입금액 44,100원 / 본인부담금 15%: 6,610 / 9%: 3,960 / 6%: 2,640"
  },
  {
    category: "안전손잡이",
    name: "CC1200",
    imageUrl: "/uploads/products/cc1200.webp",
    price: 67700,
    description: "제품번호: F18031026103 / 제조사: 세비앙 / 사이즈: 120×3.8cm / 재질: 참나무원목, 크롬도금 브라켓, 아랑띠 적용",
    note: "연간 10개 구입가능 / 구입금액 67,700원 / 본인부담금 15%: 10,150 / 9%: 6,090 / 6%: 4,060"
  },
  {
    category: "안전손잡이",
    name: "CP600",
    imageUrl: "/uploads/products/cp600.webp",
    price: 72600,
    description: "제품번호: F18030191004 / 제조사: 세비앙 / 사이즈: 56.7×9cm / 재질: 알루미늄, 실리콘 외 / 최대하중: 80Kg",
    note: "연간 10개 구입가능 / 방수기능 / 구입금액 72,600원 / 본인부담금 15%: 10,890 / 9%: 6,530 / 6%: 4,350"
  },
  {
    category: "안전손잡이",
    name: "CP660 (가로세로겸용)",
    imageUrl: "/uploads/products/cp660-가로세로겸용.webp",
    price: 122000,
    description: "제품번호: F18030191005 / 제조사: 세비앙 / 사이즈: (66.2)(60.9)×9cm / 재질: 알루미늄, 실리콘 외 / 최대하중: 80Kg",
    note: "연간 10개 구입가능 / 방수기능 / 구입금액 122,000원 / 본인부담금 15%: 18,300 / 9%: 10,980 / 6%: 7,320"
  },
  {
    category: "안전손잡이",
    name: "CP800",
    imageUrl: "/uploads/products/cp800.webp",
    price: 94100,
    description: "제품번호: F18030191006 / 제조사: 세비앙 / 사이즈: 79×9cm / 재질: 알루미늄, 실리콘 외 / 최대하중: 80Kg",
    note: "연간 10개 구입가능 / 방수기능 / 구입금액 94,100원 / 본인부담금 15%: 13,710 (이미지) / 9%: 8,220 (이미지) / 6%: 5,480 (이미지)"
  },
  {
    category: "안전손잡이",
    name: "MSP-0005 (기둥형)",
    imageUrl: "/uploads/products/msp-0005-기둥형.webp",
    price: 231000,
    description: "제품번호: F18030175001 / 제조사: (주)명성실버케어 / 사이즈: 40×199~250cm / 무게: 7.87Kg / 안전동작하중: 80Kg / 재질: PVC, PIPE 등",
    note: "연간 10개 구입가능 / 구입금액 231,000원 / 본인부담금 15%: 34,650 / 9%: 20,790 / 6%: 13,860"
  },
  {
    category: "안전손잡이",
    name: "DGP-0005 (기둥형)",
    imageUrl: "/uploads/products/dgp-0005-기둥형.webp",
    price: 188000,
    description: "제품번호: F18030059007 / 제조사: 주식회사 대구정밀 / 사이즈: 30×200~250cm / 무게: 7.35Kg / 안전동작하중: 150Kg / 재질: PVC, PIPE, 나일론",
    note: "연간 10개 구입가능 / 구입금액 188,000원 / 본인부담금 15%: 28,200 / 9%: 16,920 / 6%: 11,280"
  },
  {
    category: "안전손잡이",
    name: "CV-200 (기둥형)",
    imageUrl: "/uploads/products/cv-200-기둥형.webp",
    price: 322000,
    description: "제품번호: F18030191003 / 제조사: 세비앙 / 사이즈: 38×173~250cm / 무게: 4.3Kg / 안전동작하중: 80Kg / 재질: 알루미늄, SLICON",
    note: "연간 10개 구입가능 / 구입금액 322,000원 / 본인부담금 15%: 48,300 (이미지) / 9%: 28,980 / 6%: 19,320"
  },
  {
    category: "안전손잡이",
    name: "케어 핸들-2",
    imageUrl: "/uploads/products/케어-핸들-2.webp",
    price: 163000,
    description: "제품번호: F18031086102 / 제조사: 반김제작소 / 무게: 3.8Kg / 안전동작하중: 100Kg / 사이즈: 60×62cm / 재질: 참나무원목, 스틸",
    note: "연간 10개 구입가능 / 구입금액 163,000원 / 본인부담금 15%: 24,450 / 9%: 14,670 / 6%: 9,780"
  },
  {
    category: "안전손잡이",
    name: "BFSH10",
    imageUrl: "/uploads/products/bfsh10.webp",
    price: 203000,
    description: "제품번호: F18030025005 / 제조사: 보필 / 무게: 5.8Kg / 안전동작하중: 80Kg+α / 사이즈: 44×64.65cm(+15) / 재질: 스틸, 무, 면",
    note: "연간 10개 구입가능 / 구입금액 203,000원 / 본인부담금 15%: 30,450 / 9%: 18,270 / 6%: 12,180"
  },
  {
    category: "안전손잡이",
    name: "MSP-0002",
    imageUrl: "/uploads/products/msp-0002.webp",
    price: 240000,
    description: "제품번호: F18030175003 / 제조사: (주)명성실버케어 / 사이즈: 92×52cm / 무게: 21.7Kg / 안전동작하중: 80Kg+α / 재질: PVC, PIPE 등",
    note: "연간 10개 구입가능 / 구입금액 240,000원 / 본인부담금 15%: 36,000 / 9%: 21,600 / 6%: 14,400"
  },
  {
    category: "안전손잡이",
    name: "MSP-0003",
    imageUrl: "/uploads/products/msp-0003.webp",
    price: 221000,
    description: "제품번호: F18030175004 / 제조사: (주)명성실버케어 / 사이즈: 92×52cm / 무게: 19.9Kg / 안전동작하중: 80Kg+α / 재질: PVC, PIPE 등",
    note: "연간 10개 구입가능 / 구입금액 221,000원 / 본인부담금 15%: 33,150 / 9%: 19,890 / 6%: 13,260"
  },
  {
    category: "안전손잡이",
    name: "DGP-0002",
    imageUrl: "/uploads/products/dgp-0002.webp",
    price: 158000,
    description: "제품번호: F18030059002 / 제조사: 대구정밀 / 사이즈: 52.6×92.5cm / 무게: 16.99Kg / 안전동작하중: 100Kg+α / 재질: 스틸",
    note: "연간 10개 구입가능 / 구입금액 158,000원 / 본인부담금 15%: 23,700 / 9%: 14,220 / 6%: 9,480"
  },
  {
    category: "안전손잡이",
    name: "CSH-5000",
    imageUrl: "/uploads/products/csh-5000.webp",
    price: 183000,
    description: "제품번호: F18031026114 / 제조사: 세비앙 / 사이즈: 57×51.5×64cm / 무게: 5.5Kg / 안전동작하중: 80Kg+α / 재질: 스테인레스, 원목, PP 등",
    note: "연간 10개 구입가능 / 구입금액 183,000원 / 본인부담금 15%: 27,450 / 9%: 16,470 / 6%: 10,980"
  },

  // ===== 경사로 (p.23) =====
  {
    category: "경사로",
    name: "나이팅게일단차해소기10",
    imageUrl: "/uploads/products/나이팅게일단차해소기10.webp",
    price: 30200,
    description: "제품번호: F24011067102 / 제조사: 대성롱테크 / 소재: 합성고무 / 무게: 0.27Kg / 안전동작하중: 100Kg",
    note: "내구연한 2년 / 6개 구입가능 / 높이 1cm / 구입금액 30,200원 / 본인부담금 15%: 4,530 / 9%: 2,710 / 6%: 1,810"
  },
  {
    category: "경사로",
    name: "나이팅게일단차해소기20",
    imageUrl: "/uploads/products/나이팅게일단차해소기20.webp",
    price: 34900,
    description: "제품번호: F24011067101 / 제조사: 대성롱테크 / 소재: 합성고무 / 무게: 1Kg / 안전동작하중: 100Kg",
    note: "내구연한 2년 / 6개 구입가능 / 높이 2cm (측면 경사로 적용) / 구입금액 34,900원 / 본인부담금 15%: 5,230 / 9%: 3,140 / 6%: 2,090"
  },
  {
    category: "경사로",
    name: "나이팅게일단차해소기30",
    imageUrl: "/uploads/products/나이팅게일단차해소기30.webp",
    price: 46000,
    description: "제품번호: F24011067103 / 제조사: 대성롱테크 / 소재: 합성고무 / 무게: 2.3Kg / 안전동작하중: 100Kg",
    note: "내구연한 2년 / 6개 구입가능 / 높이 3cm / 구입금액 46,000원 / 본인부담금 15%: 6,900 / 9%: 4,140 / 6%: 2,760"
  },
  {
    category: "경사로",
    name: "ASW-103",
    imageUrl: "/uploads/products/asw-103.webp",
    price: 42600,
    description: "제품번호: F24010060101 / 제조사: (주)에이(엠)이 / 소재: 실리콘 / 무게: 1.2Kg / 안전동작하중: 100Kg",
    note: "내구연한 2년 / 6개 구입가능 / 높이 4cm / 구입금액 42,600원 / 본인부담금 15%: 6,390 / 9%: 3,830 / 6%: 2,550"
  },
  {
    category: "경사로",
    name: "ASW-104",
    imageUrl: "/uploads/products/asw-104.webp",
    price: 64000,
    description: "제품번호: F24000060004 / 제조사: (주)에이(엠)이 / 소재: 실리콘 / 무게: 1.8Kg / 안전동작하중: 100Kg",
    note: "내구연한 2년 / 6개 구입가능 / 높이 5cm / 구입금액 64,000원 / 본인부담금 15%: 9,600 / 9%: 5,760 / 6%: 3,840"
  },
  {
    category: "경사로",
    name: "TRA-H10",
    imageUrl: "/uploads/products/tra-h10.webp",
    price: 41900,
    description: "제품번호: F24011052101 / 제조사: 티이(치)(이리컨미) / 소재: 우레탄 / 무게: 0.2Kg / 안전동작하중: 100Kg",
    note: "내구연한 2년 / 6개 구입가능 / 높이 1cm / 구입금액 41,900원 / 본인부담금 15%: 6,280 (이미지) / 9%: 3,770 / 6%: 2,510"
  },
  {
    category: "경사로",
    name: "TRA-H20",
    imageUrl: "/uploads/products/tra-h20.webp",
    price: 59500,
    description: "제품번호: F24011052102 / 제조사: 티이(치)(이리컨미) / 소재: 우레탄 / 무게: 0.82Kg / 안전동작하중: 100Kg",
    note: "내구연한 2년 / 6개 구입가능 / 높이 2cm / 구입금액 59,500원 / 본인부담금 15%: 8,920 (이미지) / 9%: 5,350 / 6%: 3,570"
  },
  {
    category: "경사로",
    name: "TRA-H30",
    imageUrl: "/uploads/products/tra-h30.webp",
    price: 77900,
    description: "제품번호: F24011052103 / 제조사: 티이(치)(이리컨미) / 소재: 우레탄 / 무게: 1.78Kg / 안전동작하중: 100Kg",
    note: "내구연한 2년 / 6개 구입가능 / 높이 3cm / 구입금액 77,900원 / 본인부담금 15%: 11,680 (이미지) / 9%: 7,010 / 6%: 4,670"
  },

  // ===== 요실금팬티 (p.24) =====
  {
    category: "요실금팬티",
    name: "GHP-01",
    imageUrl: "/uploads/products/ghp-01.webp",
    price: 30500,
    description: "제품번호: T09060220001 / 제조사: (주)지디(일)컴퍼니 / 사이즈: 95, 100, 105, 110 / 패드흡수량: 80cc 이내 / 소재: 면, 돌리우레탄, 폴리에스테르",
    note: "연간 4장 구입가능 / 구입금액 30,500원 / 본인부담금 15%: 4,570 / 9%: 2,740 / 6%: 1,830"
  },
  {
    category: "요실금팬티",
    name: "GHP-03",
    imageUrl: "/uploads/products/ghp-03.webp",
    price: 39900,
    description: "제품번호: T09061171103 / 제조사: (주)지디(일)컴퍼니 / 사이즈: 95, 105 / 삼각팬티 / 패드흡수량: 150cc 이내 / 소재: 폴리우레탄, 폴리에스테르",
    note: "연간 4장 구입가능 / 구입금액 39,900원 / 본인부담금 15%: 5,980 / 9%: 3,590 / 6%: 2,390"
  },
  {
    category: "요실금팬티",
    name: "IW300 리젠피치",
    imageUrl: "/uploads/products/iw300-리젠피치.webp",
    price: 32400,
    description: "제품번호: T09061089112 / 사이즈: 95, 100, 105 / 패드흡수량: 80cc 이내 / 소재: 인견, 폴리에스터인",
    note: "연간 4장 구입가능 / 구입금액 32,400원 / 본인부담금 15%: 4,870 (이미지) / 9%: 2,920 / 6%: 1,940 (이미지)"
  },
  {
    category: "요실금팬티",
    name: "GM300 로얄블루",
    imageUrl: "/uploads/products/gm300-로얄블루.webp",
    price: 31800,
    description: "제품번호 없음(이미지) / 제조사: 인텍리 / 사이즈: 95, 100, 105 / 패드흡수량: 130cc 이내 / 소재: 나일론, 폴리우레탄등",
    note: "연간 4장 구입가능 / 구입금액 31,800원 / 본인부담금 15%: 4,770 / 9%: 2,860 / 6%: 1,900"
  },
  {
    category: "요실금팬티",
    name: "KW300 그래핀",
    imageUrl: "/uploads/products/kw300-그래핀.webp",
    price: 44000,
    description: "제품번호: T09061089113 / 사이즈: 95, 100, 105 / 색상: 그레이 / 패드흡수량: 150cc 이내 / 소재: 면, 폴리에스터인",
    note: "연간 4장 구입가능 / 구입금액 44,000원 / 본인부담금 15%: 6,600 / 9%: 3,960 / 6%: 2,640"
  },
  {
    category: "요실금팬티",
    name: "FM700 데일리트렁크 50cc",
    imageUrl: "/uploads/products/fm700-데일리트렁크-50cc.webp",
    price: 31000,
    description: "제품번호: T09060165012 / 제조사: 오넬라 / 사이즈: 95, 100, 105 / 패드흡수량: 50cc 이내 / 소재: 폴리에스터인",
    note: "연간 4장 구입가능 / 구입금액 31,000원 / 본인부담금 15%: 4,790 (이미지) / 9%: 2,790 (이미지) / 6%: 1,860"
  },
  {
    category: "요실금팬티",
    name: "MSPT-003",
    imageUrl: "/uploads/products/mspt-003.webp",
    price: 28500,
    description: "제품번호: T09061138103 / 제조사: (주)명성실버케어이 / 사이즈: S90, M95, L100 / 색상: 검정 / 패드흡수량: 70cc 이내 / 소재: 레이온, 폴리에스터",
    note: "연간 4장 구입가능 / 구입금액 28,500원 / 본인부담금 15%: 4,270 / 9%: 2,560 / 6%: 1,710"
  },
  {
    category: "요실금팬티",
    name: "MSIP-002",
    imageUrl: "/uploads/products/msip-002.webp",
    price: 28900,
    description: "제품번호: T09061102102 / 제조사: (주)명성실버케어(면삼) / 사이즈: 95, 100, 105 / 패드흡수량: 110cc 이내 / 소재: 면, 면, 폴리에스테르",
    note: "연간 4장 구입가능 / 구입금액 28,900원 / 본인부담금 15%: 4,330 / 9%: 2,600 / 6%: 1,730"
  },
  {
    category: "요실금팬티",
    name: "LP-021 보나수 50cc",
    imageUrl: "/uploads/products/lp-021-보나수-50cc.webp",
    price: 27600,
    description: "제품번호: T09061121201 / 제조사: 사이사이 인텔리 / 사이즈: 95, 100, 105, 110 / 색상: 진베이지 / 패드흡수량: 50cc 이내",
    note: "연간 4장 구입가능 / 구입금액 27,600원 / 본인부담금 15%: 4,140 / 9%: 2,480 / 6%: 1,650"
  },
  {
    category: "요실금팬티",
    name: "AW 300 코지 50cc",
    imageUrl: "/uploads/products/aw-300-코지-50cc.webp",
    price: 30400,
    description: "제품번호 없음(이미지) / 사이즈: 95, 100, 105 / 색상: 보라색 / 패드흡수량: 40cc 이내 / 소재: 면, 폴리에스터스판",
    note: "연간 4장 구입가능 / 구입금액 30,400원 / 본인부담금 15%: 4,560 / 9%: 2,730 / 6%: 1,820"
  },

  // ===== 지팡이 (p.25~26) =====
  {
    category: "지팡이",
    name: "NS",
    imageUrl: "/uploads/products/ns.webp",
    price: 45300,
    description: "제품번호: M03030132009 / 제조사: 아이온 / 소재: 카본, 합성 수지, 합성 고무 / 무게: 240g / 안전동작하중: 120Kg",
    note: "내구연한 2년 / 구입금액 45,300원 / 본인부담금 15%: 6,790 / 9%: 4,070 / 6%: 2,710"
  },
  {
    category: "지팡이",
    name: "ILA",
    imageUrl: "/uploads/products/ila.webp",
    price: 46400,
    description: "제품번호: M03030132005 / 제조사: 아이온 / 소재: 카본, 합성수지+고무 / 무게: 280g / 안전동작하중: 100Kg+α",
    note: "내구연한 2년 / 구입금액 46,400원 / 본인부담금 15%: 6,960 / 9%: 4,170 / 6%: 2,780"
  },
  {
    category: "지팡이",
    name: "SF (접이식)",
    imageUrl: "/uploads/products/sf-접이식.webp",
    price: 63700,
    description: "제품번호: M03031033104 / 제조사: 아이온 / 소재: 카본, 합성 수지, 합성 고무 / 무게: 300g / 안전동작하중: 120Kg",
    note: "내구연한 2년 / 구입금액 63,700원 / 본인부담금 15%: 9,550 / 9%: 5,730 / 6%: 3,820"
  },
  {
    category: "지팡이",
    name: "나래-1000 (접이식)",
    imageUrl: "/uploads/products/나래-1000-접이식.webp",
    price: 58800,
    description: "제품번호: M03031086001 / 제조사: 나래의료기 / 소재: 마그네슘합금, PVC / 무게: 290g / 안전동작하중: 100Kg+α",
    note: "내구연한 2년 / 구입금액 58,800원 / 본인부담금 15%: 8,820 / 9%: 5,290 / 6%: 3,520"
  },
  {
    category: "지팡이",
    name: "BS",
    imageUrl: "/uploads/products/bs.webp",
    price: 61500,
    description: "제품번호: M03030132008 / 제조사: 아이온 / 무게: 350g / 안전동작하중: 120Kg / 소재: 카본, 탐수수지/고무",
    note: "내구연한 2년 / 구입금액 61,500원 / 본인부담금 15%: 9,220 / 9%: 5,530 / 6%: 3,690"
  },
  {
    category: "지팡이",
    name: "아이온 사발지팡이",
    imageUrl: "/uploads/products/아이온-사발지팡이.webp",
    price: 61500,
    description: "제품번호: M03030132103 / 제조사: 아이온 / 무게: 340g / 안전동작하중: 120Kg / 소재: 카본, 탐수수지/고무",
    note: "내구연한 2년 / 구입금액 61,500원 / 본인부담금 15%: 9,220 / 9%: 5,530 / 6%: 3,690"
  },
  {
    category: "지팡이",
    name: "LS-20F",
    imageUrl: "/uploads/products/ls-20f.webp",
    price: 59400,
    description: "제품번호: M03031003 / 제조사: 예루 / 무게: 340g / 안전동작하중: 100Kg / 소재: 카본, 한목, 고무 등",
    note: "내구연한 2년 / 구입금액 59,400원 / 본인부담금 15%: 8,910 / 9%: 5,350 / 6%: 3,560"
  },
  {
    category: "지팡이",
    name: "백건 여자 지팡이-01",
    imageUrl: "/uploads/products/백건-여자-지팡이-01.webp",
    price: 65900,
    description: "제품번호: M00301071601 / 제조사: 백건메디 / 무게: 0.483Kg / 소재: 카본, PU이 / 안전동작하중: 100Kg+α",
    note: "내구연한 2년 / 구입금액 65,900원 / 본인부담금 15%: 9,880 / 9%: 5,930 / 6%: 3,950"
  },
  {
    category: "지팡이",
    name: "백건 여자 지팡이-02",
    imageUrl: "/uploads/products/백건-여자-지팡이-02.webp",
    price: 65900,
    description: "제품번호: M00301071602 / 제조사: 백건메디 / 무게: 0.483Kg / 안전동작하중: 100Kg+α / 소재: 카본, PU이",
    note: "내구연한 2년 / 구입금액 65,900원 / 본인부담금 15%: 9,880 / 9%: 5,930 / 6%: 3,950"
  },
  {
    category: "지팡이",
    name: "백건 남자 지팡이-01",
    imageUrl: "/uploads/products/백건-남자-지팡이-01.webp",
    price: 65900,
    description: "제품번호: M00301071603 / 제조사: 백건메디 / 무게: 0.483Kg / 안전동작하중: 100Kg+α / 소재: 카본, PU이",
    note: "내구연한 2년 / 구입금액 65,900원 / 본인부담금 15%: 9,880 / 9%: 5,930 / 6%: 3,950"
  },

  // ===== 간이변기 (p.26) =====
  {
    category: "간이변기",
    name: "BFTL4 (대변기)",
    imageUrl: "/uploads/products/bftl4-대변기.webp",
    price: 13500,
    description: "제품번호: T03060025101 / 제조사: 보필 / 무게: 460g / 용량: 1200ml / 재질: 폴리프로필렌 (PP) / 세척솔: 25cm",
    note: "연간 2개 구입가능 / 구입금액 13,500원 / 본인부담금 15%: 2,020 / 9%: 1,210 / 6%: 810"
  },
  {
    category: "간이변기",
    name: "BFTL5 (소변기 남성용)",
    imageUrl: "/uploads/products/bftl5-소변기-남성용.webp",
    price: 14300,
    description: "제품번호: T03060025102 / 제조사: 보필 / 무게: 460g / 용량: 1200ml / 재질: 폴리프로필렌 (PP) / 세척솔: 25cm",
    note: "연간 2개 구입가능 / 구입금액 14,300원 / 본인부담금 15%: 2,140 / 9%: 1,290 / 6%: 860"
  },
  {
    category: "간이변기",
    name: "BFTL6 (소변기 여성용)",
    imageUrl: "/uploads/products/bftl6-소변기-여성용.webp",
    price: 14500,
    description: "제품번호: T03060025103 / 제조사: 보필 / 무게: 460g / 용량: 1200ml / 재질: 폴리프로필렌 (PP) / 세척솔: 25cm",
    note: "연간 2개 구입가능 / 구입금액 14,500원 / 본인부담금 15%: 2,170 / 9%: 1,300 / 6%: 870"
  },
  {
    category: "간이변기",
    name: "ABP101 (대변기)",
    imageUrl: "/uploads/products/abp101-대변기.webp",
    price: 16500,
    description: "제품번호: T03060060001 / 제조사: 아시아엘이 / 무게: 196g / 용량: 1630cc / 재질: PP, TPR, PVC / 세척솔: 25cm",
    note: "연간 2개 구입가능 / 구입금액 16,500원 / 본인부담금 15%: 2,470 / 9%: 1,480 / 6%: 990"
  },
  {
    category: "간이변기",
    name: "ABP-105 (소변기 남성용)",
    imageUrl: "/uploads/products/abp-105-소변기-남성용.webp",
    price: 14300,
    description: "제품번호: T03060060101 / 제조사: 아시아엘이 / 무게: 172g / 용량: 1000cc / 재질: PP, TPR, PVC / 세척솔: 25cm",
    note: "연간 2개 구입가능 / 구입금액 14,300원 / 본인부담금 15%: 2,140 / 9%: 1,290 / 6%: 860"
  },
  {
    category: "간이변기",
    name: "ABP-106 (소변기 여성용)",
    imageUrl: "/uploads/products/abp-106-소변기-여성용.webp",
    price: 14300,
    description: "제품번호: T03060060102 / 제조사: 아시아엘이 / 무게: 196g (이미지) / 용량: 1000cc / 재질: 폴리프로필렌 / 세척솔: 25cm",
    note: "연간 2개 구입가능 / 구입금액 14,300원 (이미지) / 본인부담금 15%: 2,170 / 9%: 1,300 / 6%: 870"
  },
    {
    category: "미끄럼방지용품",
    name: "SW-M1",
    imageUrl: "/uploads/products/sw-m1.webp",
    price: 25600,
    description: "제품번호: F30031091103 / 제조사: 세원케어 / 사이즈: 91.5×61.5cm / 무게: 2.45Kg / 재질: 합성고무(NR) / 색상: 연두색",
    note: "연간 5장 구입가능 / 구입금액 25,600원 / 본인부담금 15%: 3,840 / 9%: 2,300 / 6%: 1,530"
  },
  {
    category: "미끄럼방지용품",
    name: "SW-SM02",
    imageUrl: "/uploads/products/sw-sm02.webp",
    price: 33200,
    description: "제품번호: F30031091106 / 제조사: 세원케어 / 사이즈: 91×61cm / 무게: 2Kg / 재질: 실리콘 / 색상: 보라색",
    note: "연간 5장 구입가능 / 구입금액 33,200원 / 본인부담금 15%: 4,980 / 9%: 2,980 / 6%: 1,990"
  },
  {
    category: "미끄럼방지용품",
    name: "나이팅게일축광(대)",
    imageUrl: "/uploads/products/나이팅게일축광대.webp",
    price: 36500,
    description: "제품번호: F30031067113 / 제조사: 대성롱테크 / 사이즈: 92×60cm / 무게: 0.7Kg / 재질: 축광실리콘 / 색상: 하늘색",
    note: "연간 5장 구입가능 / 구입금액 36,500원 / 본인부담금 15%: 5,470 / 9%: 3,280 / 6%: 2,190"
  },
  {
    category: "미끄럼방지용품",
    name: "나이팅게일축광(중)",
    imageUrl: "/uploads/products/나이팅게일축광중.webp",
    price: 23100,
    description: "제품번호: F30031067112 / 제조사: 대성롱테크 / 사이즈: 70×45.5cm / 무게: 0.5Kg / 재질: 축광실리콘 / 색상: 하늘색",
    note: "연간 5장 구입가능 / 구입금액 23,100원 / 본인부담금 15%: 3,460 / 9%: 2,070 / 6%: 1,380"
  },
];
