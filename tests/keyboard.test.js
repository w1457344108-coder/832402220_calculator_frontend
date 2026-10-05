import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getKeyboardAction } from '../src/keyboard.js'

const event = (key, overrides = {}) => ({
  key,
  repeat: false,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  target: { tagName: 'main' },
  ...overrides,
})

test('maps calculator keys to display actions', () => {
  assert.deepEqual(getKeyboardAction(event('7')), { type: 'append', value: '7' })
  assert.deepEqual(getKeyboardAction(event('*')), { type: 'append', value: '×' })
  assert.deepEqual(getKeyboardAction(event('/')), { type: 'append', value: '÷' })
  assert.deepEqual(getKeyboardAction(event('+')), { type: 'append', value: '+' })
  assert.deepEqual(getKeyboardAction(event('Enter')), { type: 'submit' })
  assert.deepEqual(getKeyboardAction(event('=')), { type: 'submit' })
  assert.deepEqual(getKeyboardAction(event('Backspace')), { type: 'backspace' })
  assert.deepEqual(getKeyboardAction(event('Escape')), { type: 'clear' })
})

test('ignores repeated submit and modified browser shortcuts', () => {
  assert.equal(getKeyboardAction(event('Enter', { repeat: true })), null)
  assert.equal(getKeyboardAction(event('f', { ctrlKey: true })), null)
  assert.equal(getKeyboardAction(event('s', { metaKey: true })), null)
  assert.equal(getKeyboardAction(event('8', { altKey: true })), null)
  assert.equal(getKeyboardAction(event('Enter', { isComposing: true })), null)
  assert.equal(getKeyboardAction(event('Enter', { keyCode: 229 })), null)
})

test('does not intercept editable controls or button activation', () => {
  for (const tagName of ['input', 'textarea', 'select']) {
    assert.equal(getKeyboardAction(event('1', { target: { tagName } })), null)
  }
  assert.equal(getKeyboardAction(event('1', { target: { tagName: 'div', isContentEditable: true } })), null)
  assert.equal(getKeyboardAction(event('Enter', { target: { tagName: 'button' } })), null)
  assert.equal(getKeyboardAction(event(' ', { target: { tagName: 'button' } })), null)
})
