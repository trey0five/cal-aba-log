import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

const GROUP_THEMES = [
  { bg: 'bg-gradient-to-br from-blue-400 to-blue-600', border: 'border-blue-300', icon: '🏕️' },
  { bg: 'bg-gradient-to-br from-green-400 to-green-600', border: 'border-green-300', icon: '🌲' },
  { bg: 'bg-gradient-to-br from-orange-400 to-orange-600', border: 'border-orange-300', icon: '🔥' },
  { bg: 'bg-gradient-to-br from-purple-400 to-purple-600', border: 'border-purple-300', icon: '⭐' },
  { bg: 'bg-gradient-to-br from-pink-400 to-pink-600', border: 'border-pink-300', icon: '🦋' },
  { bg: 'bg-gradient-to-br from-teal-400 to-teal-600', border: 'border-teal-300', icon: '🐢' },
  { bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600', border: 'border-yellow-300', icon: '☀️' },
  { bg: 'bg-gradient-to-br from-red-400 to-red-600', border: 'border-red-300', icon: '🎈' },
]

export default function Children() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()
  const [children, setChildren] = useState([])
  const [groups, setGroups] = useState([])
  const [openGroup, setOpenGroup] = useState(null)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [showAssign, setShowAssign] = useState(null) // child id being assigned

  useEffect(() => {
    api.get('/children').then((res) => setChildren(res.data)).catch(() => {})
    api.get('/groups').then((res) => setGroups(res.data)).catch(() => {})
  }, [])

  const groupedChildIds = groups.flatMap((g) => g.children || [])
  const ungrouped = children.filter((c) => !groupedChildIds.includes(c.id))

  const handleDelete = async (id) => {
    if (!confirm('Remove this camper?')) return
    await api.delete(`/children/${id}`)
    setChildren(children.filter((c) => c.id !== id))
  }

  const createGroup = async () => {
    if (!newGroupName.trim()) return
    try {
      const res = await api.post('/groups', { name: newGroupName.trim() })
      setGroups([...groups, res.data])
      setNewGroupName('')
      setShowNewGroup(false)
    } catch {}
  }

  const deleteGroup = async (groupId) => {
    if (!confirm('Delete this group? Campers will be ungrouped.')) return
    try {
      await api.delete(`/groups/${groupId}`)
      setGroups(groups.filter((g) => g.id !== groupId))
    } catch {}
  }

  const assignToGroup = async (childId, groupId) => {
    try {
      await api.post(`/groups/${groupId}/add-child`, { child_id: childId })
      // Reload groups
      const res = await api.get('/groups')
      setGroups(res.data)
      setShowAssign(null)
    } catch {}
  }

  const removeFromGroup = async (groupId, childId) => {
    try {
      await api.post(`/groups/${groupId}/remove-child`, { child_id: childId })
      const res = await api.get('/groups')
      setGroups(res.data)
    } catch {}
  }

  const getTheme = (index) => GROUP_THEMES[index % GROUP_THEMES.length]

  const renderChild = (child, groupId) => (
    <li key={child.id}>
      <div className="camp-card !p-3 hover:scale-[1.01] transition-transform">
        <div className="flex items-center justify-between">
          <Link to={`/child/${child.id}`} className="flex-1 min-w-0">
            <p className="font-heading text-base truncate">{child.name}</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              {child.age && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Age {child.age}</span>}
              {child.elopement_risk && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Elopement</span>}
            </div>
          </Link>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {isAdmin && !groupId && (
              <button onClick={() => setShowAssign(showAssign === child.id ? null : child.id)} className="text-xs font-bold text-blue-500 hover:text-blue-700">
                Group
              </button>
            )}
            {isAdmin && groupId && (
              <button onClick={() => removeFromGroup(groupId, child.id)} className="text-xs font-bold text-orange-500 hover:text-orange-700">
                Ungroup
              </button>
            )}
            <Link to={`/child/${child.id}`} className="text-blue-500 text-sm font-bold">View →</Link>
            {isAdmin && (
              <button onClick={() => handleDelete(child.id)} className="text-red-400 text-sm hover:text-red-600 font-bold">✕</button>
            )}
          </div>
        </div>
        {/* Assign dropdown */}
        {showAssign === child.id && groups.length > 0 && (
          <div className="mt-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs font-bold text-gray-500 mb-1">Add to group:</p>
            <div className="flex flex-wrap gap-2">
              {groups.map((g, gi) => {
                const theme = getTheme(gi)
                return (
                  <button key={g.id} onClick={() => assignToGroup(child.id, g.id)}
                    className={`${theme.bg} text-white text-xs font-bold px-3 py-1.5 rounded-full hover:scale-105 transition-transform`}>
                    {theme.icon} {g.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </li>
  )

  return (
    <div className="page-enter">
      <div className="page-header flex items-center justify-between mb-5">
        <h1 className="font-heading text-2xl text-white drop-shadow-lg">Campers</h1>
        {isAdmin && (
          <Link to="/children/add" className="btn-camp btn-camp-green text-sm !py-2 !px-4">
            + Add Camper
          </Link>
        )}
      </div>

      {/* Groups */}
      {groups.length > 0 && (
        <div className="space-y-3 mb-6">
          {groups.map((group, gi) => {
            const theme = getTheme(gi)
            const groupChildren = children.filter((c) => (group.children || []).includes(c.id))
            const isOpen = openGroup === group.id

            return (
              <div key={group.id}>
                <button
                  onClick={() => setOpenGroup(isOpen ? null : group.id)}
                  className={`w-full ${theme.bg} rounded-2xl p-4 border-2 ${theme.border} shadow-lg text-left hover:scale-[1.01] transition-all relative overflow-hidden`}
                >
                  <div className="absolute top-2 right-3 text-4xl opacity-30">{theme.icon}</div>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="font-heading text-xl text-white drop-shadow-md">{theme.icon} {group.name}</p>
                      <p className="text-white/80 text-sm font-bold">{groupChildren.length} camper{groupChildren.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/90 font-bold text-lg">{isOpen ? '▾' : '▸'}</span>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-2 ml-3 space-y-2">
                    {groupChildren.length === 0 ? (
                      <p className="text-sm text-gray-400 font-semibold p-3">No campers in this group yet</p>
                    ) : (
                      <ul className="space-y-2">
                        {groupChildren.map((child) => renderChild(child, group.id))}
                      </ul>
                    )}
                    {isAdmin && (
                      <button onClick={() => deleteGroup(group.id)} className="text-xs font-bold text-red-400 hover:text-red-600 mt-1 ml-1">
                        Delete Group
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create group button */}
      {isAdmin && (
        <div className="mb-4">
          {showNewGroup ? (
            <div className="camp-card !p-3 flex items-center gap-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name (e.g. Morning Group)"
                className="camp-input !py-2 flex-1"
                onKeyDown={(e) => e.key === 'Enter' && createGroup()}
                autoFocus
              />
              <button onClick={createGroup} className="btn-camp btn-camp-green !text-xs !py-2 !px-4">Create</button>
              <button onClick={() => { setShowNewGroup(false); setNewGroupName('') }} className="text-sm font-bold text-gray-400 hover:text-gray-600">✕</button>
            </div>
          ) : (
            <button onClick={() => setShowNewGroup(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold text-sm hover:border-blue-400 hover:text-blue-500 transition-all">
              + Create Group
            </button>
          )}
        </div>
      )}

      {/* Ungrouped campers */}
      {ungrouped.length === 0 && groups.length === 0 ? (
        <div className="camp-card text-center py-10">
          <p className="font-heading text-xl text-gray-500">No campers yet!</p>
          {isAdmin && (
            <Link to="/children/add" className="btn-camp btn-camp-green inline-block mt-4 text-sm">
              Add Your First Camper
            </Link>
          )}
        </div>
      ) : ungrouped.length > 0 && (
        <div>
          {groups.length > 0 && (
            <h2 className="font-heading text-lg text-white drop-shadow-lg mb-3">Ungrouped Campers</h2>
          )}
          <ul className="space-y-3">
            {ungrouped.map((child) => renderChild(child, null))}
          </ul>
        </div>
      )}
    </div>
  )
}
