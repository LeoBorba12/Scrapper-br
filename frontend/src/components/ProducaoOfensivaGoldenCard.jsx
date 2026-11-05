import React, { useState, useEffect } from 'react';
import { Target, Clock, ShieldCheck, AlertCircle, BarChart3, Info, Flame, UserCheck } from 'lucide-react';

export default function ProducaoOfensivaGoldenCard({ atletaId, atletaNome }) {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visao, setVisao] = useState('exploratoria'); // 'exploratoria' | 'definitiva'

  useEffect(() => {
    if (!atletaId) return;
    setLoading(true);
    fetch(`/api/atletas/metricas-golden?atleta_id=${atletaId}&amostra_minima=0`)
      .then(res => res.json())
      .then(data => {
        if (data.dados && data.dados.length > 0) {
          setMetricas(data.dados[0]);
        } else {
          setMetricas(null);
        }
      })
      .catch(() => setMetricas(null))
      .finally(() => setLoading(false));
  }, [atletaId]);

  if (loading) {
    return (
      <div className="p-4 rounded-xl border border-[#D9CEBF] bg-[#F1E8DE]/40 animate-pulse text-sm text-[#5A673E]">
        Carregando métricas avançadas por 90 minutos...
      </div>
    );
  }

  if (!metricas) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-[#D9CEBF] bg-[#F1E8DE]/20 text-xs text-[#7A6B58] flex items-center gap-2">
        <Info className="w-4 h-4 text-[#85573B]" />
        <span>Métricas decompostas por 90 minutos indisponíveis para este atleta no ciclo atual.</span>
      </div>
    );
  }

  const getBadgeClass = (classe) => {
    switch (classe) {
      case 'Robusto':
        return 'bg-[#5A673E]/20 text-[#3A4526] border-[#5A673E]/40 font-bold';
      case 'Sinal razoável':
        return 'bg-[#5A673E]/10 text-[#5A673E] border-[#5A673E]/20';
      case 'Sinal fraco':
        return 'bg-[#C27D38]/20 text-[#85573B] border-[#C27D38]/40';
      default:
        return 'bg-[#85573B]/20 text-[#6B2F1A] border-[#85573B]/40';
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-[#D9CEBF] bg-[#FDFBF7] shadow-sm mb-6">
      {/* Header com badge de amostra e seletor */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E8DEC8]">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[#85573B] block">
            Fase 2 • Golden Dataset Analítico
          </span>
          <h4 className="text-base font-bold text-[#1B1A17] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#5A673E]" />
            Produção Ofensiva Decomposta
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs border ${getBadgeClass(metricas.classificacao_amostra)}`}>
            Amostra: {metricas.classificacao_amostra} ({metricas.minutos} min)
          </span>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Gols por 90 Total */}
        <div className="p-3 rounded-xl bg-[#F1E8DE]/60 border border-[#D9CEBF]">
          <span className="text-xs text-[#7A6B58] block">Gols por 90 (Geral)</span>
          <span className="text-2xl font-black text-[#5A673E] font-mono">
            {metricas.gols_por_90.toFixed(2)}
          </span>
          <span className="text-[11px] text-[#7A6B58] block mt-0.5">
            {metricas.gols} gols em {metricas.minutos}m
          </span>
        </div>

        {/* Decomposição de Gols (Abertos vs Pênalti) */}
        <div className="p-3 rounded-xl bg-[#F1E8DE]/60 border border-[#D9CEBF]">
          <span className="text-xs text-[#7A6B58] block">Gols em Bola Rolando</span>
          <span className="text-2xl font-black text-[#1B1A17] font-mono">
            {metricas.gols_abertos}
          </span>
          <span className="text-[11px] text-[#7A6B58] block mt-0.5">
            + {metricas.gols_penalti} de pênalti
          </span>
        </div>

        {/* Dependência Ofensiva Geral vs Em Campo */}
        <div className="p-3 rounded-xl bg-[#F1E8DE]/60 border border-[#D9CEBF]">
          <span className="text-xs text-[#7A6B58] block">Dependência Ofensiva</span>
          <span className="text-2xl font-black text-[#85573B] font-mono">
            {(metricas.dependencia_ofensiva * 100).toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#7A6B58] block mt-0.5">
            {(metricas.dependencia_ofensiva_em_campo * 100).toFixed(1)}% em campo
          </span>
        </div>

        {/* Titularidade e Produção Titular */}
        <div className="p-3 rounded-xl bg-[#F1E8DE]/60 border border-[#D9CEBF]">
          <span className="text-xs text-[#7A6B58] block">Titularidade</span>
          <span className="text-2xl font-black text-[#1B1A17] font-mono">
            {metricas.titularidade_pct.toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#7A6B58] block mt-0.5">
            Gols/90 Titular: {metricas.gols_por_90_titular.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Bloco de Decomposição Titular vs Reserva */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
        <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC8]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-[#1B1A17] flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#5A673E]" />
              Como Titular
            </span>
            <span className="font-mono text-[#5A673E] font-bold">
              {metricas.gols_por_90_titular.toFixed(2)} / 90min
            </span>
          </div>
          <div className="text-[#7A6B58]">
            {metricas.titularidades} partidas ({metricas.minutos_titular} minutos jogados)
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC8]">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-[#1B1A17] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#85573B]" />
              Como Reserva Acionado
            </span>
            <span className="font-mono text-[#85573B] font-bold">
              {metricas.gols_por_90_reserva > 0 ? `${metricas.gols_por_90_reserva.toFixed(2)} / 90min` : '0.00'}
            </span>
          </div>
          <div className="text-[#7A6B58]">
            {metricas.jogos - metricas.titularidades} partidas como substituto ({metricas.minutos_reserva} minutos)
          </div>
        </div>
      </div>

      {/* Caixa de Limitações Metodológicas e SLA */}
      <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC8] text-xs text-[#7A6B58]">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-[#85573B] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#1B1A17] block">
              Contrato de Qualidade & Critério Editorial:
            </span>
            <p className="mt-0.5 leading-relaxed">
              Métricas calculadas para <strong>{metricas.competicao} ({metricas.periodo})</strong>.
              Dependência ofensiva exibida sob duas óticas: <strong>Geral ({ (metricas.dependencia_ofensiva * 100).toFixed(1) }%)</strong> sobre todos os gols do clube e <strong>Em Campo ({ (metricas.dependencia_ofensiva_em_campo * 100).toFixed(1) }%)</strong> restrita às partidas em que o atleta participou.
              {metricas.minutos >= 2700 ? (
                <span className="block mt-1 text-[#5A673E] font-semibold">
                  ★ Qualificado para o Ranking Editorial Definitivo (≥ 2.700 minutos).
                </span>
              ) : (
                <span className="block mt-1 text-[#C27D38]">
                  • Qualificado para a Visão Exploratória ({metricas.minutos} min &lt; 2.700 min).
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
