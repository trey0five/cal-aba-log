import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

const COMM_OPTIONS = [
  { key: 'verbal', label: 'Verbal Speech', desc: 'Uses words, phrases, or full sentences' },
  { key: 'aac', label: 'AAC Device', desc: 'Tablet, GoTalk, or other speech-generating software' },
  { key: 'pecs', label: 'PECS/Visuals', desc: 'Uses pictures or icons to make requests' },
  { key: 'sign', label: 'Sign Language', desc: 'ASL or modified signs' },
  { key: 'gestures', label: 'Gestures/Pointing', desc: 'Leading an adult to an item, reaching, or pointing' },
  { key: 'vocalizations', label: 'Vocalizations', desc: 'Uses specific sounds or tones to express feelings' },
]

const DIET_PRESETS = ['Gluten-Free', 'Casein-Free', 'Dye-Free', 'Sugar-Free', 'Vegan']

function DynamicList({ label, items, setItems, placeholder, addLabel, borderColor = 'gray' }) {
  const add = () => setItems([...items, ''])
  const remove = (i) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)) }
  const update = (i, val) => { const u = [...items]; u[i] = val; setItems(u) }
  const colors = { gray: 'border-gray-300 hover:border-gray-400 hover:text-gray-600', red: 'border-red-300 hover:border-red-400 hover:text-red-500', yellow: 'border-yellow-300 hover:border-yellow-400 hover:text-yellow-600', blue: 'border-blue-300 hover:border-blue-400 hover:text-blue-500', green: 'border-green-300 hover:border-green-400 hover:text-green-500' }
  return (
    <div>
      <label className="block text-sm font-bold text-gray-600 mb-1">{label}</label>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <input type="text" value={item} onChange={(e) => update(i, e.target.value)} className="camp-input !py-2" placeholder={placeholder(i)} />
          {items.length > 1 && <button type="button" onClick={() => remove(i)} className="text-red-500 font-bold text-lg px-2 hover:text-red-700">✕</button>}
        </div>
      ))}
      <button type="button" onClick={add} className={`w-full py-2 border-2 border-dashed rounded-xl text-gray-500 font-bold text-sm transition-all ${colors[borderColor]}`}>
        + {addLabel}
      </button>
    </div>
  )
}

export default function AddChild() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')
  const [allergies, setAllergies] = useState([''])
  const [behaviors, setBehaviors] = useState([''])
  const [elopementRisk, setElopementRisk] = useState(false)
  const [oneToOne, setOneToOne] = useState(false)
  const [pica, setPica] = useState(false)
  const [epiPen, setEpiPen] = useState(false)
  const [communicationStyles, setCommunicationStyles] = useState([])
  const [reinforcers, setReinforcers] = useState([''])
  const [dislikes, setDislikes] = useState([''])
  const [dietRestrictions, setDietRestrictions] = useState([])
  const [customDiet, setCustomDiet] = useState([''])
  const [toiletingHelp, setToiletingHelp] = useState(false)
  const [picturesAllowed, setPicturesAllowed] = useState(true)
  const [notes, setNotes] = useState('')
  const [caregivers, setCaregivers] = useState([{ firstName: '', lastName: '', relationship: '', phone: '' }])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const addCaregiver = () => setCaregivers([...caregivers, { firstName: '', lastName: '', relationship: '', phone: '' }])
  const removeCaregiver = (i) => { if (caregivers.length > 1) setCaregivers(caregivers.filter((_, idx) => idx !== i)) }
  const updateCaregiver = (i, field, value) => {
    const u = [...caregivers]
    if (field === 'phone') value = formatPhone(value)
    u[i][field] = value
    setCaregivers(u)
  }

  const toggleComm = (key) => {
    setCommunicationStyles((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])
  }

  const toggleDietPreset = (d) => {
    setDietRestrictions((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const validCaregivers = caregivers
      .filter((c) => c.firstName.trim())
      .map((c) => ({ name: `${c.firstName.trim()} ${c.lastName.trim()}`.trim(), relationship: c.relationship, phone: c.phone }))

    if (validCaregivers.length === 0) {
      setError('At least one caregiver is required')
      return
    }

    const allDiet = [...dietRestrictions, ...customDiet.filter((d) => d.trim())]
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()

    try {
      const res = await api.post('/children', {
        name: fullName,
        age,
        allergies: allergies.filter((a) => a.trim()),
        behaviors: behaviors.filter((b) => b.trim()),
        elopement_risk: elopementRisk,
        one_to_one: oneToOne,
        pica,
        epi_pen: epiPen,
        communication_styles: communicationStyles,
        reinforcers: reinforcers.filter((r) => r.trim()),
        dislikes: dislikes.filter((d) => d.trim()),
        diet_restrictions: allDiet,
        toileting_help: toiletingHelp,
        pictures_allowed: picturesAllowed,
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
        {error && <div className="bg-red-50 border-2 border-red-200 text-red-600 p-3 rounded-xl mb-4 font-semibold text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic Info */}
          <div className="space-y-3">
            <h2 className="font-heading text-lg text-gray-700 border-b-2 border-yellow-400 pb-1">Basic Information</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">First Name *</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="camp-input" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Last Name *</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="camp-input" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Age</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="camp-input" min="1" max="18" />
            </div>
          </div>

          {/* Communication Style */}
          <div className="space-y-3">
            <h2 className="font-heading text-lg text-gray-700 border-b-2 border-yellow-400 pb-1">Communication Style</h2>
            <p className="text-sm text-gray-500">Select all that apply</p>
            <div className="space-y-2">
              {COMM_OPTIONS.map((opt) => (
                <label key={opt.key} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${communicationStyles.includes(opt.key) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="checkbox" checked={communicationStyles.includes(opt.key)} onChange={() => toggleComm(opt.key)} className="w-5 h-5 accent-blue-500 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {communicationStyles.includes('aac') && (
              <div className="bg-blue-50 border-2 border-blue-200 p-3 rounded-xl text-sm text-blue-700 font-semibold">
                If your child uses an AAC device, please bring it to camp so our team can support its use!
              </div>
            )}
          </div>

          {/* Medical & Behavioral */}
          <div className="space-y-3">
            <h2 className="font-heading text-lg text-gray-700 border-b-2 border-yellow-400 pb-1">Medical & Behavioral</h2>

            <DynamicList label="Allergies" items={allergies} setItems={setAllergies} placeholder={(i) => `Allergy ${i + 1} (e.g. Peanuts)`} addLabel="Add Allergy" borderColor="red" />
            <DynamicList label="Behaviors" items={behaviors} setItems={setBehaviors} placeholder={(i) => `Behavior ${i + 1} (e.g. Aggression)`} addLabel="Add Behavior" borderColor="yellow" />

            {/* Safety alerts */}
            <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-200">
              <input type="checkbox" id="elopement" checked={elopementRisk} onChange={(e) => setElopementRisk(e.target.checked)} className="w-5 h-5 accent-red-500" />
              <label htmlFor="elopement" className="text-sm font-bold text-red-700">Elopement Risk — May attempt to leave the area</label>
            </div>
            <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-200">
              <input type="checkbox" id="onetoone" checked={oneToOne} onChange={(e) => setOneToOne(e.target.checked)} className="w-5 h-5 accent-red-500" />
              <label htmlFor="onetoone" className="text-sm font-bold text-red-700">1:1 Supervision Needed</label>
            </div>
            <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-200">
              <input type="checkbox" id="pica" checked={pica} onChange={(e) => setPica(e.target.checked)} className="w-5 h-5 accent-red-500" />
              <label htmlFor="pica" className="text-sm font-bold text-red-700">PICA — May attempt to eat non-food items</label>
            </div>
            <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-200">
              <input type="checkbox" id="epipen" checked={epiPen} onChange={(e) => setEpiPen(e.target.checked)} className="w-5 h-5 accent-red-500" />
              <label htmlFor="epipen" className="text-sm font-bold text-red-700">Epi-Pen Required</label>
            </div>
          </div>

          {/* Reinforcers & Dislikes */}
          <div className="space-y-3">
            <h2 className="font-heading text-lg text-gray-700 border-b-2 border-yellow-400 pb-1">Reinforcers & Dislikes</h2>
            <DynamicList label="Reinforcers" items={reinforcers} setItems={setReinforcers} placeholder={(i) => `Reinforcer ${i + 1} (e.g. iPad, bubbles)`} addLabel="Add Reinforcer" borderColor="green" />
            <DynamicList label="Dislikes / Aversions" items={dislikes} setItems={setDislikes} placeholder={(i) => `Dislike ${i + 1} (e.g. loud noises)`} addLabel="Add Dislike" borderColor="gray" />
          </div>

          {/* Diet */}
          <div className="space-y-3">
            <h2 className="font-heading text-lg text-gray-700 border-b-2 border-yellow-400 pb-1">Diet Restrictions</h2>
            <div className="flex flex-wrap gap-2">
              {DIET_PRESETS.map((d) => (
                <button key={d} type="button" onClick={() => toggleDietPreset(d)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${dietRestrictions.includes(d) ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'}`}>
                  {d}
                </button>
              ))}
            </div>
            <DynamicList label="Other Diet Restrictions" items={customDiet} setItems={setCustomDiet} placeholder={(i) => `Custom restriction ${i + 1}`} addLabel="Add Restriction" borderColor="gray" />
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <h2 className="font-heading text-lg text-gray-700 border-b-2 border-yellow-400 pb-1">Permissions</h2>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <input type="checkbox" id="toileting" checked={toiletingHelp} onChange={(e) => setToiletingHelp(e.target.checked)} className="w-5 h-5 accent-blue-500" />
              <label htmlFor="toileting" className="text-sm font-bold text-gray-700">Toileting help allowed</label>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <input type="checkbox" id="pictures" checked={picturesAllowed} onChange={(e) => setPicturesAllowed(e.target.checked)} className="w-5 h-5 accent-blue-500" />
              <label htmlFor="pictures" className="text-sm font-bold text-gray-700">Pictures allowed</label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Additional Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="camp-input" rows={2} placeholder="Any other important information..." />
          </div>

          {/* Caregivers */}
          <div className="space-y-3">
            <h2 className="font-heading text-lg text-gray-700 border-b-2 border-yellow-400 pb-1">Authorized Pickup / Caregivers *</h2>
            <p className="text-sm text-gray-500">Who is authorized to drop off and pick up this child?</p>
            {caregivers.map((cg, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-500">Caregiver {i + 1}</span>
                  {caregivers.length > 1 && <button type="button" onClick={() => removeCaregiver(i)} className="text-red-500 text-xs font-bold hover:underline">Remove</button>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="First name *" value={cg.firstName} onChange={(e) => updateCaregiver(i, 'firstName', e.target.value)} className="camp-input !py-2" required />
                  <input type="text" placeholder="Last name" value={cg.lastName} onChange={(e) => updateCaregiver(i, 'lastName', e.target.value)} className="camp-input !py-2" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Relationship (e.g. Mother)" value={cg.relationship} onChange={(e) => updateCaregiver(i, 'relationship', e.target.value)} className="camp-input !py-2 text-sm" />
                  <input type="tel" placeholder="(555) 555-5555" value={cg.phone} onChange={(e) => updateCaregiver(i, 'phone', e.target.value)} className="camp-input !py-2 text-sm" />
                </div>
              </div>
            ))}
            <button type="button" onClick={addCaregiver} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold text-sm hover:border-blue-400 hover:text-blue-500 transition-all">
              + Add Another Caregiver
            </button>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-camp btn-camp-green flex-1">Add Camper</button>
            <button type="button" onClick={() => navigate('/children')} className="btn-camp flex-1 !bg-gray-400">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
