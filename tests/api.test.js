import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { createServer } from 'vite'

// Vite resolves import.meta.env exactly as in the application, without a browser.
const server = await createServer({ server: { middlewareMode: true, hmr: false } })
const api = await server.ssrLoadModule('/src/api.js')
await server.close()
const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

function respond(body, status = 200) {
  globalThis.fetch = async () => new Response(JSON.stringify(body), {
    status, headers: { 'Content-Type': 'application/json' },
  })
}

test('calculate preserves the backend bilingual error body', async () => {
  const error = {
    success: false, code: 'DIVISION_BY_ZERO',
    message: { zh: '除数不能为零', en: 'Division by zero is not allowed' },
  }
  respond(error, 400)
  await assert.rejects(api.calculate('1/0'), received => {
    assert.deepEqual(received, error)
    return true
  })
})

test('calculate preserves errors inside a detail field', async () => {
  const error = { code: 'INVALID_EXPRESSION', message: { zh: '表达式无效', en: 'Invalid expression' } }
  respond({ detail: error }, 400)
  await assert.rejects(api.calculate('1+'), received => {
    assert.deepEqual(received, error)
    return true
  })
})

test('non-JSON failures use a bilingual fallback', async () => {
  globalThis.fetch = async () => new Response('Bad gateway', { status: 502 })
  await assert.rejects(api.calculate('1+2'), received => {
    assert.equal(received.code, 'NETWORK')
    assert.ok(received.message.zh && received.message.en)
    return true
  })
})

test('calculate sends only expression and returns the server result', async () => {
  globalThis.fetch = async (url, options) => {
    assert.ok(url.endsWith('/api/calculate'))
    assert.equal(options.method, 'POST')
    assert.deepEqual(JSON.parse(options.body), { expression: '1+2' })
    return new Response(JSON.stringify({ success: true, result: '3' }))
  }
  assert.equal((await api.calculate('1+2')).result, '3')
})

test('delete handles the empty 204 response', async () => {
  globalThis.fetch = async (url, options) => {
    assert.ok(url.endsWith('/api/history/123'))
    assert.equal(options.method, 'DELETE')
    return new Response(null, { status: 204 })
  }
  assert.equal(await api.deleteHistory(123), null)
})
