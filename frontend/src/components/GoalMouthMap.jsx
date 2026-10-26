import React, { useState, useMemo } from 'react';
import { Target, Award, ShieldAlert } from 'lucide-react';

/**
 * GoalMouthMap - Mapeamento da Baliza (Trave Oficial 7.32m x 2.44m)
 * Exibe a zona exata de destino dos chutes e gols do atleta na frente da rede.
 */
export default function GoalMouthMap({ shotmap = [], posicao = 'Atacante' }) {
  const [hoveredTarget, setHoveredTarget] = useState(null);

  // ============================================================================
  // 1. FALLBACK INTELIGENTE (Caso a base SQLite ainda não possua dados de gol-mouth)
  // ============================================================================
  const finalizacoesBaliza = useMemo(() => {
    return (shotmap || []).filter(
      (s) => s && s.gol_mouth_y != null && s.gol_mouth_z != null
    );
  }, [shotmap]);

  // Estatísticas do painel da trave
  const statsBaliza = useMemo(() => {
    const total = finalizacoesBaliza.length;
    const gols = finalizacoesBaliza.filter((s) => s.resultado === 'goal').length;
    const noAlvo = finalizacoesBaliza.filter((s) => s.resultado === 'goal' || s.resultado === 'save').length;
    const eficiencia = total > 0 ? Math.round((gols / total) * 100) : 0;
    return { total, gols, noAlvo, eficiencia };
  }, [finalizacoesBaliza]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* CABEÇALHO DO PAINEL */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent)' }}>
            🥅 Visão Frontal da Baliza (7.32 × 2.44m)
          </span>
          <h4 className="font-editorial" style={{ margin: '2px 0 0 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Cantos Alvo & Eficiência de Finalização
          </h4>
        </div>
        <span className="pill-neutral" style={{ fontSize: '0.7rem' }}>
          {statsBaliza.gols} gols na trave
        </span>
      </div>

      {/* CONTAINER DO SVG DA TRAVE */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-panel)',
          padding: '16px 20px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <svg
          viewBox="0 0 120 70"
          style={{ width: '100%', maxWidth: '380px', height: 'auto', display: 'block' }}
          role="img"
          aria-label="Esquema frontal da baliza de futebol com os locais exatos dos remates"
        >
          <defs>
            {/* Padrão de rede da trave em grade cruzada */}
            <pattern id="net-grid" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M 6 0 L 0 0 0 6" fill="none" stroke="var(--border-subtle)" strokeWidth="0.35" opacity="0.65" />
            </pattern>
          </defs>

          {/* ================= 1. FUNDO DE REDE DA BALIZA ================= */}
          <rect
            x="10"
            y="5"
            width="100"
            height="55"
            rx="1"
            fill="var(--surface-panel)"
            stroke="var(--border-strong)"
            strokeWidth="1.2"
          />
          <rect
            x="10"
            y="5"
            width="100"
            height="55"
            fill="url(#net-grid)"
          />

          {/* ================= 2. ESTRUTURA DOS POSTES E TRAVE ================= */}
          {/* Poste Esquerdo */}
          <rect x="7" y="2" width="3" height="60" rx="0.8" fill="var(--text-primary)" opacity="0.85" />
          {/* Poste Direito */}
          <rect x="110" y="2" width="3" height="60" rx="0.8" fill="var(--text-primary)" opacity="0.85" />
          {/* Travessão Superior */}
          <rect x="7" y="2" width="106" height="3.5" rx="0.8" fill="var(--text-primary)" opacity="0.85" />

          {/* Linha da Base do Gol (Relvado) */}
          <line x1="5" y1="62" x2="115" y2="62" stroke="var(--border-strong)" strokeWidth="1.5" />

          {/* ================= 3. MARCADORES DE FINALIZAÇÕES NA REDE ================= */}
          {finalizacoesBaliza.map((item, idx) => {
            const rawY = Number(item.gol_mouth_y) ?? 50;
            const rawZ = Number(item.gol_mouth_z) ?? 50;

            const cx = 12 + (rawY / 100) * 96;
            const cy = 56 - (rawZ / 100) * 48;

            const isGol = item.resultado === 'goal';
            const isSalvo = item.resultado === 'save';

            const corFill = isGol
              ? 'var(--positive)'
              : isSalvo
              ? 'var(--accent)'
              : 'var(--negative)';

            return (
              <g
                key={item.id_evento || idx}
                style={{ cursor: 'pointer', transition: 'transform 150ms ease' }}
                onMouseEnter={() => setHoveredTarget({ ...item, cx, cy })}
                onMouseLeave={() => setHoveredTarget(null)}
              >
                {isGol && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="4.5"
                    fill="none"
                    stroke="var(--positive)"
                    strokeWidth="0.6"
                    strokeDasharray="1,1"
                  />
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r="2.8"
                  fill={corFill}
                  fillOpacity="0.9"
                  stroke="var(--surface-card)"
                  strokeWidth="0.6"
                />
              </g>
            );
          })}
        </svg>

        {/* TOOLTIP FLUTUANTE DA BALIZA */}
        {hoveredTarget && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              maxWidth: 'calc(100% - 24px)',
              backgroundColor: 'var(--surface-panel)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-control)',
              padding: '6px 12px',
              boxShadow: 'var(--shadow-editorial)',
              fontSize: '0.74rem',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {hoveredTarget.resultado === 'goal' ? '⚽ GOL NO CANTO' : hoveredTarget.resultado === 'save' ? '🧤 Defesa do Goleiro' : '❌ Para Fora / Trave'}
            </span>
            <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>
              (xG: <strong className="font-mono" style={{ color: 'var(--accent)' }}>{Number(hoveredTarget.xg || 0.1).toFixed(2)}</strong>)
            </span>
          </div>
        )}
      </div>

      {/* LEGENDA INFERIOR E MÉTRICAS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '0.72rem',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--surface-raised)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-control)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--positive)', display: 'inline-block' }} />
            Gols ({statsBaliza.gols})
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'inline-block' }} />
            Defendidos
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--negative)', display: 'inline-block' }} />
            Trave/Fora
          </span>
        </div>

        <div className="font-mono tabular-nums" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          Taxa de Conversão na Rede: <span style={{ color: 'var(--positive)' }}>{statsBaliza.eficiencia}%</span>
        </div>
      </div>
    </div>
  );
}
