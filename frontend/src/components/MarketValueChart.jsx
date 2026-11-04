import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import ClubBadge from './ClubBadge';

export default function MarketValueChart({ atleta, darkMode }) {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pontoAtivo, setPontoAtivo] = useState(null);
  const [moeda, setMoeda] = useState('EUR'); // 'EUR' | 'BRL'

  useEffect(() => {
    if (!atleta) return;
    let isMounted = true;
    setLoading(true);

    fetch(`/api/jogadores/valor-mercado?atleta=${encodeURIComponent(atleta)}`)
      .then(res => res.json())
      .then(json => {
        if (isMounted) {
          setDados(json);
          const hist = json.historico || [];
          setPontoAtivo(hist.length > 0 ? hist[hist.length - 1] : null);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar valor de mercado:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [atleta]);

  const historico = dados?.historico || [];

  if (loading) {
    return (
      <div 
        className="editorial-panel"
        style={{
          padding: '24px',
          backgroundColor: 'var(--surface-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-panel)',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem'
        }}
      >
        Carregando histórico financeiro...
      </div>
    );
  }

  if (historico.length === 0) {
    return null;
  }

  const formatarValor = (eur, brl) => {
    if (moeda === 'EUR') {
      if (eur >= 1_000_000) return `€ ${(eur / 1_000_000).toFixed(1)}M`;
      if (eur >= 1_000) return `€ ${(eur / 1_000).toFixed(0)} mil`;
      return `€ ${eur}`;
    } else {
      if (brl >= 1_000_000) return `R$ ${(brl / 1_000_000).toFixed(1)}M`;
      if (brl >= 1_000) return `R$ ${(brl / 1_000).toFixed(0)} mil`;
      return `R$ ${brl}`;
    }
  };

  const valorAtualEur = dados?.valor_atual_eur || 0;
  const valorAtualBrl = dados?.valor_atual_brl || 0;
  const picoEur = dados?.pico_eur || 0;
  const picoBrl = picoEur * 6.10;

  // Cálculo dos pontos SVG
  const maxVal = Math.max(...historico.map(h => moeda === 'EUR' ? h.valor_eur : h.valor_brl), 1);
  const svgWidth = 620;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 25;

  const points = historico.map((h, i) => {
    const val = moeda === 'EUR' ? h.valor_eur : h.valor_brl;
    const x = paddingX + (i / Math.max(historico.length - 1, 1)) * (svgWidth - 2 * paddingX);
    const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - 2 * paddingY);
    return { x, y, data: h };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div 
      className="editorial-panel"
      style={{
        padding: '24px',
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-panel)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '14px',
          gap: '12px'
        }}
      >
        <div>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--surface-raised)',
              color: 'var(--accent)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}
          >
            <TrendingUp size={13} />
            <span>Mercado da Bola • Curva de Avaliação</span>
          </div>
          <h3 
            className="font-editorial"
            style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}
          >
            Evolução do Valor de Mercado
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Histórico cronológico de valorização econômica e picos na carreira.
          </p>
        </div>

        {/* Toggles Moeda */}
        <div 
          style={{
            display: 'flex',
            gap: '4px',
            padding: '3px',
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-control)'
          }}
        >
          <button
            onClick={() => setMoeda('EUR')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-control)',
              fontSize: '0.76rem',
              fontWeight: moeda === 'EUR' ? 700 : 500,
              backgroundColor: moeda === 'EUR' ? 'var(--accent)' : 'transparent',
              color: moeda === 'EUR' ? 'var(--accent-foreground)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            € Euros
          </button>
          <button
            onClick={() => setMoeda('BRL')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-control)',
              fontSize: '0.76rem',
              fontWeight: moeda === 'BRL' ? 700 : 500,
              backgroundColor: moeda === 'BRL' ? 'var(--accent)' : 'transparent',
              color: moeda === 'BRL' ? 'var(--accent-foreground)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            R$ Reais
          </button>
        </div>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px'
        }}
      >
        <div 
          style={{
            padding: '14px 16px',
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-panel)'
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Valor Atual
          </span>
          <div className="font-mono" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--accent)', marginTop: '4px' }}>
            {formatarValor(valorAtualEur, valorAtualBrl)}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Cotação 2026</span>
        </div>

        <div 
          style={{
            padding: '14px 16px',
            backgroundColor: 'var(--surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-panel)'
          }}
        >
          <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Pico Histórico
          </span>
          <div className="font-mono" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {formatarValor(picoEur, picoBrl)}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Maior cotação na carreira</span>
        </div>

        {pontoAtivo && (
          <div 
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-panel)'
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)' }}>
              Ano Selecionado: {pontoAtivo.ano}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <ClubBadge nome={pontoAtivo.clube_na_epoca} size={18} />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {pontoAtivo.clube_na_epoca}
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {pontoAtivo.idade_na_epoca} anos • {formatarValor(pontoAtivo.valor_eur, pontoAtivo.valor_brl)}
            </span>
          </div>
        )}
      </div>

      {/* Gráfico Vetorial Interativo */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ minWidth: '480px' }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '170px', overflow: 'visible' }}>
            <defs>
              <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Linhas de Grade de Fundo */}
            {[0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
              const y = svgHeight - paddingY - frac * (svgHeight - 2 * paddingY);
              return (
                <line
                  key={idx}
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              );
            })}

            {/* Área Preenchida */}
            <path d={areaD} fill="url(#valueGrad)" />

            {/* Linha da Curva de Valor */}
            <path
              d={pathD}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Pontos Clicáveis da Linha Temporal */}
            {points.map((p, i) => {
              const isSelected = pontoAtivo?.ano === p.data.ano;
              const isPeak = p.data.pico_historico === 1;

              return (
                <g key={i} style={{ cursor: 'pointer' }} onClick={() => setPontoAtivo(p.data)}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 6.5 : (isPeak ? 5.5 : 4)}
                    fill={isPeak ? '#D4AF37' : (isSelected ? 'var(--accent)' : 'var(--surface-card)')}
                    stroke="var(--accent)"
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <text
                    x={p.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fill="var(--text-secondary)"
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                  >
                    {p.data.ano}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
