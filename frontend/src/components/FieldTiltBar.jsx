import React from 'react';
import { Target, Compass, Info, Flame, ShieldAlert } from 'lucide-react';
import ClubBadge from './ClubBadge';

/**
 * FieldTiltBar - Barra Visual de Domínio Territorial (Field Tilt) & Expected Goals (xG)
 * Estética Editorial 2026 (Areia, Carvão, Oliva, Terracota) em conformidade com WCAG 2.2 AA.
 */
export default function FieldTiltBar({
  mandante = 'Mandante',
  visitante = 'Visitante',
  xgMandante = 1.45,
  xgVisitante = 1.10,
  fieldTiltMandante = 55.0,
  fieldTiltVisitante = 45.0,
  dominio = 'Equilibrado',
  compact = false
}) {
  const mPct = Math.max(15, Math.min(85, Number(fieldTiltMandante) || 50));
  const vPct = 100 - mPct;

  const isMandanteDominante = mPct >= 56;
  const isVisitanteDominante = vPct >= 56;

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-control, 8px)',
        padding: compact ? '10px 12px' : '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
    >
      {/* HEADER: TÍTULO & PLACAR DE EXPECTED GOALS (xG) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.70rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              backgroundColor: 'var(--surface-page)',
              color: 'var(--accent)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-control)'
            }}
          >
            <Compass size={13} /> Field Tilt &bull; Domínio Territorial
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Pressão no último terço
          </span>
        </div>

        {/* PLACAR DE EXPECTED GOALS (xG) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--surface-page)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-control)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <span style={{ fontSize: '0.70rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
            Placar xG:
          </span>
          <span className="font-mono tabular-nums" style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {Number(xgMandante).toFixed(2)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>&times;</span> {Number(xgVisitante).toFixed(2)}
          </span>
        </div>
      </div>

      {/* RÓTULOS DOS TIMES E PORCENTAGENS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ClubBadge nome={mandante} size={18} />
          <span style={{ fontSize: '0.82rem', fontWeight: isMandanteDominante ? 700 : 600, color: 'var(--text-primary)' }}>
            {mandante}
          </span>
          <span className="font-mono tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent)' }}>
            {mPct.toFixed(1)}%
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="font-mono tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--secondary, #85573B)' }}>
            {vPct.toFixed(1)}%
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: isVisitanteDominante ? 700 : 600, color: 'var(--text-primary)' }}>
            {visitante}
          </span>
          <ClubBadge nome={visitante} size={18} />
        </div>
      </div>

      {/* BARRA VISUAL DE FIELD TILT DIVIDIDA */}
      <div
        style={{
          width: '100%',
          height: compact ? '8px' : '10px',
          backgroundColor: 'var(--surface-page)',
          borderRadius: '5px',
          overflow: 'hidden',
          display: 'flex',
          position: 'relative'
        }}
      >
        {/* LINHA CENTRAL NEUTRA 50% */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '2px',
            backgroundColor: 'var(--text-primary)',
            opacity: 0.25,
            zIndex: 2
          }}
        />

        {/* LADO MANDANTE (Oliva / Accent) */}
        <div
          style={{
            width: `${mPct}%`,
            height: '100%',
            backgroundColor: 'var(--accent, #5A673E)',
            transition: 'width 240ms ease'
          }}
          title={`${mandante}: ${mPct.toFixed(1)}% de ações ofensivas`}
        />

        {/* LADO VISITANTE (Terracota / Secondary) */}
        <div
          style={{
            width: `${vPct}%`,
            height: '100%',
            backgroundColor: 'var(--secondary, #85573B)',
            transition: 'width 240ms ease'
          }}
          title={`${visitante}: ${vPct.toFixed(1)}% de ações ofensivas`}
        />
      </div>

      {/* FOOTER INFORMATIVO & LEGENDA EDITORIAL */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {isMandanteDominante || isVisitanteDominante ? (
            <Flame size={13} color="var(--positive)" />
          ) : (
            <Info size={13} color="var(--text-muted)" />
          )}
          <span>{dominio || (isMandanteDominante ? `Maior volume no terço final para o ${mandante}` : isVisitanteDominante ? `Maior volume no terço final para o ${visitante}` : 'Pressão territorial equilibrada')}</span>
        </span>

        <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>
          *Mede passes e chances no terço final, isolando posse passiva
        </span>
      </div>
    </div>
  );
}
