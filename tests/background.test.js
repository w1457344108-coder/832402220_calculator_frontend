import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

const css = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')

test('the chalkboard image is a bundled asset', () => {
  assert.ok(existsSync(new URL('../public/backgrounds/green-algebra-chalkboard-advanced.png', import.meta.url)))
  assert.match(css, /url\(['"]?\/backgrounds\/green-algebra-chalkboard-advanced\.png['"]?\)/)
})

test('the chalkboard is not faded before the theme overlay', () => {
  const opacities = [...css.matchAll(/--background-opacity:\s*([.\d]+)/g)]
  assert.ok(opacities.length > 0)
  for (const [, opacity] of opacities) assert.equal(Number(opacity), 1)
})

test('both theme overlays retain at least half of the chalkboard', () => {
  const overlays = [...css.matchAll(/--backdrop:\s*rgb\([^/]+\/\s*([.\d]+)%\)/g)]
  assert.equal(overlays.length, 2)
  for (const [, percentage] of overlays) assert.ok(Number(percentage) <= 50)
})

test('the background stays lightly blurred so the chalk shapes remain crisp', () => {
  const layer = css.match(/body::before\s*\{([^}]+)\}/)?.[1]
  const blur = layer?.match(/blur\(([.\d]+)px\)/)?.[1]
  assert.ok(Number(blur) > 0 && Number(blur) <= 6)
  assert.match(css, /pointer-events:\s*none/)
})
