<script setup>
import { computed, ref, watch } from 'vue'
import { convertUnit } from '../api'
import { localizedMessage, messages } from '../i18n'

const props = defineProps({ lang: { type: String, required: true }, options: { type: Object, default: null } })
const emit = defineEmits(['converted'])
const t = computed(() => messages[props.lang])
const categories = computed(() => props.options?.categories || [])
const category = ref('length')
const selectedCategory = computed(() => categories.value.find(item => item.id === category.value))
const units = computed(() => selectedCategory.value?.units || [])
const value = ref('')
const fromUnit = ref('cm')
const toUnit = ref('m')
const loading = ref(false)
const result = ref('')
const resultUnit = ref('')
const error = ref(null)

function clearResult() { result.value = ''; resultUnit.value = ''; error.value = null }
watch(categories, (items) => {
  if (items.length && !items.some(item => item.id === category.value)) category.value = items[0].id
}, { immediate: true })
watch(selectedCategory, (next, previous) => {
  if (!next) return
  const changed = next.id !== previous?.id
  const defaults = { length: ['cm', 'm'], mass: ['kg', 'g'], area: ['m2', 'cm2'], volume: ['l', 'ml'], time: ['h', 'min'], temperature: ['c', 'f'] }[next.id]
  if (changed || !next.units.some(unit => unit.id === fromUnit.value)) fromUnit.value = defaults?.[0] || next.units[0]?.id || ''
  if (changed || !next.units.some(unit => unit.id === toUnit.value)) toUnit.value = defaults?.[1] || next.units[1]?.id || next.units[0]?.id || ''
  clearResult()
}, { immediate: true, flush: 'sync' })
watch([value, fromUnit, toUnit], clearResult, { flush: 'sync' })

async function submit() {
  if (loading.value || units.value.length === 0) return
  const payload = { category: category.value, value: value.value, from_unit: fromUnit.value, to_unit: toUnit.value }
  const targetSymbol = units.value.find(unit => unit.id === payload.to_unit)?.symbol || payload.to_unit
  clearResult()
  loading.value = true
  try {
    const response = await convertUnit(payload)
    result.value = response.result
    resultUnit.value = targetSymbol
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
      <fieldset :disabled="loading || categories.length === 0" class="conversion-form">
        <div class="conversion-field full-width">
          <label for="unit-category">{{ t.category }}</label>
          <select id="unit-category" v-model="category">
            <option v-for="item in categories" :key="item.id" :value="item.id">{{ item.name[lang] }}</option>
          </select>
        </div>
        <div class="conversion-field full-width">
          <label for="unit-value">{{ t.number }}</label>
          <input id="unit-value" v-model="value" type="text" :placeholder="t.unitPlaceholder" autocomplete="off" spellcheck="false" aria-describedby="unit-input-rules unit-limits">
        </div>
        <div class="conversion-field">
          <label for="from-unit">{{ t.fromUnit }}</label>
          <select id="from-unit" v-model="fromUnit">
            <option v-for="unit in units" :key="unit.id" :value="unit.id">{{ unit.symbol }} · {{ unit.name[lang] }}</option>
          </select>
        </div>
        <div class="conversion-field">
          <label for="to-unit">{{ t.toUnit }}</label>
          <select id="to-unit" v-model="toUnit">
            <option v-for="unit in units" :key="unit.id" :value="unit.id">{{ unit.symbol }} · {{ unit.name[lang] }}</option>
          </select>
        </div>
        <button class="conversion-submit full-width" type="submit">{{ loading ? t.conversionLoading : t.convert }}</button>
      </fieldset>
    </form>
    <p v-if="error" class="error" role="alert">{{ localizedMessage(error, lang, t.network) }}</p>
    <div v-if="result !== ''" class="conversion-result" role="status" aria-live="polite">
      <span>{{ t.result }}</span>
      <strong>{{ result }} <span>{{ resultUnit }}</span></strong>
    </div>
    <table class="conversion-table unit-table">
      <caption>{{ selectedCategory?.name[lang] }} · {{ t.unitRules }}</caption>
      <thead><tr><th scope="col">{{ t.unit }}</th><th scope="col">{{ t.relation }}</th><th v-if="category === 'temperature'" scope="col">{{ t.minimum }}</th></tr></thead>
      <tbody>
        <tr v-for="unit in units" :key="unit.id">
          <th scope="row">{{ unit.symbol }} <span class="unit-name">{{ unit.name[lang] }}</span></th>
          <td>{{ unit.relation }}</td>
          <td v-if="category === 'temperature'">{{ unit.minimum }} {{ unit.symbol }}</td>
        </tr>
      </tbody>
    </table>
    <div class="conversion-rules">
      <p id="unit-input-rules">{{ t.unitInputRules }}</p>
      <p id="unit-limits">{{ t.unitLimits }}</p>
      <p>{{ t.approximateHelp }}</p>
      <p v-if="category === 'temperature'">{{ t.temperatureRules }}</p>
      <p>{{ t.unitConventions }}</p>
    </div>
  </div>
</template>
