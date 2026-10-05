import assert from 'node:assert/strict'
import { test } from 'node:test'
import { filterHistory } from '../src/history.js'

const records = [
  { id: 1, expression: '(1+2)*3', result: '9' },
  { id: 2, expression: '10/2+7', result: '12' }
]

test('blank search returns the complete history array', () => {
  assert.equal(filterHistory(records, ''), records)
})

test('whitespace-only search returns the complete history array', () => {
  assert.equal(filterHistory(records, '   '), records)
})

test('null search returns the complete history array', () => {
  assert.equal(filterHistory(records, null), records)
})

test('search matches an expression substring', () => {
  assert.deepEqual(filterHistory(records, '10/2'), [records[1]])
})

test('search without a matching expression returns no records', () => {
  assert.deepEqual(filterHistory(records, 'sqrt'), [])
})

test('search trims whitespace and ignores letter case', () => {
  const namedRecords = [{ expression: 'ABC+2' }, { expression: 'xyz+3' }]
  assert.deepEqual(filterHistory(namedRecords, '  aBc  '), [namedRecords[0]])
})

test('search treats null and missing expressions as empty strings', () => {
  assert.deepEqual(filterHistory([{ expression: null }, {}, ...records], '10/2'), [records[1]])
})
