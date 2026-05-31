'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { Upload, Trash2, Search, FileText, Eye } from 'lucide-react'

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSubject, setFilterSubject] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [keyword, setKeyword] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<{ url: string; type: string } | null>(null)

  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const categories = ['笔记', '真题', '大纲', '其他']

  async function loadData() {
    setLoading(true)
    try {
      const params: any = {}
      if (filterSubject) params.subject_id = filterSubject
      if (filterCategory) params.category = filterCategory
      if (keyword) params.keyword = keyword
      const [mats, subs] = await Promise.all([
        api.materials.list(params),
        supabase.from('subjects').select('*').order('name').then(r => r.data || []),
      ])
      setMaterials(mats)
      setSubjects(subs)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [filterSubject, filterCategory, keyword])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('title', title)
      if (subjectId) form.append('subject_id', subjectId)
      if (category) form.append('category', category)
      if (tags) form.append('tags', tags)
      form.append('file', file)
      await api.materials.upload(form)
      setShowForm(false)
      setTitle(''); setSubjectId(''); setCategory(''); setTags(''); setFile(null)
      loadData()
    } catch (e) {
      console.error(e)
    }
    setUploading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除这份资料？')) return
    await api.materials.delete(id)
    loadData()
  }

  function openPreview(m: any) {
    setPreview({ url: m.file_url, type: m.file_type || 'unknown' })
  }

  function fileIcon(type: string) {
    return <FileText size={20} className="text-gray-400" />
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">资料库</h2>
          <p className="text-sm text-gray-500 mt-1">共 {materials.length} 份资料</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Upload size={16} /> 上传资料
        </button>
      </div>

      {/* 筛选 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5">
          <Search size={14} className="text-gray-400" />
          <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="搜索资料名称..." className="text-sm outline-none w-40" />
        </div>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
          <option value="">全部学科</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
          <option value="">全部分类</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* 上传表单 */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">资料名称 *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="例如：高数极限知识点整理" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">学科</label>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">不指定</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">分类</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option value="">选择分类</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">标签（逗号分隔）</label>
            <input value={tags} onChange={e => setTags(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="例如：重点, 易错" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">选择文件 *</label>
            <input type="file" onChange={e => setFile(e.target.files![0])} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={uploading} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {uploading ? '上传中...' : '上传'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 px-5 py-2 rounded-lg text-sm hover:text-gray-700">取消</button>
          </div>
        </form>
      )}

      {/* 资料列表 */}
      {loading ? <p className="text-gray-400">加载中...</p> : materials.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p>暂无资料</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {materials.map(m => (
            <div key={m.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col">
              <div className="flex items-start gap-3 flex-1">
                {fileIcon(m.file_type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{m.title}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {m.category && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{m.category}</span>}
                    {m.tags && m.tags.map((t: string) => <span key={t} className="text-xs bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded">{t}</span>)}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{new Date(m.created_at).toLocaleDateString('zh-CN')}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => openPreview(m)} className="flex-1 text-xs bg-gray-50 text-gray-600 py-1.5 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-1">
                  <Eye size={12} />预览
                </button>
                <a href={m.file_url} target="_blank" rel="noreferrer" className="flex-1 text-xs bg-indigo-50 text-indigo-600 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center justify-center gap-1">
                  下载
                </a>
                <button onClick={() => handleDelete(m.id)} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 预览弹窗 */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <p className="font-medium">文件预览</p>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4">
              {preview.type === 'pdf' || preview.url.includes('.pdf') ? (
                <iframe src={preview.url} className="w-full h-[70vh]" />
              ) : preview.type === 'png' || preview.type === 'jpg' || preview.type === 'jpeg' || preview.url.match(/\.(png|jpg|jpeg|gif)/) ? (
                <img src={preview.url} alt="preview" className="max-w-full mx-auto" />
              ) : (
                <p className="text-center text-gray-400 py-12">暂不支持此文件格式预览，请下载后查看</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}