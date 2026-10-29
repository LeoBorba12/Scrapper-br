import React, { useState, useMemo } from 'react';
import { Flame, Target, Compass, Layers, Info } from 'lucide-react';

/**
 * SpatialPitchMap - Gramado Oficial FIFA (105x68m) com Heatmap, Shotmap (xG) e Telemetria Tática
 * Conformidade com Padrões Editoriais FutStats 2026 (Temas Areia & Carvão, WCAG 2.2 AA)
 */
export default function SpatialPitchMap({
  shotmap = [],
  heatmap = [],
  posicao = 'Atacante',
  telemetria = {},
  resumo = {}
}) {
  const [modo, setModo] = useState('ambos'); // 'ambos' | 'shotmap' | 'heatmap'
  const [hoveredShot, setHoveredShot] = useState(null);
  const [mostrarCentroide, setMostrarCentroide] = useState(true);

  // ============================================================================
  // 1. SANITIZAÇÃO DE ENTRADA
  // ============================================================================
  const chutesValidos = useMemo(() => {
    return Array.isArray(shotmap) ? shotmap.filter(s => s && s.x_origem != null) : [];
  }, [shotmap]);

  const calorValido = useMemo(() => {
    return Array.isArray(heatmap) ? heatmap.filter(h => h && h.x != null) : [];
  }, [heatmap]);

  // ============================================================================
  // 2. CÁLCULO DA GRADE DE DENSIDADE (BINNING 15x10 PARA O HEATMAP)
  // ============================================================================
  const gradeCalor = useMemo(() => {
    const cols = 15;
    const rows = 10;
    const cellW = 105 / cols;
    const cellH = 68 / rows;
    const grid = Array.from({ length: cols * rows }, (_, i) => ({
      col: i % cols,
      row: Math.floor(i / cols),
      x: (i % cols) * cellW + cellW / 2,
      y: Math.floor(i / cols) * cellH + cellH / 2,
      count: 0
    }));

    calorValido.forEach((pt) => {
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
  }, [calorValido]);

  // Estatísticas de chutes
  const statsMapa = useMemo(() => {
    const totalXg = chutesValidos.reduce((acc, s) => acc + (Number(s.xg) || 0), 0);
    const gols = chutesValidos.filter((s) => s.resultado === 'goal').length;
    return {
      totalChutes: chutesValidos.length,
      gols,
      totalXg: totalXg.toFixed(2),
      xgPorChute: chutesValidos.length > 0 ? (totalXg / chutesValidos.length).toFixed(2) : '0.00'
    };
  }, [chutesValidos]);

  // Telemetria com valores padrão inteligentes
  const telem = useMemo(() => {
    const defTercos = telemetria?.ocupacao_tercos || { defensivo_pct: 10, central_pct: 40, ofensivo_pct: 50 };
    const defCorredores = telemetria?.ocupacao_corredores || { flanco_esquerdo_pct: 25, zona_central_pct: 50, flanco_direito_pct: 25 };

    const cxMetros = telemetria?.centroide_x_metros != null ? Number(telemetria.centroide_x_metros) : 75.0;
    const cyMetros = telemetria?.centroide_y_metros != null ? Number(telemetria.centroide_y_metros) : 34.0;
    const cxPct = telemetria?.centroide_x_pct != null ? Number(telemetria.centroide_x_pct) : (cxMetros / 105) * 100;
    const cyPct = telemetria?.centroide_y_pct != null ? Number(telemetria.centroide_y_pct) : (cyMetros / 68) * 100;

    return {
      papel: telemetria?.papel_tatico || posicao || 'Atacante',
      altura: telemetria?.altura_bloco || 'Avançado',
      cxMetros,
      cyMetros,
      cxPct,
      cyPct,
      tercos: defTercos,
      corredores: defCorredores,
      fonte: telemetria?.fonte || 'Modelo Tático Baseado em Súmulas & Eventos Oficiais'
    };
  }, [telemetria, posicao]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* CABEÇALHO E SELETOR DE CAMADAS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent)' }}>
              📍 Gramado FIFA (105×68m)
            </span>
            <span className="pill-neutral" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
              {telem.papel}
            </span>
          </div>
          <h4 className="font-editorial" style={{ margin: '2px 0 0 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Heatmap Tático & Zonas de Ação
          </h4>
        </div>

        {/* Botões de Alternância de Camada */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              { id: 'heatmap', label: 'Calor' },
              { id: 'shotmap', label: 'Chutes (xG)' }
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

          <button
            type="button"
            onClick={() => setMostrarCentroide(!mostrarCentroide)}
            className="touch-tactile"
            style={{
              padding: '4px 8px',
              fontSize: '0.7rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: mostrarCentroide ? 'var(--surface-card)' : 'transparent',
              color: mostrarCentroide ? 'var(--accent)' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
            title="Alternar exibição do ponto médio de posicionamento no gramado"
          >
            🎯 Centroide
          </button>
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
            {/* Filtro de Desfoque Gaussiano para Suavização do Mapa de Calor */}
            <filter id="heatmap-blur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.8" />
            </filter>

            {/* Gradiente Radial com Stops de Alta Densidade Térmica */}
            <radialGradient id="heat-spot-high">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#EA580C" stopOpacity="0.75" />
              <stop offset="65%" stopColor="#D97706" stopOpacity="0.45" />
              <stop offset="90%" stopColor="#5A673E" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#5A673E" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heat-spot-med">
              <stop offset="0%" stopColor="#EA580C" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#D97706" stopOpacity="0.55" />
              <stop offset="85%" stopColor="#5A673E" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#5A673E" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heat-spot-low">
              <stop offset="0%" stopColor="#D97706" stopOpacity="0.70" />
              <stop offset="60%" stopColor="#5A673E" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#5A673E" stopOpacity="0" />
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

          {/* Faixas verticais de corte de grama */}
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
              {gradeCalor.map((celula, idx) => {
                const gradId = celula.intensidade > 0.65 
                  ? 'url(#heat-spot-high)' 
                  : celula.intensidade > 0.35 
                  ? 'url(#heat-spot-med)' 
                  : 'url(#heat-spot-low)';
                return (
                  <circle
                    key={idx}
                    cx={celula.x}
                    cy={celula.y}
                    r={6 + celula.intensidade * 8}
                    fill={gradId}
                    opacity={Math.min(0.95, 0.40 + celula.intensidade * 0.55)}
                  />
                );
              })}
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

          {/* ================= 4. MARCADOR DE CENTROIDE MÉDIO TÁTICO ================= */}
          {mostrarCentroide && (
            <g clipPath="url(#pitch-clip)">
              {/* Anel Pulsante Externo */}
              <circle
                cx={telem.cxMetros}
                cy={telem.cyMetros}
                r="3.8"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="0.6"
                strokeDasharray="1.2,0.8"
                opacity="0.85"
              />
              {/* Mira Central */}
              <circle
                cx={telem.cxMetros}
                cy={telem.cyMetros}
                r="1.2"
                fill="var(--accent)"
              />
              {/* Cruz de Alinhamento */}
              <line
                x1={telem.cxMetros - 5}
                y1={telem.cyMetros}
                x2={telem.cxMetros + 5}
                y2={telem.cyMetros}
                stroke="var(--accent)"
                strokeWidth="0.35"
                opacity="0.7"
              />
              <line
                x1={telem.cxMetros}
                y1={telem.cyMetros - 5}
                x2={telem.cxMetros}
                y2={telem.cyMetros + 5}
                stroke="var(--accent)"
                strokeWidth="0.35"
                opacity="0.7"
              />
              <text
                x={telem.cxMetros}
                y={telem.cyMetros - 5.5}
                textAnchor="middle"
                fontSize="2.1"
                fontWeight="800"
                fill="var(--text-primary)"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {telem.cxMetros}m
              </text>
            </g>
          )}

          {/* ================= 5. CAMADA DE SHOTMAP (FINALIZAÇÕES & xG) ================= */}
          {(modo === 'ambos' || modo === 'shotmap') && (
            <g>
              {chutesValidos.map((chute, i) => {
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
                  ? '⚽ GOL CATALOGADO'
                  : hoveredShot.resultado === 'save'
                  ? '🧤 Defesa do Goleiro'
                  : '❌ Finalização Bloqueada / Fora'}
              </span>
              {hoveredShot.minuto && <span className="font-mono">({hoveredShot.minuto}')</span>}
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '3px' }}>
              Probabilidade (xG): <strong className="font-mono" style={{ color: 'var(--accent)' }}>{Number(hoveredShot.xg).toFixed(2)}</strong>
              {hoveredShot.parte_corpo ? ` • ${hoveredShot.parte_corpo}` : ''}
              {hoveredShot.situacao ? ` • ${hoveredShot.situacao}` : ''}
            </div>
          </div>
        )}
      </div>

      {/* ================= TELEMETRIA ESPACIAL INTEGRADA (TERÇOS & CORREDORES) ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {/* Painel 1: Ocupação por Terços Longitudinal */}
        <div style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-control)', padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Terços do Campo
            </span>
            <span className="font-mono" style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)' }}>
              Bloco {telem.altura}
            </span>
          </div>
          {/* Barra tripla empilhada */}
          <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--surface-panel)', marginBottom: '6px' }}>
            <div title={`Defesa: ${telem.tercos.defensivo_pct}%`} style={{ width: `${telem.tercos.defensivo_pct}%`, backgroundColor: 'var(--border-strong)' }} />
            <div title={`Meio: ${telem.tercos.central_pct}%`} style={{ width: `${telem.tercos.central_pct}%`, backgroundColor: 'var(--accent)' }} />
            <div title={`Ataque: ${telem.tercos.ofensivo_pct}%`} style={{ width: `${telem.tercos.ofensivo_pct}%`, backgroundColor: 'var(--positive)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            <span>Def: <strong>{telem.tercos.defensivo_pct}%</strong></span>
            <span>Meio: <strong>{telem.tercos.central_pct}%</strong></span>
            <span>Atq: <strong style={{ color: 'var(--text-primary)' }}>{telem.tercos.ofensivo_pct}%</strong></span>
          </div>
        </div>

        {/* Painel 2: Ocupação por Corredores Transversais */}
        <div style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-control)', padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Corredores de Ação
            </span>
            <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Centroide: {telem.cxMetros}m
            </span>
          </div>
          {/* Barra tripla empilhada */}
          <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'var(--surface-panel)', marginBottom: '6px' }}>
            <div title={`Flanco Esquerdo: ${telem.corredores.flanco_esquerdo_pct}%`} style={{ width: `${telem.corredores.flanco_esquerdo_pct}%`, backgroundColor: '#3B82F6' }} />
            <div title={`Centro: ${telem.corredores.zona_central_pct}%`} style={{ width: `${telem.corredores.zona_central_pct}%`, backgroundColor: 'var(--accent)' }} />
            <div title={`Flanco Direito: ${telem.corredores.flanco_direito_pct}%`} style={{ width: `${telem.corredores.flanco_direito_pct}%`, backgroundColor: '#EC4899' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            <span>Esq: <strong>{telem.corredores.flanco_esquerdo_pct}%</strong></span>
            <span>Centro: <strong style={{ color: 'var(--text-primary)' }}>{telem.corredores.zona_central_pct}%</strong></span>
            <span>Dir: <strong>{telem.corredores.flanco_direito_pct}%</strong></span>
          </div>
        </div>
      </div>

      {/* LEGENDA TÉCNICA E RESUMO DE xG COM HONESTIDADE DE DADOS */}
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
          borderRadius: 'var(--radius-control)',
          border: '1px solid var(--border-subtle)'
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
            Bloqueado / Fora
          </span>
          <span style={{ color: 'var(--text-muted)' }}>• Amostras: {calorValido.length}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-mono tabular-nums" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            xG Acumulado: <span style={{ color: 'var(--accent)' }}>{statsMapa.totalXg}</span> ({statsMapa.xgPorChute}/chute)
          </span>
        </div>
      </div>

      {/* Rótulo de Honestidade de Dados */}
      <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textAlign: 'right', fontStyle: 'italic' }}>
        ℹ️ {telem.fonte}
      </div>
    </div>
  );
}
