import React, { useState } from 'react';

/**
 * Radar Pentagonal de Atributos estilo PES / Winning Eleven
 * 5 Eixos:
 * 1. Ataque (Presença ofensiva, volume de jogo no terço final)
 * 2. Finalização (Pontaria, gols marcados, conversão)
 * 3. Criação / Passe (Assistências, visão de jogo, passes chave)
 * 4. Físico / Presença (Minutagem, longevidade, jogos, disputas)
 * 5. Defesa / Disciplina (Disciplina tática, baixo número de cartões, desarme)
 */
export default function RadarPentagonPES({
  atleta,
  resumo = {},
  carreira = {},
  size = 320
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Calcula atributos com base nos dados reais do atleta (escala 40 a 99 estilo PES)
  const calcAttributes = () => {
    // Paridade estrita de escopo para cálculo de atributos:
    // Nunca misturar gols de carreira com jogos locais para cálculo de média
    let totalGols = 0;
    let totalJogos = 1;
    if (carreira.gols != null && carreira.jogos != null && Number(carreira.jogos) > 0) {
      totalGols = Number(carreira.gols);
      totalJogos = Number(carreira.jogos);
    } else {
      totalGols = Number(resumo.total_gols || carreira.gols || 0);
      totalJogos = Number(resumo.jogos_registrados || carreira.jogos || 1);
    }

    let mediaGols = totalJogos > 0 ? totalGols / totalJogos : 0;
    // Guarda de sanidade: se gols/jogos > 2.0 em amostragem > 10 jogos, usar escopo local consistente
    if (totalJogos > 10 && mediaGols > 2.0) {
      if (resumo.total_gols && resumo.jogos_registrados && Number(resumo.jogos_registrados) > 0) {
        mediaGols = Number(resumo.total_gols) / Number(resumo.jogos_registrados);
      } else {
        mediaGols = Math.min(mediaGols, 1.4);
      }
    }

    const totalAssists = carreira.assistencias ?? resumo.total_assistencias ?? 0;
    const pontaria = resumo.pontaria_chutes_pct ? Number(resumo.pontaria_chutes_pct) : 60;
    const amarelos = resumo.amarelos || 0;
    const vermelhos = resumo.vermelhos || 0;
    const clutch = resumo.gols_decisivos_80mais || 0;
    const pos = (atleta?.posicao || '').toLowerCase();
    const isAtacante = pos.includes('atacante') || pos.includes('centroavante') || pos.includes('ponta') || mediaGols > 0.3 || totalGols > 30;
    const isMeia = pos.includes('meia') || pos.includes('meio') || pos.includes('armador');
    const isDefensor = pos.includes('zagueiro') || pos.includes('lateral') || pos.includes('defensor') || pos.includes('volante');
    const isGoleiro = pos.includes('goleiro');

    // 1. Ataque (40 a 99)
    let atk = 65;
    if (isAtacante) {
      atk = 82 + Math.min(16, Math.round(mediaGols * 22) + (clutch > 3 ? 3 : 0));
    } else if (isMeia) {
      atk = 74 + Math.min(18, Math.round(mediaGols * 18) + (totalAssists > 20 ? 5 : 2));
    } else if (isDefensor) {
      atk = 48 + Math.min(22, Math.round(mediaGols * 25));
    } else if (isGoleiro) {
      atk = 40;
    } else {
      atk = 60 + Math.min(25, Math.round(mediaGols * 22));
    }

    // 2. Finalização (40 a 99)
    let fin = 55;
    if (isAtacante) {
      fin = 76;
      if (totalGols > 150) fin += 18;
      else if (totalGols > 80) fin += 14;
      else if (totalGols > 40) fin += 9;
      else if (totalGols > 15) fin += 4;
      if (mediaGols > 0.45) fin += 5;
      fin += Math.round((pontaria - 50) * 0.2);
    } else if (isMeia) {
      fin = 66 + (totalGols > 30 ? 12 : 5);
      if (mediaGols > 0.25) fin += 6;
    } else if (isDefensor) {
      fin = 45 + Math.min(20, Math.round(totalGols * 1.5));
    } else if (isGoleiro) {
      fin = 40;
    } else {
      fin = 55 + (totalGols > 20 ? 12 : 4);
    }

    // 3. Criação / Passe (40 a 99)
    let cri = 58;
    if (isMeia) {
      cri = 78;
      if (totalAssists > 50) cri += 18;
      else if (totalAssists > 25) cri += 12;
      else if (totalAssists > 10) cri += 7;
    } else if (isAtacante) {
      cri = 60;
      if (totalAssists > 40) cri += 18;
      else if (totalAssists > 20) cri += 10;
      else if (totalAssists > 5) cri += 5;
    } else if (isDefensor) {
      cri = 50 + (pos.includes('lateral') ? 14 : 4);
    } else {
      cri = 55 + Math.min(20, totalAssists * 2);
    }

    // 4. Físico / Presença (40 a 99)
    let fis = 65;
    if (totalJogos > 400) fis += 25;
    else if (totalJogos > 250) fis += 18;
    else if (totalJogos > 150) fis += 12;
    else if (totalJogos > 60) fis += 6;
    if (resumo.jogos_titular && resumo.jogos_titular > 100) fis += 5;

    // 5. Defesa / Disciplina (40 a 99)
    let def = 50;
    if (isGoleiro) {
      def = 92;
    } else if (isDefensor) {
      def = 82 + (totalJogos > 100 ? 8 : 4);
    } else if (isMeia) {
      def = pos.includes('volante') ? 80 : 58;
    } else {
      // Para centroavantes clássicos, a taxa de recomposição defensiva é baixa (~42-52)
      def = 44;
      const cartoesPorJogo = totalJogos > 0 ? (amarelos + vermelhos * 2) / totalJogos : 0;
      if (cartoesPorJogo < 0.12) def += 8;
      else if (cartoesPorJogo > 0.25) def -= 6;
    }

    const clamp = (v) => Math.max(40, Math.min(99, Math.round(v)));
    return [
      { key: 'atk', label: 'Ataque', valor: clamp(atk), desc: 'Presença e volume ofensivo' },
      { key: 'fin', label: 'Finalização', valor: clamp(fin), desc: 'Conversão e precisão no arremate' },
      { key: 'cri', label: 'Criação / Passe', valor: clamp(cri), desc: 'Visão de jogo e assistências' },
      { key: 'fis', label: 'Físico / Presença', valor: clamp(fis), desc: 'Resistência, minutagem e solidez' },
      { key: 'def', label: 'Defesa / Disciplina', valor: clamp(def), desc: 'Combate e disciplina tática' },
    ];
  };

  const eixos = calcAttributes();

  // Média Geral (Overall Rating no estilo Winning Eleven)
  const ovr = Math.round(eixos.reduce((acc, e) => acc + e.valor, 0) / eixos.length);

  // Parâmetros do SVG Pentagonal
  const center = size / 2;
  const radius = (size / 2) - 44; // margem para labels
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const totalAxes = 5;

  // Ângulos do pentágono: topo a -90 graus (-PI / 2)
  const getCoordinates = (index, valuePercent) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = radius * valuePercent;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Caminho da teia concêntrica para cada nível
  const getPolygonPath = (level) => {
    const points = Array.from({ length: totalAxes }).map((_, i) => {
      const { x, y } = getCoordinates(i, level);
      return `${x},${y}`;
    });
    return points.join(' ');
  };

  // Coordenadas dos vértices dos atributos do jogador
  // Coordenadas dos vértices dos atributos do jogador
  const playerPoints = eixos.map((item, idx) => {
    // Normalização com baseline 40 para destacar características táticas reais (PES / Winning Eleven)
    // 40 pts = 0.20 raio (núcleo), 70 pts = 0.60 raio, 99 pts = 1.00 raio
    const pct = Math.max(0.18, Math.min(1.0, 0.20 + ((item.valor - 40) / 59) * 0.80));
    return getCoordinates(idx, pct);
  });
  const playerPolygonPath = playerPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        maxWidth: `${size}px`,
        margin: '0 auto'
      }}
    >
      {/* Badge de OVR estilo PES */}
      <div
        style={{
          position: 'absolute',
          top: '6px',
          right: '8px',
          zIndex: 10,
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '4px 10px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-editorial)'
        }}
        title="Overall Rating Geral calculado"
      >
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          PES OVR
        </span>
        <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>
          {ovr}
        </div>
      </div>

      <svg
        width="100%"
        height="auto"
        viewBox={`0 0 ${size} ${size}`}
        style={{ maxWidth: `${size}px`, display: 'block', margin: '0 auto', overflow: 'visible' }}
      >
        <defs>
          {/* Gradiente PES translúcido harmônico */}
          <linearGradient id="pesRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.45" />
            <stop offset="50%" stopColor="var(--positive)" stopOpacity="0.30" />
            <stop offset="100%" stopColor="var(--accent-hover)" stopOpacity="0.50" />
          </linearGradient>

          {/* Filtro Glow para o contorno do polígono */}
          <filter id="pesRadarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Círculo de fundo suave */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="var(--surface-raised)"
          fillOpacity="0.35"
        />

        {/* Níveis Concêntricos do Pentágono */}
        {levels.map((lvl, idx) => (
          <polygon
            key={idx}
            points={getPolygonPath(lvl)}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth={idx === levels.length - 1 ? 1.5 : 1}
            strokeDasharray={idx === levels.length - 1 ? 'none' : '2,3'}
            opacity={0.8}
          />
        ))}

        {/* Eixos radiais do centro a cada vértice */}
        {Array.from({ length: totalAxes }).map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="var(--border-subtle)"
              strokeWidth="1.2"
              opacity={0.7}
            />
          );
        })}

        {/* Polígono de Atributos do Atleta com Preenchimento Translúcido */}
        <polygon
          points={playerPolygonPath}
          fill="url(#pesRadarGrad)"
          stroke="var(--accent)"
          strokeWidth="2.5"
          filter="url(#pesRadarGlow)"
          style={{ transition: 'all 280ms ease' }}
        />

        {/* Vértices Pontilhados com Indicadores Interativos */}
        {playerPoints.map((pt, i) => {
          const item = eixos[i];
          const isHov = hoveredIndex === i;
          return (
            <g
              key={i}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Anel de pulso no hover */}
              {isHov && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="9"
                  fill="var(--accent)"
                  fillOpacity="0.35"
                />
              )}
              {/* Ponto central brilhante */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHov ? 5 : 4}
                fill={isHov ? 'var(--accent-hover)' : 'var(--accent)'}
                stroke="var(--surface-panel)"
                strokeWidth="2"
              />
            </g>
          );
        })}

        {/* Rótulos e Valores nos 5 Vértices */}
        {eixos.map((item, i) => {
          const { x, y, angle } = getCoordinates(i, 1.22);
          const isHov = hoveredIndex === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              <text
                x={x}
                y={y - 4}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isHov ? 'var(--accent)' : 'var(--text-secondary)'}
                fontSize="11"
                fontWeight="700"
                fontFamily="var(--font-ui)"
              >
                {item.label}
              </text>
              <text
                x={x}
                y={y + 11}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isHov ? 'var(--accent)' : 'var(--text-primary)'}
                fontSize="13"
                fontWeight="800"
                fontFamily="var(--font-mono)"
              >
                {item.valor}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip Interativo Informativo abaixo do Radar */}
      <div
        style={{
          marginTop: '6px',
          padding: '6px 12px',
          borderRadius: 'var(--radius-control)',
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.74rem',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          minHeight: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}
      >
        {hoveredIndex !== null ? (
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>{eixos[hoveredIndex].label} ({eixos[hoveredIndex].valor}/99):</strong>{' '}
            <span>{eixos[hoveredIndex].desc}</span>
          </div>
        ) : (
          <span>Passe o cursor sobre os 5 vértices para detalhar cada atributo.</span>
        )}
      </div>
    </div>
  );
}
