import React, { useState } from 'react';

/**
 * Radar Dual PES - Confronto de Atributos Sobrepostos (Winning Eleven / PES Style)
 * Compara dois atletas em 5 eixos táticos padronizados:
 * 1. Ataque
 * 2. Finalização
 * 3. Criação / Passe
 * 4. Físico / Presença
 * 5. Defesa / Disciplina
 *
 * Paleta Editorial 2026:
 * - Atleta 1: Oliva (#5A673E / #7C8F52)
 * - Atleta 2: Terracota (#85573B / #B87550)
 */
export default function RadarDualPES({
  atleta1 = {},
  atleta2 = {},
  eixos1 = [],
  eixos2 = [],
  ovr1 = 75,
  ovr2 = 75,
  size = 360
}) {
  const [hoveredAxis, setHoveredAxis] = useState(null);

  const totalAxes = 5;
  const center = size / 2;
  const radius = (size / 2) - 52; // Espaço para rótulos externos
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index, valuePercent) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = radius * valuePercent;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  const getPolygonPath = (level) => {
    const points = Array.from({ length: totalAxes }).map((_, i) => {
      const { x, y } = getCoordinates(i, level);
      return `${x},${y}`;
    });
    return points.join(' ');
  };

  const calcPoints = (eixos) => {
    return eixos.map((item, idx) => {
      const val = item.valor != null ? item.valor : 50;
      // Normalização com base 40 até 99
      const pct = Math.max(0.18, Math.min(1.0, 0.20 + ((val - 40) / 59) * 0.80));
      return getCoordinates(idx, pct);
    });
  };

  const points1 = calcPoints(eixos1);
  const path1 = points1.map(p => `${p.x},${p.y}`).join(' ');

  const points2 = calcPoints(eixos2);
  const path2 = points2.map(p => `${p.x},${p.y}`).join(' ');

  // Dados consolidados por eixo
  const combinedAxes = eixos1.map((e1, idx) => {
    const e2 = eixos2[idx] || { valor: 50 };
    const v1 = e1.valor || 0;
    const v2 = e2.valor || 0;
    const diff = v1 - v2;
    return {
      idx,
      key: e1.key,
      label: e1.label,
      desc: e1.desc || '',
      v1,
      v2,
      diff,
      lider: diff > 0 ? 1 : (diff < 0 ? 2 : 0)
    };
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        maxWidth: `${size}px`,
        margin: '0 auto',
        userSelect: 'none'
      }}
    >
      {/* Placar OVR Lado a Lado no Topo */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          padding: '0 4px'
        }}
      >
        {/* Atleta 1 OVR (Oliva) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(90, 103, 62, 0.12)',
            border: '1px solid rgba(90, 103, 62, 0.35)',
            borderRadius: 'var(--radius-control)',
            padding: '4px 10px'
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#7C8F52',
              boxShadow: '0 0 6px rgba(124, 143, 82, 0.6)'
            }}
          />
          <div>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#7C8F52', textTransform: 'uppercase' }}>
              {atleta1.nome || 'Atleta 1'}
            </div>
            <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
              {ovr1} <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)' }}>OVR</span>
            </div>
          </div>
        </div>

        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>VS</span>

        {/* Atleta 2 OVR (Terracota) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(133, 87, 59, 0.12)',
            border: '1px solid rgba(133, 87, 59, 0.35)',
            borderRadius: 'var(--radius-control)',
            padding: '4px 10px',
            textAlign: 'right'
          }}
        >
          <div>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#B87550', textTransform: 'uppercase' }}>
              {atleta2.nome || 'Atleta 2'}
            </div>
            <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
              {ovr2} <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-muted)' }}>OVR</span>
            </div>
          </div>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#B87550',
              boxShadow: '0 0 6px rgba(184, 117, 80, 0.6)'
            }}
          />
        </div>
      </div>

      {/* SVG Pentagonal Dual */}
      <svg
        width="100%"
        height="auto"
        viewBox={`0 0 ${size} ${size}`}
        style={{ maxWidth: `${size}px`, display: 'block', margin: '0 auto', overflow: 'visible' }}
      >
        <defs>
          <filter id="dualGlowOliva" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="dualGlowTerracota" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Círculo de fundo translúcido */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="var(--surface-raised)"
          fillOpacity="0.4"
        />

        {/* Níveis Concêntricos do Pentágono */}
        {levels.map((lvl, idx) => (
          <polygon
            key={idx}
            points={getPolygonPath(lvl)}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth={idx === levels.length - 1 ? 1.5 : 0.9}
            strokeDasharray={idx === levels.length - 1 ? 'none' : '2,3'}
            opacity={0.75}
          />
        ))}

        {/* Raios do Centro para os 5 Vértices */}
        {Array.from({ length: totalAxes }).map((_, i) => {
          const edge = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={edge.x}
              y2={edge.y}
              stroke="var(--border-subtle)"
              strokeWidth={1}
              opacity={0.6}
            />
          );
        })}

        {/* Polígono 1: Atleta 1 (Oliva) */}
        {points1.length === totalAxes && (
          <polygon
            points={path1}
            fill="rgba(90, 103, 62, 0.38)"
            stroke="#7C8F52"
            strokeWidth={2.4}
            filter="url(#dualGlowOliva)"
            style={{ transition: 'all 0.35s ease' }}
          />
        )}

        {/* Polígono 2: Atleta 2 (Terracota) */}
        {points2.length === totalAxes && (
          <polygon
            points={path2}
            fill="rgba(133, 87, 59, 0.38)"
            stroke="#B87550"
            strokeWidth={2.4}
            filter="url(#dualGlowTerracota)"
            style={{ transition: 'all 0.35s ease' }}
          />
        )}

        {/* Vértices / Círculos do Atleta 1 (Oliva) */}
        {points1.map((p, idx) => (
          <circle
            key={`a1-pt-${idx}`}
            cx={p.x}
            cy={p.y}
            r={hoveredAxis === idx ? 6 : 4}
            fill="#7C8F52"
            stroke="var(--surface-page)"
            strokeWidth={1.5}
            style={{ transition: 'r 0.2s ease', cursor: 'pointer' }}
            onMouseEnter={() => setHoveredAxis(idx)}
            onMouseLeave={() => setHoveredAxis(null)}
          />
        ))}

        {/* Vértices / Círculos do Atleta 2 (Terracota) */}
        {points2.map((p, idx) => (
          <circle
            key={`a2-pt-${idx}`}
            cx={p.x}
            cy={p.y}
            r={hoveredAxis === idx ? 6 : 4}
            fill="#B87550"
            stroke="var(--surface-page)"
            strokeWidth={1.5}
            style={{ transition: 'r 0.2s ease', cursor: 'pointer' }}
            onMouseEnter={() => setHoveredAxis(idx)}
            onMouseLeave={() => setHoveredAxis(null)}
          />
        ))}

        {/* Rótulos dos 5 Eixos com Valores e Destaque */}
        {combinedAxes.map((item, idx) => {
          const edge = getCoordinates(idx, 1.0);
          const angle = edge.angle;
          // Deslocar o texto ligeiramente para fora do pentágono
          const offsetDist = 26;
          const lx = center + (radius + offsetDist) * Math.cos(angle);
          const ly = center + (radius + offsetDist) * Math.sin(angle);

          const isHovered = hoveredAxis === idx;
          const textAnchor = Math.abs(Math.cos(angle)) < 0.25 ? 'middle' : (Math.cos(angle) > 0 ? 'start' : 'end');

          return (
            <g
              key={`label-${idx}`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredAxis(idx)}
              onMouseLeave={() => setHoveredAxis(null)}
            >
              {/* Nome do Eixo */}
              <text
                x={lx}
                y={ly - 7}
                textAnchor={textAnchor}
                fill={isHovered ? 'var(--text-primary)' : 'var(--text-secondary)'}
                fontSize="10"
                fontWeight={isHovered ? 800 : 700}
                letterSpacing="0.02em"
              >
                {item.label}
              </text>

              {/* Valores Lado a Lado: Oliva vs Terracota */}
              <text
                x={lx}
                y={ly + 8}
                textAnchor={textAnchor}
                className="font-mono"
                fontSize="11"
                fontWeight={700}
              >
                <tspan fill="#7C8F52" fontWeight={item.lider === 1 ? 900 : 600}>
                  {item.v1}
                </tspan>
                <tspan fill="var(--text-muted)" fontSize="9"> vs </tspan>
                <tspan fill="#B87550" fontWeight={item.lider === 2 ? 900 : 600}>
                  {item.v2}
                </tspan>
                {item.diff !== 0 && (
                  <tspan
                    fill={item.lider === 1 ? '#7C8F52' : '#B87550'}
                    fontSize="9"
                    fontWeight={800}
                    dx="4"
                  >
                    ({item.diff > 0 ? `+${item.diff}` : item.diff})
                  </tspan>
                )}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip / Caixa de Explicação do Eixo em Hover */}
      <div
        style={{
          minHeight: '44px',
          width: '100%',
          marginTop: '6px',
          padding: '6px 10px',
          borderRadius: 'var(--radius-control)',
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--text-secondary)'
        }}
      >
        {hoveredAxis !== null && combinedAxes[hoveredAxis] ? (
          <>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>{combinedAxes[hoveredAxis].label}:</strong>{' '}
              {combinedAxes[hoveredAxis].desc}
            </div>
            <div className="font-mono" style={{ fontWeight: 800, whiteSpace: 'nowrap', marginLeft: '8px' }}>
              Vantagem:{' '}
              {combinedAxes[hoveredAxis].lider === 1 ? (
                <span style={{ color: '#7C8F52' }}>{atleta1.nome} (+{combinedAxes[hoveredAxis].diff})</span>
              ) : combinedAxes[hoveredAxis].lider === 2 ? (
                <span style={{ color: '#B87550' }}>{atleta2.nome} (+{Math.abs(combinedAxes[hoveredAxis].diff)})</span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Empate tático</span>
              )}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', width: '100%', color: 'var(--text-muted)', fontSize: '0.68rem' }}>
            Passe o mouse sobre os vértices para inspecionar a vantagem tática em cada fundamento (40 a 99).
          </div>
        )}
      </div>
    </div>
  );
}
