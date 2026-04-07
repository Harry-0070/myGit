import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "주문 내역",
}

export default function OrdersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">주문 내역</h1>
      <div className="text-center py-20 text-gray-400">
        <p className="mb-4">주문 내역이 없습니다</p>
        <Link
          href="/products"
          className="inline-block px-6 py-2 bg-black text-white text-sm rounded hover:bg-gray-900 transition-colors"
        >
          쇼핑 시작하기
        </Link>
      </div>
    </div>
  )
}
