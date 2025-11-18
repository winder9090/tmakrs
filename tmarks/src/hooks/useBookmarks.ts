import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookmarksService } from '@/services/bookmarks'
import type {
  BookmarkQueryParams,
  CreateBookmarkRequest,
  UpdateBookmarkRequest,
  BatchActionRequest,
} from '@/lib/types'

export const BOOKMARKS_QUERY_KEY = 'bookmarks'

/**
 * 获取书签列表
 */
export function useBookmarks(params?: BookmarkQueryParams, options?: { staleTime?: number; gcTime?: number }) {
  return useQuery({
    queryKey: [BOOKMARKS_QUERY_KEY, params],
    queryFn: () => bookmarksService.getBookmarks(params),
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5分钟默认过期时间
    gcTime: options?.gcTime || 10 * 60 * 1000, // 10分钟缓存时间
    refetchOnWindowFocus: false, // 禁止窗口聚焦时自动刷新
  })
}

/**
 * 无限滚动获取书签列表
 */
export function useInfiniteBookmarks(
  params?: BookmarkQueryParams,
  options?: { staleTime?: number; cacheTime?: number }
) {
  return useInfiniteQuery({
    queryKey: [BOOKMARKS_QUERY_KEY, params],
    queryFn: ({ pageParam }) =>
      bookmarksService.getBookmarks({
        ...params,
        page_cursor: typeof pageParam === 'string' ? pageParam : undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.meta?.has_more ? lastPage.meta.next_cursor : undefined),
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    gcTime: options?.cacheTime ?? 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * 创建书签
 */
export function useCreateBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBookmarkRequest) => bookmarksService.createBookmark(data),
    onSuccess: async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY] })
      } catch (error) {
        console.error('Failed to invalidate queries:', error)
      }
    },
  })
}

/**
 * 更新书签
 */
export function useUpdateBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookmarkRequest }) =>
      bookmarksService.updateBookmark(id, data),
    onSuccess: async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY] })
      } catch (error) {
        console.error('Failed to invalidate queries:', error)
      }
    },
  })
}

/**
 * 删除书签
 */
export function useDeleteBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bookmarksService.deleteBookmark(id),
    onSuccess: async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY] })
      } catch (error) {
        console.error('Failed to invalidate queries:', error)
      }
    },
  })
}

/**
 * 恢复书签
 */
export function useRestoreBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => bookmarksService.restoreBookmark(id),
    onSuccess: async () => {
      try {
        await queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY] })
      } catch (error) {
        console.error('Failed to invalidate queries:', error)
      }
    },
  })
}

/**
 * 记录书签点击
 */
export function useRecordClick() {
  return useMutation({
    mutationFn: (id: string) => bookmarksService.recordClick(id),
  })
}

/**
 * 批量操作书签
 */
export function useBatchAction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BatchActionRequest) => bookmarksService.batchAction(data),
    onSuccess: async () => {
      // 使用 catch 来防止 invalidateQueries 的错误影响 mutation 结果
      try {
        await queryClient.invalidateQueries({ queryKey: [BOOKMARKS_QUERY_KEY] })
      } catch (error) {
        console.error('Failed to invalidate queries:', error)
        // 即使缓存失效失败也不应该让操作显示为失败
      }
    },
  })
}
