'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { CheckCircle2, Circle, Plus, Trash2, Edit2 } from 'lucide-react'

export default function TasksPage() {
  const [weekly, setWeekly] = useState<any>(null)
  const [dailyTasks, setDailyTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingWeekly, setEditingWeekly] = useState(false)
  const [weeklyTitle, setWeeklyTitle] = useState('')
  const [showAddDaily, setShowAddDaily] = useState(false)
  const [newDailyTitle, setNewDailyTitle] = useState('')
  const [newDailyDate, setNewDailyDate] = useState(new Date().toISOString().slice(0,10))

  async function load() {
    setLoading(true)
    try {
      const w = await api.tasks.getWeekly()
      setWeekly(w)
      setDailyTasks(w?.daily_tasks || [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveWeekly() {
    if (!weeklyTitle.trim()) return
    try {
      await api.tasks.upsertWeekly(weeklyTitle)
      setEditingWeekly(false)
      load()
    } catch (e) {
      console.error(e)
    }
  }

  async function addDaily() {
    if (!newDailyTitle.trim() || !weekly) return
    if (!weekly.id) {
      alert('本周任务 ID 缺失，请先保存本周任务再添加日任务')
      return
    }
    try {
      await api.tasks.createDaily(weekly.id, { title: newDailyTitle, date: newDailyDate })
      setShowAddDaily(false)
      setNewDailyTitle('')
      load()
    } catch (e) {
      console.error(e)
      alert('添加任务失败，请稍后重试')
    }
  }

  async function toggleTask(task: any) {
    const completed = !task.completed
    await api.tasks.updateDaily(task.id, { completed, progress: completed ? 100 : 0 })
    load()
  }

  async function updateProgress(task: any, progress: number) {
    await api.tasks.updateDaily(task.id, { progress })
    load()
  }

  const today = new Date().toISOString().slice(0,10)
  const todayTasks = dailyTasks.filter(t => t.date === today)
  const weekStart = dailyTasks.length > 0 ? dailyTasks[0].date : null
  const weekEnd = dailyTasks.length > 0 ? dailyTasks[dailyTasks.length - 1].date : null

  if (loading) return <div className="p-6 text-gray-400">加载中...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">周/日任务</h2>
        <p className="text-sm text-gray-500 mt-1">
          {weekStart && weekEnd ? `${weekStart} ~ ${weekEnd}` : '录入本周任务开始跟踪进度'}
        </p>
      </div>

      {/* 本周任务 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700">本周任务</h3>
          {!editingWeekly && <button onClick={() => { setWeeklyTitle(weekly?.title || ''); setEditingWeekly(true) }} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            <Edit2 size={14} /> {weekly ? '编辑' : '录入本周任务'}
          </button>}
        </div>
        {editingWeekly ? (
          <div className="flex gap-3">
            <input value={weeklyTitle} onChange={e => setWeeklyTitle(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="例如：完成高数极限与连续章节的习题" />
            <button onClick={saveWeekly} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">保存</button>
            <button onClick={() => setEditingWeekly(false)} className="text-gray-400 px-3 py-2 text-sm">取消</button>
          </div>
        ) : weekly ? (
          <p className="text-gray-800 font-medium">{weekly.title}</p>
        ) : (
          <p className="text-gray-400 text-sm">点击上方按钮录入本周任务</p>
        )}
      </div>

      {/* 每日任务 */}
      {weekly && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">每日任务</h3>
            <button onClick={() => setShowAddDaily(true)} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              <Plus size={14} /> 添加今日任务
            </button>
          </div>

          {showAddDaily && (
            <div className="flex gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <input type="date" value={newDailyDate} onChange={e => setNewDailyDate(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              <input value={newDailyTitle} onChange={e => setNewDailyTitle(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="今日要完成的具体任务" />
              <button onClick={addDaily} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">添加</button>
              <button onClick={() => setShowAddDaily(false)} className="text-gray-400 px-3 py-2 text-sm">取消</button>
            </div>
          )}

          {todayTasks.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">今日暂无任务，添加一个开始吧</p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 font-medium uppercase">今日 · {today}</p>
              {todayTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <button onClick={() => toggleTask(task)} className="flex-shrink-0">
                    {task.completed ? <CheckCircle2 size={22} className="text-green-500" /> : <Circle size={22} className="text-gray-300" />}
                  </button>
                  <div className="flex-1">
                    <p className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</p>
                    {!task.completed && task.progress > 0 && (
                      <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-48">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                      </div>
                    )}
                  </div>
                  <input
                    type="range"
                    min="0" max="100"
                    value={task.progress}
                    onChange={e => updateProgress(task, parseInt(e.target.value))}
                    className="w-24 accent-indigo-600"
                    disabled={task.completed}
                  />
                  <span className="text-xs text-gray-400 w-10">{task.progress}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 本周所有日任务 */}
      {weekly && dailyTasks.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-4">本周所有任务</h3>
          <div className="space-y-2">
            {dailyTasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                {task.completed ? <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" /> : <Circle size={18} className="text-gray-300 flex-shrink-0" />}
                <div className="flex-1">
                  <p className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>{task.title}</p>
                  <p className="text-xs text-gray-400">{task.date}</p>
                </div>
                {task.progress > 0 && !task.completed && (
                  <div className="h-1 w-20 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${task.progress}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}