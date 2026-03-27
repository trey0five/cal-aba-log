import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function AddChild() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [allergies, setAllergies] = useState([''])
  const [behaviors, setBehaviors] = useState('')
  const [elopementRisk, setElopementRisk] = useState(false)
  const [notes, setNotes] = useState('')
  const [caregivers, setCaregivers] = useState([{ name: '', relationship: '', phone: '' }])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const addCaregiver = () => setCaregivers([...caregivers, { name: '', relationship: '', phone: '' }])
  const removeCaregiver = (i) => { if (caregivers.length > 1) setCaregivers(caregivers.filter((_, idx) => idx !== i)) }
  const updateCaregiver = (i, field, value) => { const u = [...caregivers]; u[i][field] = value; setCaregivers(u) }

  const addAllergy = () => setAllergies([...allergies, ''])
  const removeAllergy = (i) => { if (allergies.length > 1) setAllergies(allergies.filter((_, idx) => idx !== i)) }
  const updateAllergy = (i, value) => { const u = [...allergies]; u[i] = value; setAllergies(u) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const validCaregivers = caregivers.filter((c) => c.name.trim())
    if (validCaregivers.length === 0) {
      setError('At least one caregiver is required')
      return
    }

    const validAllergies = allergies.filter((a) => a.trim())

    try {
      const res = await api.post('/children', {
        name,
        age,
        allergies: validAllergies,
        behaviors,
        elopement_risk: elopementRisk,
        notes,
        caregivers: validCaregivers,
      })
      navigate(`/child/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add camper')
    }
  }

  return (
    <div className="page-enter max-w-lg mx-auto">
      <div className="camp-card">
        <h1 className="font-heading text-2xl text-center mb-6">Add New Camper</h1>
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 p-3 rounded-xl mb-4 font-semibold text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="space-y-3">
            <h2 className="font-heading text-lg text-gray-700 border-b-2 border-yellow-400 pb-1">Basic Information</h2>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Child's Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="camp-input" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Age</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="camp-input" min="1" max="18" />
            </div>
          </div>

          {/* Medical & Behavioral */}
          <div className="space-y-3">
            <h2 className="font-heading text-lg text-gray-700 border-b-2 border-yellow-400 pb-1">Medical & Behavioral</h2>

            {/* Allergies - dynamic list */}
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Allergies</label>
              {allergies.map((allergy, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={allergy}
                    onChange={(e) => updateAllergy(i, e.target.value)}
                    className="camp-input !py-2"
                    placeholder={`Allergy ${i + 1} (e.g. Peanuts)`}
                  />
                  {allergies.length > 1 && (
                    <button type="button" onClick={() => removeAllergy(i)} className="text-red-500 font-bold text-lg px-2 hover:text-red-700">
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addAllergy}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold text-sm hover:border-red-400 hover:text-red-500 transition-all"
              >
                + Add Allergy
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Behaviors</label>
              <textarea
                value={behaviors}
                onChange={(e) => setBehaviors(e.target.value)}
                className="camp-input"
                rows={2}
                placeholder="Describe any relevant behaviors or triggers..."
              />
            </div>
            <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-200">
              <input
                type="checkbox"
                id="elopement"
                checked={elopementRisk}
                onChange={(e) => setElopementRisk(e.target.checked)}
                className="w-5 h-5 accent-red-500"
              />
              <label htmlFor="elopement" className="text-sm font-bold text-red-700">
                Elopement Risk — This child may attempt to leave the area
              </label>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Additional Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="camp-input"
                rows={2}
                placeholder="Any other important information..."
              />
            </div>
          </div>

          {/* Caregivers */}
          <div className="space-y-3">
            <h2 className="font-heading text-lg text-gray-700 border-b-2 border-yellow-400 pb-1">
              Authorized Caregivers *
            </h2>
            <p className="text-sm text-gray-500">Who is authorized to drop off and pick up this child?</p>

            {caregivers.map((cg, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-500">Caregiver {i + 1}</span>
                  {caregivers.length > 1 && (
                    <button type="button" onClick={() => removeCaregiver(i)} className="text-red-500 text-xs font-bold hover:underline">
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Full name *"
                  value={cg.name}
                  onChange={(e) => updateCaregiver(i, 'name', e.target.value)}
                  className="camp-input !py-2"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Mother)"
                    value={cg.relationship}
                    onChange={(e) => updateCaregiver(i, 'relationship', e.target.value)}
                    className="camp-input !py-2 text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={cg.phone}
                    onChange={(e) => updateCaregiver(i, 'phone', e.target.value)}
                    className="camp-input !py-2 text-sm"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addCaregiver}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold text-sm hover:border-blue-400 hover:text-blue-500 transition-all"
            >
              + Add Another Caregiver
            </button>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-camp btn-camp-green flex-1">
              Add Camper
            </button>
            <button type="button" onClick={() => navigate('/children')} className="btn-camp flex-1 !bg-gray-400">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
