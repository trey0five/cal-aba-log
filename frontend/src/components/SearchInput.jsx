export default function SearchInput({ value, onChange, placeholder = 'Search by name…', autoFocus = false, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        className="camp-input !py-2 pr-9 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  )
}
