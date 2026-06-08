'use client'
import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Coffee, Brain, Timer } from 'lucide-react'

const WORK_TIME = 25 * 60 // 25分钟
const SHORT_BREAK = 5 * 60 // 5分钟
const LONG_BREAK = 15 * 60 // 15分钟

type Mode = 'work' | 'shortBreak' | 'longBreak'

const modeConfig = {
  work: { label: '专注学习', time: WORK_TIME, color: 'bg-indigo-500', icon: Brain },
  shortBreak: { label: '短休息', time: SHORT_BREAK, color: 'bg-green-500', icon: Coffee },
  longBreak: { label: '长休息', time: LONG_BREAK, color: 'bg-blue-500', icon: Coffee },
}

export default function PomodoroPage() {
  const [mode, setMode] = useState<Mode>('work')
  const [timeLeft, setTimeLeft] = useState(WORK_TIME)
  const [isRunning, setIsRunning] = useState(false)
  const [completed, setCompleted] = useState(0)
  const [sessionsToday, setSessionsToday] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 加载今日完成数
  useEffect(() => {
    const today = new Date().toDateString()
    const saved = localStorage.getItem('pomodoro_today')
    const savedDate = localStorage.getItem('pomodoro_date')
    if (saved && savedDate === today) {
      setSessionsToday(parseInt(saved))
    }
  }, [])

  // 计时逻辑
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => t - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      // 播放提示音
      if (audioRef.current) {
        audioRef.current.play().catch(() => {})
      }
      // 完成一个番茄钟
      if (mode === 'work') {
        const today = new Date().toDateString()
        const newCount = sessionsToday + 1
        setSessionsToday(newCount)
        localStorage.setItem('pomodoro_today', String(newCount))
        localStorage.setItem('pomodoro_date', today)
        setCompleted(c => c + 1)
      }
      // 自动切换模式
      if (mode === 'work') {
        const nextMode = sessionsToday > 0 && sessionsToday % 4 === 0 ? 'longBreak' : 'shortBreak'
        setMode(nextMode)
        setTimeLeft(modeConfig[nextMode].time)
      } else {
        setMode('work')
        setTimeLeft(WORK_TIME)
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft, mode, sessionsToday])

  const start = () => setIsRunning(true)
  const pause = () => setIsRunning(false)
  const reset = () => {
    setIsRunning(false)
    setTimeLeft(modeConfig[mode].time)
  }

  const switchMode = (newMode: Mode) => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(modeConfig[newMode].time)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const progress = ((modeConfig[mode].time - timeLeft) / modeConfig[mode].time) * 100
  const config = modeConfig[mode]
  const Icon = config.icon

  return (
    <div className="flex flex-col h-[calc(100vh-48px)]">
      {/* 页面标题 */}
      <div className="flex items-center gap-2 mb-6">
        <Timer size={24} className="text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-800">番茄钟</h2>
      </div>

      {/* 模式切换 */}
      <div className="flex gap-2 mb-8">
        {(['work', 'shortBreak', 'longBreak'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {modeConfig[m].label}
          </button>
        ))}
      </div>

      {/* 计时器主体 */}
      <div className="flex flex-col items-center flex-1">
        {/* 圆形进度 */}
        <div className="relative w-64 h-64 mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128" cy="128" r="120"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="128" cy="128" r="120"
              stroke={mode === 'work' ? '#6366f1' : mode === 'shortBreak' ? '#22c55e' : '#3b82f6'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Icon size={32} className={`mb-2 ${mode === 'work' ? 'text-indigo-500' : 'text-green-500'}`} />
            <span className="text-5xl font-bold text-gray-800">{formatTime(timeLeft)}</span>
            <span className="text-sm text-gray-400 mt-2">{config.label}</span>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex gap-4 mb-8">
          {isRunning ? (
            <button
              onClick={pause}
              className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
            >
              <Pause size={20} /> 暂停
            </button>
          ) : (
            <button
              onClick={start}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              <Play size={20} /> 开始
            </button>
          )}
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            <RotateCcw size={20} /> 重置
          </button>
        </div>

        {/* 今日统计 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 w-full max-w-md">
          <h3 className="text-sm font-medium text-gray-500 mb-4">今日统计</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-3xl font-bold text-indigo-600">{sessionsToday}</div>
              <div className="text-xs text-gray-500 mt-1">完成番茄数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{sessionsToday * 25}</div>
              <div className="text-xs text-gray-500 mt-1">累计分钟</div>
            </div>
          </div>
        </div>
      </div>

      {/* 提示音 */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQYAKI/R9bSEIA8lks3qsWcOHyyW1LpqJBgWKJTO5reCHRMpj9LZpncQADeL0/K0hR8OMpPQ6biAIw9qk9PqtIgfEG2W0+m2iyATbJfW6riNIRdvmNjruI8jE3CY2uu6kCUVcJzZ67uRJRZzntrrvJMmFnaf2u29lCYWeJ/b7b6WKBl8odvvv5cqHYKh3O6/ly0jhKHc7r+YLyaHod3uv5suJ4mi3e6/my4piqLe7r+bLymLo9/uv50vKo2k4O+/nS8rjqbh77+eLyyPp+Hvv58wLZCp4fDAoDEwk6nj8cGiMzKTquPxwqMzMpSr4/DBozQ0la3k8cKkNTWWruXww6U1Npev5fDEpjY3mLDl8cSnNziasOXyxag4OJqy5vPHqTo5m7Pm88iqOjqcsubzyaw7O5yz5/PLrTw7nbPn88+uPDuedeiz0LDD" type="audio/wav" />
      </audio>
    </div>
  )
}