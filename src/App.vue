<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { calculate, deleteHistory, getHistory } from './api'
import { localizedMessage, messages } from './i18n'
import { filterHistory } from './history'
import { getKeyboardAction } from './keyboard'
const lang = ref('zh'), expression = ref(''), result = ref(''), error = ref(''), loading = ref(false), history = ref([])
const searchTerm = ref('')
const t = computed(() => messages[lang.value])
const filteredHistory = computed(() => filterHistory(history.value, searchTerm.value))
const buttons = ['7','8','9','÷','4','5','6','×','1','2','3','-','0','.','(',')','+']
function append(value) { expression.value += value }
function clear() { expression.value = ''; result.value = ''; error.value = '' }
function backspace() { expression.value = expression.value.slice(0, -1) }
async function loadHistory() { history.value = await getHistory() }
async function submit() { if (loading.value) return; error.value = null; result.value = ''; loading.value = true; try { const body = expression.value.replaceAll('×', '*').replaceAll('÷', '/'); const response = await calculate(body); result.value = response.result; await loadHistory() } catch (e) { error.value = e } finally { loading.value = false } }
async function remove(id) { await deleteHistory(id); await loadHistory() }
function handleKeydown(event) {
  const action = getKeyboardAction(event)
  if (!action) return
  event.preventDefault()
  if (action.type === 'append') append(action.value)
  else if (action.type === 'submit') submit()
  else if (action.type === 'backspace') backspace()
  else if (action.type === 'clear') clear()
}
onMounted(() => {
  loadHistory()
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>
<template>
  <main class="page"><header><div><p class="eyebrow">SOFTWARE ENGINEERING · 01</p><h1>{{ t.title }}</h1><p class="subtitle">{{ t.subtitle }}</p></div><button class="lang" @click="lang = lang === 'zh' ? 'en' : 'zh'">{{ t.language }}</button></header>
  <section class="workspace"><div class="calculator panel"><div class="display"><span>{{ expression || '0' }}</span><strong v-if="result">= {{ result }}</strong></div><p v-if="error" class="error">{{ localizedMessage(error, lang, t.network) }}</p><div class="keys"><button v-for="button in buttons" :key="button" @click="append(button)">{{ button }}</button></div><div class="actions"><button @click="clear">{{ t.clear }}</button><button @click="backspace">{{ t.backspace }}</button><button class="primary" :disabled="loading" @click="submit">{{ loading ? t.loading : t.calculate }}</button></div></div><section class="panel history"><div class="section-title"><div><p class="eyebrow">DATABASE</p><h2>{{ t.history }}</h2></div><span>{{ history.length }}</span></div><div class="history-search"><label for="history-search">{{ t.searchHistory }}</label><input id="history-search" v-model="searchTerm" type="search" :placeholder="t.searchPlaceholder"></div><div v-if="history.length === 0" class="empty">{{ t.empty }}</div><div v-else-if="filteredHistory.length === 0" class="empty">{{ t.noSearchResults }}</div><div v-for="item in filteredHistory" :key="item.id" class="record"><div><b>{{ item.expression }}</b><small>{{ item.created_at ? new Date(item.created_at).toLocaleString() : '' }}</small></div><strong>{{ item.result }}</strong><button class="delete" :aria-label="`${t.delete}: ${item.expression}`" @click="remove(item.id)">{{ t.delete }}</button></div></section></section></main>
</template>
