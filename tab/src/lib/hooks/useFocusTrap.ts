/**
 * 焦点陷阱 Hook
 * 确保 Tab 键只在弹窗内循环，不会跳到背景元素
 */

import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector)
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: 如果在第一个元素，跳到最后一个
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: 如果在最后一个元素，跳到第一个
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // 自动聚焦到第一个可聚焦元素
    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector)
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}
