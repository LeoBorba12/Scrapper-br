import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function MobileBottomSheet({ isOpen, onClose, title, subtitle, children }) {
  // Bloquear rolagem do body quando o drawer estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fechar com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        animation: 'fadeIn 180ms ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxHeight: '88vh',
          backgroundColor: 'var(--surface-card)',
          borderTop: '1px solid var(--border-subtle)',
          borderTopLeftRadius: '22px',
          borderTopRightRadius: '22px',
          boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUp 240ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Puxador Tátil (Drag Handle) */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '12px',
            paddingBottom: '6px',
            cursor: 'grab'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '5px',
              borderRadius: '9999px',
              backgroundColor: 'var(--border-strong)',
              opacity: 0.8
            }}
          />
        </div>

        {/* Cabeçalho do Drawer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 20px 14px 20px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0
              }}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-secondary)',
                  margin: '2px 0 0 0'
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="touch-tactile"
            aria-label="Fechar gaveta"
            style={{
              minWidth: '40px',
              minHeight: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo com rolagem touch nativa */}
        <div
          style={{
            padding: '18px 20px 32px 20px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
