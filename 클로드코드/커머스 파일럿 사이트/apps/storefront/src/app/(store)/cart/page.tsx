"use client"

import Link from "next/link"
import { useCartStore } from "@/store/cart-store"

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price)
}

export default function CartPage() {
  const { items, total, removeItem, updateQuantity } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-6">장바구니</h1>
        <p className="text-gray-500 mb-8">장바구니가 비어있습니다.</p>
        <Link
          href="/products"
          className="inline-block px-8 py-3 bg-black text-white text-sm font-semibold tracking-wider hover:bg-gray-900 transition-colors rounded"
        >
          쇼핑 계속하기
        </Link>
      </div>
    )
  }

  const shippingFee = total >= 50000 ? 0 : 3000

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">장바구니</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 상품 목록 */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 border border-gray-100 rounded-lg p-4"
            >
              <div className="w-24 h-28 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                <span className="text-gray-300 text-xs">이미지</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{item.title}</p>
                {item.size && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {item.size}
                    {item.color ? ` / ${item.color}` : ""}
                  </p>
                )}
                <p className="font-bold mt-1">{formatPrice(item.price)}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 border border-gray-300 rounded w-fit">
                    <button
                      onClick={() =>
                        item.quantity > 1
                          ? updateQuantity(item.id, item.quantity - 1)
                          : removeItem(item.id)
                      }
                      className="px-2 py-1 hover:bg-gray-50"
                    >
                      −
                    </button>
                    <span className="px-2 text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-gray-400 hover:text-red-500"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 주문 요약 */}
        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-lg p-5 space-y-3 sticky top-24">
            <h2 className="font-bold text-lg mb-4">주문 요약</h2>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">상품 금액</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">배송비</span>
              <span>{shippingFee === 0 ? "무료" : formatPrice(shippingFee)}</span>
            </div>
            {shippingFee > 0 && (
              <p className="text-xs text-gray-400">
                {formatPrice(50000 - total)} 더 담으면 무료배송
              </p>
            )}
            <div className="border-t pt-3 flex justify-between font-bold">
              <span>총 결제 금액</span>
              <span>{formatPrice(total + shippingFee)}</span>
            </div>
            <Link
              href="/checkout"
              className="block w-full bg-black text-white text-center py-3.5 text-sm font-semibold tracking-wider hover:bg-gray-900 transition-colors rounded mt-2"
            >
              주문하기
            </Link>
            <Link
              href="/products"
              className="block w-full border border-gray-300 text-center py-3 text-sm hover:bg-gray-50 transition-colors rounded"
            >
              쇼핑 계속하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
