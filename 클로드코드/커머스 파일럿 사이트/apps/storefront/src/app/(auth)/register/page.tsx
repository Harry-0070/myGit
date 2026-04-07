"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import sdk from "@/lib/medusa-client"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirm: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }
    if (form.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.")
      return
    }

    setIsLoading(true)
    try {
      await sdk.auth.register("customer", "emailpass", {
        email: form.email,
        password: form.password,
        first_name: form.firstName,
        last_name: form.lastName,
      })
      router.push("/login?registered=1")
    } catch (err: any) {
      setError(err?.message || "회원가입에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold tracking-wider text-center mb-8">
          회원가입
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">성</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="홍"
                required
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">이름</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="길동"
                required
                className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="이메일 주소 입력"
              required
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="8자 이상"
              required
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">비밀번호 확인</label>
            <input
              type="password"
              value={form.passwordConfirm}
              onChange={(e) => setForm((p) => ({ ...p, passwordConfirm: e.target.value }))}
              placeholder="비밀번호 재입력"
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
            {isLoading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="text-black font-semibold hover:underline"
            >
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
