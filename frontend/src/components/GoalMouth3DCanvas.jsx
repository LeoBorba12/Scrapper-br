import React, { useRef, useEffect, useState, useMemo } from 'react';

/**
 * GoalMouth3DCanvas - Baliza Oficial FIFA 3D com Física de Rede e Vento (Canvas 2D)
 * Adaptado do projeto CraqueView para a identidade editorial FutStats 2026.
 *
 * Propriedades:
 * - finalizacoes: lista de remates com { gol_mouth_y, gol_mouth_z, resultado, xg, minuto, adversario }
 * - vento: intensidade da brisa na rede (0.1 a 1.0)
 * - altura: altura do canvas em px (default: 230)
 * - onHoverTarget: callback ao passar o cursor sobre um alvo (ou null)
 */
export default function GoalMouth3DCanvas({
  finalizacoes = [],
  vento = 0.55,
  altura = 230,
  onHoverTarget = null
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [pontosProjetados, setPontosProjetados] = useState([]);

  // ============================================================================
  // 1. MOTOR GRÁFICO 3D PINHOLE + SIMULAÇÃO DE TECIDO DA REDE
  // ============================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Medidas oficiais da baliza (metros)
    const GW = 7.32, GH = 2.44, HW = GW / 2, DEEP = 1.95;
    const EYE = [-3.05, 1.70, 7.55];
    const TGT = [0.05, 1.00, -0.55];
    const WDX = 0.93, WDZ = 0.37; // Direção do vento no chão

    // Álgebra vetorial ortonormal
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const cross = (a, b) => [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
    const norm = (a) => {
      const l = Math.hypot(a[0], a[1], a[2]) || 1;
      return [a[0] / l, a[1] / l, a[2] / l];
    };

    const FWD = norm(sub(TGT, EYE));
    const RGT = norm(cross(FWD, [0, 1, 0]));
    const UPV = cross(RGT, FWD);

    let F = 1, CX = 0, CY = 0, W = 0, H = 0, DPR = 1;

    function proj(x, y, z) {
      const dx = x - EYE[0], dy = y - EYE[1], dz = z - EYE[2];
      const d = dx * FWD[0] + dy * FWD[1] + dz * FWD[2];
      const s = F / (d > 0.15 ? d : 0.15);
      return [
        CX + (dx * RGT[0] + dy * RGT[1] + dz * RGT[2]) * s,
        CY - (dx * UPV[0] + dy * UPV[1] + dz * UPV[2]) * s,
        d
      ];
    }

    // Função de onda do vento
    function ventoFunc(x, z, t) {
      const s =
        0.55 * Math.sin(0.55 * x + 0.30 * z - 1.45 * t) +
        0.30 * Math.sin(0.90 * x - 0.42 * z - 2.30 * t + 1.7) +
        0.15 * Math.sin(1.70 * x + 0.60 * z - 3.40 * t + 4.1);
      const rajada = 0.58 + 0.42 * Math.sin(t * 0.41) * Math.sin(t * 0.26 + 1.1);
      return s * rajada;
    }

    // Perfil curvo da rede
    const PROF = [
      [0, 1],
      [0.30, 0.982],
      [0.52, 0.885],
      [0.70, 0.700],
      [0.85, 0.440],
      [0.95, 0.200],
      [1, 0]
    ];

    function perfil(v) {
      const f = Math.min(Math.max(v, 0), 1) * (PROF.length - 1);
      const i = Math.min(Math.floor(f), PROF.length - 2);
      const k = f - i;
      return [
        -DEEP * (PROF[i][0] + (PROF[i + 1][0] - PROF[i][0]) * k),
        GH * (PROF[i][1] + (PROF[i + 1][1] - PROF[i][1]) * k)
      ];
    }

    // Geração de gramado com lâminas de relva
    const TONS = ['#16351d', '#1c4023', '#234c29', '#2a5931', '#33693a'];
    const LARG = [0.8, 1.4, 2.2, 3.2];
    let grupos = [], horY = 0;

    function noChao(sx, sy) {
      const a = (sx - CX) / F, b = -(sy - CY) / F;
      const dy = FWD[1] + a * RGT[1] + b * UPV[1];
      if (dy > -1e-4) return null;
      const k = -EYE[1] / dy;
      if (k > 27) return null;
      return [
        EYE[0] + k * (FWD[0] + a * RGT[0] + b * UPV[0]),
        EYE[2] + k * (FWD[2] + a * RGT[2] + b * UPV[2]),
        k
      ];
    }

    function semear() {
      horY = proj(0, 0, -900)[1];
      grupos = TONS.flatMap((c) =>
        LARG.map((l) => ({ cor: c, lw: l * DPR, atras: [], frente: [] }))
      );
      const y0 = Math.max(horY + 2, 0);
      const faixa = H + 14 - y0;
      if (faixa <= 0) return;

      const alvo = Math.round(Math.min(1800, ((W + 20) * faixa) / (58 * DPR * DPR)));
      let seed = 20261104, feitas = 0, tent = 0;
      const rnd = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };

      while (feitas < alvo && tent++ < alvo * 8) {
        const g = noChao(-10 + rnd() * (W + 20), y0 + rnd() * faixa);
        if (!g) continue;
        feitas++;
        const k = g[2];
        const lam = {
          x: g[0],
          z: g[1],
          h: (0.040 + rnd() * 0.055) * Math.min(1.85, 1 + 0.036 * k),
          rig: 0.55 + rnd() * 0.85,
          fase: rnd() * 6.28,
          pend: (rnd() - 0.5) * 0.55
        };
        let ti = Math.round(rnd() * 4);
        if (k > 11) ti = Math.max(0, ti - 1);
        const px = ((0.011 + rnd() * 0.010) * F) / k;
        const li = px < 1.1 ? 0 : px < 1.8 ? 1 : px < 2.8 ? 2 : 3;
        const gr = grupos[ti * LARG.length + li];
        (lam.z < -0.05 ? gr.atras : gr.frente).push(lam);
      }
    }

    // Desenha solo do gramado e faixas de corte
    function chao() {
      const hor = proj(0, 0, -900)[1];
      const g = ctx.createLinearGradient(0, hor, 0, H);
      g.addColorStop(0, '#152d1c');
      g.addColorStop(0.32, '#1d4325');
      g.addColorStop(0.70, '#20492a');
      g.addColorStop(1, '#22502d');
      ctx.fillStyle = g;
      ctx.fillRect(0, hor, W, H - hor);

      // Faixas esportivas de corte convergindo
      for (let i = -8; i < 8; i++) {
        if (i % 2) continue;
        const a = proj(i * 1.85, 0, -60);
        const b = proj(i * 1.85 + 1.85, 0, -60);
        const c = proj(i * 1.85 + 1.85, 0, 5.4);
        const d = proj(i * 1.85, 0, 5.4);
        ctx.fillStyle = 'rgba(255,255,255,.022)';
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.lineTo(c[0], c[1]);
        ctx.lineTo(d[0], d[1]);
        ctx.closePath();
        ctx.fill();
      }

      // Linha de fundo oficial
      ctx.strokeStyle = 'rgba(255,255,255,.18)';
      ctx.lineWidth = Math.max(1, 1.6 * DPR);
      const l0 = proj(-11, 0.005, 0);
      const l1 = proj(11, 0.005, 0);
      ctx.beginPath();
      ctx.moveTo(l0[0], l0[1]);
      ctx.lineTo(l1[0], l1[1]);
      ctx.stroke();

      // Sombra sob a baliza
      const c = proj(0, 0, -DEEP * 0.45);
      const r = (proj(HW + 0.7, 0, -DEEP * 0.45)[0] - proj(-HW - 0.7, 0, -DEEP * 0.45)[0]) * 0.5;
      const sg = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], r);
      sg.addColorStop(0, 'rgba(0,0,0,.42)');
      sg.addColorStop(0.6, 'rgba(0,0,0,.18)');
      sg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.translate(c[0], c[1]);
      ctx.scale(1, 0.19);
      ctx.translate(-c[0], -c[1]);
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(c[0], c[1], r, 0, 6.2832);
      ctx.fill();
      ctx.restore();
    }

    // Desenha relva dinâmica oscilando com o vento
    function desenhaGrama(t, campo) {
      ctx.lineCap = 'round';
      for (const gr of grupos) {
        const lista = gr[campo];
        if (!lista.length) continue;
        ctx.strokeStyle = gr.cor;
        ctx.lineWidth = gr.lw;
        ctx.beginPath();
        for (const b of lista) {
          const w = (ventoFunc(b.x, b.z, t + b.fase * 0.05) * vento) / b.rig;
          const dx = (WDX * w + b.pend) * b.h * 0.85;
          const dz = (WDZ * w + b.pend * 0.4) * b.h * 0.85;
          const hy = b.h * (0.98 - 0.22 * Math.abs(w));
          const p0 = proj(b.x, 0, b.z);
          const p1 = proj(b.x + dx * 0.30, hy * 0.58, b.z + dz * 0.30);
          const p2 = proj(b.x + dx, hy, b.z + dz);
          ctx.moveTo(p0[0], p0[1]);
          ctx.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]);
        }
        ctx.stroke();
      }
    }

    // Malha da rede com deformação balística pelo vento
    const NU = 23, NV = 13, SU = 10, SV = 9;
    const gridFundo = [], gridLat = [[], []];

    function malha(t) {
      const amp = 0.30 * vento;
      // Painel de fundo
      for (let j = 0; j < NV; j++) {
        const v = j / (NV - 1), pr = perfil(v);
        for (let i = 0; i < NU; i++) {
          const u = i / (NU - 1), x = -HW + GW * u;
          const bojo = Math.sin(Math.PI * u) * Math.sin(Math.PI * Math.min(v * 1.12, 1));
          const w = ventoFunc(x, pr[0], t) * amp * bojo;
          gridFundo[j * NU + i] = proj(x + w * 0.30, pr[1] + w * 0.22, pr[0] + w * 0.92);
        }
      }
      // Painéis laterais
      for (let s = 0; s < 2; s++) {
        const sx = s ? HW : -HW;
        for (let i = 0; i < SU; i++) {
          const v = i / (SU - 1), pr = perfil(v);
          for (let j = 0; j < SV; j++) {
            const f = j / (SV - 1), y = pr[1] * f;
            const bojo = Math.sin(Math.PI * v) * Math.sin(Math.PI * f);
            const w = ventoFunc(sx, pr[0], t) * amp * bojo * 0.8;
            gridLat[s][i * SV + j] = proj(sx + w * (s ? 0.95 : -0.95), y + w * 0.10, pr[0] + w * 0.20);
          }
        }
      }
    }

    function tracar(pts) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
    }

    function renderRede() {
      ctx.lineWidth = Math.max(0.6, 0.95 * DPR);
      ctx.lineJoin = 'round';
      // Laterais
      for (let s = 0; s < 2; s++) {
        ctx.strokeStyle = s ? 'rgba(226,240,232,.22)' : 'rgba(226,240,232,.30)';
        for (let i = 0; i < SU; i++) {
          const c = [];
          for (let j = 0; j < SV; j++) c.push(gridLat[s][i * SV + j]);
          tracar(c);
        }
        for (let j = 0; j < SV; j++) {
          const r = [];
          for (let i = 0; i < SU; i++) r.push(gridLat[s][i * SV + j]);
          tracar(r);
        }
      }
      // Fundo principal
      ctx.strokeStyle = 'rgba(232,244,236,.36)';
      for (let i = 0; i < NU; i++) {
        const c = [];
        for (let j = 0; j < NV; j++) c.push(gridFundo[j * NU + i]);
        tracar(c);
      }
      for (let j = 0; j < NV; j++) {
        const r = [];
        for (let i = 0; i < NU; i++) r.push(gridFundo[j * NU + i]);
        tracar(r);
      }
    }

    // Traves tubulares com iluminação reflexiva
    function tubo(a, b, esp, cor, passos) {
      ctx.strokeStyle = cor;
      ctx.lineCap = 'round';
      for (let k = 0; k < passos; k++) {
        const t0 = k / passos, t1 = (k + 1) / passos;
        const p = proj(a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0, a[2] + (b[2] - a[2]) * t0);
        const q = proj(a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1, a[2] + (b[2] - a[2]) * t1);
        ctx.lineWidth = Math.max(1, (esp * F) / ((p[2] + q[2]) * 0.5));
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(q[0], q[1]);
        ctx.stroke();
      }
    }

    function estrutura() {
      tubo([-HW, 0.02, -DEEP], [HW, 0.02, -DEEP], 0.042, 'rgba(214,228,220,.45)', 8);
      tubo([-HW, 0.02, 0], [-HW, 0.02, -DEEP], 0.05, 'rgba(214,228,220,.45)', 5);
      tubo([HW, 0.02, 0], [HW, 0.02, -DEEP], 0.05, 'rgba(214,228,220,.45)', 5);
      tubo([-HW, 0, 0], [-HW, GH, 0], 0.12, '#eef4f0', 4);
      tubo([HW, 0, 0], [HW, GH, 0], 0.12, '#dfe8e3', 4);
      tubo([-HW, GH, 0], [HW, GH, 0], 0.12, '#eef4f0', 14);
      tubo([-HW, GH + 0.035, 0], [HW, GH + 0.035, 0], 0.03, 'rgba(255,255,255,.60)', 14);
    }

    // Calcula coordenadas CSS da boca da baliza (x: 0..1 esq->dir, y: 0..1 chao->travessao)
    function bocaCoords(nx, ny) {
      const q = proj(-HW + GW * nx, GH * ny, 0);
      return [q[0] / DPR, q[1] / DPR];
    }

    function recalcularTamanho() {
      const r = canvas.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(2, Math.round(r.width * DPR));
      H = Math.max(2, Math.round(r.height * DPR));

      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
        F = 1; CX = 0; CY = 0;

        let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        const cantos = [
          [-HW, 0, 0], [HW, 0, 0],
          [-HW, GH, 0], [HW, GH, 0],
          [-HW, 0, -DEEP], [HW, 0, -DEEP]
        ];
        for (const q of cantos) {
          const s = proj(q[0], q[1], q[2]);
          if (s[0] < x0) x0 = s[0];
          if (s[0] > x1) x1 = s[0];
          if (s[1] < y0) y0 = s[1];
          if (s[1] > y1) y1 = s[1];
        }

        F = Math.min((W * 0.88) / (x1 - x0), (H * 0.62) / (y1 - y0));
        CX = W * 0.5 - (x0 + x1) * 0.5 * F;
        CY = H * 0.08 - y0 * F;
        semear();

        // Mapeia posições 2D na tela para o overlay interativo
        atualizarPontosOverlay();
      }
    }

    function atualizarPontosOverlay() {
      if (!finalizacoes || !finalizacoes.length) {
        setPontosProjetados([]);
        return;
      }
      const pts = finalizacoes.map((item, idx) => {
        const nx = Math.min(Math.max((Number(item.gol_mouth_y) || 50) / 100, 0.03), 0.97);
        const ny = Math.min(Math.max((Number(item.gol_mouth_z) || 50) / 100, 0.03), 0.97);
        const [px, py] = bocaCoords(nx, ny);
        return { ...item, idx, px, py };
      });
      setPontosProjetados(pts);
    }

    function desenharQuadro(t) {
      recalcularTamanho();
      ctx.clearRect(0, 0, W, H);
      chao();
      desenhaGrama(t, 'atras');
      malha(t);
      renderRede();
      estrutura();
      desenhaGrama(t, 'frente');
    }

    // Ciclo de Animação com detecção de visibilidade
    let raf = 0, t0 = null, visivel = true;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animar(ms) {
      if (t0 === null) t0 = ms;
      desenharQuadro((ms - t0) / 1000);
      raf = visivel && !reducedMotion ? requestAnimationFrame(animar) : 0;
    }

    if (reducedMotion) {
      requestAnimationFrame(() => desenharQuadro(3.2));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          visivel = entries[0]?.isIntersecting ?? true;
          if (visivel && !raf) raf = requestAnimationFrame(animar);
        },
        { threshold: 0.05 }
      );
      observer.observe(canvas);
      engineRef.current = { observer };
    }

    const onResize = () => {
      if (!raf) requestAnimationFrame(() => desenharQuadro(3.2));
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
      if (engineRef.current?.observer) engineRef.current.observer.disconnect();
    };
  }, [vento, finalizacoes]);

  // ============================================================================
  // 2. RENDERIZAÇÃO DO CANVAS + CAMADA DE INTERAÇÃO FLUTUANTE
  // ============================================================================
  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: `${altura}px`,
        backgroundColor: '#122518', // Fundo gramado escurecido editorial
        borderRadius: 'var(--radius-panel)',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)'
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />

      {/* OVERLAY DE ALVOS/FINALIZAÇÕES PROJETADOS NA BOCA DA BALIZA */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        {pontosProjetados.map((p) => {
          const isHovered = hoveredIdx === p.idx;
          const isGol = p.resultado === 'goal';
          const isSalvo = p.resultado === 'save';

          const cor = isGol
            ? '#38D98A' // Emerald
            : isSalvo
            ? '#F5CE3B' // Gold
            : '#E05D52'; // Terracota

          return (
            <g
              key={p.id_evento || p.idx}
              style={{
                pointerEvents: 'auto',
                cursor: 'pointer'
              }}
              onMouseEnter={() => {
                setHoveredIdx(p.idx);
                if (onHoverTarget) onHoverTarget(p);
              }}
              onMouseLeave={() => {
                setHoveredIdx(null);
                if (onHoverTarget) onHoverTarget(null);
              }}
            >
              {/* Anel de impacto para gols */}
              {isGol && (
                <circle
                  cx={p.px}
                  cy={p.py}
                  r={isHovered ? 13 : 9}
                  fill="none"
                  stroke={cor}
                  strokeWidth={isHovered ? 1.8 : 1.2}
                  opacity={isHovered ? 0.9 : 0.6}
                  strokeDasharray="2,2"
                />
              )}

              {/* Ponto da bola com brilho radial */}
              <circle
                cx={p.px}
                cy={p.py}
                r={isHovered ? 6 : 4.2}
                fill={cor}
                stroke="#ffffff"
                strokeWidth={isHovered ? 1.6 : 1.0}
                style={{
                  filter: isHovered
                    ? `drop-shadow(0 0 6px ${cor})`
                    : 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))',
                  transition: 'r 150ms ease, filter 150ms ease'
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* BADGE DE CONTROLE DE VENTO / ESTADO */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.66rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.7)',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '3px 8px',
          borderRadius: '999px',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: '#38D98A',
            animation: 'pulse 2s infinite'
          }}
        />
        Rede 3D Dinâmica ({Math.round(vento * 100)}% brisa)
      </div>
    </div>
  );
}
