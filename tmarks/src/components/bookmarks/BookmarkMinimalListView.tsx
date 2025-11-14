import type { Bookmark } from '@/lib/types'
import { useRecordClick } from '@/hooks/useBookmarks'

interface BookmarkMinimalListViewProps {
  bookmarks: Bookmark[]
  onEdit?: (bookmark: Bookmark) => void
  readOnly?: boolean
  batchMode?: boolean
  selectedIds?: string[]
  onToggleSelect?: (id: string) => void
}

export function BookmarkMinimalListView({
  bookmarks,
  onEdit,
  readOnly = false,
  batchMode = false,
  selectedIds = [],
  onToggleSelect,
}: BookmarkMinimalListViewProps) {
  return (
    <div className="rounded-xl border border-base-300 overflow-hidden">
      <div className={`grid ${batchMode ? 'grid-cols-[auto_minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_auto]' : 'grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_auto]'} gap-4 px-4 py-2 text-xs uppercase tracking-wide text-base-content/50 bg-base-200`}>
        {batchMode && <span></span>}
        <span>标题</span>
        <span>网址</span>
        <span>备注</span>
        <span className="text-right">{readOnly ? '' : '操作'}</span>
      </div>
      <div>
        {bookmarks.map((bookmark) => (
          <MinimalRow
            key={bookmark.id}
            bookmark={bookmark}
            onEdit={onEdit ? () => onEdit(bookmark) : undefined}
            readOnly={readOnly}
            batchMode={batchMode}
            isSelected={selectedIds.includes(bookmark.id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    </div>
  )
}

interface MinimalRowProps {
  bookmark: Bookmark
  onEdit?: () => void
  readOnly?: boolean
  batchMode?: boolean
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
}

function MinimalRow({
  bookmark,
  onEdit,
  readOnly = false,
  batchMode = false,
  isSelected = false,
  onToggleSelect,
}: MinimalRowProps) {
  const recordClick = useRecordClick()

  const handleVisit = () => {
    if (!readOnly) {
      recordClick.mutate(bookmark.id)
    }
    window.open(bookmark.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={`grid ${batchMode ? 'grid-cols-[auto_minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_auto]' : 'grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_auto]'} gap-4 px-4 py-3 text-sm items-center border-t border-base-200 first:border-t-0 hover:bg-base-200/60 ${
      batchMode && isSelected ? 'bg-primary/10' : ''
    }`}>
      {batchMode && onToggleSelect && (
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onToggleSelect(bookmark.id)
            }}
            className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border-2 border-border hover:border-primary'
            }`}
            title={isSelected ? '取消选择' : '选择'}
          >
            {isSelected && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={handleVisit}
        className="text-left font-medium truncate hover:text-primary"
        title={bookmark.title}
      >
        {bookmark.title || bookmark.url}
      </button>
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary truncate hover:underline"
        title={bookmark.url}
      >
        {bookmark.url}
      </a>
      <span className="text-xs text-base-content/70 truncate" title={bookmark.description || undefined}>
        {bookmark.description || '—'}
      </span>
      <div className="flex justify-end">
        {!!onEdit && !readOnly && !batchMode ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              onEdit()
            }}
            className="text-xs font-medium px-3 py-1 rounded-md bg-base-300 hover:bg-base-200 transition-colors"
          >
            编辑
          </button>
        ) : null}
      </div>
    </div>
  )
}
