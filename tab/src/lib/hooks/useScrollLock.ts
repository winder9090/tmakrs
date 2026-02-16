/**
 * 滚动锁定 Hook
 * 弹窗打开时锁定背景滚动
 */

import { useEffect } from 'react';

export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    // 保存原始样式
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // 计算滚动条宽度
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // 锁定滚动
    document.body.style.overflow = 'hidden';
    
    // 如果有滚动条，添加 padding 防止内容跳动
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      // 恢复原始样式
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
}
