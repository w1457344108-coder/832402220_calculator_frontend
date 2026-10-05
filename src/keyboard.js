const displayKeys = { '*': '×', '/': '÷' }
const operators = new Set(['+', '-', '*', '/', '.', '(', ')'])
const editableTags = new Set(['input', 'textarea', 'select'])
const nativeActivationTags = new Set(['a', 'button', 'summary'])

function tagName(target) {
  return typeof target?.tagName === 'string' ? target.tagName.toLowerCase() : ''
}

function isEditableTarget(target) {
  return editableTags.has(tagName(target)) || target?.isContentEditable === true || target?.contentEditable === 'true'
}

export function getKeyboardAction(event) {
  const { key, repeat, ctrlKey, metaKey, altKey, isComposing, keyCode, target } = event
  if (isEditableTarget(target) || ctrlKey || metaKey || altKey) return null
  if (isComposing || keyCode === 229) return null
  if (nativeActivationTags.has(tagName(target)) && (key === 'Enter' || key === ' ' || key === 'Spacebar')) return null

  if (/^[0-9]$/.test(key) || operators.has(key)) {
    return { type: 'append', value: displayKeys[key] ?? key }
  }
  if ((key === 'Enter' || key === '=') && !repeat) return { type: 'submit' }
  if (key === 'Backspace') return { type: 'backspace' }
  if (key === 'Escape') return { type: 'clear' }
  return null
}
