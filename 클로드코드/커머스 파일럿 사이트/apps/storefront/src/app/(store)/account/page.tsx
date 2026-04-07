import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "마이페이지",
}

export default function AccountPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">마이페이지</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 사이드 메뉴 */}
        <aside className="md:col-span-1">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="pb-4 mb-4 border-b">
              <p className="font-semibold">안녕하세요!</p>
              <p className="text-sm text-gray-500 mt-0.5">로그인이 필요합니다</p>
            </div>
            <nav className="space-y-1">
              {[
                { label: "주문 내역", href: "/account/orders" },
                { label: "배송 현황", href: "#" },
                { label: "찜 목록", href: "#" },
                { label: "쿠폰 / 포인트", href: "#" },
                { label: "회원정보 수정", href: "#" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3 border-t mt-3">
                <Link
                  href="/login"
                  className="block w-full text-center py-2 border border-gray-300 text-sm rounded hover:bg-gray-50 transition-colors"
                >
                  로그인
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <div className="md:col-span-2">
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="font-bold text-lg mb-4">최근 주문 내역</h2>
            <div className="text-center py-10 text-gray-400">
              <p className="mb-4">로그인 후 주문 내역을 확인하세요</p>
              <Link
                href="/login"
                className="inline-block px-6 py-2 bg-black text-white text-sm rounded hover:bg-gray-900 transition-colors"
              >
                로그인하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
