<script setup>
import { computed, ref, watch } from 'vue'
import { convertBase } from '../api'
import { localizedMessage, messages } from '../i18n'

const props = defineProps({ lang: { type: String, required: true }, options: { type: Object, default: null } })
const emit = defineEmits(['converted'])
const t = computed(() => messages[props.lang])
const bases = computed(() => props.options?.bases || [])
const value = ref('')
const fromBase = ref(10)
const toBase = ref(16)
const loading = ref(false)
const result = ref('')
const resultBase = ref(null)
const error = ref(null)

function clearResult() { result.value = ''; resultBase.value = null; error.value = null }
watch([value, fromBase, toBase], clearResult, { flush: 'sync' })

async function submit() {
  if (loading.value || bases.value.length === 0) return
  const payload = { value: value.value, from_base: fromBase.value, to_base: toBase.value }
  clearResult()
  loading.value = true
  try {
    const response = await convertBase(payload)
    result.value = response.result
    resultBase.value = payload.to_base
    emit('converted', response)
  } catch (received) {
    error.value = received
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="converter">
    <form @submit.prevent="submit">
      <fieldset :disabled="loading || bases.length === 0" class="conversion-form">
        <div class="conversion-field full-width">
          <label for="base-value">{{ t.integer }}</label>
          <input id="base-value" v-model="value" type="text" :placeholder="t.integerPlaceholder" autocomplete="off" spellcheck="false" aria-describedby="base-input-rules base-limits">
        </div>
        <div class="conversion-field">
          <label for="from-base">{{ t.fromBase }}</label>
          <select id="from-base" v-model="fromBase">
            <option v-for="base in bases" :key="base.id" :value="base.id">{{ base.id }}</option>
          </select>
        </div>
        <div class="conversion-field">
          <label for="to-base">{{ t.toBase }}</label>
          <select id="to-base" v-model="toBase">
            <option v-for="base in bases" :key="base.id" :value="base.id">{{ base.id }}</option>
          </select>
        </div>
        <button class="conversion-submit full-width" type="submit">{{ loading ? t.conversionLoading : t.convert }}</button>
      </fieldset>
    </form>
    <p v-if="error" class="error" role="alert">{{ localizedMessage(error, lang, t.network) }}</p>
    <div v-if="result !== ''" class="conversion-result" role="status" aria-live="polite">
      <span>{{ t.result }} · {{ t.base }} {{ resultBase }}</span>
      <strong>{{ result }}</strong>
    </div>
    <table class="conversion-table">
      <caption>{{ t.baseRules }}</caption>
      <thead><tr><th scope="col">{{ t.base }}</th><th scope="col">{{ t.allowedDigits }}</th><th scope="col">{{ t.baseExample }}</th></tr></thead>
      <tbody><tr v-for="base in bases" :key="base.id"><th scope="row">{{ base.id }}</th><td>{{ base.digits }}</td><td>{{ base.example }}</td></tr></tbody>
    </table>
    <div class="conversion-rules">
      <p id="base-input-rules">{{ t.baseInputRules }}</p>
      <p>{{ t.baseSignRules }}</p>
      <p id="base-limits">{{ t.baseLimits }}</p>
    </div>
  </div>
</template>
