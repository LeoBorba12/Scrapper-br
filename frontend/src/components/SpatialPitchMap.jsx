import React, { useState, useMemo } from 'react';
import { Flame, Target, Info } from 'lucide-react';

/**
 * SpatialPitchMap - Gramado Oficial FIFA (105x68m) com Heatmap e Shotmap (xG)
 * Projetado para a Arquitetura Editorial & Protagonista (Temas Areia e Carvão)
 */
export default function SpatialPitchMap({
  shotmap = [],
  heatmap = [],
  posicao = 'Atacante',
  resumo = {}
}) {
  const [modo, setModo] = useState('ambos'); // 'ambos' | 'shotmap' | 'heatmap'
  const [hoveredShot, setHoveredShot] = useState(null);

  // ============================================================================
  // 1. FALLBACK INTELIGENTE (Caso a rota ainda não retorne dados do scraper)
  // ============================================================================
  const dadosEspaciais = useMemo(() => {
    const chutesValidos = Array.isArray(shotmap) ? shotmap.filter(s => s && s.x_origem != null) : [];
    const calorValido = Array.isArray(heatmap) ? heatmap.filter(h => h && h.x != null) : [];

    return {
      chutes: chutesValidos,
      calor: calorValido,
      isSimulado: false,
      temDados: chutesValidos.length > 0 || calorValido.length > 0
    };
  }, [shotmap, heatmap]);

  // ============================================================================
  // 2. CÁLCULO DA GRADE DE DENSIDADE (BINNING 12x8 PARA O HEATMAP)
  // ============================================================================
  const gradeCalor = useMemo(() => {
    const cols = 12;
    const rows = 8;
    const cellW = 105 / cols;
    const cellH = 68 / rows;
    const grid = Array.from({ length: cols * rows }, (_, i) => ({
      col: i % cols,
      row: Math.floor(i / cols),
      x: (i % cols) * cellW + cellW / 2,
      y: Math.floor(i / cols) * cellH + cellH / 2,
      count: 0
    }));

    (dadosEspaciais.calor || []).forEach((pt) => {
      const xPct = Math.max(0, Math.min(99.9, Number(pt.x) || 0));
      const yPct = Math.max(0, Math.min(99.9, Number(pt.y) || 0));
      const c = Math.floor((xPct / 100) * cols);
      const r = Math.floor((yPct / 100) * rows);
      const idx = r * cols + c;
      if (grid[idx]) grid[idx].count += 1;
    });

    const maxCount = Math.max(...grid.map((g) => g.count), 1);
    return grid
      .filter((g) => g.count > 0)
      .map((g) => ({
        ...g,
        intensidade: g.count / maxCount
      }));
  }, [dadosEspaciais.calor]);

  // Estatísticas rápidas de xG do mapa
  const statsMapa = useMemo(() => {
    const chutes = dadosEspaciais.chutes || [];
    const totalXg = chutes.reduce((acc, s) => acc + (Number(s.xg) || 0), 0);
    const gols = chutes.filter((s) => s.resultado === 'goal').length;
    return {
      totalChutes: chutes.length,
      gols,
      totalXg: totalXg.toFixed(2),
      xgPorChute: chutes.length > 0 ? (totalXg / chutes.length).toFixed(2) : '0.00'
    };
  }, [dadosEspaciais.chutes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* CABEÇALHO E SELETOR DE CAMADAS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent)' }}>
            📍 Mapeamento Espacial FIFA (105×68m)
          </span>
          <h4 className="font-editorial" style={{ margin: '2px 0 0 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Zonas de Ação & Finalizações (xG)
          </h4>
        </div>

        {/* Botões de Alternância de Camada */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-control)',
            padding: '2px',
            gap: '2px'
          }}
        >
          {[
            { id: 'ambos', label: 'Combinado' },
            { id: 'shotmap', label: 'Chutes (xG)' },
            { id: 'heatmap', label: 'Calor' }
          ].map((tab) => {
            const ativo = modo === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setModo(tab.id)}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: ativo ? 700 : 500,
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: ativo ? 'var(--accent)' : 'transparent',
                  color: ativo ? 'var(--accent-foreground)' : 'var(--text-secondary)',
                  transition: 'all 150ms ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTAINER DO GRAMADO SVG */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-panel)',
          padding: '10px',
          overflow: 'hidden'
        }}
      >
        <svg
          viewBox="-4 -4 113 76"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label="Mapa espacial de calor e finalizações no gramado de futebol"
        >
          <defs>
            {/* Filtro de Desfoque Gaussiano para suavizar o Mapa de Calor */}
            <filter id="heatmap-blur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4.8" />
            </filter>

            {/* Gradiente Radial Editorial para Zonas de Calor */}
            <radialGradient id="heat-spot">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.85" />
              <stop offset="55%" stopColor="var(--positive)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </radialGradient>

            {/* Clip Path dos limites do campo (105x68) */}
            <clipPath id="pitch-clip">
              <rect x="0" y="0" width="105" height="68" rx="1.5" />
            </clipPath>
          </defs>

          {/* ================= 1. FUNDO E FAIXAS DO GRAMADO ================= */}
          <rect
            x="0"
            y="0"
            width="105"
            height="68"
            rx="1.5"
            fill="var(--surface-panel)"
            stroke="var(--border-strong)"
            strokeWidth="0.6"
          />

          {/* Faixas verticais sutis de corte de grama */}
          {[1, 3, 5, 7, 9].map((i) => (
            <rect
              key={i}
              x={i * (105 / 10)}
              y="0"
              width={105 / 10}
              height="68"
              fill="var(--surface-raised)"
              fillOpacity="0.45"
            />
          ))}

          {/* ================= 2. CAMADA DE HEATMAP (BORRADA) ================= */}
          {(modo === 'ambos' || modo === 'heatmap') && (
            <g clipPath="url(#pitch-clip)" filter="url(#heatmap-blur)">
              {gradeCalor.map((celula, idx) => (
                <circle
                  key={idx}
                  cx={celula.x}
                  cy={celula.y}
                  r={7 + celula.intensidade * 9}
                  fill="url(#heat-spot)"
                  opacity={Math.min(0.95, 0.35 + celula.intensidade * 0.65)}
                />
              ))}
            </g>
          )}

          {/* ================= 3. LINHAS OFICIAIS DO CAMPO (FIFA 105x68) ================= */}
          <g stroke="var(--border-strong)" strokeWidth="0.45" fill="none">
            {/* Linha de Meio-Campo e Círculo Central */}
            <line x1="52.5" y1="0" x2="52.5" y2="68" />
            <circle cx="52.5" cy="34" r="9.15" />
            <circle cx="52.5" cy="34" r="0.6" fill="var(--border-strong)" />

            {/* Grande Área Esquerda (Defesa) */}
            <rect x="0" y="13.84" width="16.5" height="40.32" />
            <rect x="0" y="24.84" width="5.5" height="18.32" />
            <circle cx="11" cy="34" r="0.5" fill="var(--border-strong)" />
            <path d="M 16.5 26.7 A 9.15 9.15 0 0 1 16.5 41.3" />

            {/* Grande Área Direita (Ataque) */}
            <rect x="88.5" y="13.84" width="16.5" height="40.32" />
            <rect x="99.5" y="24.84" width="5.5" height="18.32" />
            <circle cx="94" cy="34" r="0.5" fill="var(--border-strong)" />
            <path d="M 88.5 26.7 A 9.15 9.15 0 0 0 88.5 41.3" />

            {/* Balizas (Gols) */}
            <rect x="-2" y="30.34" width="2" height="7.32" strokeWidth="0.5" />
            <rect x="105" y="30.34" width="2" height="7.32" strokeWidth="0.5" />
          </g>

          {/* Indicador de Direção de Ataque */}
          <g opacity="0.65">
            <text
              x="52.5"
              y="66"
              textAnchor="middle"
              fontSize="2.2"
              fontWeight="600"
              fill="var(--text-muted)"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}
            >
              DIREÇÃO DO ATAQUE ➔
            </text>
          </g>

          {/* ================= 4. CAMADA DE SHOTMAP (FINALIZAÇÕES & xG) ================= */}
          {(modo === 'ambos' || modo === 'shotmap') && (
            <g>
              {(dadosEspaciais.chutes || []).map((chute, i) => {
                const cx = chute.x_metros != null ? Number(chute.x_metros) : (Number(chute.x_origem || 85) / 100) * 105;
                const cy = chute.y_metros != null ? Number(chute.y_metros) : (Number(chute.y_origem || 50) / 100) * 68;
                const xg = Math.max(0.03, Number(chute.xg) || 0.1);
                const raio = Math.min(4.2, Math.max(1.4, Math.sqrt(xg) * 4.5));

                const isGol = chute.resultado === 'goal';
                const isSalvo = chute.resultado === 'save';

                const fillCor = isGol
                  ? 'var(--positive)'
                  : isSalvo
                  ? 'var(--accent)'
                  : 'var(--surface-card)';

                const strokeCor = isGol
                  ? 'var(--surface-card)'
                  : isSalvo
                  ? 'var(--surface-card)'
                  : 'var(--negative)';

                return (
                  <g
                    key={chute.id_evento || i}
                    style={{ cursor: 'pointer', transition: 'transform 150ms ease' }}
                    onMouseEnter={() => setHoveredShot({ ...chute, cx, cy })}
                    onMouseLeave={() => setHoveredShot(null)}
                  >
                    {isGol && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={raio + 1.4}
                        fill="none"
                        stroke="var(--positive)"
                        strokeWidth="0.4"
                        strokeDasharray="1,0.8"
                      />
                    )}

                    <circle
                      cx={cx}
                      cy={cy}
                      r={raio}
                      fill={fillCor}
                      fillOpacity={isGol ? 0.95 : 0.82}
                      stroke={strokeCor}
                      strokeWidth="0.55"
                    />
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* TOOLTIP FLUTUANTE AO PASSAR O MOUSE EM UM CHUTE */}
        {hoveredShot && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              maxWidth: 'calc(100% - 24px)',
              backgroundColor: 'var(--surface-panel)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-control)',
              padding: '8px 12px',
              boxShadow: 'var(--shadow-editorial)',
              fontSize: '0.74rem',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--text-primary)' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: hoveredShot.resultado === 'goal' ? 'var(--positive)' : 'var(--accent)'
                }}
              />
              <span>
                {hoveredShot.resultado === 'goal'
                  ? '⚽ GOL CONFIRMADO'
                  : hoveredShot.resultado === 'save'
                  ? '🧤 Defesa do Goleiro'
                  : '❌ Finalização Fora / Bloqueada'}
              </span>
              {hoveredShot.minuto && <span className="font-mono">({hoveredShot.minuto}')</span>}
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '3px' }}>
              Probabilidade (xG): <strong className="font-mono" style={{ color: 'var(--accent)' }}>{Number(hoveredShot.xg).toFixed(2)}</strong>
              {hoveredShot.parte_corpo ? ` • ${hoveredShot.parte_corpo}` : ''}
            </div>
          </div>
        )}
      </div>

      {/* LEGENDA TÉCNICA E RESUMO DE xG */}
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
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'var(--positive)', display: 'inline-block' }} />
            <strong>Gol ({statsMapa.gols})</strong>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'inline-block' }} />
            No Alvo
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', border: '1.5px solid var(--negative)', backgroundColor: 'var(--surface-card)', display: 'inline-block' }} />
            Fora/Bloq.
          </span>
          <span style={{ color: 'var(--text-muted)' }}>• Tamanho = xG</span>
        </div>

        <div className="font-mono tabular-nums" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          xG Acumulado: <span style={{ color: 'var(--accent)' }}>{statsMapa.totalXg}</span> ({statsMapa.xgPorChute}/chute)
        </div>
      </div>
    </div>
  );
}
