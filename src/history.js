export function filterHistory(records, query) {
  const normalizedQuery = String(query ?? '').trim().toLowerCase()
  if (!normalizedQuery) return records
  return records.filter(record => String(record.expression ?? '').toLowerCase().includes(normalizedQuery))
}
