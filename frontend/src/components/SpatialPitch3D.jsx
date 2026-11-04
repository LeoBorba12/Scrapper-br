import React, { useState, useMemo } from 'react';

/**
 * SpatialPitch3D - Campo Tático Isométrico 3D em Bloco de Terra Flutuante
 * Adaptado do projeto CraqueView para a identidade editorial FutStats 2026.
 *
 * Propriedades:
 * - heatmap: lista de pontos { x, y } (coordenadas do campo em metros 105x68 ou %)
 * - shotmap: lista de finalizações com { x_metros, y_metros, x_origem, y_origem, resultado, xg, minuto }
 * - posicao: posição tática do atleta (ex: 'Atacante', 'Meio-Campo', 'Zagueiro', 'Lateral')
 * - modo: 'ambos' | 'heatmap' | 'shotmap'
 * - largura: largura base do campo marcado em px (default: 175)
 * - onHoverShot: callback ao passar o cursor sobre um chute
 */
export default function SpatialPitch3D({
  heatmap = [],
  shotmap = [],
  posicao = 'Atacante',
  modo = 'ambos',
  largura = 175,
  onHoverShot = null
}) {
  const [hoveredShot, setHoveredShot] = useState(null);

  // ============================================================================
  // 1. ESCALA DE CORES ANALÍTICAS (Frio -> Quente)
  // ============================================================================
  const STOPS = [
    [43, 101, 214],  // Azul Frio
    [56, 217, 138],  // Verde Grama
    [245, 206, 59],  // Amarelo
    [224, 72, 63]    // Terracota / Vermelho Quente
  ];

  const calcCor = (w) => {
    const t = Math.max(0, Math.min(1, w)) * (STOPS.length - 1);
    const i = Math.min(STOPS.length - 2, Math.floor(t));
    const f = t - i;
    const a = STOPS[i], b = STOPS[i + 1];
    return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
  };

  const calcOpacidade = (w) => {
    const lo = 0.10, hi = 0.55;
    const t = Math.max(0, Math.min(1, (w - lo) / (hi - lo)));
    return t * t * (3 - 2 * t) * 0.94;
  };

  // ============================================================================
  // 2. GRADE DE CALOR ISOMÉTRICA (16 colunas x 24 linhas)
  // ============================================================================
  const { celulasCalor, picoBrilho } = useMemo(() => {
    const cols = 16, rows = 24;
    const grid = new Float32Array(cols * rows);

    const ptsValidos = Array.isArray(heatmap) ? heatmap.filter(h => h && h.x != null) : [];

    if (ptsValidos.length > 0) {
      // Distribuição por acumulação Gaussiana com dados reais
      ptsValidos.forEach((pt) => {
        const normX = Math.min(Math.max((Number(pt.x) || 0) / 105, 0), 1); // 0..1 topo ao fundo (105m)
        const normY = Math.min(Math.max((Number(pt.y) || 0) / 68, 0), 1);  // 0..1 lateral a lateral (68m)

        const cCenter = normY * cols;
        const rCenter = normX * rows;
        const sigma = 1.8;

        for (let r = Math.max(0, Math.floor(rCenter - 3)); r <= Math.min(rows - 1, Math.ceil(rCenter + 3)); r++) {
          for (let c = Math.max(0, Math.floor(cCenter - 3)); c <= Math.min(cols - 1, Math.ceil(cCenter + 3)); c++) {
            const d2 = (c - cCenter) ** 2 + (r - rCenter) ** 2;
            const peso = Math.exp(-d2 / (2 * sigma * sigma));
            grid[r * cols + c] += peso;
          }
        }
      });
    } else {
      // Fallback Gaussiano posicional realista
      const posMap = {
        'Atacante': [[0.50, 0.78], [0.35, 0.72], [0.65, 0.72]],
        'Ponta': [[0.78, 0.70], [0.82, 0.82], [0.60, 0.75]],
        'Meio-Campo': [[0.50, 0.55], [0.35, 0.45], [0.65, 0.45]],
        'Volante': [[0.50, 0.38], [0.38, 0.35], [0.62, 0.35]],
        'Zagueiro': [[0.50, 0.22], [0.35, 0.20], [0.65, 0.20]],
        'Lateral': [[0.82, 0.45], [0.85, 0.65], [0.80, 0.25]],
        'Goleiro': [[0.50, 0.08]]
      };
      const bases = posMap[posicao] || posMap['Atacante'];
      const sigma = 0.22;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const u = (c + 0.5) / cols;
          const v = (r + 0.5) / rows;
          let val = 0;
          bases.forEach((b) => {
            val = Math.max(val, Math.exp(-((u - b[0]) ** 2 + (v - b[1]) ** 2) / (2 * sigma * sigma)));
          });
          grid[r * cols + c] = val;
        }
      }
    }

    // Normalização pelo pico
    let max = 0;
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] > max) max = grid[i];
    }
    const cw = 100 / cols;
    const ch = 100 / rows;
    let pico = 0, px = 50, py = 50;
    const cells = [];

    for (let i = 0; i < grid.length; i++) {
      const w = max > 0 ? grid[i] / max : 0;
      const c = i % cols;
      const r = Math.floor(i / cols);

      if (w > pico) {
        pico = w;
        px = (c + 0.5) * cw;
        py = (r + 0.5) * ch;
      }

      const op = calcOpacidade(w);
      if (op > 0.01) {
        cells.push({
          id: i,
          left: `${(c * cw).toFixed(2)}%`,
          top: `${(r * ch).toFixed(2)}%`,
          width: `${(cw + 0.9).toFixed(2)}%`,
          height: `${(ch + 0.9).toFixed(2)}%`,
          background: calcCor(w),
          opacity: op.toFixed(2)
        });
      }
    }

    return {
      celulasCalor: cells,
      picoBrilho: {
        x: `${px.toFixed(1)}%`,
        y: `${py.toFixed(1)}%`,
        cor: calcCor(pico),
        opacidade: (0.20 + 0.35 * pico).toFixed(2)
      }
    };
  }, [heatmap, posicao]);

  // ============================================================================
  // 3. FINALIZAÇÕES MAPEADAS EM 3D (SHOTMAP PINS)
  // ============================================================================
  const chutesProjetados = useMemo(() => {
    if (!Array.isArray(shotmap) || modo === 'heatmap') return [];

    return shotmap
      .filter((s) => s && (s.x_origem != null || s.x_metros != null))
      .map((s, idx) => {
        const cx = s.x_metros != null ? Number(s.x_metros) : (Number(s.x_origem || 85) / 100) * 105;
        const cy = s.y_metros != null ? Number(s.y_metros) : (Number(s.y_origem || 50) / 100) * 68;

        // Na perspectiva vertical do campo 3D:
        // Top = comprimento do campo (0 a 105m de norte a sul)
        // Left = largura do campo (0 a 68m de oeste a leste)
        const topPct = Math.min(Math.max((cx / 105) * 100, 3), 97);
        const leftPct = Math.min(Math.max((cy / 68) * 100, 3), 97);
        const xg = Math.max(0.04, Number(s.xg || 0.1));

        return {
          ...s,
          idx,
          top: `${topPct.toFixed(2)}%`,
          left: `${leftPct.toFixed(2)}%`,
          xg
        };
      });
  }, [shotmap, modo]);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 10px 18px',
        overflow: 'hidden'
      }}
    >
      {/* BLOCO GEOLÓGICO 3D */}
      <div
        className="campo3d"
        style={{ '--w': `${largura}px` }}
      >
        {/* Sombra no chão sob o bloco flutuante */}
        <div className="c3-sombra" />

        {/* Wrapper de bobbing suave com animação inercial */}
        <div className="c3-flutua">
          <div className="c3-cena">
            {/* FACE DO TOPO (Gramado FIFA, Linhas, Calor e Marcadores) */}
            <div className="c3-topo">
              <div className="c3-pista">
                {/* Nuvem de Calor Contínua */}
                {(modo === 'ambos' || modo === 'heatmap') && (
                  <>
                    <div className="c3-calor">
                      {celulasCalor.map((c) => (
                        <i
                          key={c.id}
                          style={{
                            left: c.left,
                            top: c.top,
                            width: c.width,
                            height: c.height,
                            background: c.background,
                            opacity: c.opacity
                          }}
                        />
                      ))}
                    </div>
                    {/* Brilho Especular no Ponto de Pico */}
                    <div
                      className="c3-brilho"
                      style={{
                        left: picoBrilho.x,
                        top: picoBrilho.y,
                        background: `radial-gradient(circle, ${picoBrilho.cor} 0%, transparent 70%)`,
                        opacity: picoBrilho.opacidade
                      }}
                    />
                  </>
                )}

                {/* Marcadores de Finalizações em 3D */}
                {(modo === 'ambos' || modo === 'shotmap') && (
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    {chutesProjetados.map((c) => {
                      const isHovered = hoveredShot?.idx === c.idx;
                      const isGol = c.resultado === 'goal';
                      const isSalvo = c.resultado === 'save';

                      const cor = isGol
                        ? '#38D98A'
                        : isSalvo
                        ? '#F5CE3B'
                        : '#E05D52';

                      const tamanho = Math.min(10, Math.max(5, Math.sqrt(c.xg) * 9));

                      return (
                        <div
                          key={c.id_evento || c.idx}
                          onMouseEnter={() => {
                            setHoveredShot(c);
                            if (onHoverShot) onHoverShot(c);
                          }}
                          onMouseLeave={() => {
                            setHoveredShot(null);
                            if (onHoverShot) onHoverShot(null);
                          }}
                          style={{
                            position: 'absolute',
                            left: c.left,
                            top: c.top,
                            transform: `translate(-50%, -50%) ${isHovered ? 'scale(1.4)' : 'scale(1)'}`,
                            width: `${tamanho}px`,
                            height: `${tamanho}px`,
                            borderRadius: '50%',
                            backgroundColor: cor,
                            border: '1.2px solid #ffffff',
                            boxShadow: isHovered
                              ? `0 0 8px ${cor}, 0 2px 4px rgba(0,0,0,0.8)`
                              : '0 1px 3px rgba(0,0,0,0.7)',
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            zIndex: isHovered ? 15 : 6,
                            transition: 'transform 150ms ease, box-shadow 150ms ease'
                          }}
                        >
                          {/* Anel pulsante em torno de gols */}
                          {isGol && (
                            <span
                              style={{
                                position: 'absolute',
                                inset: '-4px',
                                borderRadius: '50%',
                                border: `1.5px dashed ${cor}`,
                                animation: 'spin 6s linear infinite',
                                pointerEvents: 'none'
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Marcações Oficiais do Campo em CSS */}
              <div className="c3-linhas">
                <i className="borda" />
                <i className="meio" />
                <i className="circulo" />
                <i className="area n" />
                <i className="area s" />
                <i className="pequena n" />
                <i className="pequena s" />
                <i className="ponto centro" />
                <i className="ponto pn" />
                <i className="ponto ps" />
                <i className="canto no" />
                <i className="canto ne" />
                <i className="canto so" />
                <i className="canto se" />
              </div>

              {/* Sombras projetadas das goleiras */}
              <div className="c3-sombra-gol n" />
              <div className="c3-sombra-gol s" />
            </div>

            {/* PAREDES DE TERRA DO BLOCO (Sul e Oeste) */}
            <div className="c3-lado s" />
            <div className="c3-lado o" />

            {/* GOLEIRAS VERTICAIS COM PERSPECTIVA */}
            <div className="c3-gol n" />
            <div className="c3-gol s" />
          </div>
        </div>

        {/* GRÃOS DE TERRA CAINDO DA BORDA QUEBRADA */}
        <div className="c3-poeira">
          <i /><i /><i /><i /><i /><i /><i /><i /><i />
        </div>
      </div>

      {/* TOOLTIP FLUTUANTE DE FINALIZAÇÃO */}
      {hoveredShot && (
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(18, 18, 18, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-control)',
            padding: '5px 12px',
            fontSize: '0.72rem',
            color: '#ffffff',
            boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
            zIndex: 20,
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none'
          }}
        >
          <span style={{ fontWeight: 700 }}>
            {hoveredShot.resultado === 'goal' ? '⚽ GOL' : hoveredShot.resultado === 'save' ? '🧤 DEFESA' : '❌ FINALIZAÇÃO'}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.7)', marginLeft: '6px' }}>
            (xG: <strong className="font-mono" style={{ color: '#F5CE3B' }}>{Number(hoveredShot.xg).toFixed(2)}</strong>)
          </span>
          {hoveredShot.minuto && (
            <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '6px' }}>
              • {hoveredShot.minuto}'
            </span>
          )}
        </div>
      )}
    </div>
  );
}
