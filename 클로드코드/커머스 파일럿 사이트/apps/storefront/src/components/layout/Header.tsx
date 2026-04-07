"use client"

import Link from "next/link"
import { useState } from "react"
import { useCartStore } from "@/store/cart-store"

const CATEGORIES = [
  {
    label: "남성",
    slug: "men",
    sub: ["상의", "하의", "아우터", "신발"],
    subSlugs: ["men-top", "men-bottom", "men-outer", "men-shoes"],
  },
  {
    label: "여성",
    slug: "women",
    sub: ["상의", "하의", "아우터", "신발"],
    subSlugs: ["women-top", "women-bottom", "women-outer", "women-shoes"],
  },
  {
    label: "아동",
    slug: "kids",
    sub: ["상의", "하의"],
    subSlugs: ["kids-top", "kids-bottom"],
  },
]

export default function Header() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const { items, toggleCart } = useCartStore()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        {/* 상단 바 */}
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-widest text-fabric-black"
          >
            FABRIC
          </Link>

          {/* GNB */}
          <nav className="hidden md:flex items-center gap-8">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.slug}
                className="relative"
                onMouseEnter={() => setHoveredCategory(cat.slug)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  href={`/categories/${cat.slug}`}
                  className="text-sm font-medium tracking-wider hover:text-gray-500 transition-colors py-5 block"
                >
                  {cat.label}
                </Link>

                {/* 드롭다운 */}
                {hoveredCategory === cat.slug && (
                  <div className="absolute top-full left-0 bg-white border border-gray-100 shadow-lg rounded-sm py-3 w-32 z-50">
                    {cat.sub.map((sub, i) => (
                      <Link
                        key={sub}
                        href={`/categories/${cat.subSlugs[i]}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* 우측 아이콘 */}
          <div className="flex items-center gap-4">
            {/* 검색 */}
            <button
              aria-label="검색"
              className="p-2 hover:text-gray-500 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>

            {/* 로그인 */}
            <Link
              href="/login"
              className="p-2 hover:text-gray-500 transition-colors text-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </Link>

            {/* 장바구니 */}
            <button
              onClick={toggleCart}
              aria-label="장바구니"
              className="relative p-2 hover:text-gray-500 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
