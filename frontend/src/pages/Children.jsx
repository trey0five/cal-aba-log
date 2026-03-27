import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

export default function Children() {
  const [children, setChildren] = useState([])

  useEffect(() => {
    api.get('/children').then((res) => setChildren(res.data)).catch(() => {})
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Remove this camper?')) return
    await api.delete(`/children/${id}`)
    setChildren(children.filter((c) => c.id !== id))
  }

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-heading text-2xl text-white drop-shadow-lg">Campers</h1>
        <Link to="/children/add" className="btn-camp btn-camp-green text-sm !py-2 !px-4">
          + Add Camper
        </Link>
      </div>

      {children.length === 0 ? (
        <div className="camp-card text-center py-10">
          <p className="font-heading text-xl text-gray-500">No campers yet!</p>
          <Link to="/children/add" className="btn-camp btn-camp-green inline-block mt-4 text-sm">
            Add Your First Camper
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {children.map((child) => (
            <li key={child.id}>
              <Link to={`/child/${child.id}`} className="camp-card block hover:scale-[1.01] transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-heading text-lg">{child.name}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {child.age && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Age {child.age}</span>}
                      {child.elopement_risk && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Elopement Risk</span>}
                      {child.allergies && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">Allergies</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500 text-sm font-bold">View →</span>
                    <button
                      onClick={(e) => { e.preventDefault(); handleDelete(child.id) }}
                      className="text-red-400 text-sm hover:text-red-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                {child.caregivers && child.caregivers.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1 font-semibold">
                    Caregivers: {child.caregivers.map((c) => c.name).join(', ')}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
