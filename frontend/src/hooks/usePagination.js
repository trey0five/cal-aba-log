import { useState, useEffect, useMemo } from 'react'

export default function usePagination(items, { pageSize = 10, resetKey } = {}) {
  const [page, setPage] = useState(1)

  // Reset to page 1 when the caller's resetKey (search term + group id, as a string) changes.
  useEffect(() => { setPage(1) }, [resetKey])

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  // Safety net: if the list shrinks below the current page, clamp back into range.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const current = Math.min(page, totalPages)
  const startIndex = (current - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const pageItems = useMemo(
    () => items.slice(startIndex, startIndex + pageSize),
    [items, startIndex, pageSize]
  )

  const next = () => setPage((p) => Math.min(p + 1, totalPages))
  const prev = () => setPage((p) => Math.max(p - 1, 1))

  return { pageItems, page: current, totalPages, totalItems, setPage, next, prev, startIndex, endIndex }
}
