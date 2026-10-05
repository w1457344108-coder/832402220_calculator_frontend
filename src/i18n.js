export const messages = {
  zh: { title: '前后端分离计算器', subtitle: '后端计算 · PostgreSQL 持久化', calculate: '计算', clear: '清空', backspace: '退格', history: '计算历史', searchHistory: '搜索历史', searchPlaceholder: '输入表达式片段', noSearchResults: '无匹配记录', expression: '表达式', result: '结果', time: '时间', delete: '删除', empty: '暂无计算记录', language: 'English', loading: '处理中...', network: '后端服务暂时不可用' },
  en: { title: 'Separated Calculator', subtitle: 'Backend calculation · PostgreSQL persistence', calculate: 'Calculate', clear: 'Clear', backspace: 'Backspace', history: 'History', searchHistory: 'Search history', searchPlaceholder: 'Enter part of an expression', noSearchResults: 'No matching history', expression: 'Expression', result: 'Result', time: 'Time', delete: 'Delete', empty: 'No calculation history', language: '中文', loading: 'Calculating...', network: 'Backend service is unavailable' }
}

export function localizedMessage(error, language, fallback) {
  return error?.message?.[language] || fallback
}
