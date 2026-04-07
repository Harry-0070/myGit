import type { Metadata } from "next"
import ProductCard from "@/components/product/ProductCard"

export const metadata: Metadata = {
  title: "전체 상품",
}

// 목업 상품 데이터 — 추후 Medusa API 연동
const MOCK_PRODUCTS = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  handle: `product-${i + 1}`,
  title: ["베이직 코튼 티셔츠", "슬림핏 치노 팬츠", "라이트 봄 재킷", "화이트 스니커즈"][i % 4],
  thumbnail: null,
  price: [29000, 59000, 89000, 79000][i % 4],
  originalPrice: [39000, undefined, 119000, undefined][i % 4] as number | undefined,
  discountRate: [26, undefined, 25, undefined][i % 4] as number | undefined,
}))

export default async function ProductsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold tracking-wider mb-8">전체 상품</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  )
}
