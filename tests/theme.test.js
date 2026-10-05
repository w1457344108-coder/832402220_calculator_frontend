import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const app = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
const i18n = readFileSync(new URL('../src/i18n.js', import.meta.url), 'utf8')
const css = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')

test('App wires a light default theme to the document root and exposes a toggle', () => {
  assert.match(app, /theme\s*=\s*ref\('light'\)/)
  assert.match(app, /\bwatch\b/)
  assert.match(app, /document\.documentElement\.dataset\.theme\s*=\s*value/)
  assert.match(app, /immediate:\s*true/)
  assert.match(app, /theme\.value\s*=\s*theme\.value\s*===\s*'light'\s*\?\s*'dark'\s*:\s*'light'/)
})

test('theme labels are available in both supported languages', () => {
  for (const key of ['theme', 'themeLight', 'themeDark']) {
    assert.match(i18n, new RegExp(`${key}:`))
  }
  assert.match(app, /t\.theme/)
  assert.match(app, /t\.themeLight/)
  assert.match(app, /t\.themeDark/)
})

test('theme CSS defines light and dark palettes for the shared surfaces', () => {
  assert.match(css, /:root\s*\{/)
  assert.match(css, /:root\[data-theme=['"]dark['"]\]\s*\{/)
  for (const selector of ['body', '.page', '.panel', '.display', '.keys button', '.actions', '.history', '.history-search input', '.error', '.empty']) {
    assert.match(css, new RegExp(selector.replace(/[.]/g, '\\.') + '[^{]*\\{[^}]*var\\(--'))
  }
})

test('theme CSS gives the primary action a dedicated button accent', () => {
  assert.match(css, /--accent-button:\s*#315b9e/)
  assert.match(css, /:root\[data-theme=['"]dark['"]\][\s\S]*--accent-button:\s*#456ea8/)
  assert.match(css, /\.actions \.primary[\s\S]*background:\s*var\(--accent-button\)/)
})
