import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-fabric-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 */}
          <div>
            <h3 className="text-xl font-bold tracking-widest mb-4">FABRIC</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              국내 패션 커머스 파일럿 사이트
              <br />
              당신의 스타일을 완성하다.
            </p>
          </div>

          {/* 쇼핑 */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider mb-4 text-gray-300">
              쇼핑
            </h4>
            <ul className="space-y-2">
              {["남성", "여성", "아동"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/categories/${cat === "남성" ? "men" : cat === "여성" ? "women" : "kids"}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 고객센터 */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider mb-4 text-gray-300">
              고객센터
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>평일 09:00 - 18:00</li>
              <li>점심 12:00 - 13:00</li>
              <li>주말 및 공휴일 휴무</li>
            </ul>
          </div>

          {/* 정보 */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider mb-4 text-gray-300">
              정보
            </h4>
            <ul className="space-y-2">
              {[
                { label: "이용약관", href: "#" },
                { label: "개인정보처리방침", href: "#" },
                { label: "공지사항", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-600">
          © 2026 FABRIC. All rights reserved. | 파일럿 프로젝트 — PoC 목적
        </div>
      </div>
    </footer>
  )
}
