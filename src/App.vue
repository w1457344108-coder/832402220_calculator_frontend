<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { calculate, deleteHistory, getHistory } from './api'
import { localizedMessage, messages } from './i18n'
import { filterHistory } from './history'
import { getKeyboardAction } from './keyboard'

const lang = ref('zh')
const theme = ref('light')
const expression = ref('')
const expressionInput = ref(null)
const result = ref('')
const error = ref('')
const loading = ref(false)
const history = ref([])
const searchTerm = ref('')
const currentPage = ref(1)
const pageSize = 5
const t = computed(() => messages[lang.value])
const filteredHistory = computed(() => filterHistory(history.value, searchTerm.value))
const totalPages = computed(() => Math.max(1, Math.ceil(filteredHistory.value.length / pageSize)))
const paginatedHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredHistory.value.slice(start, start + pageSize)
})
const buttons = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '(', ')', '+']
const scientificButtons = [
  { label: 'π', value: 'π' },
  { label: 'e', value: 'e' },
  { label: 'xʸ', value: '^' },
  { label: '√', value: 'sqrt(' },
  { label: 'sin', value: 'sin(' },
  { label: 'cos', value: 'cos(' },
  { label: 'tan', value: 'tan(' },
  { label: 'ln', value: 'ln(' },
  { label: 'log₁₀', value: 'log10(' },
  { label: 'exp', value: 'exp(' },
]

function clearEditedState() {
  result.value = ''
  error.value = ''
}

function selection() {
  const input = expressionInput.value
  if (!input || input.selectionStart === null || input.selectionEnd === null) {
    return { start: expression.value.length, end: expression.value.length }
  }
  return { start: input.selectionStart, end: input.selectionEnd }
}

function updateExpression(value, start, end = start) {
  expression.value = value
  nextTick(() => {
    const input = expressionInput.value
    if (!input || loading.value) return
    input.focus()
    input.setSelectionRange(start, end)
  })
}

function append(value) {
  if (loading.value) return
  const { start, end } = selection()
  const nextExpression = expression.value.slice(0, start) + value + expression.value.slice(end)
  clearEditedState()
  updateExpression(nextExpression, start + value.length)
}

function handleExpressionInput() {
  clearEditedState()
}

function clear() {
  if (loading.value) return
  expression.value = ''
  result.value = ''
  error.value = ''
  nextTick(() => expressionInput.value?.focus())
}

function backspace() {
  if (loading.value) return
  const { start, end } = selection()
  if (start === 0 && end === 0) return
  const deleteStart = start === end ? Math.max(0, start - 1) : start
  clearEditedState()
  updateExpression(expression.value.slice(0, deleteStart) + expression.value.slice(end), deleteStart)
}

function toggleTheme() { theme.value = theme.value === 'light' ? 'dark' : 'light' }
async function loadHistory() { history.value = await getHistory() }
async function submit() {
  if (loading.value) return
  error.value = null
  result.value = ''
  loading.value = true
  try {
    const body = expression.value.replaceAll('×', '*').replaceAll('÷', '/')
    const response = await calculate(body)
    result.value = response.result
    await loadHistory()
  } catch (e) {
    error.value = e
  } finally {
    loading.value = false
  }
}
async function remove(id) { await deleteHistory(id); await loadHistory() }

function handleExpressionKeydown(event) {
  if (event.isComposing || event.keyCode === 229 || event.ctrlKey || event.metaKey || event.altKey) return
  if ((event.key === 'Enter' || event.key === '=') && !event.repeat) {
    event.preventDefault()
    submit()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    clear()
  }
}

function handleKeydown(event) {
  const action = getKeyboardAction(event)
  if (!action) return
  event.preventDefault()
  if (loading.value) return
  if (action.type === 'append') append(action.value)
  else if (action.type === 'submit') submit()
  else if (action.type === 'backspace') backspace()
  else if (action.type === 'clear') clear()
}

watch(theme, (value) => {
  document.documentElement.dataset.theme = value
}, { immediate: true })
watch(searchTerm, () => {
  currentPage.value = 1
})
watch(totalPages, (value) => {
  if (currentPage.value > value) currentPage.value = value
})

onMounted(() => {
  loadHistory()
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <main class="page">
    <header>
      <div>
        <p class="eyebrow">SOFTWARE ENGINEERING · 01</p>
        <h1>{{ t.title }}</h1>
        <p class="subtitle">{{ t.subtitle }}</p>
      </div>
      <div class="header-actions">
        <button
          class="theme-toggle"
          type="button"
          :aria-pressed="theme === 'dark'"
          :aria-label="`${t.theme}: ${theme === 'light' ? t.themeDark : t.themeLight}`"
          @click="toggleTheme"
        >
          {{ t.theme }}: {{ theme === 'light' ? t.themeDark : t.themeLight }}
        </button>
        <button class="lang" type="button" @click="lang = lang === 'zh' ? 'en' : 'zh'">{{ t.language }}</button>
      </div>
    </header>

    <section class="workspace">
      <div class="calculator panel">
        <div class="display">
          <label class="sr-only" for="expression-input">{{ t.expression }}</label>
          <input
            id="expression-input"
            ref="expressionInput"
            v-model="expression"
            :placeholder="t.expressionPlaceholder"
            :aria-label="t.expression"
            :disabled="loading"
            autocomplete="off"
            inputmode="text"
            spellcheck="false"
            @input="handleExpressionInput"
            @keydown="handleExpressionKeydown"
          >
          <strong v-if="result">= {{ result }}</strong>
        </div>
        <p v-if="error" class="error">{{ localizedMessage(error, lang, t.network) }}</p>
        <div class="keys">
          <button v-for="button in buttons" :key="button" type="button" :disabled="loading" @click="append(button)">{{ button }}</button>
        </div>
        <div class="scientific-toolbar">
          <div class="scientific-heading">
            <span>{{ t.scientific }}</span>
            <span class="angle-mode">{{ t.angleMode }}</span>
          </div>
          <div class="scientific-keys">
            <button
              v-for="button in scientificButtons"
              :key="button.value"
              type="button"
              :disabled="loading"
              :aria-label="`${button.label} ${t.insert}`"
              @click="append(button.value)"
            >{{ button.label }}</button>
          </div>
        </div>
        <div class="actions">
          <button type="button" :disabled="loading" @click="clear">{{ t.clear }}</button>
          <button type="button" :disabled="loading" @click="backspace">{{ t.backspace }}</button>
          <button class="primary" type="button" :disabled="loading" @click="submit">{{ loading ? t.loading : t.calculate }}</button>
        </div>
      </div>

      <section class="panel history">
        <div class="section-title">
          <div>
            <p class="eyebrow">DATABASE</p>
            <h2>{{ t.history }}</h2>
          </div>
          <span>{{ history.length }}</span>
        </div>
        <div class="history-search">
          <label for="history-search">{{ t.searchHistory }}</label>
          <input id="history-search" v-model="searchTerm" type="search" :placeholder="t.searchPlaceholder">
        </div>
        <div v-if="history.length === 0" class="empty">{{ t.empty }}</div>
        <div v-else-if="filteredHistory.length === 0" class="empty">{{ t.noSearchResults }}</div>
        <div v-for="item in paginatedHistory" :key="item.id" class="record">
          <div>
            <b>{{ item.expression }}</b>
            <small>{{ item.created_at ? new Date(item.created_at).toLocaleString() : '' }}</small>
          </div>
          <strong>{{ item.result }}</strong>
          <button class="delete" type="button" :aria-label="`${t.delete}: ${item.expression}`" @click="remove(item.id)">{{ t.delete }}</button>
        </div>
        <nav v-if="filteredHistory.length > pageSize" class="pagination" :aria-label="t.historyPagination">
          <button type="button" :disabled="currentPage === 1" @click="currentPage -= 1">{{ t.previousPage }}</button>
          <span aria-live="polite">{{ currentPage }} / {{ totalPages }}</span>
          <button type="button" :disabled="currentPage === totalPages" @click="currentPage += 1">{{ t.nextPage }}</button>
        </nav>
      </section>
    </section>
  </main>
</template>
