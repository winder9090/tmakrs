/**
 * AI 配置预设保存弹窗
 */

import { t } from '@/lib/i18n';
import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';
import { useScrollLock } from '@/lib/hooks/useScrollLock';

interface PresetModalProps {
  isOpen: boolean;
  presetLabel: string;
  presetError: string | null;
  isSaving: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onChangeLabel: (label: string) => void;
}

export function PresetModal({
  isOpen,
  presetLabel,
  presetError,
  isSaving,
  onClose,
  onConfirm,
  onChangeLabel,
}: PresetModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 焦点陷阱和滚动锁定
  const modalRef = useFocusTrap(isOpen);
  useScrollLock(isOpen);

  // 动画和焦点管理
  useEffect(() => {
    if (isOpen) {
      // 触发入场动画
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
      // 聚焦输入框
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSaving) {
      onConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 150);
  };

  return createPortal(
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm transition-opacity duration-150 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ margin: 0 }}
      onClick={handleClose}
    >
      <div 
        ref={modalRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preset-modal-title"
        className={`relative w-full max-w-md overflow-hidden rounded-2xl border border-[color:var(--tab-options-modal-border)] bg-[color:var(--tab-options-modal-bg)] shadow-2xl transition-all duration-150 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ margin: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--tab-options-modal-topbar-from)] via-[var(--tab-options-modal-topbar-via)] to-[var(--tab-options-modal-topbar-to)]" />
        
        {/* 关闭按钮 - 绝对定位在右上角 */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-xl leading-none text-[var(--tab-options-modal-close-text)] transition-colors hover:border-[var(--tab-options-modal-close-hover-border)] hover:bg-[var(--tab-options-modal-close-hover-border)]/10 hover:text-[var(--tab-options-modal-close-hover-text)]"
          aria-label={t('options_close')}
        >
          ×
        </button>

        <div className="p-6 pt-10 space-y-6">
          <div>
            <h3 id="preset-modal-title" className="text-lg font-semibold text-[var(--tab-options-title)]">{t('options_save_config')}</h3>
            <p className="mt-1 text-sm text-[var(--tab-options-text)] pr-8">{t('options_save_config_desc')}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="preset-label-input" className="block text-sm font-medium text-[var(--tab-options-text)]">{t('options_config_name')}</label>
            <input
              ref={inputRef}
              id="preset-label-input"
              type="text"
              value={presetLabel}
              onChange={(e) => onChangeLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border border-[color:var(--tab-options-button-border)] bg-[color:var(--tab-options-card-bg)] px-3 py-2 text-[var(--tab-options-title)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-options-button-primary-bg)]"
              placeholder={t('options_config_name_placeholder')}
            />
          </div>

          {presetError && (
            <div className="rounded-lg border border-[color:var(--tab-options-danger-border)] bg-[color:var(--tab-options-danger-bg)] px-3 py-2 text-sm text-[var(--tab-options-danger-text)]">
              {presetError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="rounded-lg border border-[color:var(--tab-options-button-border)] px-4 py-2 text-sm font-medium text-[var(--tab-options-button-text)] transition-colors hover:bg-[var(--tab-options-button-hover-bg)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSaving || !presetLabel.trim()}
              className="rounded-lg bg-[var(--tab-options-button-primary-bg)] px-4 py-2 text-sm font-medium text-[var(--tab-options-button-primary-text)] shadow-sm transition-colors hover:bg-[var(--tab-options-button-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? t('btn_saving') : t('btn_confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
