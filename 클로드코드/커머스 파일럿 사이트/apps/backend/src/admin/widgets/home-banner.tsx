import { defineWidgetConfig } from "@medusajs/admin-sdk"

const HomeBannerWidget = () => {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1a1a1a 0%, #374151 100%)",
        borderRadius: "12px",
        padding: "28px 32px",
        color: "white",
        marginBottom: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <p style={{ fontSize: "12px", color: "#9ca3af", letterSpacing: "3px", marginBottom: "6px" }}>
          FABRIC ADMIN DASHBOARD
        </p>
        <h2 style={{ fontSize: "24px", fontWeight: "700", letterSpacing: "4px", marginBottom: "8px" }}>
          FABRIC
        </h2>
        <p style={{ fontSize: "14px", color: "#d1d5db" }}>패션 커머스 관리 시스템</p>
        <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
          {[
            { label: "상품관리", href: "/app/products" },
            { label: "주문관리", href: "/app/orders" },
            { label: "고객관리", href: "/app/customers" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                padding: "6px 14px",
                fontSize: "12px",
                color: "white",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
      <div style={{ fontSize: "64px", opacity: 0.15 }}>🧵</div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: "product.list.before",
})

export default HomeBannerWidget
