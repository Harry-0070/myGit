import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    template: "%s | FABRIC",
    default: "FABRIC — 패션 커머스",
  },
  description: "FABRIC — 국내 패션 커머스 파일럿 사이트",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
