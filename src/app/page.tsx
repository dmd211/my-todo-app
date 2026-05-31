'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { RefreshCw, BookOpen, FolderOpen, Calendar, Brain } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [dash, q] = await Promise.all([api.ai.dashboard(), api.quotes.random()])
      setStats(dash)
      setQuote(q)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function refreshQuote() {
    setRefreshing(true)
    const q = await api.quotes.random()
    setQuote(q)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="p-6 text-gray-400">加载中...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">学习仪表盘</h2>
        <p className="text-sm text-gray-500 mt-1">距离考研还有 <span className="text-indigo-600 font-bold text-lg">{stats?.days_to_exam}</span> 天</p>
      </div>

      {/* 快速统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={<Calendar />} label="今日新增错题" value={stats?.today_wrong_count ?? 0} color="bg-red-50 text-red-500" />
        <StatCard icon={<FolderOpen />} label="今日新增资料" value={stats?.today_material_count ?? 0} color="bg-blue-50 text-blue-500" />
        <StatCard icon={<CheckSquare />} label="本周完成度" value={`${stats?.weekly_progress ?? 0}%`} color="bg-green-50 text-green-500" />
        <StatCard icon={<Brain />} label="AI 督学" value="随时问" color="bg-purple-50 text-purple-500" />
      </div>

      {/* AI 励志语 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-75 mb-1">✨ 今日励志语</p>
            <p className="text-xl font-medium leading-relaxed">&ldquo;{quote?.content}&rdquo;</p>
            <p className="text-sm opacity-60 mt-2">— {quote?.author || '佚名'}</p>
          </div>
          <button
            onClick={refreshQuote}
            disabled={refreshing}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 功能入口 */}
      <div className="grid grid-cols-3 gap-4">
        <FeatureCard href="/wrong-questions" icon={<BookOpen />} title="错题本" desc="上传错题，AI分析错因" color="bg-red-500" />
        <FeatureCard href="/materials" icon={<FolderOpen />} title="资料库" desc="上传整理复习资料" color="bg-blue-500" />
        <FeatureCard href="/tasks" icon={<CheckSquare />} title="周/日任务" desc="跟踪每周每日任务进度" color="bg-green-500" />
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

function FeatureCard({ href, icon, title, desc, color }: { href: string; icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <a href={href} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className={`p-3 rounded-xl ${color} text-white`}>{icon}</div>
      <div>
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-400">{desc}</p>
      </div>
    </a>
  )
}

function CheckSquare({ size = 18 }: { size?: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
}