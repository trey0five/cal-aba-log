import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import Pagination from '../components/Pagination'
import SearchInput from '../components/SearchInput'
import usePagination from '../hooks/usePagination'
import filterByName from '../utils/filterByName'

export default function PhotoPermissions() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [children, setChildren] = useState([])
  const [search, setSearch] = useState('')
  const [view, setView] = useState('both') // 'both' | 'allowed' | 'denied'

  const loadChildren = useCallback(() => {
    api.get('/children').then((res) => setChildren(res.data)).catch(() => {})
  }, [])

  // Load on mount, and refresh whenever the tab/window regains focus so a
  // changed pictures-allowed setting (edited on a camper's profile or another
  // device) is reflected here without a manual reload.
  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/'); return }
    loadChildren()
    const onFocus = () => loadChildren()
    const onVisible = () => { if (document.visibilityState === 'visible') loadChildren() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [loadChildren])

  // A camper is OK to post unless pictures_allowed is explicitly false
  // (matches how the camper profile interprets the flag).
  const allowed = useMemo(() => children.filter((c) => c.pictures_allowed !== false), [children])
  const notAllowed = useMemo(() => children.filter((c) => c.pictures_allowed === false), [children])

  const allowedFiltered = useMemo(() => filterByName(allowed, search), [allowed, search])
  const notAllowedFiltered = useMemo(() => filterByName(notAllowed, search), [notAllowed, search])

  const term = search.trim().toLowerCase()
  const allowedPg = usePagination(allowedFiltered, { pageSize: 50, resetKey: term })
  const notAllowedPg = usePagination(notAllowedFiltered, { pageSize: 50, resetKey: term })

  const showAllowed = view === 'both' || view === 'allowed'
  const showDenied = view === 'both' || view === 'denied'
  const toggle = (which) => setView((v) => (v === which ? 'both' : which))

  const renderRow = (child, ok) => (
    <li key={child.id}>
      <Link
        to={`/child/${child.id}`}
        className={`flex items-center gap-3 py-2.5 px-3 rounded-xl border-2 hover:scale-[1.02] active:scale-100 transition-transform ${
          ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}
      >
        <span
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold shadow ${
            ok ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600'
          }`}
        >
          {ok ? '✓' : '✕'}
        </span>
        <span className="font-bold text-sm text-gray-700 truncate flex-1 min-w-0">{child.name}</span>
        <span className="text-blue-500 text-xs font-bold shrink-0">View →</span>
      </Link>
    </li>
  )

  const renderList = (pg, filtered, ok) => (
    filtered.length === 0 ? (
      <p className="text-sm text-gray-400 font-semibold p-3 text-center">{search ? 'No campers match' : 'None'}</p>
    ) : (
      <>
        <ul className="space-y-2">
          {pg.pageItems.map((child) => renderRow(child, ok))}
        </ul>
        <Pagination
          page={pg.page} totalPages={pg.totalPages} totalItems={pg.totalItems}
          startIndex={pg.startIndex} endIndex={pg.endIndex} onPrev={pg.prev} onNext={pg.next}
          label="campers" variant="onCard"
        />
      </>
    )
  )

  return (
    <div className="page-enter">
      <div className="page-header flex items-center justify-between mb-4 gap-2">
        <h1 className="font-heading text-xl sm:text-2xl text-white drop-shadow-lg flex items-center gap-2 min-w-0">
          <span className="bounce-icon shrink-0">📷</span>
          <span className="truncate">Photo Permissions</span>
        </h1>
        <button onClick={() => navigate('/')} className="back-btn shrink-0">← Back</button>
      </div>

      {/* Tappable summary cards — double as filters */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
        <button
          type="button"
          onClick={() => toggle('allowed')}
          className={`stat-card stat-card-green block text-left transition-all hover:scale-[1.03] active:scale-100 ${
            view === 'denied' ? 'opacity-50' : ''
          } ${view === 'allowed' ? 'ring-4 ring-white/70' : ''}`}
        >
          <p className="text-4xl sm:text-5xl font-heading drop-shadow-md leading-none">{allowed.length}</p>
          <p className="text-white/90 font-bold mt-1 text-sm sm:text-base">✅ OK to post</p>
        </button>

        <button
          type="button"
          onClick={() => toggle('denied')}
          className={`stat-card block text-left text-white bg-gradient-to-br from-red-500 to-rose-600 shadow-lg transition-all hover:scale-[1.03] active:scale-100 ${
            view === 'allowed' ? 'opacity-50' : ''
          } ${view === 'denied' ? 'ring-4 ring-white/70' : ''}`}
        >
          <p className="text-4xl sm:text-5xl font-heading drop-shadow-md leading-none">{notAllowed.length}</p>
          <p className="text-white/90 font-bold mt-1 text-sm sm:text-base">🚫 Do NOT post</p>
        </button>
      </div>

      {view !== 'both' && (
        <button
          type="button"
          onClick={() => setView('both')}
          className="text-xs font-bold text-white/90 hover:text-white underline mb-3 drop-shadow"
        >
          Show both lists
        </button>
      )}

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search campers…" />
      </div>

      <div className="space-y-4">
        {showAllowed && (
          <div className="camp-card">
            <h2 className="font-heading text-lg mb-3 text-green-700 border-b-2 border-green-200 pb-1 flex items-center justify-between">
              <span>✅ OK to post</span>
              <span className="text-sm bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">{allowedFiltered.length}</span>
            </h2>
            {renderList(allowedPg, allowedFiltered, true)}
          </div>
        )}

        {showDenied && (
          <div className="camp-card">
            <h2 className="font-heading text-lg mb-3 text-red-600 border-b-2 border-red-200 pb-1 flex items-center justify-between">
              <span>🚫 Do NOT post</span>
              <span className="text-sm bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">{notAllowedFiltered.length}</span>
            </h2>
            {renderList(notAllowedPg, notAllowedFiltered, false)}
          </div>
        )}
      </div>
    </div>
  )
}
