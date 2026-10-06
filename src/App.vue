<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { calculate, deleteHistory, getConversionOptions, getHistory } from './api'
import { localizedMessage, messages } from './i18n'
import { filterHistory } from './history'
import { createHistoryController } from './history-refresh'
import { getKeyboardAction } from './keyboard'
import BaseConverter from './components/BaseConverter.vue'
import UnitConverter from './components/UnitConverter.vue'

const lang = ref('zh')
const theme = ref('light')
const activeTool = ref('calculate')
const expression = ref('')
const expressionInput = ref(null)
const result = ref('')
const error = ref('')
const loading = ref(false)
const searchTerm = ref('')
const currentPage = ref(1)
const pageSize = 5
const options = ref(null)
const optionsLoading = ref(false)
const optionsError = ref(null)
const historyState = reactive({ records: [], refreshError: null, deleteErrors: {}, deletingIds: [] })
const t = computed(() => messages[lang.value])
const history = computed(() => historyState.records)
const filteredHistory = computed(() => filterHistory(history.value, searchTerm.value))
const totalPages = computed(() => Math.max(1, Math.ceil(filteredHistory.value.length / pageSize)))
const paginatedHistory = computed(() => { const start = (currentPage.value - 1) * pageSize; return filteredHistory.value.slice(start, start + pageSize) })
const tabs = computed(() => [
  { id: 'calculate', label: t.value.calculatorTab },
  { id: 'base', label: t.value.baseTab },
  { id: 'unit', label: t.value.unitTab },
])
const buttons = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '(', ')', '+']
const scientificButtons = [
  { label: 'π', value: 'π' }, { label: 'e', value: 'e' }, { label: 'xʸ', value: '^' }, { label: '√', value: 'sqrt(' },
  { label: 'sin', value: 'sin(' }, { label: 'cos', value: 'cos(' }, { label: 'tan', value: 'tan(' }, { label: 'ln', value: 'ln(' },
  { label: 'log₁₀', value: 'log10(' }, { label: 'exp', value: 'exp(' },
]
const historyController = createHistoryController({ getHistory, deleteHistory, onChange: snapshot => Object.assign(historyState, snapshot) })
function clearEditedState() { result.value = ''; error.value = '' }
function selection() { const input = expressionInput.value; if (!input || input.selectionStart === null || input.selectionEnd === null) return { start: expression.value.length, end: expression.value.length }; return { start: input.selectionStart, end: input.selectionEnd } }
function updateExpression(value, start, end = start) { expression.value = value; nextTick(() => { const input = expressionInput.value; if (input && !loading.value) { input.focus(); input.setSelectionRange(start, end) } }) }
function append(value) { if (loading.value) return; const { start, end } = selection(); clearEditedState(); updateExpression(expression.value.slice(0, start) + value + expression.value.slice(end), start + value.length) }
function handleExpressionInput() { clearEditedState() }
function clear() { if (loading.value) return; expression.value = ''; clearEditedState(); nextTick(() => expressionInput.value?.focus()) }
function backspace() { if (loading.value) return; const { start, end } = selection(); if (start === 0 && end === 0) return; const deleteStart = start === end ? Math.max(0, start - 1) : start; clearEditedState(); updateExpression(expression.value.slice(0, deleteStart) + expression.value.slice(end), deleteStart) }
function toggleTheme() { theme.value = theme.value === 'light' ? 'dark' : 'light' }
async function loadOptions() { optionsLoading.value = true; optionsError.value = null; try { options.value = await getConversionOptions() } catch (received) { optionsError.value = received } finally { optionsLoading.value = false } }
async function submit() { if (loading.value) return; error.value = null; result.value = ''; loading.value = true; try { const body = expression.value.replaceAll('×', '*').replaceAll('÷', '/'); const response = await calculate(body); result.value = response.result; historyController.acceptCreated(response) } catch (received) { error.value = received } finally { loading.value = false } }
function remove(id) { return historyController.remove(id) }
function handleTabKey(event) { const index = tabs.value.findIndex(tab => tab.id === activeTool.value); let next = index; if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.value.length; else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.value.length) % tabs.value.length; else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = tabs.value.length - 1; else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); return } else return; event.preventDefault(); activeTool.value = tabs.value[next].id; nextTick(() => document.getElementById('tool-tab-' + tabs.value[next].id)?.focus()) }
function handleExpressionKeydown(event) { if (event.isComposing || event.keyCode === 229 || event.ctrlKey || event.metaKey || event.altKey) return; if ((event.key === 'Enter' || event.key === '=') && !event.repeat) { event.preventDefault(); submit() } else if (event.key === 'Escape') { event.preventDefault(); clear() } }
function handleKeydown(event) {
  if (activeTool.value !== 'calculate') return
  const action = getKeyboardAction(event)
  if (!action) return
  event.preventDefault()
  if (loading.value) return
  if (action.type === 'append') append(action.value)
  else if (action.type === 'submit') submit()
  else if (action.type === 'backspace') backspace()
  else if (action.type === 'clear') clear()
}
watch(theme, value => { document.documentElement.dataset.theme = value }, { immediate: true })
watch(searchTerm, () => { currentPage.value = 1 })
watch(totalPages, value => { if (currentPage.value > value) currentPage.value = value })
onMounted(() => { historyController.refresh(); loadOptions(); window.addEventListener('keydown', handleKeydown) })
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <main class="page">
    <header>
      <div><p class="eyebrow">SOFTWARE ENGINEERING · 01</p><h1>{{ t.title }}</h1><p class="subtitle">{{ t.subtitle }}</p></div>
      <div class="header-actions"><button class="theme-toggle" type="button" :aria-pressed="theme === 'dark'" :aria-label="t.theme + ': ' + (theme === 'light' ? t.themeDark : t.themeLight)" @click="toggleTheme">{{ t.theme }}: {{ theme === 'light' ? t.themeDark : t.themeLight }}</button><button class="lang" type="button" @click="lang = lang === 'zh' ? 'en' : 'zh'">{{ t.language }}</button></div>
    </header>
    <section class="tool-shell" :aria-label="t.tools">
      <div class="tool-tabs" role="tablist" :aria-label="t.tools">
        <button v-for="tab in tabs" :id="'tool-tab-' + tab.id" :key="tab.id" class="tool-tab" role="tab" type="button" :aria-selected="activeTool === tab.id" :tabindex="activeTool === tab.id ? 0 : -1" :aria-controls="'tool-panel-' + tab.id" @click="activeTool = tab.id" @keydown="handleTabKey">{{ tab.label }}</button>
      </div>
      <section id="tool-panel-calculate" class="workspace" role="tabpanel" aria-labelledby="tool-tab-calculate" v-show="activeTool === 'calculate'">
        <div class="calculator panel">
          <div class="display"><label class="sr-only" for="expression-input">{{ t.expression }}</label><input id="expression-input" ref="expressionInput" v-model="expression" :placeholder="t.expressionPlaceholder" :aria-label="t.expression" :disabled="loading" autocomplete="off" inputmode="text" spellcheck="false" @input="handleExpressionInput" @keydown="handleExpressionKeydown"><strong v-if="result">= {{ result }}</strong></div>
          <p v-if="error" class="error" role="alert">{{ localizedMessage(error, lang, t.network) }}</p><div class="keys"><button v-for="button in buttons" :key="button" type="button" :disabled="loading" @click="append(button)">{{ button }}</button></div>
          <div class="scientific-toolbar"><div class="scientific-heading"><span>{{ t.scientific }}</span><span class="angle-mode">{{ t.angleMode }}</span></div><div class="scientific-keys"><button v-for="button in scientificButtons" :key="button.value" type="button" :disabled="loading" :aria-label="button.label + ' ' + t.insert" @click="append(button.value)">{{ button.label }}</button></div></div>
          <div class="actions"><button type="button" :disabled="loading" @click="clear">{{ t.clear }}</button><button type="button" :disabled="loading" @click="backspace">{{ t.backspace }}</button><button class="primary" type="button" :disabled="loading" @click="submit">{{ loading ? t.loading : t.calculate }}</button></div>
        </div>
        <section class="panel history">
          <div class="section-title"><div><p class="eyebrow">DATABASE</p><h2>{{ t.history }}</h2></div><span>{{ history.length }}</span></div>
          <div class="history-search"><label for="history-search">{{ t.searchHistory }}</label><input id="history-search" v-model="searchTerm" type="search" :placeholder="t.searchPlaceholder"></div>
          <p v-if="historyState.refreshError" class="error" role="alert">{{ t.historyLoadError }}</p>
          <div v-if="history.length === 0" class="empty">{{ t.empty }}</div><div v-else-if="filteredHistory.length === 0" class="empty">{{ t.noSearchResults }}</div>
          <div v-for="item in paginatedHistory" :key="item.id" class="record"><div><b>{{ item.expression }}</b><small>{{ item.created_at ? new Date(item.created_at).toLocaleString() : '' }}</small></div><strong>{{ item.result }}</strong><button class="delete" type="button" :disabled="historyState.deletingIds.includes(item.id)" :aria-label="t.delete + ': ' + item.expression" @click="remove(item.id)">{{ historyState.deletingIds.includes(item.id) ? t.deleting : t.delete }}</button><p v-if="historyState.deleteErrors[item.id]" class="error record-error">{{ t.deleteError }}</p></div>
          <nav v-if="filteredHistory.length > pageSize" class="pagination" :aria-label="t.historyPagination"><button type="button" :disabled="currentPage === 1" @click="currentPage -= 1">{{ t.previousPage }}</button><span aria-live="polite">{{ currentPage }} / {{ totalPages }}</span><button type="button" :disabled="currentPage === totalPages" @click="currentPage += 1">{{ t.nextPage }}</button></nav>
        </section>
      </section>
      <section id="tool-panel-base" class="panel converter-panel" role="tabpanel" aria-labelledby="tool-tab-base" v-show="activeTool === 'base'">
        <p v-if="optionsLoading" class="loading-note">{{ t.optionsLoading }}</p><template v-else-if="optionsError"><p class="error" role="alert">{{ localizedMessage(optionsError, lang, t.optionsError) }}</p><button type="button" @click="loadOptions">{{ t.retry }}</button></template><BaseConverter v-else :lang="lang" :options="options" @converted="historyController.acceptCreated" />
      </section>
      <section id="tool-panel-unit" class="panel converter-panel" role="tabpanel" aria-labelledby="tool-tab-unit" v-show="activeTool === 'unit'">
        <p v-if="optionsLoading" class="loading-note">{{ t.optionsLoading }}</p><template v-else-if="optionsError"><p class="error" role="alert">{{ localizedMessage(optionsError, lang, t.optionsError) }}</p><button type="button" @click="loadOptions">{{ t.retry }}</button></template><UnitConverter v-else :lang="lang" :options="options" @converted="historyController.acceptCreated" />
      </section>
    </section>
  </main>
</template>
