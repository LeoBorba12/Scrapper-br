import React, { useState } from 'react';
import { getClubInfo } from '../utils/clubData';

/**
 * ClubBadge - Componente de Escudo Oficial de Clube de Futebol
 * 
 * Funcionalidades:
 * - Carrega o escudo oficial vetorizado/PNG em alta resolução via CDN (Wikimedia)
 * - Em caso de falha de rede ou clubes sem escudo catalogado, exibe monograma 
 *   tipográfico estilizado com as cores oficiais primárias do clube.
 * - Suporta tamanhos arbitrários (16px, 20px, 24px, 32px, 48px, etc.)
 * - Suporta exibição opcional do nome do time com tipografia alinhada.
 */
export default function ClubBadge({
  nome,
  size = 24,
  style = {},
  className = '',
  showName = false,
  textStyle = {},
  monogramOnly = false
}) {
  const [imgError, setImgError] = useState(false);
  const info = getClubInfo(nome);

  const hasImage = !monogramOnly && Boolean(info.badge) && !imgError;

  return (
    <span
      className={`club-badge-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        verticalAlign: 'middle',
        ...style
      }}
      title={info.fullName || nome || 'Clube'}
    >
      <span
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          borderRadius: size >= 32 ? '6px' : '4px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: hasImage ? 'transparent' : info.bg,
          color: info.text,
          border: hasImage ? 'none' : '1px solid var(--border-subtle)',
          boxShadow: size >= 32 ? 'var(--shadow-editorial)' : 'none',
          flexShrink: 0,
          position: 'relative'
        }}
      >
        {hasImage ? (
          <img
            src={info.badge}
            alt={info.fullName || nome || 'Escudo'}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        ) : (
          <span
            className="font-mono"
            style={{
              fontSize: `${Math.max(8, Math.round(size * 0.38))}px`,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              userSelect: 'none'
            }}
          >
            {info.sigla}
          </span>
        )}
      </span>

      {showName && (
        <span
          style={{
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontSize: size >= 32 ? '1rem' : '0.85rem',
            lineHeight: 1.2,
            ...textStyle
          }}
        >
          {nome}
        </span>
      )}
    </span>
  );
}
