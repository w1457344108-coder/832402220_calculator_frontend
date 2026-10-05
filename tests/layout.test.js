import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const app = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')

test('the scientific help paragraph is removed from the page', () => {
  assert.doesNotMatch(app, /scientific-help|scientificHelp/)
})

test('calculator and history use a compact single-column flow', () => {
  const workspace = css.match(/\.workspace\s*\{([^}]+)\}/)?.[1] || ''
  assert.match(workspace, /grid-template-columns:\s*minmax\(0, 1fr\)/)
  assert.doesNotMatch(css, /(?:\.panel|\.history)[^{]*\{[^}]*overflow-(?:x|y|)\s*:/s)
})

test('the chalkboard layer stays sharp enough for the formulas', () => {
  const layer = css.match(/body::before\s*\{([^}]+)\}/)?.[1] || ''
  const blur = Number(layer.match(/blur\(([.\d]+)px\)/)?.[1])
  assert.ok(blur > 0 && blur <= 0.5)
})
