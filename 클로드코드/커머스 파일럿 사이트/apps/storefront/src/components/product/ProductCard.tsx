import Image from "next/image"
import Link from "next/link"

interface ProductCardProps {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  price?: number
  originalPrice?: number
  discountRate?: number
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price)
}

export default function ProductCard({
  handle,
  title,
  thumbnail,
  price,
  originalPrice,
  discountRate,
}: ProductCardProps) {
  return (
    <Link href={`/products/${handle}`} className="group block">
      {/* 이미지 */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-4xl text-gray-200">👗</span>
            <span className="text-gray-300 text-xs">이미지 준비중</span>
          </div>
        )}

        {/* 할인 뱃지 */}
        {discountRate && discountRate > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1">
            -{discountRate}%
          </span>
        )}

        {/* 호버 오버레이 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* 상품 정보 */}
      <div className="mt-3 space-y-1">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-gray-500 transition-colors leading-snug">
          {title}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {price !== undefined && (
            <span className="text-sm font-bold text-gray-900">{formatPrice(price)}</span>
          )}
          {originalPrice && originalPrice !== price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
          {discountRate && discountRate > 0 && (
            <span className="text-xs font-bold text-red-500">{discountRate}%</span>
          )}
        </div>
      </div>
    </Link>
  )
}
