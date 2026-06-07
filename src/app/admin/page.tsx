'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser, logout } from '@/lib/auth'
import { Plus, Trash2, Edit2, Check, X, LogOut } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<any[]>([])
  const [knowledgePoints, setKnowledgePoints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [activeTab, setActiveTab] = useState<'subjects' | 'knowledge'>('subjects')
  const [editingSubject, setEditingSubject] = useState<any>(null)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectColor, setNewSubjectColor] = useState('#6366f1')
  const [newKPName, setNewKPName] = useState('')
  const [newKPSubject, setNewKPSubject] = useState('')

  // 检查登录状态
  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserEmail(user.email || '')
      setCheckingAuth(false)
      load()
    }
    checkAuth()
  }, [router])

  async function load() {
    setLoading(true)
    try {
      const [subs, kps] = await Promise.all([
        supabase.from('subjects').select('*').order('name').then(r => r.data || []),
        supabase.from('knowledge_points').select('*,subjects:subject_id(name)').then(r => r.data || []),
      ])
      setSubjects(subs)
      setKnowledgePoints(kps)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  async function saveSubject(e: React.FormEvent) {
    e.preventDefault()
    if (!newSubjectName.trim()) return
    if (editingSubject) {
      await supabase.from('subjects').update({ name: newSubjectName, color: newSubjectColor }).eq('id', editingSubject.id)
    } else {
      await supabase.from('subjects').insert({ name: newSubjectName, color: newSubjectColor })
    }
    setEditingSubject(null)
    setNewSubjectName('')
    setNewSubjectColor('#6366f1')
    load()
  }

  async function deleteSubject(id: string) {
    if (!confirm('删除学科会同时删除其下所有知识点，确定？')) return
    await supabase.from('subjects').delete().eq('id', id)
    load()
  }

  async function saveKP(e: React.FormEvent) {
    e.preventDefault()
    if (!newKPName.trim() || !newKPSubject) return
    await supabase.from('knowledge_points').insert({ name: newKPName, subject_id: newKPSubject })
    setNewKPName('')
    setNewKPSubject('')
    load()
  }

  async function deleteKP(id: string) {
    await supabase.from('knowledge_points').delete().eq('id', id)
    load()
  }

  if (checkingAuth) return <div className="p-6 text-gray-400">检查登录状态...</div>
  if (loading) return <div className="p-6 text-gray-400">加载中...</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">管理端</h2>
          <p className="text-sm text-gray-500 mt-1">管理学科和知识点</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{userEmail}</span>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50">
            <LogOut size={16} /> 退出
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button onClick={() => setActiveTab('subjects')} className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'subjects' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          学科管理
        </button>
        <button onClick={() => setActiveTab('knowledge')} className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'knowledge' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          知识点管理
        </button>
      </div>

      {activeTab === 'subjects' && (
        <div className="space-y-4">
          {/* 添加/编辑学科 */}
          <form onSubmit={saveSubject} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <input value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="学科名称" className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1" />
            <input type="color" value={newSubjectColor} onChange={e => setNewSubjectColor(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">{editingSubject ? '保存' : '添加'}</button>
            {editingSubject && <button type="button" onClick={() => { setEditingSubject(null); setNewSubjectName('') }} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>}
          </form>

          {/* 学科列表 */}
          <div className="grid grid-cols-3 gap-3">
            {subjects.map(s => (
              <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="flex-1 font-medium text-gray-700 text-sm">{s.name}</span>
                <button onClick={() => { setEditingSubject(s); setNewSubjectName(s.name); setNewSubjectColor(s.color) }} className="text-gray-400 hover:text-indigo-600"><Edit2 size={14} /></button>
                <button onClick={() => deleteSubject(s.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          <form onSubmit={saveKP} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <select value={newKPSubject} onChange={e => setNewKPSubject(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="">选择学科</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input value={newKPName} onChange={e => setNewKPName(e.target.value)} placeholder="知识点名称" className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1" />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">添加</button>
          </form>

          {/* 知识点列表（按学科分组） */}
          <div className="space-y-4">
            {subjects.filter(s => knowledgePoints.some(kp => kp.subject_id === s.id)).map(s => {
              const kps = knowledgePoints.filter(kp => kp.subject_id === s.id)
              return (
                <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="font-semibold text-gray-700">{s.name}</span>
                    <span className="text-xs text-gray-400">({kps.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {kps.map(kp => (
                      <span key={kp.id} className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-sm">
                        {kp.name}
                        <button onClick={() => deleteKP(kp.id)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
            {knowledgePoints.length === 0 && <p className="text-gray-400 text-center py-6">暂无知识点，添加一个开始吧</p>}
          </div>
        </div>
      )}
    </div>
  )
}