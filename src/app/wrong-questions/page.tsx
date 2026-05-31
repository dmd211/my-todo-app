'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { BookOpen, Upload, Trash2, Bot, Search, Filter } from 'lucide-react'

const subjectColors: Record<string, string> = {
  '高等数学': '#ef4444',
  '线性代数': '#f97316',
  '概率论与数理统计': '#eab308',
  '数据结构': '#22c55e',
  '计算机网络': '#14b8a6',
  '操作系统': '#06b6d4',
  '计算机组成原理': '#3b82f6',
  '英语': '#8b5cf6',
  '政治': '#ec4899',
}

export default function WrongQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSubject, setFilterSubject] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)

  // Form state
  const [subjectId, setSubjectId] = useState('')
  const [description, setDescription] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const [qs, subs] = await Promise.all([
        api.wrongQuestions.list(filterSubject ? { subject_id: filterSubject } : {}),
        supabase.from('subjects').select('*').order('name').then(r => r.data || []),
      ])
      setQuestions(qs)
      setSubjects(subs)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [filterSubject])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setUploading(true)
    try {
      const form = new FormData()
      if (subjectId) form.append('subject_id', subjectId)
      if (description) form.append('description', description)
      if (userAnswer) form.append('user_answer', userAnswer)
      if (correctAnswer) form.append('correct_answer', correctAnswer)
      images.forEach(f => form.append('images', f))
      await api.wrongQuestions.create(form)
      setShowForm(false)
      setSubjectId(''); setDescription(''); setUserAnswer(''); setCorrectAnswer(''); setImages([])
      loadData()
    } catch (e) {
      console.error(e)
    }
    setUploading(false)
  }

  async function handleAnalyze(id: string) {
    setAnalyzing(id)
    try {
      await api.wrongQuestions.analyze(id)
      loadData()
    } catch (e) {
      console.error(e)
    }
    setAnalyzing(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除这条错题？')) return
    await api.wrongQuestions.delete(id)
    loadData()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">错题本</h2>
          <p className="text-sm text-gray-500 mt-1">共 {questions.length} 条记录</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Upload size={16} /> 录入新错题
        </button>
      </div>

      {/* 筛选 */}
      <div className="flex items-center gap-3">
        <Filter size={16} className="text-gray-400" />
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
          <option value="">全部学科</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* 录入表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">学科</label>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">请选择学科</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">上传图片（可多选）</label>
              <input type="file" multiple accept="image/*" onChange={e => setImages([...e.target.files!])} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">题目描述（可选）</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="粘贴题目内容或描述..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">我的错误答案</label>
              <textarea value={userAnswer} onChange={e => setUserAnswer(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="我当时的答案是..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">正确答案</label>
              <textarea value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="正确答案是..." />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={uploading} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {uploading ? '提交中...' : '提交错题'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-5 py-2 rounded-lg text-sm hover:text-gray-700">取消</button>
          </div>
        </form>
      )}

      {/* 错题列表 */}
      {loading ? <p className="text-gray-400">加载中...</p> : questions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>暂无错题记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => {
            const subject = subjects.find(s => s.id === q.subject_id)
            return (
              <div key={q.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {subject && <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: subject.color }}>{subject.name}</span>}
                      <span className="text-xs text-gray-400">{new Date(q.created_at).toLocaleDateString('zh-CN')}</span>
                    </div>
                    {q.description && <p className="text-sm text-gray-700 mb-1">{q.description}</p>}
                    {q.user_answer && <p className="text-sm text-red-500 mb-1">✗ 我的答案：{q.user_answer}</p>}
                    {q.correct_answer && <p className="text-sm text-green-600 mb-1">✓ 正确答案：{q.correct_answer}</p>}
                    {q.image_urls && q.image_urls.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {q.image_urls.map((url: string, i: number) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer">
                            <img src={url} alt={`图片${i+1}`} className="h-20 rounded-lg object-cover hover:opacity-80 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    )}
                    {q.ai_analysis && (
                      <div className="mt-3 p-3 bg-indigo-50 rounded-lg text-sm">
                        <p className="font-medium text-indigo-600 mb-1">📌 错因分析</p>
                        <p className="text-gray-700">{q.ai_analysis}</p>
                        {q.ai_suggestion && <><p className="font-medium text-indigo-600 mt-2 mb-1">💡 改进建议</p><p className="text-gray-700">{q.ai_suggestion}</p></>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!q.ai_analysis && <button onClick={() => handleAnalyze(q.id)} disabled={analyzing === q.id} className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-200 disabled:opacity-50 flex items-center gap-1">
                      <Bot size={12} />{analyzing === q.id ? '分析中...' : 'AI分析'}
                    </button>}
                    <button onClick={() => handleDelete(q.id)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                      <Trash2 size={12} />删除
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}