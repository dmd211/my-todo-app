'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, FolderOpen, CheckSquare, Timer, Settings } from 'lucide-react'

const navItems = [
  { href: '/', label: '学习仪表盘', icon: LayoutDashboard },
  { href: '/wrong-questions', label: '错题本', icon: BookOpen },
  { href: '/materials', label: '资料库', icon: FolderOpen },
  { href: '/tasks', label: '周/日任务', icon: CheckSquare },
  { href: '/ai', label: '番茄钟', icon: Timer },
  { href: '/admin', label: '管理端', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-lg font-bold text-indigo-600">22408 考研助手</h1>
        <p className="text-xs text-gray-400 mt-1">高效复习 · 精准督学</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}