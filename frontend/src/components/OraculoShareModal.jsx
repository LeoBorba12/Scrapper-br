import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';

function _desenharCardCanvas(canvas, { mandante, visitante, simulacao, desfalquesMCount, desfalquesVCount }) {
  if (!canvas || !simulacao) return;
  const W = 1200;
  const H = 675;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const probs = simulacao.probabilidades || {};
  const topPlacar = (probs.top_placares || [])[0];
  const clima = simulacao.contexto_dinamico?.clima_prejogo;
  const formaM = (simulacao.contexto_dinamico?.forma_mandante?.forma_string || []).join(' ');
  const formaV = (simulacao.contexto_dinamico?.forma_visitante?.forma_string || []).join(' ');

  // Fundo Terminal Quant escuro com contraste AA+
  ctx.fillStyle = '#0D1117';
  ctx.fillRect(0, 0, W, H);

  // Moldura sutil
  ctx.strokeStyle = '#263040';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  // Barra superior de identidade
  ctx.fillStyle = '#22C55E';
  ctx.fillRect(24, 24, 340, 6);
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(364, 24, 180, 6);

  // Cabeçalho
  ctx.fillStyle = '#94A3B8';
  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.fillText('FUTSTATS  •  ORÁCULO PREDITIVO HÍBRIDO 2026', 56, 76);

  // Badge de confiança no canto direito
  const confText = `${simulacao.incerteza?.nivel_confianca || 'Moderada'} (±${simulacao.incerteza?.margem_conformal_pct ?? 8}%)`;
  ctx.font = '700 16px "JetBrains Mono", monospace';
  const confW = ctx.measureText(confText).width + 28;
  ctx.fillStyle = simulacao.incerteza?.nivel_confianca === 'Alta Confiança' ? '#052E16' : '#2C1B12';
  ctx.fillRect(W - 56 - confW, 50, confW, 34);
  ctx.strokeStyle = simulacao.incerteza?.nivel_confianca === 'Alta Confiança' ? '#22C55E' : '#F59E0B';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(W - 56 - confW, 50, confW, 34);
  ctx.fillStyle = simulacao.incerteza?.nivel_confianca === 'Alta Confiança' ? '#4ADE80' : '#FBBF24';
  ctx.fillText(confText, W - 56 - confW + 14, 73);

  // Título do Confronto
  ctx.fillStyle = '#F8FAFC';
  ctx.font = '800 46px "Inter", system-ui, sans-serif';
  ctx.fillText(`${mandante.toUpperCase()}  ×  ${visitante.toUpperCase()}`, 56, 150);

  // Manchete do Veredito
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '500 22px "Inter", system-ui, sans-serif';
  const manchete = simulacao.veredito?.manchete || '';
  ctx.fillText(manchete.slice(0, 74), 56, 192);

  // Sinais dinâmicos (Forma + Clima)
  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 16px "JetBrains Mono", monospace';
  const linhaSinais = [
    formaM ? `${mandante.slice(0, 3).toUpperCase()} 5J: ${formaM}` : null,
    formaV ? `${visitante.slice(0, 3).toUpperCase()} 5J: ${formaV}` : null,
    clima ? `${clima.chuva_mm >= 1 ? 'CHUVA' : 'CLIMA'} ${clima.cidade}: ${clima.temperatura_c}°C • ${clima.chuva_mm}mm` : null
  ]
    .filter(Boolean)
    .join('   |   ');
  ctx.fillText(linhaSinais, 56, 234);

  // Barra Tricolor de Probabilidades
  const barX = 56;
  const barY = 266;
  const barW = W - 112;
  const barH = 74;
  const pM = Number(probs.prob_mandante || 33.3);
  const pE = Number(probs.prob_empate || 33.4);
  const pV = Number(probs.prob_visitante || 33.3);
  const wM = (barW * pM) / 100;
  const wE = (barW * pE) / 100;
  const wV = barW - wM - wE;

  ctx.fillStyle = '#22C55E';
  ctx.fillRect(barX, barY, wM, barH);
  ctx.fillStyle = '#334155';
  ctx.fillRect(barX + wM, barY, wE, barH);
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(barX + wM + wE, barY, wV, barH);

  ctx.textAlign = 'center';
  ctx.font = '800 24px "JetBrains Mono", monospace';
  ctx.fillStyle = '#052E16';
  if (wM > 110) ctx.fillText(`${mandante.slice(0, 3).toUpperCase()} ${pM}%`, barX + wM / 2, barY + 46);
  ctx.fillStyle = '#F8FAFC';
  if (wE > 95) ctx.fillText(`EMP ${pE}%`, barX + wM + wE / 2, barY + 46);
  ctx.fillStyle = '#1F1300';
  if (wV > 110) ctx.fillText(`${visitante.slice(0, 3).toUpperCase()} ${pV}%`, barX + wM + wE + wV / 2, barY + 46);
  ctx.textAlign = 'left';

  // 3 Blocos de KPIs
  const cards = [
    {
      label: 'GOLS ESPERADOS (xG)',
      valor: `${simulacao.lambda_mandante ?? '-'}  ×  ${simulacao.lambda_visitante ?? '-'}`,
      sub: `Over 2.5: ${probs.prob_over_2_5 ?? '-'}%  •  BTTS: ${probs.prob_btts_sim ?? '-'}%`
    },
    {
      label: 'FAIR ODDS (ORÁCULO)',
      valor: `${probs.fair_odd_mandante ?? '-'} / ${probs.fair_odd_empate ?? '-'} / ${probs.fair_odd_visitante ?? '-'}`,
      sub: 'Pi-Ratings + Dixon-Coles + Forma 5J'
    },
    {
      label: 'PLACAR MAIS PROVÁVEL',
      valor: topPlacar ? `${topPlacar.placar} (${topPlacar.prob_pct}%)` : '—',
      sub:
        desfalquesMCount + desfalquesVCount > 0
          ? `Desfalques ativos: ${mandante.slice(0, 3).toUpperCase()} (${desfalquesMCount}) • ${visitante.slice(0, 3).toUpperCase()} (${desfalquesVCount})`
          : 'Força máxima projetada (sem desfalques)'
    }
  ];

  const cardW = (barW - 36) / 3;
  cards.forEach((c, i) => {
    const cx = barX + i * (cardW + 18);
    const cy = 376;
    ctx.fillStyle = '#161B22';
    ctx.fillRect(cx, cy, cardW, 158);
    ctx.strokeStyle = '#263040';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx, cy, cardW, 158);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '700 15px "JetBrains Mono", monospace';
    ctx.fillText(c.label, cx + 22, cy + 38);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '800 32px "JetBrains Mono", monospace';
    ctx.fillText(c.valor, cx + 22, cy + 92);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 14px "Inter", system-ui, sans-serif';
    ctx.fillText(c.sub, cx + 22, cy + 132);
  });

  // Rodapé editorial
  ctx.fillStyle = '#64748B';
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.fillText('MODELO HÍBRIDO VALIDADO (BACKTEST RPS 0.2079)  •  DADOS REAIS BRASILEIRÃO', 56, 614);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#22C55E';
  ctx.fillText('scrapper-br.vercel.app', W - 56, 614);
  ctx.textAlign = 'left';
}

export default function OraculoShareModal({
  aberto,
  onClose,
  mandante,
  visitante,
  simulacao,
  desfalquesMCount = 0,
  desfalquesVCount = 0
}) {
  const canvasRef = useRef(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!aberto || !simulacao) return;
    const t = setTimeout(() => {
      _desenharCardCanvas(canvasRef.current, {
        mandante,
        visitante,
        simulacao,
        desfalquesMCount,
        desfalquesVCount
      });
    }, 30);
    return () => clearTimeout(t);
  }, [aberto, mandante, visitante, simulacao, desfalquesMCount, desfalquesVCount]);

  if (!aberto || !simulacao) return null;

  const probs = simulacao.probabilidades || {};
  const clima = simulacao.contexto_dinamico?.clima_prejogo;

  const textoTweet = [
    `🔮 Oráculo FutStats: ${mandante} x ${visitante}`,
    `📊 Probabilidades: ${mandante} ${probs.prob_mandante}% | Empate ${probs.prob_empate}% | ${visitante} ${probs.prob_visitante}%`,
    `⚽ xG Esperado: ${simulacao.lambda_mandante} x ${simulacao.lambda_visitante} (Fair Odds: ${probs.fair_odd_mandante} / ${probs.fair_odd_empate} / ${probs.fair_odd_visitante})`,
    clima ? `${clima.chuva_mm >= 1 ? '🌧️' : '☀️'} Clima (${clima.cidade}): ${clima.temperatura_c}°C • ${clima.chuva_mm}mm` : null,
    `Simule desfalques e cenários ao vivo: https://scrapper-br.vercel.app/?tab=oraculo-preditivo`,
    `#Brasileirao #FutStats #Analytics`
  ]
    .filter(Boolean)
    .join('\n');

  const baixarPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    const slug = `${mandante}-x-${visitante}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `oraculo-futstats-${slug}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const copiarTexto = async () => {
    try {
      await navigator.clipboard.writeText(textoTweet);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      // Fallback silencioso
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Card compartilhável para X / Twitter"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="soft-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
              Exportação 16:9 • X / Twitter
            </div>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '1.08rem', color: 'var(--text-primary)' }}>
              Card Compartilhável — {mandante} × {visitante}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            style={{
              background: 'none',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            display: 'block'
          }}
        />

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            onClick={copiarTexto}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 14px',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--surface-raised)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {copiado ? <Check size={15} color="#22C55E" /> : <Copy size={15} />}
            <span>{copiado ? 'Texto copiado!' : 'Copiar Texto p/ X'}</span>
          </button>
          <button
            onClick={baixarPng}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 16px',
              borderRadius: 'var(--radius-control)',
              border: 'none',
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Download size={15} />
            <span>Baixar PNG (1200×675)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
