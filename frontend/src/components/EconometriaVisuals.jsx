import React, { useState } from 'react';

export function MetricTooltip({ label, what, how, refText, align = 'left' }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        cursor: 'help',
        borderBottom: '1px dashed var(--text-muted)',
        paddingBottom: '1px'
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
      tabIndex={0}
      role="button"
      aria-label={`Explicação de ${label}`}
    >
      <span>{label}</span>
      <span
        className="font-mono"
        style={{
          fontSize: '0.62rem',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--accent)',
          fontWeight: 700
        }}
      >
        ?
      </span>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            ...(align === 'right' ? { right: 0 } : { left: 0 }),
            width: '250px',
            zIndex: 120,
            backgroundColor: '#0F141A',
            color: '#F1F5F9',
            border: '1px solid var(--border-strong)',
            borderRadius: '6px',
            padding: '10px 12px',
            textAlign: 'left',
            fontWeight: 400,
            textTransform: 'none',
            letterSpacing: 'normal',
            lineHeight: 1.45,
            fontSize: '0.74rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: 700, color: '#22C55E', marginBottom: '4px', fontSize: '0.76rem' }}>{label}</div>
          <div style={{ marginBottom: '4px' }}><strong style={{ color: '#CBD5E1' }}>O que é:</strong> {what}</div>
          <div style={{ marginBottom: refText ? '4px' : 0 }}><strong style={{ color: '#CBD5E1' }}>Como ler:</strong> {how}</div>
          {refText && (
            <div style={{ color: '#94A3B8', fontSize: '0.7rem', borderTop: '1px solid #252F3D', paddingTop: '4px', marginTop: '4px' }}>
              Ref.: {refText}
            </div>
          )}
        </div>
      )}
    </span>
  );
}

export function ScoreBar({ value }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const color = pct >= 80 ? 'var(--positive)' : pct >= 60 ? 'var(--accent)' : 'var(--negative)';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
      <div style={{ width: '54px', height: '6px', borderRadius: '999px', backgroundColor: 'var(--surface-raised)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '999px' }} />
      </div>
      <span className="font-mono" style={{ fontWeight: 800, color, minWidth: '34px', textAlign: 'right' }}>
        {pct.toFixed(1)}
      </span>
    </div>
  );
}

export function RapmDivergingBar({ value, maxAbs = 0.40 }) {
  const v = Number(value) || 0;
  const pct = Math.min(100, (Math.abs(v) / Math.max(maxAbs, 0.05)) * 100);
  const isPos = v >= 0;
  const color = isPos ? 'var(--positive)' : 'var(--negative)';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
      <div style={{ width: '76px', height: '8px', display: 'grid', gridTemplateColumns: '1fr 1px 1fr', alignItems: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', height: '6px', backgroundColor: 'var(--surface-raised)', borderRadius: '3px 0 0 3px', overflow: 'hidden' }}>
          {!isPos && <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color }} />}
        </div>
        <div style={{ width: '1px', height: '10px', backgroundColor: 'var(--border-strong)' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-start', height: '6px', backgroundColor: 'var(--surface-raised)', borderRadius: '0 3px 3px 0', overflow: 'hidden' }}>
          {isPos && <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color }} />}
        </div>
      </div>
      <span className="font-mono" style={{ fontWeight: 800, color, minWidth: '52px', textAlign: 'right' }}>
        {isPos ? `+${v.toFixed(3)}` : v.toFixed(3)}
      </span>
    </div>
  );
}

export function ClubXptsScatterChart({ clubes = [] }) {
  const [hovered, setHovered] = useState(null);
  if (!clubes || clubes.length === 0) return null;

  const width = 680;
  const height = 270;
  const pad = { top: 22, right: 24, bottom: 36, left: 44 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const allVals = clubes.flatMap((c) => [Number(c.xpts) || 0, Number(c.pontos) || 0]);
  const minVal = Math.max(0, Math.floor((Math.min(...allVals) - 4) / 5) * 5);
  const maxVal = Math.ceil((Math.max(...allVals) + 4) / 5) * 5;
  const span = Math.max(maxVal - minVal, 10);

  const sx = (v) => pad.left + ((v - minVal) / span) * plotW;
  const sy = (v) => pad.top + plotH - ((v - minVal) / span) * plotH;

  const ticks = [minVal, Math.round(minVal + span * 0.33), Math.round(minVal + span * 0.66), maxVal];

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
        <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
          Mapa Visual: <strong>xPTS (Eixo X)</strong> vs <strong>Pontos Reais (Eixo Y)</strong> — passe o mouse nos clubes
        </div>
        <div className="font-mono" style={{ display: 'flex', gap: '12px', fontSize: '0.7rem' }}>
          <span style={{ color: 'var(--positive)' }}>● Acima da linha = Eficiência / Sorte</span>
          <span style={{ color: 'var(--negative)' }}>● Abaixo da linha = Subvalorizado</span>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto', backgroundColor: 'var(--surface-sidebar)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-control)', padding: '8px' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxHeight: '280px', display: 'block' }}>
          {/* Grid */}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} y1={sy(t)} x2={width - pad.right} y2={sy(t)} stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <line x1={sx(t)} y1={pad.top} x2={sx(t)} y2={height - pad.bottom} stroke="var(--border-subtle)" strokeDasharray="3 3" />
              <text x={pad.left - 8} y={sy(t) + 3} textAnchor="end" fill="var(--text-muted)" fontSize="10" fontFamily="JetBrains Mono, monospace">{t}</text>
              <text x={sx(t)} y={height - pad.bottom + 14} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="JetBrains Mono, monospace">{t}</text>
            </g>
          ))}

          {/* Diagonal y = x (alinhado ao esperado) */}
          <line x1={sx(minVal)} y1={sy(minVal)} x2={sx(maxVal)} y2={sy(maxVal)} stroke="var(--text-muted)" strokeWidth="1.2" strokeDasharray="5 4" />
          <text x={pad.left + 8} y={pad.top + 14} fill="#22C55E" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono, monospace">ACIMA DO ESPERADO (+ΔxPTS)</text>
          <text x={width - pad.right - 8} y={height - pad.bottom - 8} textAnchor="end" fill="#F59E0B" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono, monospace">SUBVALORIZADO (-ΔxPTS)</text>

          {/* Rótulos dos eixos */}
          <text x={pad.left + plotW / 2} y={height - 4} textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontWeight="700">Pontos Esperados (xPTS)</text>
          <text x={12} y={pad.top + plotH / 2} textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontWeight="700" transform={`rotate(-90 12 ${pad.top + plotH / 2})`}>Pontos Reais</text>

          {/* Pontos dos 20 clubes */}
          {clubes.map((c) => {
            const cx = sx(Number(c.xpts) || 0);
            const cy = sy(Number(c.pontos) || 0);
            const isOver = (Number(c.delta_xpts) || 0) >= 0;
            const isHov = hovered?.clube_id_canonico === c.clube_id_canonico;
            const fill = isOver ? '#22C55E' : '#F59E0B';
            return (
              <g
                key={c.clube_id_canonico}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(c)}
                onMouseLeave={() => setHovered(null)}
              >
                <circle cx={cx} cy={cy} r={isHov ? 7 : 5} fill={fill} stroke="#0B0E11" strokeWidth="1.5" />
                <text x={cx + 7} y={cy + 3} fill={isHov ? '#FFFFFF' : 'var(--text-secondary)'} fontSize={isHov ? '10' : '9'} fontWeight={isHov ? '800' : '600'} fontFamily="JetBrains Mono, monospace">
                  {c.sigla || (c.nome || '').slice(0, 3).toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {hovered && (
        <div
          className="font-mono"
          style={{
            marginTop: '8px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-control)',
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border-strong)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.76rem'
          }}
        >
          <strong style={{ color: 'var(--text-primary)' }}>#{hovered.rank_econometrico} {hovered.nome}</strong>
          <span>Pts: <strong>{hovered.pontos}</strong> | xPTS: <strong>{hovered.xpts.toFixed(1)}</strong> | Δ: <strong style={{ color: hovered.delta_xpts >= 0 ? 'var(--positive)' : 'var(--negative)' }}>{hovered.delta_xpts >= 0 ? `+${hovered.delta_xpts.toFixed(1)}` : hovered.delta_xpts.toFixed(1)}</strong></span>
          <span>Saldo xG: <strong>{hovered.saldo_xg >= 0 ? `+${hovered.saldo_xg.toFixed(1)}` : hovered.saldo_xg.toFixed(1)}</strong> | PPDA: <strong>{hovered.ppda.toFixed(2)}</strong></span>
        </div>
      )}
    </div>
  );
}
