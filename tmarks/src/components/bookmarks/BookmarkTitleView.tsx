import { useMemo, useRef } from 'react'
import type { Bookmark } from '@/lib/types'
import { useRecordClick } from '@/hooks/useBookmarks'

interface BookmarkTitleViewProps {
  bookmarks: Bookmark[]
  onEdit?: (bookmark: Bookmark) => void
  readOnly?: boolean
  batchMode?: boolean
  selectedIds?: string[]
  onToggleSelect?: (id: string) => void
}

export function BookmarkTitleView({
  bookmarks,
  onEdit,
  readOnly = false,
  batchMode = false,
  selectedIds = [],
  onToggleSelect,
}: BookmarkTitleViewProps) {
  return (
    <div className="columns-1 sm:columns-2 xl:columns-4 gap-2.5 sm:gap-3">
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} className="break-inside-avoid mb-2.5 sm:mb-3">
          <TitleOnlyCard
            bookmark={bookmark}
            onEdit={onEdit ? () => onEdit(bookmark) : undefined}
            readOnly={readOnly}
            batchMode={batchMode}
            isSelected={selectedIds.includes(bookmark.id)}
            onToggleSelect={onToggleSelect}
          />
        </div>
      ))}
    </div>
  )
}

interface TitleOnlyCardProps {
  bookmark: Bookmark
  onEdit?: () => void
  readOnly?: boolean
  batchMode?: boolean
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
}

function TitleOnlyCard({
  bookmark,
  onEdit,
  readOnly = false,
  batchMode = false,
  isSelected = false,
  onToggleSelect,
}: TitleOnlyCardProps) {
  const recordClick = useRecordClick()
  const hasEditClickRef = useRef(false)
  const domain = useMemo(() => {
    try {
      return new URL(bookmark.url).hostname
    } catch {
      return bookmark.url.replace(/^https?:\/\//i, '').split('/')[0] || bookmark.url
    }
  }, [bookmark.url])

  const handleVisit = () => {
    if (!readOnly) {
      recordClick.mutate(bookmark.id)
    }
    window.open(bookmark.url, '_blank', 'noopener,noreferrer')
  }

  const handleCardClick = () => {
    if (batchMode && onToggleSelect) {
      onToggleSelect(bookmark.id)
    } else {
      handleVisit()
    }
  }

  return (
    <div className="relative group">
      <div className={`rounded-xl border border-border/70 bg-card/95 backdrop-blur-sm shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 ${
        batchMode && isSelected ? 'ring-2 ring-primary' : ''
      }`}>
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-primary/4 via-transparent to-secondary/8 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* 批量选择复选框 */}
        {batchMode && onToggleSelect && (
          <div className="absolute top-3 left-3 z-10">
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

        {!!onEdit && !readOnly && !batchMode && (
          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              ;(event.nativeEvent as MouseEvent).stopImmediatePropagation?.()
            }}
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              ;(event.nativeEvent as MouseEvent).stopImmediatePropagation?.()
              hasEditClickRef.current = true
              setTimeout(() => {
                hasEditClickRef.current = false
              }, 0)
              onEdit()
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-xl border border-white/20 bg-card/80 hover:bg-muted/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
            title="编辑"
          >
            <svg className="w-4 h-4 text-base-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}

        <div className="relative z-10 px-5 py-4 space-y-2 pointer-events-none">
          <button
            type="button"
            onClick={(event) => {
              if (hasEditClickRef.current) {
                hasEditClickRef.current = false
                event.preventDefault()
                return
              }
              handleCardClick()
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleCardClick()
              }
            }}
            className="pointer-events-auto inline-flex max-w-full text-left text-sm font-semibold leading-snug text-foreground line-clamp-2 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-md pr-12"
          >
            {bookmark.title?.trim() || bookmark.url}
          </button>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto block text-xs text-muted-foreground/70 truncate hover:text-primary"
            onClick={(e) => {
              if (batchMode) {
                e.preventDefault()
                onToggleSelect?.(bookmark.id)
              } else if (!readOnly) {
                recordClick.mutate(bookmark.id)
              }
            }}
          >
            {domain}
          </a>
        </div>
      </div>
    </div>
  )
}
