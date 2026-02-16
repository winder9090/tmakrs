/**
 * 添加快捷方式弹窗组件
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Link, Type } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';
import { useScrollLock } from '@/lib/hooks/useScrollLock';
import { Z_INDEX } from '../../constants/z-index';

interface AddShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string, title: string) => void;
  groupName?: string;
}

export function AddShortcutModal({ isOpen, onClose, onAdd, groupName }: AddShortcutModalProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // 焦点陷阱和滚动锁定
  const dialogRef = useFocusTrap(isOpen);
  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setError('');
    if (!url.trim()) {
      setError(t('error_enter_url'));
      return;
    }
    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(fullUrl);
      const domain = new URL(fullUrl).hostname;
      const finalTitle = title.trim() || domain;
      onAdd(fullUrl, finalTitle);
      setUrl('');
      setTitle('');
      onClose();
    } catch {
      setError(t('error_invalid_url'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setUrl('');
      setTitle('');
      setError('');
    }, 150);
  };

  return createPortal(
    <div 
      className={`fixed inset-0 flex items-center justify-center transition-all duration-150 ${
        isVisible ? 'bg-black/60 opacity-100' : 'bg-transparent opacity-0'
      }`}
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* 弹窗内容 */}
      <div 
        ref={dialogRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-[400px] max-w-[90vw] transition-all duration-150 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
      >
        <div className="glass-modal rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 id="modal-title" className="text-lg font-medium text-white">
              {t('modal_add_shortcut')}
              {groupName && <span className="ml-2 text-sm text-white/50">{t('modal_add_shortcut_to', groupName)}</span>}
            </h3>
            <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label={t('options_close')}>
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-white/60 mb-2">
                <Link className="w-4 h-4" />
                {t('label_url')}
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://example.com"
                className="w-full bg-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none border border-white/20 focus:border-blue-500/50 placeholder:text-white/30 transition-colors"
                autoFocus
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-white/60 mb-2">
                <Type className="w-4 h-4" />
                {t('label_name')} <span className="text-white/30">{t('label_optional')}</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('placeholder_auto_domain')}
                className="w-full bg-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none border border-white/20 focus:border-blue-500/50 placeholder:text-white/30 transition-colors"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 text-sm transition-colors"
            >
              {t('btn_cancel')}
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-xl bg-blue-500/80 hover:bg-blue-500 text-white text-sm transition-colors"
            >
              {t('btn_add')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
