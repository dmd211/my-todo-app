'use client'
import { useState } from 'react'
import { api } from '@/lib/api'
import { Send, Bot, RefreshCw } from 'lucide-react'

export default function AIPage() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input
    setInput('')
    setMessages(m => [...m, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const res = await api.ai.consult(userMsg)
      setMessages(m => [...m, { role: 'ai', content: res.answer }])
    } catch (e) {
      setMessages(m => [...m, { role: 'ai', content: '抱歉，AI 回答失败了，请稍后重试。' }])
    }
    setLoading(false)
  }

  const quickQuestions = [
    '本周还剩什么没做？',
    '我今天的任务完成了吗？',
    '给我一些复习建议',
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      <div className="flex items-center gap-2 mb-4">
        <Bot size={24} className="text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-800">AI 督学</h2>
      </div>

      {/* 快捷问题 */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickQuestions.map(q => (
          <button key={q} onClick={() => setInput(q)} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors">
            {q}
          </button>
        ))}
      </div>

      {/* 对话区 */}
      <div className="flex-1 bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
              <Bot size={48} className="mx-auto mb-3 opacity-30" />
              <p>问我任何关于本周任务、进度或复习建议的问题</p>
              <p className="text-xs mt-2">例如：&ldquo;本周任务完成得怎么样？&rdquo;</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-green-100'}`}>
                {msg.role === 'user' ? '我' : '🤖'}
              </div>
              <div className={`max-w-[70%] rounded-xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">🤖</div>
              <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400">思考中...</div>
            </div>
          )}
        </div>

        {/* 输入框 */}
        <div className="flex gap-3 border-t pt-4">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="问我关于本周任务、进度、复习建议..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <button onClick={send} disabled={!input.trim() || loading} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
            <Send size={16} /> 发送
          </button>
        </div>
      </div>
    </div>
  )
}