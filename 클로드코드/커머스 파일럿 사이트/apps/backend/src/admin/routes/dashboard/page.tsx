import { defineRouteConfig } from "@medusajs/admin-sdk"
import { GridLayout } from "@medusajs/icons"

const menuItems = [
  {
    icon: "📦",
    title: "상품 관리",
    description: "상품 등록, 수정, 재고 관리",
    href: "/products",
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: "🛒",
    title: "주문 관리",
    description: "주문 조회, 처리, 환불 관리",
    href: "/orders",
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: "👤",
    title: "고객 관리",
    description: "회원 정보 조회 및 관리",
    href: "/customers",
    color: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: "🏷️",
    title: "카테고리",
    description: "상품 카테고리 구조 관리",
    href: "/categories",
    color: "from-orange-500 to-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: "💳",
    title: "결제 관리",
    description: "결제 수단 및 설정",
    href: "/settings/payment-providers",
    color: "from-pink-500 to-pink-600",
    bg: "bg-pink-50",
  },
  {
    icon: "🚚",
    title: "배송 관리",
    description: "배송 방법 및 요금 설정",
    href: "/settings/shipping-profiles",
    color: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    icon: "🎁",
    title: "쿠폰/할인",
    description: "프로모션 및 할인 코드 관리",
    href: "/promotions",
    color: "from-yellow-500 to-yellow-600",
    bg: "bg-yellow-50",
  },
  {
    icon: "⚙️",
    title: "설정",
    description: "스토어 기본 설정",
    href: "/settings",
    color: "from-gray-500 to-gray-600",
    bg: "bg-gray-50",
  },
]

const DashboardPage = () => {
  const now = new Date()
  const hour = now.getHours()
  const greeting =
    hour < 12 ? "좋은 아침이에요" : hour < 18 ? "좋은 오후예요" : "좋은 저녁이에요"

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* 헤더 */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)",
          borderRadius: "16px",
          padding: "40px",
          marginBottom: "32px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "200px",
            height: "200px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "40%",
            width: "300px",
            height: "300px",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "50%",
          }}
        />
        <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "8px", letterSpacing: "2px" }}>
          FABRIC ADMIN
        </p>
        <h1 style={{ fontSize: "32px", fontWeight: "700", letterSpacing: "4px", marginBottom: "8px" }}>
          FABRIC
        </h1>
        <p style={{ fontSize: "16px", color: "#d1d5db" }}>
          {greeting} 👋 — 오늘도 좋은 하루 되세요
        </p>
        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}>
          {now.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
      </div>

      {/* 빠른 메뉴 */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", marginBottom: "16px" }}>
          빠른 메뉴
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={`/app${item.href}`}
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                padding: "20px",
                textDecoration: "none",
                color: "inherit",
                display: "block",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 4px 20px rgba(0,0,0,0.1)"
                ;(e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none"
                ;(e.currentTarget as HTMLElement).style.transform = "translateY(0)"
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>{item.icon}</div>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                {item.title}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>{item.description}</div>
            </a>
          ))}
        </div>
      </div>

      {/* 하단 안내 */}
      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px 24px",
          marginTop: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "20px" }}>💡</span>
        <div>
          <p style={{ fontSize: "14px", fontWeight: "500", color: "#374151", margin: 0 }}>
            기본 메뉴는 왼쪽 사이드바에서 접근할 수 있어요
          </p>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: "2px 0 0" }}>
            Products → 상품 | Orders → 주문 | Customers → 고객 | Promotions → 쿠폰
          </p>
        </div>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "한국어 대시보드",
  icon: GridLayout,
})

export default DashboardPage
