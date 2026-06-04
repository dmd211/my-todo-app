'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RefreshCw, BookOpen, FolderOpen, Calendar, Brain, CheckSquare } from 'lucide-react'

export default function DashboardPage() {
  const [todayWrong, setTodayWrong] = useState(0)
  const [weeklyProgress, setWeeklyProgress] = useState(0)
  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [daysToExam, setDaysToExam] = useState(0)

  // 考研倒计时：每年12月最后一个周六
  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear()
    // 12月最后一个周六
    const lastDayOfDec = new Date(year, 11, 1)
    const dayOfWeek = lastDayOfDec.getDay()
    const daysToAdd = dayOfWeek <= 6 ? 6 - dayOfWeek : 0
    const lastSaturday = new Date(year, 11, 31 - daysToAdd)
    // 如果已经过了今年的考研，往后推到明年
    const examDate = lastSaturday < now ? new Date(year + 1, 11, 31 - ((new Date(year + 1, 11, 1).getDay() + 1) % 7 || 7)) : lastSaturday
    setDaysToExam(Math.max(0, Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))))
  }, [])

  async function loadQuote() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/quotes/random`)
      const q = await res.json()
      setQuote(q)
    } catch (e) {
      setQuote({ content: '加油，你一定可以！', author: '佚名' })
    }
  }

  async function loadStats() {
    setLoading(true)
    try {
      // 今日新增错题（直接查 Supabase）
      const today = new Date().toISOString().split('T')[0]
      const { count: wrongCount } = await supabase
        .from('wrong_questions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today + 'T00:00:00')
        .lt('created_at', today + 'T23:59:59')

      setTodayWrong(wrongCount || 0)

      // 本周完成度（查 daily_tasks）
      const now = new Date()
      const year = now.getFullYear()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      const weekEnd = new Date(now)
      weekEnd.setDate(now.getDate() + (6 - now.getDay()))

      const { data: weeklyTasks } = await supabase
        .from('daily_tasks')
        .select('*')
        .gte('date', weekStart.toISOString().split('T')[0])
        .lte('date', weekEnd.toISOString().split('T')[0])

      if (weeklyTasks && weeklyTasks.length > 0) {
        const done = weeklyTasks.filter((t: any) => t.completed).length
        setWeeklyProgress(Math.round((done / weeklyTasks.length) * 100))
      } else {
        setWeeklyProgress(0)
      }

      await loadQuote()
    } catch (e) {
      console.error('加载仪表盘数据失败:', e)
    }
    setLoading(false)
  }

  async function refreshQuote() {
    setRefreshing(true)
    await loadQuote()
    setRefreshing(false)
  }

  useEffect(() => { loadStats() }, [])

  if (loading) return <div className="p-6 text-gray-400">加载中...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">学习仪表盘</h2>
        <p className="text-sm text-gray-500 mt-1">
          距离考研还有 <span className="text-indigo-600 font-bold text-lg">{daysToExam}</span> 天
        </p>
      </div>

      {/* 快速统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen />}
          label="今日新增错题"
          value={todayWrong}
          color="bg-red-50 text-red-500"
        />
        <StatCard
          icon={<FolderOpen />}
          label="今日新增资料"
          value="—"
          color="bg-blue-50 text-blue-500"
          hint="资料库开发中"
        />
        <StatCard
          icon={<CheckSquare />}
          label="本周完成度"
          value={`${weeklyProgress}%`}
          color="bg-green-50 text-green-500"
        />
        <StatCard
          icon={<Brain />}
          label="AI 督学"
          value="随时问"
          color="bg-purple-50 text-purple-500"
          href="/ai"
        />
      </div>

      {/* AI 励志语 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-75 mb-1">✨ 今日励志语</p>
            <p className="text-xl font-medium leading-relaxed">
             ldquo;{quote?.content || '加油，你一定可以！'}&rdquo;
            </p>
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

function StatCard({
  icon,
  label,
  value,
  color,
  hint,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  hint?: string
  href?: string
}) {
  const content = (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
    </div>
  )

  return href ? (
    <a href={href} className="hover:shadow-md transition-shadow cursor-pointer block">
      {content}
    </a>
  ) : (
    content
  )
}

function FeatureCard({
  href,
  icon,
  title,
  desc,
  color,
}: {
  href: string
  icon: React.ReactNode
  title: string
  desc: string
  color: string
}) {
  return (
    <a
      href={href}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className={`p-3 rounded-xl ${color} text-white`}>{icon}</div>
      <div>
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-400">{desc}</p>
      </div>
    </a>
  )
}