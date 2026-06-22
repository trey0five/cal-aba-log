// Helpers for caregiver name handling. Names are typed into separate First/Last
// fields and combined for display; the phone number belongs in the Phone field.

// Drop tabs/newlines, collapse runs of whitespace, and trim. Guards against
// pasted contact blobs (which often contain tabs) leaking into the name.
export function cleanNamePart(s) {
  return (s || '').replace(/[\t\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
}

// Build a caregiver display name from first/last parts.
export function buildCaregiverName(first, last) {
  return `${cleanNamePart(first)} ${cleanNamePart(last)}`.trim()
}

// Returns an error string if any kept caregiver's name contains digits
// (i.e. a phone number was typed into a name field), otherwise null.
export function validateCaregiverNames(caregivers) {
  for (const c of caregivers) {
    if (/\d/.test(`${c.firstName || ''} ${c.lastName || ''}`)) {
      return 'Caregiver names can’t contain numbers — put the phone number in the Phone field.'
    }
  }
  return null
}
