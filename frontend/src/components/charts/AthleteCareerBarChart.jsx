import React, { useState } from 'react';

/**
 * Gráfico de Barras da Carreira de Atletas (gols ano a ano por clube)
 * - Mostra a evolução histórica de gols por temporada.
 * - Suporta tooltips interativos com clube, jogos, média e gols.
 * - SVG responsivo com grid sutil e acabamento editorial.
 */
export default function AthleteCareerBarChart({
  temporadas = [],
  altura = 240
}) {
  const [hoveredAno, setHoveredAno] = useState(null);

  if (!temporadas || temporadas.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Sem dados de temporadas registradas para este atleta.
      </div>
    );
  }

  // Ordena por ano cronológico (crescente)
  const dados = [...temporadas]
    .filter(t => t.ano)
    .sort((a, b) => Number(a.ano) - Number(b.ano));

  if (dados.length === 0) return null;

  const maxGols = Math.max(...dados.map(d => Number(d.gols) || 0), 5);
  // Arredonda o topo para um múltiplo amigável
  const yMax = Math.ceil(maxGols * 1.15);

  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 28;
  const paddingBottom = 36;
  const viewBoxWidth = Math.max(540, dados.length * 44 + paddingLeft + paddingRight);
  const viewBoxHeight = altura;

  const chartWidth = viewBoxWidth - paddingLeft - paddingRight;
  const chartHeight = viewBoxHeight - paddingTop - paddingBottom;

  const barWidth = Math.min(28, Math.max(14, (chartWidth / dados.length) * 0.65));
  const stepX = chartWidth / dados.length;

  // Linhas de grade no eixo Y (4 níveis)
  const yTicks = [0, Math.round(yMax * 0.33), Math.round(yMax * 0.66), yMax];

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div style={{ overflowX: 'auto', scrollbarWidth: 'thin' }}>
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          style={{ width: '100%', minWidth: `${Math.min(viewBoxWidth, 680)}px`, height: `${viewBoxHeight}px`, display: 'block' }}
        >
          <defs>
            <linearGradient id="barCareerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C7FF00" />
              <stop offset="40%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent-hover)" />
            </linearGradient>

            <linearGradient id="barCareerGradHover" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF4BC4" />
              <stop offset="100%" stopColor="#FF13B1" />
            </linearGradient>
          </defs>

          {/* Linhas de Grade Horizontais */}
          {yTicks.map((val, idx) => {
            const y = paddingTop + chartHeight - (val / yMax) * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={viewBoxWidth - paddingRight}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeWidth="1"
                  strokeDasharray={idx === 0 ? 'none' : '3,3'}
                  opacity={0.7}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                  fill="var(--text-muted)"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Barras Verticais de Gols por Temporada */}
          {dados.map((d, idx) => {
            const gols = Number(d.gols) || 0;
            const h = (gols / yMax) * chartHeight;
            const x = paddingLeft + (idx * stepX) + (stepX - barWidth) / 2;
            const y = paddingTop + chartHeight - h;
            const isHover = hoveredAno === d.ano;

            return (
              <g
                key={d.ano || idx}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredAno(d.ano)}
                onMouseLeave={() => setHoveredAno(null)}
              >
                {/* Área invisível ampla para facilitar hover em touch/mouse */}
                <rect
                  x={paddingLeft + (idx * stepX)}
                  y={paddingTop}
                  width={stepX}
                  height={chartHeight + paddingBottom}
                  fill="transparent"
                />

                {/* Sombra de fundo de barra */}
                <rect
                  x={x}
                  y={paddingTop}
                  width={barWidth}
                  height={chartHeight}
                  fill="var(--surface-raised)"
                  opacity={isHover ? 0.6 : 0.25}
                  rx="4"
                />

                {/* Barra Principal de Gols */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(h, 3)}
                  rx="4"
                  fill={isHover ? 'url(#barCareerGradHover)' : 'url(#barCareerGrad)'}
                  style={{ transition: 'all 200ms ease' }}
                />

                {/* Valor numérico de gols acima da barra se houver espaço ou hover */}
                {(gols > 0 && (h > 18 || isHover)) && (
                  <text
                    x={x + barWidth / 2}
                    y={Math.max(y - 6, paddingTop + 10)}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                    fill={isHover ? '#FF13B1' : 'var(--text-primary)'}
                  >
                    {gols}
                  </text>
                )}

                {/* Rótulo do Ano no Eixo X */}
                <text
                  x={x + barWidth / 2}
                  y={viewBoxHeight - 12}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHover ? '800' : '600'}
                  fontFamily="var(--font-ui)"
                  fill={isHover ? 'var(--text-primary)' : 'var(--text-secondary)'}
                >
                  {String(d.ano).slice(-2)}'
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip Dinâmico Informativo com Dados Completos da Temporada */}
      {hoveredAno && (() => {
        const item = dados.find(d => d.ano === hoveredAno);
        if (!item) return null;
        const clubes = Array.isArray(item.clubes) ? item.clubes.join(', ') : (item.clubes || 'Clube');

        return (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '12px',
              backgroundColor: 'var(--surface-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-control)',
              padding: '8px 12px',
              boxShadow: 'var(--shadow-editorial)',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 20
            }}
          >
            <div>
              <span className="font-mono" style={{ fontWeight: 800, color: '#FF13B1' }}>
                Temporada {item.ano}
              </span>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                {clubes}
              </div>
            </div>
            <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Gols</span>
                <div className="font-mono" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{item.gols || 0}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Jogos</span>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{item.jogos || 0}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Média</span>
                <div className="font-mono" style={{ fontWeight: 700, color: 'var(--accent)' }}>{item.media_gols || '0.00'}</div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
