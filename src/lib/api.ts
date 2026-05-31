import { API_BASE } from './supabase'

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const api = {
  // 错题本
  wrongQuestions: {
    list: (params?: { subject_id?: string; page?: number; page_size?: number }) =>
      fetchAPI('/api/wrong-questions/?' + new URLSearchParams(params as any)),
    get: (id: string) => fetchAPI(`/api/wrong-questions/${id}`),
    create: (data: FormData) =>
      fetchAPI('/api/wrong-questions/', { method: 'POST', body: data }),
    analyze: (id: string) =>
      fetchAPI(`/api/wrong-questions/${id}/analyze`, { method: 'POST' }),
    delete: (id: string) =>
      fetchAPI(`/api/wrong-questions/${id}`, { method: 'DELETE' }),
  },

  // 资料库
  materials: {
    list: (params?: { subject_id?: string; category?: string; keyword?: string }) =>
      fetchAPI('/api/materials/?' + new URLSearchParams(params as any)),
    upload: (data: FormData) => fetchAPI('/api/materials/', { method: 'POST', body: data }),
    delete: (id: string) => fetchAPI(`/api/materials/${id}`, { method: 'DELETE' }),
  },

  // 任务
  tasks: {
    getWeekly: () => fetchAPI('/api/tasks/weekly/current'),
    upsertWeekly: (title: string, year?: number, week_num?: number) =>
      fetchAPI('/api/tasks/weekly', { method: 'POST', body: JSON.stringify({ title, year, week_num }) }),
    createDaily: (weekly_task_id: string, data: { title: string; date: string }) =>
      fetchAPI(`/api/tasks/daily?weekly_task_id=${weekly_task_id}`, { method: 'POST', body: JSON.stringify(data) }),
    updateDaily: (id: string, data: { progress?: number; completed?: boolean; title?: string }) =>
      fetchAPI(`/api/tasks/daily/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // AI咨询
  ai: {
    consult: (question: string) =>
      fetchAPI('/api/ai/consult', { method: 'POST', body: JSON.stringify({ question }) }),
    dashboard: () => fetchAPI('/api/ai/dashboard'),
  },

  // 励志语
  quotes: {
    random: () => fetchAPI('/api/quotes/random'),
  },
}