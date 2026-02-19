'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  return (
    <>
      <div className={cn('detail-panel-overlay', open && 'open')} onClick={onClose} />
      <div className={cn('detail-panel', open && 'open')}>
        <div className="detail-panel-header">
          {title && <span className="t-sub">{title}</span>}
          <button className="btn-icon btn-icon-sm" onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="detail-panel-body">{children}</div>
        {footer && <div className="detail-panel-footer">{footer}</div>}
      </div>
    </>
  );
}
