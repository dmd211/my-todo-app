'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BookOpen, Upload, Trash2, Bot, Filter, CheckCircle2, X } from 'lucide-react'

const SUBJECTS = [
  { id: '54c3540c-8fd2-4002-989c-735edc418342', name: '高等数学', color: '#ef4444' },
  { id: '767b90bf-12b2-4a62-905d-a09f030af9aa', name: '线性代数', color: '#f97316' },
  { id: '28cdcfe1-0a4a-4567-8cbb-8ff00f44e2d7', name: '概率论与数理统计', color: '#eab308' },
  { id: '7b897694-f6c8-4a9f-b4b1-bd8f255559c2', name: '数据结构', color: '#22c55e' },
  { id: '3e8ee19e-0531-47f6-874b-d953686f845d', name: '计算机网络', color: '#14b8a6' },
  { id: '152ad643-4315-46e7-bcd9-383e4289f6c9', name: '操作系统', color: '#06b6d4' },
  { id: 'b626cce2-6259-4519-8d45-a7fe6698c689', name: '计算机组成原理', color: '#3b82f6' },
  { id: 'ebc530d1-efc3-4523-bd5c-f7ffb5f27c7f', name: '英语', color: '#8b5cf6' },
  { id: 'f50afdf7-8c17-4c67-8c54-6111f5e18402', name: '政治', color: '#ec4899' },
]

const ERROR_REASONS = [
  { value: '概念不清', label: '概念不清' },
  { value: '计算失误', label: '计算失误' },
  { value: '审题错误', label: '审题错误' },
  { value: '记忆错误', label: '记忆错误' },
  { value: '其他', label: '其他' },
]

export default function WrongQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSubject, setFilterSubject] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Form state
  const [subjectId, setSubjectId] = useState('')
  const [description, setDescription] = useState('')
  const [userAnswer, setUserAnswer] = useState('')
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [errorReason, setErrorReason] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  async function loadData() {
    setLoading(true)
    try {
      let query = supabase
        .from('wrong_questions')
        .select('*,subjects:subject_id(*)')
        .order('created_at', { ascending: false })

      if (filterSubject) {
        query = query.eq('subject_id', filterSubject)
      }

      const { data, error } = await query
      if (error) throw error
      setQuestions(data || [])
    } catch (e: any) {
      console.error('加载错题失败:', e)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [filterSubject])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subjectId) {
      showToast('请选择学科')
      return
    }
    setUploading(true)
    try {
      const { error } = await supabase.from('wrong_questions').insert({
        subject_id: subjectId,
        description: description.trim() || null,
        user_answer: userAnswer.trim() || null,
        correct_answer: correctAnswer.trim() || null,
        error_reason: errorReason || null,
        user_id: 'default',
      })

      if (error) throw error

      setShowForm(false)
      setSubjectId(''); setDescription(''); setUserAnswer(''); setCorrectAnswer(''); setErrorReason(''); setImages([])
      showToast('✅ 错题已保存，刷新仪表盘即可看到最新数据')
      loadData()
    } catch (e: any) {
      console.error('保存失败:', e)
      showToast('保存失败，请稍后重试')
    }
    setUploading(false)
  }

  async function handleAnalyze(id: string) {
    setAnalyzing(id)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/wrong-questions/${id}/analyze`, { method: 'POST' })
      if (!res.ok) throw new Error(await res.text())
      showToast('✅ AI 分析完成')
      loadData()
    } catch (e: any) {
      console.error('AI分析失败:', e)
      showToast('AI 分析失败，请稍后重试')
    }
    setAnalyzing(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除这条错题？')) return
    try {
      const { error } = await supabase.from('wrong_questions').delete().eq('id', id)
      if (error) throw error
      showToast('✅ 已删除')
      loadData()
    } catch (e: any) {
      console.error('删除失败:', e)
      showToast('删除失败，请稍后重试')
    }
  }

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-3 rounded-lg text-sm z-50 shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">错题本</h2>
          <p className="text-sm text-gray-500 mt-1">共 {questions.length} 条记录</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Upload size={16} /> 录入新错题
        </button>
      </div>

      {/* 筛选 */}
      <div className="flex items-center gap-3">
        <Filter size={16} className="text-gray-400" />
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">全部学科</option>
          {SUBJECTS.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* 录入表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">学科 *</label>
              <select
                value={subjectId}
                onChange={e => setSubjectId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                required
              >
                <option value="">请选择学科</option>
                {SUBJECTS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">错误原因</label>
              <select
                value={errorReason}
                onChange={e => setErrorReason(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">请选择错因</option>
                {ERROR_REASONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">题目描述</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="粘贴题目内容或描述..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">我的错误答案</label>
              <textarea
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="我当时的答案是..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">正确答案</label>
              <textarea
                value={correctAnswer}
                onChange={e => setCorrectAnswer(e.target.value)}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="正确答案是..."
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={uploading || !subjectId}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploading ? '提交中...' : '提交错题'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-500 px-5 py-2 rounded-lg text-sm hover:text-gray-700"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* 错题列表 */}
      {loading ? (
        <p className="text-gray-400">加载中...</p>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>暂无错题记录</p>
          <p className="text-xs mt-2">点击上方按钮录入第一道错题</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => {
            const subject = SUBJECTS.find(s => s.id === q.subject_id)
            return (
              <div key={q.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {subject && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: subject.color }}
                        >
                          {subject.name}
                        </span>
                      )}
                      {q.error_reason && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                          {q.error_reason}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(q.created_at).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' })}
                      </span>
                    </div>
                    {q.description && (
                      <p className="text-sm text-gray-700 mb-1">{q.description}</p>
                    )}
                    {q.user_answer && (
                      <p className="text-sm text-red-500 mb-0.5">✗ 我的答案：{q.user_answer}</p>
                    )}
                    {q.correct_answer && (
                      <p className="text-sm text-green-600 mb-1">✓ 正确答案：{q.correct_answer}</p>
                    )}
                    {q.ai_analysis && (
                      <div className="mt-3 p-3 bg-indigo-50 rounded-lg text-sm">
                        <p className="font-medium text-indigo-600 mb-1">📌 错因分析</p>
                        <p className="text-gray-700">{q.ai_analysis}</p>
                        {q.ai_suggestion && (
                          <>
                            <p className="font-medium text-indigo-600 mt-2 mb-1">💡 改进建议</p>
                            <p className="text-gray-700">{q.ai_suggestion}</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!q.ai_analysis ? (
                      <button
                        onClick={() => handleAnalyze(q.id)}
                        disabled={analyzing === q.id}
                        className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-200 disabled:opacity-50 flex items-center gap-1"
                      >
                        <Bot size={12} />
                        {analyzing === q.id ? '分析中...' : 'AI分析'}
                      </button>
                    ) : (
                      <span className="text-xs text-green-500 flex items-center gap-1 px-3 py-1.5">
                        <CheckCircle2 size={12} />已分析
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                    >
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