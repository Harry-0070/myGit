import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import ProductCard from "@/components/product/ProductCard"

export const metadata: Metadata = {
  title: "FABRIC — 패션 커머스",
  description: "FABRIC 패션 커머스 — 남성, 여성, 아동 의류",
}

const CATEGORIES = [
  {
    label: "남성",
    slug: "men",
    desc: "Men's Collection",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80&fit=crop",
  },
  {
    label: "여성",
    slug: "women",
    desc: "Women's Collection",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80&fit=crop",
  },
  {
    label: "아동",
    slug: "kids",
    desc: "Kids' Collection",
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80&fit=crop",
  },
]

const SAMPLE_PRODUCTS = [
  {
    id: "1",
    handle: "sample-tshirt-1",
    title: "베이직 코튼 티셔츠",
    thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=533&q=80&fit=crop",
    price: 29000,
    originalPrice: 39000,
    discountRate: 26,
  },
  {
    id: "2",
    handle: "sample-pants-1",
    title: "슬림핏 치노 팬츠",
    thumbnail: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=533&q=80&fit=crop",
    price: 59000,
  },
  {
    id: "3",
    handle: "sample-jacket-1",
    title: "라이트 봄 재킷",
    thumbnail: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=533&q=80&fit=crop",
    price: 89000,
    originalPrice: 119000,
    discountRate: 25,
  },
  {
    id: "4",
    handle: "sample-sneakers-1",
    title: "화이트 로우탑 스니커즈",
    thumbnail: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=533&q=80&fit=crop",
    price: 79000,
  },
  {
    id: "5",
    handle: "sample-dress-1",
    title: "플로럴 미디 원피스",
    thumbnail: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=533&q=80&fit=crop",
    price: 69000,
    originalPrice: 89000,
    discountRate: 22,
  },
  {
    id: "6",
    handle: "sample-hoodie-1",
    title: "오버핏 후드 집업",
    thumbnail: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&h=533&q=80&fit=crop",
    price: 69000,
  },
  {
    id: "7",
    handle: "sample-coat-1",
    title: "울 혼방 롱 코트",
    thumbnail: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=533&q=80&fit=crop",
    price: 159000,
    originalPrice: 199000,
    discountRate: 20,
  },
  {
    id: "8",
    handle: "sample-bag-1",
    title: "레더 미니 크로스백",
    thumbnail: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=533&q=80&fit=crop",
    price: 49000,
  },
]

const BANNERS = [
  {
    title: "SS 2026 컬렉션",
    desc: "새봄을 맞이하는 설레는 스타일",
    cta: "지금 쇼핑하기",
    href: "/products",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85&fit=crop",
    align: "left",
  },
]

export default async function HomePage() {
  return (
    <div className="bg-white">

      {/* ─── 히어로 배너 ─── */}
      <section className="relative h-[85vh] min-h-[560px] overflow-hidden">
        <Image
          src={BANNERS[0].image}
          alt="FABRIC 2026 SS 컬렉션"
          fill
          priority
          className="object-cover object-center"
        />
        {/* 어두운 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

        {/* 텍스트 */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-8 w-full">
            <p className="text-xs tracking-[0.4em] text-gray-300 mb-4 uppercase">
              New Arrivals — Spring / Summer 2026
            </p>
            <h1 className="text-6xl md:text-8xl font-bold tracking-widest text-white mb-4 leading-none">
              FABRIC
            </h1>
            <p className="text-xl text-gray-200 mb-10 max-w-md leading-relaxed">
              당신의 일상을 완성하는<br />세련된 패션
            </p>
            <div className="flex gap-4">
              <Link
                href="/categories/women"
                className="px-8 py-3.5 bg-white text-black text-sm font-bold tracking-wider hover:bg-gray-100 transition-colors"
              >
                여성 컬렉션
              </Link>
              <Link
                href="/categories/men"
                className="px-8 py-3.5 border border-white text-white text-sm font-bold tracking-wider hover:bg-white hover:text-black transition-colors"
              >
                남성 컬렉션
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 카테고리 ─── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group relative aspect-[3/4] overflow-hidden bg-gray-100"
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-xs tracking-widest mb-1 text-gray-300">{cat.desc}</p>
                <p className="text-2xl font-bold tracking-widest">{cat.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── 배너 띠 ─── */}
      <section className="bg-black text-white py-6 text-center">
        <p className="text-sm tracking-[0.3em] uppercase">
          무료배송 — 3만원 이상 구매시 &nbsp;|&nbsp; 무료반품 &nbsp;|&nbsp; SS 2026 신상 매일 업데이트
        </p>
      </section>

      {/* ─── 신상품 그리드 ─── */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs tracking-widest text-gray-400 mb-1">NEW ARRIVALS</p>
            <h2 className="text-2xl font-bold tracking-wider">신상품</h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium underline underline-offset-4 hover:text-gray-500 transition-colors"
          >
            전체 보기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {SAMPLE_PRODUCTS.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* ─── 중간 풀배너 ─── */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden mx-4 mb-16 rounded-xl">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=85&fit=crop"
          alt="FABRIC 여성 컬렉션"
          fill
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <p className="text-xs tracking-[0.4em] mb-3 text-gray-300">WOMEN'S COLLECTION</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-widest mb-6">여성 컬렉션</h2>
          <Link
            href="/categories/women"
            className="px-10 py-3 border border-white text-sm font-bold tracking-wider hover:bg-white hover:text-black transition-colors"
          >
            컬렉션 보기
          </Link>
        </div>
      </section>

      {/* ─── ABOUT FABRIC ─── */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square overflow-hidden rounded-xl">
            <Image
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=700&q=80&fit=crop"
              alt="FABRIC 스토어"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs tracking-[0.3em] text-gray-400 mb-3">ABOUT FABRIC</p>
            <h2 className="text-4xl font-bold tracking-widest mb-6">우리의 이야기</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              FABRIC은 일상의 편안함과 세련된 스타일을 동시에 추구합니다.
              트렌디하지만 오래 입을 수 있는 옷, 좋은 소재와 합리적인 가격으로
              당신의 옷장을 완성해 드립니다.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              남성, 여성, 아동 모두를 위한 컬렉션을 매 시즌 새롭게 선보입니다.
            </p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-black text-white text-sm font-bold tracking-wider hover:bg-gray-800 transition-colors"
            >
              전체 상품 보기
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
