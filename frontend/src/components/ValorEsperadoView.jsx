import React, { useState, useEffect } from 'react';
import { TrendingUp, Percent, ShieldCheck, CheckCircle2, XCircle, HelpCircle, Filter, Sparkles, Scale, Info, ArrowUpRight } from 'lucide-react';

export default function ValorEsperadoView() {
  const [minEv, setMinEv] = useState(5.0); // Padrão +5%
  const [limite, setLimite] = useState(30);
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    setLoading(true);
    setErro(null);

    fetch(`/api/mercados/valor-esperado?min_ev=${minEv}&limite=${limite}`)
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar oportunidades de Valor Esperado');
        return res.json();
      })
      .then(data => {
        setDados(data);
        setLoading(false);
      })
      .catch(err => {
        setErro(err.message);
        setLoading(false);
      });
  }, [minEv, limite]);

  const resumo = dados?.resumo_performance;

  return (
    <div className="space-y-6 text-[#1B1A17] font-sans">
      {/* Topo Editorial */}
      <div className="bg-[#FAF6F0] border border-[#E5DBCF] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#85573B]">
              Inteligência Preditiva & Anomalias de Mercado
            </span>
            <h1 className="font-serif text-2xl font-bold text-[#1B1A17] flex items-center gap-2 mt-1">
              <TrendingUp className="w-6 h-6 text-[#5A673E]" />
              Radar de Valor Esperado (+EV)
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl">
              Cruzamento matemático entre as probabilidades reais calculadas pelo modelo Dixon-Coles calibrado e as Odds de fechamento de casas de aposta (Pinnacle/Bet365), detectando precificações incorretas favoráveis ao apostador.
            </p>
          </div>

          {/* Filtros Táteis de +EV */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#EAE0D2] rounded-lg border border-[#D8C7B5]">
            <span className="text-xs font-semibold text-[#85573B] px-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Corte:
            </span>
            {[2.0, 5.0, 8.0, 12.0].map(corte => (
              <button
                key={`corte-${corte}`}
                onClick={() => setMinEv(corte)}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all touch-tactile ${
                  minEv === corte
                    ? 'bg-[#5A673E] text-white shadow-sm'
                    : 'bg-white/80 text-[#1B1A17] hover:bg-white'
                }`}
              >
                +{corte}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {erro && (
        <div className="bg-[#FDF2F0] border border-[#EAC4BE] rounded-lg p-4 text-[#85573B] flex items-center gap-3">
          <Info className="w-5 h-5 flex-shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {/* Grade de KPIs de Performance */}
      {resumo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#FAF6F0] border border-[#E5DBCF] p-4 rounded-xl shadow-sm text-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Oportunidades no Acervo
            </span>
            <span className="font-mono text-3xl font-black text-[#1B1A17]">
              {resumo.total_oportunidades_encontradas}
            </span>
            <span className="text-[11px] text-gray-500 font-mono block mt-1">Corte ≥ +{minEv}%</span>
          </div>

          <div className="bg-[#FAF6F0] border border-[#E5DBCF] p-4 rounded-xl shadow-sm text-center">
            <span className="text-xs font-semibold text-[#5A673E] uppercase tracking-wider block mb-1">
              +EV Médio Detectado
            </span>
            <span className="font-mono text-3xl font-black text-[#5A673E]">
              +{resumo.ev_medio_pct}%
            </span>
            <span className="text-[11px] text-gray-500 font-mono block mt-1">Vantagem Teórica</span>
          </div>

          <div className="bg-[#FAF6F0] border border-[#E5DBCF] p-4 rounded-xl shadow-sm text-center">
            <span className="text-xs font-semibold text-[#85573B] uppercase tracking-wider block mb-1">
              Taxa de Acerto Real
            </span>
            <span className="font-mono text-3xl font-black text-[#85573B]">
              {resumo.taxa_acerto_historico_pct}%
            </span>
            <span className="text-[11px] text-gray-500 font-mono block mt-1">Win Rate Auditada</span>
          </div>

          <div className="bg-[#FAF6F0] border border-[#E5DBCF] p-4 rounded-xl shadow-sm text-center">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Amostragem Exibida
            </span>
            <span className="font-mono text-3xl font-black text-gray-700">
              {resumo.total_retornadas}
            </span>
            <span className="text-[11px] text-gray-500 font-mono block mt-1">Top Desvios Ordenados</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="p-12 text-center text-[#5A673E] space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#5A673E] border-t-transparent" />
          <p className="font-serif italic">Auditando 5.922 partidas com odds e calculando matrizes de valor esperado...</p>
        </div>
      )}

      {!loading && dados?.oportunidades && (
        <>
          {/* Tabela de Oportunidades +EV */}
          <div className="bg-[#FAF6F0] border border-[#E5DBCF] rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                Oportunidades de Maior Valor Esperado Catalogadas
              </h2>
              <span className="text-xs font-mono bg-[#EAE0D2] px-3 py-1 rounded-full text-[#85573B] font-bold">
                Ordenado por +EV%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5DBCF] text-xs font-semibold uppercase text-gray-500 font-sans">
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Partida</th>
                    <th className="py-2.5 px-3">Mercado Analisado</th>
                    <th className="py-2.5 px-3 text-center">Odd Mercado</th>
                    <th className="py-2.5 px-3 text-center">Odd Justa</th>
                    <th className="py-2.5 px-3 text-center">Prob. Modelo</th>
                    <th className="py-2.5 px-3 text-center">+EV %</th>
                    <th className="py-2.5 px-3 text-center">Resultado Factual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE5DB] font-mono text-sm">
                  {dados.oportunidades.map((op, idx) => (
                    <tr key={`ev-${op.id_partida}-${idx}`} className="hover:bg-white/60 transition-colors">
                      <td className="py-3 px-3 text-xs text-gray-600">{op.data}</td>
                      <td className="py-3 px-3 font-sans">
                        <span className="font-bold">{op.mandante}</span>
                        <span className="text-gray-400 mx-1.5">vs</span>
                        <span className="font-bold">{op.visitante}</span>
                        <span className="block text-[11px] text-gray-500">{op.campeonato}</span>
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <span className="inline-block px-2 py-0.5 rounded bg-[#EAE0D2] text-[#85573B] text-xs font-semibold">
                          {op.mercado}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-gray-800">
                        {op.odd_mercado.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center text-[#5A673E] font-bold">
                        {op.odd_justa_modelo.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center text-gray-700">
                        {op.probabilidade_modelo_pct}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#5A673E]/15 text-[#5A673E] font-black text-xs border border-[#5A673E]/30">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          +{op.ev_percentual}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-sans text-xs">
                        {op.acerto_historico === true ? (
                          <span className="inline-flex items-center gap-1 text-[#5A673E] font-semibold">
                            <CheckCircle2 className="w-4 h-4" /> Green ({op.placar})
                          </span>
                        ) : op.acerto_historico === false ? (
                          <span className="inline-flex items-center gap-1 text-[#85573B] font-semibold">
                            <XCircle className="w-4 h-4" /> Red ({op.placar})
                          </span>
                        ) : (
                          <span className="text-gray-400">Pendente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card Teórico Explicativo */}
          <div className="bg-[#FAF6F0] border border-[#E5DBCF] rounded-xl p-5 shadow-sm text-xs text-gray-700 space-y-2">
            <h3 className="font-serif text-sm font-bold text-[#85573B] flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#85573B]" />
              Fundamentação Matemática do Valor Esperado (+EV)
            </h3>
            <p>
              O Valor Esperado mede a expectativa matemática de lucro a longo prazo de uma decisão:
              <code className="bg-[#EAE0D2] px-2 py-0.5 rounded mx-1.5 font-mono text-[#1B1A17] font-bold">
                EV = (Probabilidade_do_Modelo × Odd_do_Mercado) - 1.0
              </code>
            </p>
            <p className="text-gray-600">
              Quando o valor percentual é positivo (<span className="text-[#5A673E] font-bold">+EV</span>), significa que a odd oferecida pela casa de apostas paga mais do que o risco real calculado pela distribuição bivariada de Dixon-Coles, invertendo a margem da banca a favor do usuário no longo prazo.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
