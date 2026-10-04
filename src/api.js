const base = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw body.detail || { code: 'NETWORK', message: { zh: '请求失败', en: 'Request failed' } }
  }
  return response.status === 204 ? null : response.json()
}
export const calculate = expression => request('/api/calculate', { method: 'POST', body: JSON.stringify({ expression }) })
export const getHistory = () => request('/api/history')
export const deleteHistory = id => request(`/api/history/${id}`, { method: 'DELETE' })
