"use client"

import type { Metadata } from "next"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import sdk from "@/lib/medusa-client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await sdk.auth.login("customer", "emailpass", { email, password })
      router.push("/account")
    } catch (err: any) {
      setError(err?.message || "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold tracking-wider text-center mb-8">
          로그인
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소 입력"
              required
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              required
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 text-sm font-semibold tracking-wider hover:bg-gray-900 transition-colors rounded disabled:opacity-50"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            계정이 없으신가요?{" "}
            <Link
              href="/register"
              className="text-black font-semibold hover:underline"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
