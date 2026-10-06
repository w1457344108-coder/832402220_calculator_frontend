export const messages = {
  zh: { title: '前后端分离计算器', subtitle: '王昭衍 ｜ FZU ID：832402220 ｜ MU ID：24125644', calculate: '计算', clear: '清空', backspace: '退格', history: '计算历史', searchHistory: '搜索历史', searchPlaceholder: '输入表达式片段', noSearchResults: '无匹配记录', expression: '表达式', expressionPlaceholder: '输入表达式，例如 sin(π/2)', result: '结果', time: '时间', delete: '删除', empty: '暂无计算记录', language: 'English', theme: '主题', themeLight: '浅色', themeDark: '深色', loading: '处理中...', network: '后端服务暂时不可用', previousPage: '上一页', nextPage: '下一页', historyPagination: '历史记录分页', scientific: '科学计算', angleMode: 'RAD / 弧度', insert: '插入' },
  en: { title: 'Separated Calculator', subtitle: 'Zhaoyan Wang｜ FZU ID: 832402220 ｜ MU ID: 24125644', calculate: 'Calculate', clear: 'Clear', backspace: 'Backspace', history: 'History', searchHistory: 'Search history', searchPlaceholder: 'Enter part of an expression', noSearchResults: 'No matching history', expression: 'Expression', expressionPlaceholder: 'Enter an expression, e.g. sin(π/2)', result: 'Result', time: 'Time', delete: 'Delete', empty: 'No calculation history', language: '中文', theme: 'Theme', themeLight: 'Light', themeDark: 'Dark', loading: 'Calculating...', network: 'Backend service is unavailable', previousPage: 'Previous', nextPage: 'Next', historyPagination: 'History pagination', scientific: 'Scientific', angleMode: 'RAD / radians', insert: 'insert' }
}

Object.assign(messages.zh, {
  calculatorTab: '计算器', baseTab: '进制转换', unitTab: '单位换算', tools: '计算工具',
  number: '数值', integer: '整数', integerPlaceholder: '例如 -255 或 FF',
  unitPlaceholder: '例如 100 或 1.2e-3', fromBase: '来源进制', toBase: '目标进制',
  convert: '转换', conversionLoading: '转换中...', category: '类别', fromUnit: '来源单位',
  toUnit: '目标单位', baseRules: '进制说明', base: '进制', allowedDigits: '可用数字',
  baseExample: '十进制 255 示例', unitRules: '单位关系', unit: '单位', relation: '基准关系',
  minimum: '最低温度', baseInputRules: '仅支持正负整数；十六进制接受 A–F / a–f。按所选进制直接输入，不加 0b、0o 或 0x 前缀。',
  baseSignRules: '负数保留负号，不使用补码；前导零省略，-0 变为 0。',
  baseLimits: '输入最多 400 个字符，结果含负号最多 200 个字符；超出范围会提示，不会截断。',
  unitInputRules: '支持正负十进制数和科学计数法，如 0.1、-2.5、1.2e-3；不接受表达式、逗号或内部空格。',
  unitLimits: '输入最多 100 个字符、50 位有效数字；非零数值数量级范围为 10⁻¹⁰⁰⁰⁰ 至小于 10¹⁰⁰⁰¹。结果最多 50 位有效数字。',
  approximateHelp: '≈ 表示结果经过舍入，使用四舍六入五成双；精确结果不加此符号。',
  temperatureRules: '转换的是绝对温度，不是温差；输入不能低于表中的最低温度。',
  unitConventions: 'nm 指纳米，t 指公吨；质量不换算为牛顿。1 mL = 1 cm³，1 L = 1 dm³；1 d 固定为 24 h。',
  optionsLoading: '正在加载转换目录...', optionsError: '转换目录加载失败，请重试。',
  retry: '重试', historyLoadError: '历史记录加载失败', deleteError: '删除失败，请重试',
  deleting: '删除中...', historyLoading: '正在加载历史记录...',
})

Object.assign(messages.en, {
  calculatorTab: 'Calculator', baseTab: 'Number bases', unitTab: 'Unit converter', tools: 'Calculator tools',
  number: 'Value', integer: 'Integer', integerPlaceholder: 'e.g. -255 or FF',
  unitPlaceholder: 'e.g. 100 or 1.2e-3', fromBase: 'From base', toBase: 'To base',
  convert: 'Convert', conversionLoading: 'Converting...', category: 'Category', fromUnit: 'From unit',
  toUnit: 'To unit', baseRules: 'Number base guide', base: 'Base', allowedDigits: 'Digits',
  baseExample: 'Decimal 255', unitRules: 'Unit relationships', unit: 'Unit', relation: 'Reference relationship',
  minimum: 'Minimum temperature', baseInputRules: 'Signed integers only; hexadecimal accepts A–F / a–f. Enter digits in the selected base without a 0b, 0o or 0x prefix.',
  baseSignRules: 'Negative numbers keep their minus sign, without two’s complement. Leading zeros are removed; -0 becomes 0.',
  baseLimits: 'Up to 400 input characters and 200 result characters including the sign. Out-of-range values are rejected, never truncated.',
  unitInputRules: 'Signed decimal and scientific notation, e.g. 0.1, -2.5 or 1.2e-3. No expressions, commas or internal spaces.',
  unitLimits: 'Up to 100 input characters and 50 significant digits. Nonzero magnitude: 10⁻¹⁰⁰⁰⁰ to below 10¹⁰⁰⁰¹. Results have at most 50 significant digits.',
  approximateHelp: '≈ marks a rounded result using round half to even. Exact results have no approximation mark.',
  temperatureRules: 'Converts absolute temperature, not temperature differences. Inputs cannot be below the minimum shown in the table.',
  unitConventions: 'nm means nanometre; t means metric tonne. Mass is not converted to newtons. 1 mL = 1 cm³; 1 L = 1 dm³; 1 d is exactly 24 h.',
  optionsLoading: 'Loading conversion options...', optionsError: 'Conversion options could not load. Try again.',
  retry: 'Retry', historyLoadError: 'History could not load', deleteError: 'Delete failed. Try again',
  deleting: 'Deleting...', historyLoading: 'Loading history...',
})

export function localizedMessage(error, language, fallback) {
  return error?.message?.[language] || fallback
}
