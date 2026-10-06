export function createHistoryController({ getHistory, deleteHistory, onChange }) {
  let records = []
  let refreshError = null
  const deleteErrors = {}
  const deletingIds = new Set()
  let requestSequence = 0

  function notify() {
    // The UI may make snapshots reactive or edit them without changing our state.
    onChange(structuredClone({ records, refreshError, deleteErrors, deletingIds: [...deletingIds] }))
  }

  async function refresh() {
    const sequence = ++requestSequence
    try {
      const received = await getHistory()
      if (sequence !== requestSequence || deletingIds.size > 0) return
      records = structuredClone(received)
      refreshError = null
      notify()
    } catch (error) {
      if (sequence !== requestSequence || deletingIds.size > 0) return
      refreshError = error
      notify()
    }
  }

  function acceptCreated(record) {
    requestSequence += 1
    const received = structuredClone(record)
    records = [...records.filter(item => item.id !== received.id), received]
    records.sort((left, right) =>
      Date.parse(right.created_at) - Date.parse(left.created_at) || right.id - left.id)
    notify()
    void refresh()
  }

  async function remove(id) {
    if (deletingIds.has(id)) return
    deletingIds.add(id)
    requestSequence += 1
    notify()
    try {
      await deleteHistory(id)
      requestSequence += 1
      records = records.filter(record => record.id !== id)
      delete deleteErrors[id]
      notify()
    } catch (error) {
      deleteErrors[id] = error
      notify()
    } finally {
      deletingIds.delete(id)
      notify()
      // Refresh only when all overlapping deletions have settled.
      if (deletingIds.size === 0) void refresh()
    }
  }

  notify()
  return { refresh, acceptCreated, remove }
}
