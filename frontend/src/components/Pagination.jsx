export default function Pagination({ page, totalPages, totalItems, startIndex, endIndex, onPrev, onNext, label = 'items', variant = 'onBg' }) {
  if (totalPages <= 1) return null
  const onCard = variant === 'onCard'
  const pageTextClass = onCard ? 'text-gray-700' : 'text-white drop-shadow'
  const countTextClass = onCard ? 'text-gray-500' : 'text-white/80'
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="btn-camp btn-camp-blue !text-xs !py-2 !px-4 disabled:opacity-40 disabled:pointer-events-none"
          disabled={page <= 1}
          onClick={onPrev}
        >
          ← Prev
        </button>
        <span className={`font-heading text-sm ${pageTextClass}`}>Page {page} of {totalPages}</span>
        <button
          type="button"
          className="btn-camp btn-camp-blue !text-xs !py-2 !px-4 disabled:opacity-40 disabled:pointer-events-none"
          disabled={page >= totalPages}
          onClick={onNext}
        >
          Next →
        </button>
      </div>
      <p className={`text-xs font-semibold text-center mt-1 ${countTextClass}`}>
        Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems} {label}
      </p>
    </div>
  )
}
