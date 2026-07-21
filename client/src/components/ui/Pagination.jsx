import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export default function Pagination({ page, totalPages, onChange, className }) {
  if (!totalPages || totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)

  return (
    <div className={cn('flex items-center justify-center gap-1.5', className)}>
      <button
        onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
        className="p-2 rounded-lg text-mist hover:text-paper hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-mist text-sm">…</span>}
          <button
            onClick={() => onChange(p)}
            className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-colors', p === page ? 'bg-current text-white' : 'text-mist hover:text-paper hover:bg-white/5')}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        className="p-2 rounded-lg text-mist hover:text-paper hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
