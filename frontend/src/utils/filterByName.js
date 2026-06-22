export default function filterByName(list, term) {
  const q = (term || '').trim().toLowerCase()
  if (!q) return list
  return list.filter((c) => (c.name || '').toLowerCase().includes(q))
}
