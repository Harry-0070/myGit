"use client"

import { useState } from "react"
import { useCartStore } from "@/store/cart-store"

interface PageProps {
  params: { handle: string }
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
const COLORS = ["블랙", "화이트", "네이비", "그레이"]

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price)
}

// 목업 상품 상세 데이터
function getMockProduct(handle: string) {
  return {
    id: handle,
    handle,
    title: "베이직 코튼 티셔츠",
    description:
      "일상에서 편안하게 입을 수 있는 베이직 코튼 티셔츠입니다. 고급 순면 소재를 사용하여 부드럽고 통기성이 뛰어납니다. 다양한 컬러와 사이즈로 제공됩니다.",
    price: 29000,
    originalPrice: 39000,
    discountRate: 26,
    thumbnail: null,
    variants: SIZES.map((size) => ({
      id: `${handle}-${size}`,
      title: size,
    })),
  }
}

export default function ProductDetailPage({ params }: PageProps) {
  const product = getMockProduct(params.handle)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem, openCart } = useCartStore()

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("사이즈를 선택해주세요.")
      return
    }
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor || "기본"}`,
      productId: product.id,
      variantId: `${product.handle}-${selectedSize}`,
      title: product.title,
      thumbnail: product.thumbnail,
      price: product.price,
      quantity,
      size: selectedSize,
      color: selectedColor || undefined,
    })
    setAddedToCart(true)
    setTimeout(() => {
      setAddedToCart(false)
      openCart()
    }, 500)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* 이미지 갤러리 */}
        <div className="space-y-3">
          <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-300 text-sm">상품 이미지 준비중</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gray-100 rounded cursor-pointer hover:ring-2 hover:ring-black"
              />
            ))}
          </div>
        </div>

        {/* 상품 정보 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{product.title}</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-2xl font-bold">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-gray-400 line-through text-sm">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-red-500 text-sm font-semibold">
                    {product.discountRate}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 색상 선택 */}
          <div>
            <p className="text-sm font-semibold mb-2">
              색상{selectedColor ? `: ${selectedColor}` : ""}
            </p>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1.5 text-sm border rounded transition-colors ${
                    selectedColor === color
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-500"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* 사이즈 선택 */}
          <div>
            <p className="text-sm font-semibold mb-2">
              사이즈{selectedSize ? `: ${selectedSize}` : ""}
            </p>
            <div className="grid grid-cols-6 gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 text-sm border rounded transition-colors ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-500"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* 수량 */}
          <div>
            <p className="text-sm font-semibold mb-2">수량</p>
            <div className="flex items-center gap-3 w-fit border border-gray-300 rounded">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-50 text-lg leading-none"
              >
                −
              </button>
              <span className="px-2 py-2 min-w-[2rem] text-center text-sm">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-gray-50 text-lg leading-none"
              >
                +
              </button>
            </div>
          </div>

          {/* 장바구니 / 구매 버튼 */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              className={`w-full py-3.5 text-sm font-semibold tracking-wider rounded transition-colors ${
                addedToCart
                  ? "bg-green-600 text-white"
                  : "bg-black text-white hover:bg-gray-900"
              }`}
            >
              {addedToCart ? "✓ 장바구니 추가됨" : "장바구니 담기"}
            </button>
            <button className="w-full py-3.5 border border-black text-sm font-semibold tracking-wider rounded hover:bg-gray-50 transition-colors">
              바로 구매
            </button>
          </div>

          {/* 상품 설명 */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold mb-3">상품 설명</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
