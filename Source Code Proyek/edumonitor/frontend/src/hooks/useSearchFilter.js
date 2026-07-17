import { useMemo, useState } from 'react'

export function useSearch(items, { fields, defaultQuery = '' } = {}) {
  const [query, setQuery] = useState(defaultQuery)

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword || !fields) return items
    return items.filter((item) =>
      fields.some((field) => {
        const value = resolveField(item, field)
        return String(value).toLowerCase().includes(keyword)
      }),
    )
  }, [items, query, fields])

  return { query, setQuery, filtered }
}

export function useFilter(items, { filterKey, filterOptions, defaultFilter = 'Semua' } = {}) {
  const [filter, setFilter] = useState(defaultFilter)

  const filtered = useMemo(() => {
    if (filter === 'Semua' || !filterKey) return items
    return items.filter((item) => resolveField(item, filterKey) === filter)
  }, [items, filter, filterKey])

  return { filter, setFilter, filtered }
}

export function useSort(items, { defaultField = 'name', defaultDir = 'asc' } = {}) {
  const [sortBy, setSortBy] = useState(defaultField)
  const [sortDir, setSortDir] = useState(defaultDir)

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const valA = String(resolveField(a, sortBy) || '').toLowerCase()
      const valB = String(resolveField(b, sortBy) || '').toLowerCase()
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
    })
  }, [items, sortBy, sortDir])

  return { sorted, sortBy, setSortBy, sortDir, setSortDir }
}

export function useSearchFilter(items, options = {}) {
  const search = useSearch(items, options)
  const filter = useFilter(search.filtered, options)
  const sort = useSort(filter.filtered, options)

  return {
    query: search.query,
    setQuery: search.setQuery,
    filter: filter.filter,
    setFilter: filter.setFilter,
    sortBy: sort.sortBy,
    setSortBy: sort.setSortBy,
    sortDir: sort.sortDir,
    setSortDir: sort.setSortDir,
    data: sort.sorted,
  }
}

function resolveField(obj, field) {
  if (typeof field === 'function') return field(obj)
  return field.split('.').reduce((acc, key) => acc?.[key], obj)
}
