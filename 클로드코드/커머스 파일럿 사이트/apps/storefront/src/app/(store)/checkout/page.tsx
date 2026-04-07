"use client"

import { useState } from "react"
import { useCartStore } from "@/store/cart-store"
import { useRouter } from "next/navigation"

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price)
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const router = useRouter()
  const [step, setStep] = useState<"shipping" | "payment" | "confirm">("shipping")
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    phone: "",
    address: "",
    addressDetail: "",
    zipCode: "",
    memo: "",
  })

  const shippingFee = total >= 50000 ? 0 : 3000

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">결제</h1>
        <p className="text-gray-500">장바구니가 비어있습니다.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">결제</h1>

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-2 mb-10">
        {["배송정보", "결제수단", "주문확인"].map((s, i) => {
          const stepKeys = ["shipping", "payment", "confirm"]
          const isActive = stepKeys.indexOf(step) >= i
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-sm ${isActive ? "font-semibold" : "text-gray-400"}`}>
                {s}
              </span>
              {i < 2 && <span className="text-gray-300">—</span>}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 폼 영역 */}
        <div className="lg:col-span-2">
          {step === "shipping" && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-4">배송 정보</h2>
              {[
                { label: "이름", key: "name", placeholder: "받는 분 이름" },
                { label: "연락처", key: "phone", placeholder: "010-0000-0000" },
                { label: "우편번호", key: "zipCode", placeholder: "우편번호 검색" },
                { label: "주소", key: "address", placeholder: "기본 주소" },
                { label: "상세주소", key: "addressDetail", placeholder: "상세 주소" },
                { label: "배송메모", key: "memo", placeholder: "배송 요청사항 (선택)" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-sm font-medium block mb-1">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={shippingInfo[key as keyof typeof shippingInfo]}
                    onChange={(e) =>
                      setShippingInfo((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                  />
                </div>
              ))}
              <button
                onClick={() => setStep("payment")}
                className="w-full bg-black text-white py-3.5 text-sm font-semibold tracking-wider hover:bg-gray-900 transition-colors rounded mt-4"
              >
                다음 — 결제수단 선택
              </button>
            </div>
          )}

          {step === "payment" && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-4">결제 수단</h2>
              <div className="space-y-3">
                {[
                  { id: "toss", label: "토스페이먼츠 (카드/간편결제)", recommended: true },
                  { id: "card", label: "신용/체크카드" },
                  { id: "transfer", label: "무통장입금" },
                ].map((method) => (
                  <label
                    key={method.id}
                    className="flex items-center gap-3 border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      defaultChecked={method.id === "toss"}
                    />
                    <span className="text-sm">{method.label}</span>
                    {method.recommended && (
                      <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        추천
                      </span>
                    )}
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep("shipping")}
                  className="flex-1 border border-gray-300 py-3.5 text-sm hover:bg-gray-50 transition-colors rounded"
                >
                  이전
                </button>
                <button
                  onClick={() => setStep("confirm")}
                  className="flex-1 bg-black text-white py-3.5 text-sm font-semibold tracking-wider hover:bg-gray-900 transition-colors rounded"
                >
                  다음 — 주문 확인
                </button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-4">주문 확인</h2>
              <div className="border rounded-lg p-4 space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">받는 분:</span>{" "}
                  {shippingInfo.name || "(미입력)"}
                </p>
                <p>
                  <span className="text-gray-500">연락처:</span>{" "}
                  {shippingInfo.phone || "(미입력)"}
                </p>
                <p>
                  <span className="text-gray-500">주소:</span>{" "}
                  {shippingInfo.address} {shippingInfo.addressDetail}
                </p>
              </div>
              <p className="text-sm text-gray-500 bg-yellow-50 p-3 rounded">
                ※ PoC 환경입니다. 실제 결제는 토스페이먼츠 연동 후 가능합니다.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep("payment")}
                  className="flex-1 border border-gray-300 py-3.5 text-sm hover:bg-gray-50 transition-colors rounded"
                >
                  이전
                </button>
                <button
                  onClick={() => {
                    clearCart()
                    router.push("/account")
                  }}
                  className="flex-1 bg-black text-white py-3.5 text-sm font-semibold tracking-wider hover:bg-gray-900 transition-colors rounded"
                >
                  주문 완료 (테스트)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 주문 요약 */}
        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-lg p-5 sticky top-24">
            <h2 className="font-bold mb-4">주문 상품</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="truncate text-gray-700">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="font-medium ml-2 flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">상품 금액</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">배송비</span>
                <span>{shippingFee === 0 ? "무료" : formatPrice(shippingFee)}</span>
              </div>
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-bold">
              <span>총 결제 금액</span>
              <span>{formatPrice(total + shippingFee)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
