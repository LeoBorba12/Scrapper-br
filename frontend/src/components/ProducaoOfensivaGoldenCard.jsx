import React, { useState, useEffect } from 'react';
import { Target, Clock, ShieldCheck, AlertCircle, BarChart3, Info } from 'lucide-react';

export default function ProducaoOfensivaGoldenCard({ atletaId, atletaNome }) {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(false);

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
        <span>Métricas por 90 minutos do Golden Dataset indisponíveis para este atleta no ciclo atual.</span>
      </div>
    );
  }

  const getBadgeClass = (classe) => {
    switch (classe) {
      case 'Robusto':
        return 'bg-[#5A673E]/20 text-[#3A4526] border-[#5A673E]/40';
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
      {/* Header com badge de amostra */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E8DEC8]">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[#85573B] block">
            Fase 2 • Golden Dataset Analítico
          </span>
          <h4 className="text-base font-bold text-[#1B1A17] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#5A673E]" />
            Produção Ofensiva por 90 Minutos
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeClass(metricas.classificacao_amostra)}`}>
            Amostra: {metricas.classificacao_amostra} ({metricas.minutos} min)
          </span>
        </div>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Gols por 90 */}
        <div className="p-3 rounded-xl bg-[#F1E8DE]/60 border border-[#D9CEBF]">
          <span className="text-xs text-[#7A6B58] block">Gols por 90</span>
          <span className="text-2xl font-black text-[#5A673E] font-mono">
            {metricas.gols_por_90.toFixed(2)}
          </span>
          <span className="text-[11px] text-[#7A6B58] block mt-0.5">
            {metricas.gols} gols em {metricas.minutos}m
          </span>
        </div>

        {/* Titularidade */}
        <div className="p-3 rounded-xl bg-[#F1E8DE]/60 border border-[#D9CEBF]">
          <span className="text-xs text-[#7A6B58] block">Titularidade</span>
          <span className="text-2xl font-black text-[#1B1A17] font-mono">
            {metricas.titularidade_pct.toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#7A6B58] block mt-0.5">
            {metricas.titularidades} de {metricas.jogos} partidas
          </span>
        </div>

        {/* Dependência Ofensiva */}
        <div className="p-3 rounded-xl bg-[#F1E8DE]/60 border border-[#D9CEBF]">
          <span className="text-xs text-[#7A6B58] block">Dependência Ofensiva</span>
          <span className="text-2xl font-black text-[#85573B] font-mono">
            {(metricas.dependencia_ofensiva * 100).toFixed(1)}%
          </span>
          <span className="text-[11px] text-[#7A6B58] block mt-0.5">
            dos gols do {metricas.clube}
          </span>
        </div>

        {/* Minutos Jogados */}
        <div className="p-3 rounded-xl bg-[#F1E8DE]/60 border border-[#D9CEBF]">
          <span className="text-xs text-[#7A6B58] block">Recorte de Competição</span>
          <span className="text-sm font-bold text-[#1B1A17] block truncate mt-1">
            {metricas.competicao}
          </span>
          <span className="text-[11px] text-[#7A6B58] block mt-0.5">
            Edição {metricas.periodo}
          </span>
        </div>
      </div>

      {/* Caixa de Limitações Metodológicas e SLA */}
      <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#E8DEC8] text-xs text-[#7A6B58]">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-[#85573B] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#1B1A17] block">
              Contrato de Qualidade & Limitações Metodológicas:
            </span>
            <p className="mt-0.5 leading-relaxed">
              Métrica calculada como <code className="bg-[#EFE8DD] px-1 py-0.5 rounded text-[#1B1A17] font-mono">(Gols / Minutos) × 90</code>. 
              {metricas.classificacao_amostra === 'Insuficiente' ? (
                <strong className="text-[#85573B] block mt-1">
                  ⚠️ Amostra inferior a 270 minutos: estatisticamente descartada para comparações editoriais de elite.
                </strong>
              ) : (
                <span className="block mt-0.5 text-[#5A673E]">
                  ✓ Atende ao corte mínimo de 270 minutos ({metricas.confianca_editorial}).
                </span>
              )}
              {metricas.limitacoes}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
