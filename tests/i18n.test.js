import assert from 'node:assert/strict'
import { test } from 'node:test'
import { localizedMessage } from '../src/i18n.js'

test('localizedMessage follows the currently selected language', () => {
  const error = { message: { zh: '除数不能为零', en: 'Division by zero is not allowed' } }
  assert.equal(localizedMessage(error, 'zh', 'fallback'), '除数不能为零')
  assert.equal(localizedMessage(error, 'en', 'fallback'), 'Division by zero is not allowed')
})
