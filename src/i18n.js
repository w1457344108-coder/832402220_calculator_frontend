export const messages = {
  zh: { title: '前后端分离计算器', subtitle: '王昭衍 ｜ FZU ID：832402220 ｜ MU ID：24125644', calculate: '计算', clear: '清空', backspace: '退格', history: '计算历史', searchHistory: '搜索历史', searchPlaceholder: '输入表达式片段', noSearchResults: '无匹配记录', expression: '表达式', expressionPlaceholder: '输入表达式，例如 sin(π/2)', result: '结果', time: '时间', delete: '删除', empty: '暂无计算记录', language: 'English', theme: '主题', themeLight: '浅色', themeDark: '深色', loading: '处理中...', network: '后端服务暂时不可用', previousPage: '上一页', nextPage: '下一页', historyPagination: '历史记录分页', scientific: '科学计算', angleMode: 'RAD / 弧度', insert: '插入' },
  en: { title: 'Separated Calculator', subtitle: 'Zhaoyan Wang｜ FZU ID: 832402220 ｜ MU ID: 24125644', calculate: 'Calculate', clear: 'Clear', backspace: 'Backspace', history: 'History', searchHistory: 'Search history', searchPlaceholder: 'Enter part of an expression', noSearchResults: 'No matching history', expression: 'Expression', expressionPlaceholder: 'Enter an expression, e.g. sin(π/2)', result: 'Result', time: 'Time', delete: 'Delete', empty: 'No calculation history', language: '中文', theme: 'Theme', themeLight: 'Light', themeDark: 'Dark', loading: 'Calculating...', network: 'Backend service is unavailable', previousPage: 'Previous', nextPage: 'Next', historyPagination: 'History pagination', scientific: 'Scientific', angleMode: 'RAD / radians', insert: 'insert' }
}

export function localizedMessage(error, language, fallback) {
  return error?.message?.[language] || fallback
}
