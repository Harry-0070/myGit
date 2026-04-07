import type { Metadata } from "next"
import ProductCard from "@/components/product/ProductCard"

interface PageProps {
  params: { slug: string }
}

const CATEGORY_LABELS: Record<string, string> = {
  men: "남성",
  women: "여성",
  kids: "아동",
  "men-top": "남성 > 상의",
  "men-bottom": "남성 > 하의",
  "men-outer": "남성 > 아우터",
  "men-shoes": "남성 > 신발",
  "women-top": "여성 > 상의",
  "women-bottom": "여성 > 하의",
  "women-outer": "여성 > 아우터",
  "women-shoes": "여성 > 신발",
  "kids-top": "아동 > 상의",
  "kids-bottom": "아동 > 하의",
}

// 목업 상품
const MOCK_PRODUCTS = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1),
  handle: `product-${i + 1}`,
  title: ["베이직 코튼 티셔츠", "슬림핏 치노 팬츠", "라이트 봄 재킷", "화이트 스니커즈"][i % 4],
  thumbnail: null,
  price: [29000, 59000, 89000, 79000][i % 4],
  discountRate: [26, undefined, 25, undefined][i % 4] as number | undefined,
}))

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const label = CATEGORY_LABELS[params.slug] || params.slug
  return { title: label }
}

export default async function CategoryPage({ params }: PageProps) {
  const label = CATEGORY_LABELS[params.slug] || params.slug

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold tracking-wider mb-8">{label}</h1>

      <div className="flex gap-8">
        {/* 필터 사이드바 */}
        <aside className="hidden lg:block w-48 flex-shrink-0">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">사이즈</h3>
              <div className="space-y-1.5">
                {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                  <label key={size} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    {size}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">색상</h3>
              <div className="space-y-1.5">
                {["블랙", "화이트", "네이비", "그레이"].map((color) => (
                  <label key={color} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    {color}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">가격</h3>
              <div className="space-y-1.5">
                {["~30,000원", "30,000~60,000원", "60,000~100,000원", "100,000원~"].map((range) => (
                  <label key={range} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    {range}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* 상품 그리드 */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">{MOCK_PRODUCTS.length}개 상품</p>
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>최신순</option>
              <option>가격 낮은순</option>
              <option>가격 높은순</option>
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {MOCK_PRODUCTS.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
