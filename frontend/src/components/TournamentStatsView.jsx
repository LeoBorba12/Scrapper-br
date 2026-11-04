import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, TrendingUp, Target, Shield, Crosshair, ArrowRight, 
  ChevronLeft, ChevronRight, Activity, Users, Award, Sparkles, Filter 
} from 'lucide-react';
import ClubBadge from './ClubBadge';

export default function TournamentStatsView({ darkMode }) {
  const [modoCalculo, setModoCalculo] = useState('total'); // 'total' | 'por_jogo'
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('equipes'); // 'equipes' | 'jogadores'
  const [subAbaJogadores, setSubAbaJogadores] = useState('ataque'); // 'ataque' | 'criacao' | 'defesa' | 'goleiros'

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch('/api/campeonatos/estatisticas-completas?edicao=210277&ano=2026')
      .then(res => res.json())
      .then(json => {
        if (isMounted) {
          setDados(json);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Falha ao carregar estatísticas do campeonato:', err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const equipes = dados?.equipes || [];
  const lideres = dados?.lideres || {};

  // Ordenação das tabelas de equipes conforme o modo (total vs por jogo)
  const rankingChutes = useMemo(() => {
    return [...equipes].sort((a, b) => 
      modoCalculo === 'total' ? (b.chutes_total - a.chutes_total) : (b.chutes_jogo - a.chutes_jogo)
    ).slice(0, 10);
  }, [equipes, modoCalculo]);

  const rankingDefesas = useMemo(() => {
    return [...equipes].sort((a, b) => 
      modoCalculo === 'total' ? (b.defesas_total - a.defesas_total) : (b.defesas_jogo - a.defesas_jogo)
    ).slice(0, 10);
  }, [equipes, modoCalculo]);

  const rankingCruzamentos = useMemo(() => {
    return [...equipes].sort((a, b) => 
      modoCalculo === 'total' ? (b.cruzamentos_certos_total - a.cruzamentos_certos_total) : (b.cruzamentos_certos_jogo - a.cruzamentos_certos_jogo)
    ).slice(0, 10);
  }, [equipes, modoCalculo]);

  const rankingXG = useMemo(() => {
    return [...equipes].sort((a, b) => (b.xg_pro - a.xg_pro)).slice(0, 10);
  }, [equipes]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 font-inter animate-fade-in">
      {/* Header Editorial do Campeonato */}
      <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
        darkMode ? 'bg-[#22201C] border-[#38332B] text-[#F1E8DE]' : 'bg-[#FAF6F0] border-[#E2D7C7] text-[#1B1A17]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#85573B]/10 text-[#85573B]">
              <Trophy className="w-3.5 h-3.5" />
              Estatísticas Oficiais • Edição 2026
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold font-editorial tracking-tight">
              Brasileirão Série A 2026
            </h1>
            <p className={`text-sm max-w-2xl ${darkMode ? 'text-[#C9BAA9]' : 'text-[#5C5549]'}`}>
              Painel analítico consolidado com métricas avançadas (xG, xGOT, desarmes, defesas e cruzamentos)
              atualizado diretamente dos feeds oficiais às 01:00 AM.
            </p>
          </div>

          {/* Toggle de Modo: Equipes vs Jogadores */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#EAE1D5] border-[#D4C6B3]'}`}>
              <button
                onClick={() => setAbaAtiva('equipes')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  abaAtiva === 'equipes'
                    ? 'bg-[#85573B] text-white shadow-sm'
                    : darkMode ? 'text-[#C9BAA9] hover:text-white' : 'text-[#5C5549] hover:text-[#1B1A17]'
                }`}
              >
                Estatísticas de Equipes
              </button>
              <button
                onClick={() => setAbaAtiva('jogadores')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  abaAtiva === 'jogadores'
                    ? 'bg-[#85573B] text-white shadow-sm'
                    : darkMode ? 'text-[#C9BAA9] hover:text-white' : 'text-[#5C5549] hover:text-[#1B1A17]'
                }`}
              >
                Estatísticas de Jogadores
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="w-full h-80 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-[#85573B] border-t-transparent rounded-full animate-spin" />
          <span className={`text-sm ${darkMode ? 'text-[#C9BAA9]' : 'text-[#5C5549]'}`}>Carregando scouts oficiais...</span>
        </div>
      ) : (
        <>
          {/* ================= SEÇÃO DE EQUIPES (Espelho fiel do OGol) ================= */}
          {abaAtiva === 'equipes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-[#E2D7C7] dark:border-[#38332B]">
                <div>
                  <h2 className="text-xl font-bold font-editorial text-primary">
                    ESTATÍSTICAS DE EQUIPAS
                  </h2>
                  <p className="text-xs text-secondary mt-0.5">
                    Scouts agregados dos 20 clubes participantes na temporada 2026.
                  </p>
                </div>

                {/* Seletor TOTAL / POR JOGO */}
                <div className={`flex p-0.5 rounded-lg border ${darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#EAE1D5] border-[#D4C6B3]'}`}>
                  <button
                    onClick={() => setModoCalculo('total')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                      modoCalculo === 'total'
                        ? (darkMode ? 'bg-[#38332B] text-white shadow-sm' : 'bg-white text-[#1B1A17] shadow-sm')
                        : (darkMode ? 'text-[#8A8175] hover:text-white' : 'text-[#7D7365] hover:text-[#1B1A17]')
                    }`}
                  >
                    TOTAL
                  </button>
                  <button
                    onClick={() => setModoCalculo('por_jogo')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
                      modoCalculo === 'por_jogo'
                        ? (darkMode ? 'bg-[#38332B] text-white shadow-sm' : 'bg-white text-[#1B1A17] shadow-sm')
                        : (darkMode ? 'text-[#8A8175] hover:text-white' : 'text-[#7D7365] hover:text-[#1B1A17]')
                    }`}
                  >
                    POR JOGO
                  </button>
                </div>
              </div>

              {/* Grid de Caixas de Estatísticas de Equipes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Chutes */}
                <CardEquipeRanking
                  titulo="Chutes"
                  subtitulo={modoCalculo === 'total' ? 'Finalizações Totais' : 'Média por Jogo'}
                  dados={rankingChutes}
                  campoValor={modoCalculo === 'total' ? 'chutes_total' : 'chutes_jogo'}
                  unidade=""
                  darkMode={darkMode}
                />

                {/* 2. Defesas */}
                <CardEquipeRanking
                  titulo="Defesas"
                  subtitulo={modoCalculo === 'total' ? 'Intervenções do Goleiro' : 'Média por Jogo'}
                  dados={rankingDefesas}
                  campoValor={modoCalculo === 'total' ? 'defesas_total' : 'defesas_jogo'}
                  unidade=""
                  darkMode={darkMode}
                />

                {/* 3. Cruzamentos Certos */}
                <CardEquipeRanking
                  titulo="Cruzamentos Certos"
                  subtitulo={modoCalculo === 'total' ? 'Bolas na Área Completadas' : 'Média por Jogo'}
                  dados={rankingCruzamentos}
                  campoValor={modoCalculo === 'total' ? 'cruzamentos_certos_total' : 'cruzamentos_certos_jogo'}
                  unidade=""
                  darkMode={darkMode}
                />

                {/* 4. Gols Esperados (xG) */}
                <CardEquipeRanking
                  titulo="Gols Esperados (xG)"
                  subtitulo="Qualidade das Chances Produzidas"
                  dados={rankingXG}
                  campoValor="xg_pro"
                  unidade=" xG"
                  darkMode={darkMode}
                />
              </div>
            </div>
          )}

          {/* ================= SEÇÃO DE JOGADORES (LÍDERES INDIVIDUAIS) ================= */}
          {abaAtiva === 'jogadores' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-[#E2D7C7] dark:border-[#38332B]">
                <div>
                  <h2 className="text-xl font-bold font-editorial text-primary">
                    LÍDERES ESTATÍSTICOS INDIVIDUAIS
                  </h2>
                  <p className="text-xs text-secondary mt-0.5">
                    Rankings consolidados dos 700+ atletas da Série A 2026.
                  </p>
                </div>

                {/* Filtros de Posição/Dimensão */}
                <div className={`flex p-1 rounded-xl border ${darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#EAE1D5] border-[#D4C6B3]'}`}>
                  {[
                    { id: 'ataque', label: 'Gols & Finalizações' },
                    { id: 'criacao', label: 'Criação & Passes' },
                    { id: 'defesa', label: 'Desarmes & Intercepções' },
                    { id: 'goleiros', label: 'Goleiros & Defesas' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSubAbaJogadores(tab.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        subAbaJogadores === tab.id
                          ? 'bg-[#85573B] text-white shadow-sm'
                          : darkMode ? 'text-[#8A8175] hover:text-white' : 'text-[#7D7365] hover:text-[#1B1A17]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Dinâmica de Líderes por Categoria */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subAbaJogadores === 'ataque' && (
                  <>
                    <CardAtletaRanking
                      titulo="Artilharia (Gols)"
                      atletas={lideres.artilheiros || []}
                      campoPrincipal="gols"
                      rotuloPrincipal="Gols"
                      campoSecundario="xg"
                      rotuloSecundario="xG"
                      darkMode={darkMode}
                    />
                    <CardAtletaRanking
                      titulo="Gols Esperados (xG)"
                      atletas={lideres.xg || []}
                      campoPrincipal="xg"
                      rotuloPrincipal="xG"
                      campoSecundario="gols"
                      rotuloSecundario="Gols"
                      darkMode={darkMode}
                    />
                    <CardAtletaRanking
                      titulo="Chutes Totais"
                      atletas={lideres.chutes || []}
                      campoPrincipal="chutes_totais"
                      rotuloPrincipal="Chutes"
                      campoSecundario="chutes_gol"
                      rotuloSecundario="No Gol"
                      darkMode={darkMode}
                    />
                  </>
                )}

                {subAbaJogadores === 'criacao' && (
                  <>
                    <CardAtletaRanking
                      titulo="Assistências"
                      atletas={lideres.assistencias || []}
                      campoPrincipal="assistencias"
                      rotuloPrincipal="Assists"
                      campoSecundario="oportunidades_criadas"
                      rotuloSecundario="Chances"
                      darkMode={darkMode}
                    />
                    <CardAtletaRanking
                      titulo="Cruzamentos Certos"
                      atletas={lideres.cruzamentos || []}
                      campoPrincipal="cruzamentos_certos"
                      rotuloPrincipal="Cruzamentos"
                      campoSecundario="assistencias"
                      rotuloSecundario="Assists"
                      darkMode={darkMode}
                    />
                    <CardAtletaRanking
                      titulo="Passes Certos"
                      atletas={lideres.passes || []}
                      campoPrincipal="passes_certos"
                      rotuloPrincipal="Passes"
                      campoSecundario="jogos"
                      rotuloSecundario="Jogos"
                      darkMode={darkMode}
                    />
                  </>
                )}

                {subAbaJogadores === 'defesa' && (
                  <>
                    <CardAtletaRanking
                      titulo="Desarmes Ganhos"
                      atletas={lideres.desarmes || []}
                      campoPrincipal="desarmes_ganhos"
                      rotuloPrincipal="Desarmes"
                      campoSecundario="interceptacoes"
                      rotuloSecundario="Intercep."
                      darkMode={darkMode}
                    />
                    <CardAtletaRanking
                      titulo="Interceptações"
                      atletas={(lideres.desarmes || []).map(a => ({ ...a, val: a.interceptacoes }))}
                      campoPrincipal="interceptacoes"
                      rotuloPrincipal="Intercep."
                      campoSecundario="desarmes_ganhos"
                      rotuloSecundario="Desarmes"
                      darkMode={darkMode}
                    />
                  </>
                )}

                {subAbaJogadores === 'goleiros' && (
                  <>
                    <CardAtletaRanking
                      titulo="Defesas Totais"
                      atletas={lideres.defesas || []}
                      campoPrincipal="defesas_totais"
                      rotuloPrincipal="Defesas"
                      campoSecundario="defesas_area"
                      rotuloSecundario="Na Área"
                      darkMode={darkMode}
                    />
                    <CardAtletaRanking
                      titulo="Defesas Dentro da Área"
                      atletas={(lideres.defesas || []).map(a => ({ ...a, val: a.defesas_area }))}
                      campoPrincipal="defesas_area"
                      rotuloPrincipal="Na Área"
                      campoSecundario="defesas_totais"
                      rotuloSecundario="Totais"
                      darkMode={darkMode}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Subcomponente de Card de Ranking de Equipes (Layout Espelho OGol)
function CardEquipeRanking({ titulo, subtitulo, dados, campoValor, unidade, darkMode }) {
  const [expandido, setExpandido] = useState(false);
  const itens = expandido ? dados : dados.slice(0, 5);

  return (
    <div className={`p-4 rounded-xl border flex flex-col justify-between shadow-sm transition-all ${
      darkMode ? 'bg-[#22201C] border-[#38332B]' : 'bg-[#FAF6F0] border-[#E2D7C7]'
    }`}>
      <div>
        <div className="flex items-center justify-between border-b pb-2 mb-3 border-[#E2D7C7] dark:border-[#38332B]">
          <h3 className="font-bold text-base font-editorial text-primary tracking-tight">{titulo}</h3>
          <span className="text-[10px] uppercase font-semibold text-[#85573B] tracking-wider">{subtitulo}</span>
        </div>

        <div className="space-y-2">
          {itens.map((equipe, idx) => {
            const val = equipe[campoValor] ?? 0;
            const formattedVal = typeof val === 'number' && !Number.isInteger(val) ? val.toFixed(2) : val;

            return (
              <div 
                key={equipe.clube + idx}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  idx === 0 
                    ? (darkMode ? 'bg-[#85573B]/15 font-semibold' : 'bg-[#85573B]/10 font-semibold')
                    : (darkMode ? 'hover:bg-[#2A2722]' : 'hover:bg-[#F2EAE0]')
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-4 text-xs font-bold ${idx < 3 ? 'text-[#85573B]' : 'text-secondary'}`}>
                    {idx + 1}
                  </span>
                  <ClubBadge clube={equipe.clube} size={22} className="flex-shrink-0" />
                  <span className="text-xs truncate font-medium text-primary">
                    {equipe.clube}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="text-sm font-bold font-mono text-primary">
                    {formattedVal}{unidade}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {dados.length > 5 && (
        <button
          onClick={() => setExpandido(!expandido)}
          className={`mt-4 pt-2 border-t w-full text-center text-xs font-bold uppercase tracking-wider transition-colors ${
            darkMode 
              ? 'border-[#38332B] text-[#85573B] hover:text-[#A77252]' 
              : 'border-[#E2D7C7] text-[#85573B] hover:text-[#5E3B26]'
          }`}
        >
          {expandido ? 'Recolher' : 'Ver lista completa'}
        </button>
      )}
    </div>
  );
}

// Subcomponente de Card de Ranking de Atletas
function CardAtletaRanking({ titulo, atletas, campoPrincipal, rotuloPrincipal, campoSecundario, rotuloSecundario, darkMode }) {
  const [expandido, setExpandido] = useState(false);
  const lista = expandido ? atletas : atletas.slice(0, 5);

  return (
    <div className={`p-4 rounded-xl border flex flex-col justify-between shadow-sm transition-all ${
      darkMode ? 'bg-[#22201C] border-[#38332B]' : 'bg-[#FAF6F0] border-[#E2D7C7]'
    }`}>
      <div>
        <div className="flex items-center justify-between border-b pb-2 mb-3 border-[#E2D7C7] dark:border-[#38332B]">
          <h3 className="font-bold text-base font-editorial text-primary tracking-tight">{titulo}</h3>
          <span className="text-[10px] uppercase font-semibold text-[#85573B] tracking-wider">{rotuloPrincipal}</span>
        </div>

        <div className="space-y-2">
          {lista.map((atleta, idx) => {
            const valPri = atleta[campoPrincipal] ?? 0;
            const valSec = atleta[campoSecundario] ?? 0;
            const formattedPri = typeof valPri === 'number' && !Number.isInteger(valPri) ? valPri.toFixed(2) : valPri;
            const formattedSec = typeof valSec === 'number' && !Number.isInteger(valSec) ? valSec.toFixed(2) : valSec;

            return (
              <div 
                key={atleta.atleta + idx}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  idx === 0 
                    ? (darkMode ? 'bg-[#85573B]/15 font-semibold' : 'bg-[#85573B]/10 font-semibold')
                    : (darkMode ? 'hover:bg-[#2A2722]' : 'hover:bg-[#F2EAE0]')
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-4 text-xs font-bold ${idx < 3 ? 'text-[#85573B]' : 'text-secondary'}`}>
                    {idx + 1}
                  </span>
                  <ClubBadge clube={atleta.clube} size={20} className="flex-shrink-0" />
                  <div className="truncate">
                    <p className="text-xs truncate font-medium text-primary">
                      {atleta.atleta}
                    </p>
                    <p className="text-[10px] text-secondary truncate">
                      {atleta.posicao ? `${atleta.posicao} • ` : ''}{atleta.clube}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-sm font-bold font-mono text-primary">
                    {formattedPri}
                  </div>
                  {rotuloSecundario && (
                    <div className="text-[10px] font-mono text-secondary">
                      {formattedSec} {rotuloSecundario}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {atletas.length > 5 && (
        <button
          onClick={() => setExpandido(!expandido)}
          className={`mt-4 pt-2 border-t w-full text-center text-xs font-bold uppercase tracking-wider transition-colors ${
            darkMode 
              ? 'border-[#38332B] text-[#85573B] hover:text-[#A77252]' 
              : 'border-[#E2D7C7] text-[#85573B] hover:text-[#5E3B26]'
          }`}
        >
          {expandido ? 'Recolher' : 'Ver lista completa'}
        </button>
      )}
    </div>
  );
}
