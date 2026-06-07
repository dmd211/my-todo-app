'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { register } from '@/lib/auth'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password || !confirmPassword) {
      setError('请填写所有字段')
      return
    }

    if (password !== confirmPassword) {
      setError('两次密码不一致')
      return
    }

    if (password.length < 6) {
      setError('密码至少6位')
      return
    }

    setLoading(true)
    try {
      await register(email, password)
      alert('注册成功！现在可以登录了')
      router.push('/login')
    } catch (e: any) {
      setError(e.message || '注册失败')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">22408 考研助手</h1>
          <p className="text-gray-500 mt-2">注册账号</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
              placeholder="输入邮箱"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
              placeholder="输入密码（至少6位）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
              placeholder="再次输入密码"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          已有账号？<Link href="/login" className="text-indigo-600 hover:underline">登录</Link>
        </p>
      </div>
    </div>
  )
}