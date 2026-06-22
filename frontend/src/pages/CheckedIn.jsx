import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import Pagination from '../components/Pagination'
import SearchInput from '../components/SearchInput'
import usePagination from '../hooks/usePagination'
import filterByName from '../utils/filterByName'

function ElapsedTimer({ since }) {
  const [elapsed, setElapsed] = useState('')
  useEffect(() => {
    const calc = () => {
      const diff = Math.floor((Date.now() - new Date(since).getTime()) / 1000)
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      setElapsed(`${h}h ${m}m ${s}s`)
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [since])
  return <span>{elapsed}</span>
}

export default function CheckedIn() {
  const navigate = useNavigate()
  const [children, setChildren] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [search, setSearch] = useState('')

  const loadData = useCallback(() => {
    Promise.all([
      api.get('/children'),
      api.get('/logs'),
      api.get('/groups'),
    ]).then(([childRes, logsRes, groupsRes]) => {
      setChildren(childRes.data)
      setTodayLogs(logsRes.data)
      setGroups(groupsRes.data)
    }).catch(() => {})
  }, [])

  // Initial load, plus a refresh whenever the tab/window regains focus so that
  // group changes or deletions made elsewhere are reflected in the filters.
  useEffect(() => {
    loadData()
    const onFocus = () => loadData()
    const onVisible = () => { if (document.visibilityState === 'visible') loadData() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [loadData])

  // If the currently selected group no longer exists (renamed away / deleted),
  // fall back to "All" so the filter never points at a stale group.
  useEffect(() => {
    if (selectedGroup === 'all' || selectedGroup === 'ungrouped') return
    if (!groups.some((g) => g.id === selectedGroup)) setSelectedGroup('all')
  }, [groups, selectedGroup])

  const checkedInKids = children
    .map((child) => {
      const childLogs = todayLogs.filter((l) => l.child_id === child.id)
      if (childLogs.length === 0) return null
      const last = childLogs[childLogs.length - 1]
      if (last.action !== 'in') return null
      return { ...child, checkinTime: last.timestamp, checkinBy: last.staff_name, caregiver: last.caregiver }
    })
    .filter(Boolean)

  const groupedIds = useMemo(() => new Set(groups.flatMap((g) => g.children || [])), [groups])
  const inSelectedGroup = (child) =>
    selectedGroup === 'all' ? true
    : selectedGroup === 'ungrouped' ? !groupedIds.has(child.id)
    : (groups.find((g) => g.id === selectedGroup)?.children || []).includes(child.id)
  const filtered = useMemo(
    () => filterByName(checkedInKids.filter(inSelectedGroup), search),
    [children, todayLogs, groups, selectedGroup, search]
  )
  const pg = usePagination(filtered, { pageSize: 10, resetKey: `${selectedGroup}|${search.trim().toLowerCase()}` })

  return (
    <div className="page-enter">
      <div className="page-header flex items-center justify-between mb-4">
        <h1 className="font-heading text-2xl text-white drop-shadow-lg">Currently Checked In</h1>
        <button onClick={() => navigate('/')} className="back-btn">← Back</button>
      </div>

      {checkedInKids.length === 0 ? (
        <div className="camp-card text-center py-8">
          <p className="font-heading text-lg text-gray-500">No campers checked in right now</p>
        </div>
      ) : (
        <>
          <div className="camp-card mb-4 text-center">
            <p className="font-heading text-4xl text-green-600">{checkedInKids.length}</p>
            <p className="text-sm font-bold text-gray-500">Camper{checkedInKids.length !== 1 ? 's' : ''} at camp</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <button
              type="button"
              onClick={() => setSelectedGroup('all')}
              className={`font-bold text-xs px-3 py-1.5 rounded-full transition-transform hover:scale-105 ${selectedGroup === 'all' ? 'bg-green-600 text-white' : 'bg-white/80 text-gray-700'}`}
            >
              All ({checkedInKids.length})
            </button>
            {groups.map((g) => {
              const count = checkedInKids.filter((k) => (g.children || []).includes(k.id)).length
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGroup(g.id)}
                  className={`font-bold text-xs px-3 py-1.5 rounded-full transition-transform hover:scale-105 ${selectedGroup === g.id ? 'bg-green-600 text-white' : 'bg-white/80 text-gray-700'}`}
                >
                  {g.name} ({count})
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setSelectedGroup('ungrouped')}
              className={`font-bold text-xs px-3 py-1.5 rounded-full transition-transform hover:scale-105 ${selectedGroup === 'ungrouped' ? 'bg-green-600 text-white' : 'bg-white/80 text-gray-700'}`}
            >
              Ungrouped ({checkedInKids.filter((k) => !groupedIds.has(k.id)).length})
            </button>
          </div>

          <div className="mb-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search checked-in campers…" />
          </div>

          {filtered.length === 0 ? (
            <div className="camp-card text-center py-6">
              <p className="font-heading text-lg text-gray-500">No checked-in campers match</p>
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {pg.pageItems.map((child) => (
                  <li key={child.id}>
                    <Link to={`/child/${child.id}`} className="camp-card block hover:scale-[1.01] transition-transform">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-heading text-lg truncate">{child.name}</p>
                          <p className="text-xs text-gray-500 font-semibold break-words line-clamp-2">
                            Dropped off by: {child.caregiver}
                          </p>
                          <p className="text-xs text-gray-400 font-semibold">Staff: {child.checkinBy}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-heading text-base sm:text-lg text-green-600 whitespace-nowrap tabular-nums">
                            <ElapsedTimer since={child.checkinTime} />
                          </p>
                          <p className="text-xs font-bold text-gray-400">elapsed</p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <Pagination page={pg.page} totalPages={pg.totalPages} totalItems={pg.totalItems} startIndex={pg.startIndex} endIndex={pg.endIndex} onPrev={pg.prev} onNext={pg.next} label="campers" />
            </>
          )}
        </>
      )}
    </div>
  )
}
