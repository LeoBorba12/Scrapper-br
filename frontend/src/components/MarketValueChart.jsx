import React, { useState, useEffect } from 'react';
import { TrendingUp, Euro, DollarSign, Calendar, Shield, Award, Sparkles } from 'lucide-react';
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
      <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center h-56 transition-all ${
        darkMode ? 'bg-[#22201C] border-[#38332B]' : 'bg-[#FAF6F0] border-[#E2D7C7]'
      }`}>
        <div className="w-8 h-8 border-3 border-[#85573B] border-t-transparent rounded-full animate-spin mb-2" />
        <span className={`text-xs ${darkMode ? 'text-[#C9BAA9]' : 'text-[#5C5549]'}`}>
          Carregando histórico financeiro...
        </span>
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
  const minVal = 0;
  const svgWidth = 600;
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
    <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
      darkMode ? 'bg-[#22201C] border-[#38332B] text-[#F1E8DE]' : 'bg-[#FAF6F0] border-[#E2D7C7] text-[#1B1A17]'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-[#E2D7C7] dark:border-[#38332B]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#85573B]/10 text-[#85573B]">
            <TrendingUp className="w-3.5 h-3.5" />
            Mercado da Bola • Curva de Avaliação
          </div>
          <h3 className="text-xl font-bold font-editorial tracking-tight">
            Evolução do Valor de Mercado
          </h3>
          <p className={`text-xs ${darkMode ? 'text-[#C9BAA9]' : 'text-[#5C5549]'}`}>
            Histórico cronológico de valorização econômica e picos na carreira.
          </p>
        </div>

        {/* Toggles Moeda */}
        <div className={`flex p-1 rounded-xl border self-start sm:self-center ${
          darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#EAE1D5] border-[#D4C6B3]'
        }`}>
          <button
            onClick={() => setMoeda('EUR')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              moeda === 'EUR'
                ? 'bg-[#85573B] text-white shadow-sm'
                : (darkMode ? 'text-[#8A8175] hover:text-white' : 'text-[#7D7365] hover:text-[#1B1A17]')
            }`}
          >
            € Euros
          </button>
          <button
            onClick={() => setMoeda('BRL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              moeda === 'BRL'
                ? 'bg-[#85573B] text-white shadow-sm'
                : (darkMode ? 'text-[#8A8175] hover:text-white' : 'text-[#7D7365] hover:text-[#1B1A17]')
            }`}
          >
            R$ Reais
          </button>
        </div>
      </div>

      {/* Cards de Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-white border-[#E2D7C7]'}`}>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
            Valor Atual
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#85573B] mt-1">
            {formatarValor(valorAtualEur, valorAtualBrl)}
          </div>
          <span className="text-[10px] text-secondary">Cotação temporada 2026</span>
        </div>

        <div className={`p-4 rounded-xl border ${darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-white border-[#E2D7C7]'}`}>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">
            Pico Histórico
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-primary mt-1">
            {formatarValor(picoEur, picoBrl)}
          </div>
          <span className="text-[10px] text-secondary">Maior valor na carreira</span>
        </div>

        {pontoAtivo && (
          <div className={`col-span-2 sm:col-span-1 p-4 rounded-xl border ${
            darkMode ? 'bg-[#85573B]/10 border-[#85573B]/30' : 'bg-[#85573B]/5 border-[#85573B]/20'
          }`}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#85573B]">
              Ano Selecionado: {pontoAtivo.ano}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <ClubBadge clube={pontoAtivo.clube_na_epoca} size={20} />
              <span className="text-sm font-bold text-primary truncate">
                {pontoAtivo.clube_na_epoca}
              </span>
            </div>
            <span className="text-[10px] text-secondary">
              {pontoAtivo.idade_na_epoca} anos • {formatarValor(pontoAtivo.valor_eur, pontoAtivo.valor_brl)}
            </span>
          </div>
        )}
      </div>

      {/* Gráfico Vetorial Interativo */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[500px]">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 overflow-visible">
            <defs>
              <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#85573B" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#85573B" stopOpacity="0.0" />
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
                  stroke={darkMode ? '#38332B' : '#E2D7C7'}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              );
            })}

            {/* Área Preenchida com Gradiente */}
            <path d={areaD} fill="url(#valueGrad)" />

            {/* Linha da Curva de Valor */}
            <path
              d={pathD}
              fill="none"
              stroke="#85573B"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Pontos Clicáveis da Linha Temporal */}
            {points.map((p, i) => {
              const isSelected = pontoAtivo?.ano === p.data.ano;
              const isPeak = p.data.pico_historico === 1;

              return (
                <g key={i} className="cursor-pointer" onClick={() => setPontoAtivo(p.data)}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 7 : (isPeak ? 6 : 4.5)}
                    fill={isPeak ? '#D4AF37' : (isSelected ? '#85573B' : (darkMode ? '#FAF6F0' : '#1B1A17'))}
                    stroke="#85573B"
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all hover:r-8"
                  />
                  {/* Rótulo do Ano */}
                  <text
                    x={p.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fill={darkMode ? '#8A8175' : '#7D7365'}
                    fontSize="11"
                    fontFamily="monospace"
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
