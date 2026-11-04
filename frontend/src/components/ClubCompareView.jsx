import React, { useState, useEffect } from 'react';
import { 
  Swords, Trophy, Search, RefreshCw, Award, Flame, 
  Calendar, MapPin, Share2, Sparkles, TrendingUp, AlertCircle, 
  ChevronRight, ArrowRight, ShieldCheck, BarChart3
} from 'lucide-react';
import ClubBadge from './ClubBadge';
import { sanitizarListaClubes } from '../utils/clubData';
import { baixarCardDueloH2HPNG } from '../utils/cardGenerator';

const CLASSICOS_PREDEFINIDOS = [
  { label: 'Fla-Flu', c1: 'Flamengo', c2: 'Fluminense', regiao: 'Rio de Janeiro' },
  { label: 'Clássico dos Milhões', c1: 'Flamengo', c2: 'Vasco', regiao: 'Rio de Janeiro' },
  { label: 'Derby Paulista', c1: 'Palmeiras', c2: 'Corinthians', regiao: 'São Paulo' },
  { label: 'Gre-Nal', c1: 'Grêmio', c2: 'Internacional', regiao: 'Rio Grande do Sul' },
  { label: 'San-São', c1: 'Santos', c2: 'São Paulo', regiao: 'São Paulo' },
  { label: 'Majestoso', c1: 'Corinthians', c2: 'São Paulo', regiao: 'São Paulo' },
  { label: 'Clássico Mineiro', c1: 'Atlético-MG', c2: 'Cruzeiro', regiao: 'Minas Gerais' },
  { label: 'Ba-Vi', c1: 'Bahia', c2: 'Vitória', regiao: 'Bahia' },
  { label: 'Clássico da Saudade', c1: 'Santos', c2: 'Palmeiras', regiao: 'São Paulo' },
  { label: 'Clássico da Rivalidade', c1: 'Botafogo', c2: 'Flamengo', regiao: 'Rio de Janeiro' }
];

export default function ClubCompareView({
  darkMode,
  clubesList = [],
  clubeInicial1 = 'Flamengo',
  clubeInicial2 = 'Vasco'
}) {
  const [clube1, setClube1] = useState(clubeInicial1);
  const [clube2, setClube2] = useState(clubeInicial2);
  const [h2hData, setH2hData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const carregarConfronto = async (c1 = clube1, c2 = clube2) => {
    if (!c1 || !c2) return;
    setLoading(true);
    setErro(null);
    try {
      const token = localStorage.getItem('futstats_auth_token');
      const res = await fetch(`/api/clubes/comparar?clube1=${encodeURIComponent(c1)}&clube2=${encodeURIComponent(c2)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        throw new Error('Não foi possível carregar os dados do confronto.');
      }
      const data = await res.json();
      setH2hData(data);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar retrospecto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarConfronto(clubeInicial1, clubeInicial2);
  }, []);

  const selecionarClassico = (c1, c2) => {
    setClube1(c1);
    setClube2(c2);
    carregarConfronto(c1, c2);
  };

  const c1Nome = h2hData?.clube1 || clube1;
  const c2Nome = h2hData?.clube2 || clube2;
  const total = h2hData?.total_jogos || 0;
  const vit1 = h2hData?.vitorias_clube1 || 0;
  const vit2 = h2hData?.vitorias_clube2 || 0;
  const emp = h2hData?.empates || 0;
  const gols1 = h2hData?.gols_clube1 || 0;
  const gols2 = h2hData?.gols_clube2 || 0;

  const pctVit1 = total > 0 ? ((vit1 / total) * 100).toFixed(1) : 0;
  const pctVit2 = total > 0 ? ((vit2 / total) * 100).toFixed(1) : 0;
  const pctEmp = total > 0 ? ((emp / total) * 100).toFixed(1) : 0;

  const palmares1 = h2hData?.palmares_clube1;
  const palmares2 = h2hData?.palmares_clube2;
  const projDC = h2hData?.projecao_dixon_coles;
  const artilheiros = h2hData?.artilheiros_confronto || [];

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* SELETOR E CLÁSSICOS RÁPIDOS */}
      <section className={`p-6 rounded-2xl border transition-all ${
        darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#FDFBF7] border-[#E6DEC9] shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold font-serif flex items-center gap-2.5">
              <Swords className="w-6 h-6 text-[#85573B]" />
              Comparador Histórico H2H de Clubes
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-[#C9BAA9]' : 'text-[#6B6255]'}`}>
              Confronto direto, estante de títulos oficiais (Palmarés), artilheiros e projeção preditiva Dixon-Coles.
            </p>
          </div>

          {h2hData && (
            <button
              onClick={() => baixarCardDueloH2HPNG({
                clube1: c1Nome,
                clube2: c2Nome,
                vitorias1: vit1,
                vitorias2: vit2,
                empates: emp,
                totalJogos: total
              })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all bg-[#85573B] hover:bg-[#6D462E] text-white shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              Exportar Card PNG
            </button>
          )}
        </div>

        {/* Chips de Clássicos Rápidos */}
        <div className="mb-6">
          <span className={`text-xs font-semibold uppercase tracking-wider block mb-2.5 ${darkMode ? 'text-[#8E8271]' : 'text-[#857B6C]'}`}>
            🔥 Duelos Clássicos Populares
          </span>
          <div className="flex flex-wrap gap-2">
            {CLASSICOS_PREDEFINIDOS.map((cl) => {
              const ativo = (clube1.toLowerCase() === cl.c1.toLowerCase() && clube2.toLowerCase() === cl.c2.toLowerCase()) ||
                            (clube1.toLowerCase() === cl.c2.toLowerCase() && clube2.toLowerCase() === cl.c1.toLowerCase());
              return (
                <button
                  key={cl.label}
                  onClick={() => selecionarClassico(cl.c1, cl.c2)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    ativo
                      ? 'bg-[#5A673E] text-white font-semibold shadow-sm'
                      : darkMode
                        ? 'bg-[#292621] text-[#D8CEBF] hover:bg-[#38332B]'
                        : 'bg-[#EFE7D8] text-[#423C32] hover:bg-[#E2D8C3]'
                  }`}
                >
                  {cl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs de Pesquisa Customizada */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <label className={`block text-xs font-semibold uppercase mb-1.5 ${darkMode ? 'text-[#C9BAA9]' : 'text-[#6B6255]'}`}>
              Primeiro Clube
            </label>
            <input
              type="text"
              value={clube1}
              onChange={(e) => setClube1(e.target.value)}
              placeholder="Ex: Flamengo, Palmeiras, Grêmio..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#85573B] ${
                darkMode ? 'bg-[#292621] border-[#443E34] text-white' : 'bg-white border-[#D6CCB6] text-black'
              }`}
            />
          </div>

          <div className="md:col-span-2">
            <label className={`block text-xs font-semibold uppercase mb-1.5 ${darkMode ? 'text-[#C9BAA9]' : 'text-[#6B6255]'}`}>
              Segundo Clube (Rival)
            </label>
            <input
              type="text"
              value={clube2}
              onChange={(e) => setClube2(e.target.value)}
              placeholder="Ex: Vasco, Corinthians, Internacional..."
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#85573B] ${
                darkMode ? 'bg-[#292621] border-[#443E34] text-white' : 'bg-white border-[#D6CCB6] text-black'
              }`}
            />
          </div>

          <div className="md:col-span-1">
            <button
              onClick={() => carregarConfronto()}
              disabled={loading || !clube1 || !clube2}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-[#85573B] hover:bg-[#6D462E] disabled:opacity-50 text-white shadow-sm"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Comparar
            </button>
          </div>
        </div>

        {erro && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}
      </section>

      {/* PAINEL PRINCIPAL DE RETROSPECTO */}
      {h2hData && (
        <>
          {/* PLACAR HISTÓRICO GERAL & BARRAS DE PROPORÇÃO */}
          <section className={`p-6 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#FDFBF7] border-[#E6DEC9] shadow-sm'
          }`}>
            <div className="text-center mb-6">
              <span className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-[#8E8271]' : 'text-[#857B6C]'}`}>
                Retrospecto Oficial Consolidado
              </span>
              <h3 className="text-2xl md:text-3xl font-black font-serif mt-1">
                {total} <span className="text-sm font-normal text-opacity-80">jogos no acervo</span>
              </h3>
            </div>

            {/* Confronto Visual Lado a Lado */}
            <div className="grid grid-cols-3 gap-2 md:gap-6 items-center text-center">
              {/* Clube 1 */}
              <div className="flex flex-col items-center">
                <ClubBadge clube={c1Nome} size={54} />
                <h4 className="font-bold text-base md:text-lg mt-2">{c1Nome}</h4>
                <div className="text-3xl md:text-4xl font-black text-[#5A673E] mt-1">{vit1}</div>
                <span className={`text-xs ${darkMode ? 'text-[#A89A89]' : 'text-[#7A7063]'}`}>vitórias ({pctVit1}%)</span>
                <span className={`text-xs font-medium mt-1 ${darkMode ? 'text-[#C9BAA9]' : 'text-[#5C5549]'}`}>
                  {gols1} gols ({total > 0 ? (gols1 / total).toFixed(2) : 0}/j)
                </span>
              </div>

              {/* Empates */}
              <div className="flex flex-col items-center justify-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs ${
                  darkMode ? 'bg-[#292621] text-[#C9BAA9]' : 'bg-[#EAE1D1] text-[#5C5549]'
                }`}>
                  VS
                </div>
                <div className="text-2xl md:text-3xl font-bold mt-2">{emp}</div>
                <span className={`text-xs ${darkMode ? 'text-[#A89A89]' : 'text-[#7A7063]'}`}>empates ({pctEmp}%)</span>
              </div>

              {/* Clube 2 */}
              <div className="flex flex-col items-center">
                <ClubBadge clube={c2Nome} size={54} />
                <h4 className="font-bold text-base md:text-lg mt-2">{c2Nome}</h4>
                <div className="text-3xl md:text-4xl font-black text-[#85573B] mt-1">{vit2}</div>
                <span className={`text-xs ${darkMode ? 'text-[#A89A89]' : 'text-[#7A7063]'}`}>vitórias ({pctVit2}%)</span>
                <span className={`text-xs font-medium mt-1 ${darkMode ? 'text-[#C9BAA9]' : 'text-[#5C5549]'}`}>
                  {gols2} gols ({total > 0 ? (gols2 / total).toFixed(2) : 0}/j)
                </span>
              </div>
            </div>

            {/* Barra Visual de Divisão de Vitórias */}
            <div className="w-full h-3 rounded-full overflow-hidden flex mt-6 bg-[#38332B]/30">
              <div style={{ width: `${pctVit1}%` }} className="bg-[#5A673E] h-full transition-all" title={`${c1Nome}: ${pctVit1}%`} />
              <div style={{ width: `${pctEmp}%` }} className="bg-[#A89A89] h-full transition-all" title={`Empates: ${pctEmp}%`} />
              <div style={{ width: `${pctVit2}%` }} className="bg-[#85573B] h-full transition-all" title={`${c2Nome}: ${pctVit2}%`} />
            </div>

            {/* Nota Histórica Contextual */}
            {h2hData.nota_historica && (
              <div className={`mt-6 p-4 rounded-xl text-xs leading-relaxed border ${
                darkMode ? 'bg-[#25221C] border-[#38332B] text-[#D8CEBF]' : 'bg-[#F4ECE1] border-[#E0D5C3] text-[#423C32]'
              }`}>
                <span className="font-bold block mb-1">📜 Contexto Centenário:</span>
                {h2hData.nota_historica}
              </div>
            )}
          </section>

          {/* PALMARÉS COMPARATIVO (ESTANTE DE TÍTULOS OFICIAIS) */}
          {(palmares1 || palmares2) && (
            <section className={`p-6 rounded-2xl border transition-all ${
              darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#FDFBF7] border-[#E6DEC9] shadow-sm'
            }`}>
              <h3 className="text-lg font-bold font-serif mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#85573B]" />
                Palmarés Comparativo Oficial (Grandes Taças)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Palmarés Clube 1 */}
                <div className={`p-4 rounded-xl border ${
                  darkMode ? 'bg-[#25221C] border-[#3A352B]' : 'bg-[#FAF6EE] border-[#E6DFC9]'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <ClubBadge clube={c1Nome} size={28} />
                    <span className="font-bold text-sm">{c1Nome}</span>
                  </div>
                  {palmares1 ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-opacity-70">Mundial FIFA:</span>
                        <span className="font-bold">{palmares1.mundial || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-opacity-70">Libertadores:</span>
                        <span className="font-bold">{palmares1.libertadores || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-opacity-70">Brasileirão Série A:</span>
                        <span className="font-bold">{palmares1.brasileirao || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-opacity-70">Copa do Brasil:</span>
                        <span className="font-bold">{palmares1.copa_do_brasil || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-opacity-70">Estaduais:</span>
                        <span className="font-bold">{palmares1.estaduais || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-opacity-70">Outros Oficiais:</span>
                        <span className="font-bold">{palmares1.internacionais || palmares1.copa_nordeste || 0}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-opacity-50">Títulos em processo de homologação.</span>
                  )}
                </div>

                {/* Palmarés Clube 2 */}
                <div className={`p-4 rounded-xl border ${
                  darkMode ? 'bg-[#25221C] border-[#3A352B]' : 'bg-[#FAF6EE] border-[#E6DFC9]'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <ClubBadge clube={c2Nome} size={28} />
                    <span className="font-bold text-sm">{c2Nome}</span>
                  </div>
                  {palmares2 ? (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-opacity-70">Mundial FIFA:</span>
                        <span className="font-bold">{palmares2.mundial || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-opacity-70">Libertadores:</span>
                        <span className="font-bold">{palmares2.libertadores || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-opacity-70">Brasileirão Série A:</span>
                        <span className="font-bold">{palmares2.brasileirao || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-opacity-70">Copa do Brasil:</span>
                        <span className="font-bold">{palmares2.copa_do_brasil || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-opacity-70">Estaduais:</span>
                        <span className="font-bold">{palmares2.estaduais || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-opacity-70">Outros Oficiais:</span>
                        <span className="font-bold">{palmares2.internacionais || palmares2.copa_nordeste || 0}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-opacity-50">Títulos em processo de homologação.</span>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ARTILHEIROS DO DUELO & PROJEÇÃO DIXON-COLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Artilheiros do Confronto */}
            <section className={`p-6 rounded-2xl border transition-all ${
              darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#FDFBF7] border-[#E6DEC9] shadow-sm'
            }`}>
              <h3 className="text-base font-bold font-serif mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#85573B]" />
                Maiores Artilheiros da História do Confronto
              </h3>

              {artilheiros.length > 0 ? (
                <div className="space-y-2">
                  {artilheiros.slice(0, 7).map((art, idx) => (
                    <div 
                      key={idx}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
                        darkMode ? 'bg-[#25221C] border-[#38332B]' : 'bg-[#FAF6EE] border-[#EAE1D1]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          idx === 0 ? 'bg-amber-500 text-black' : darkMode ? 'bg-[#38332B] text-white' : 'bg-[#D6CCB6] text-black'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="font-bold">{art.atleta}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          art.clube.toLowerCase().includes(c1Nome.toLowerCase())
                            ? 'bg-[#5A673E]/20 text-[#5A673E]'
                            : 'bg-[#85573B]/20 text-[#85573B]'
                        }`}>
                          {art.clube}
                        </span>
                      </div>
                      <span className="font-extrabold text-sm text-[#85573B]">{art.gols} gols</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-opacity-50">
                  Nenhum gol detalhado catalogado para este confronto.
                </div>
              )}
            </section>

            {/* Projeção Dixon-Coles 1X2 */}
            <section className={`p-6 rounded-2xl border transition-all ${
              darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#FDFBF7] border-[#E6DEC9] shadow-sm'
            }`}>
              <h3 className="text-base font-bold font-serif mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#5A673E]" />
                Projeção Preditiva Dixon-Coles (Próximo Duelo)
              </h3>

              {projDC ? (
                <div className="space-y-4">
                  <p className={`text-xs ${darkMode ? 'text-[#C9BAA9]' : 'text-[#6B6255]'}`}>
                    Probabilidades calculadas via modelo bivariado calibrado pelo acervo histórico oficial.
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className={`p-3 rounded-xl border ${darkMode ? 'bg-[#25221C] border-[#38332B]' : 'bg-[#FAF6EE] border-[#E6DEC9]'}`}>
                      <span className="text-[10px] uppercase font-bold block opacity-70">{c1Nome}</span>
                      <span className="text-xl font-extrabold text-[#5A673E]">{projDC.prob_clube1}%</span>
                      <span className="text-[10px] block opacity-50 mt-1">xG {projDC.xg_clube1}</span>
                    </div>

                    <div className={`p-3 rounded-xl border ${darkMode ? 'bg-[#25221C] border-[#38332B]' : 'bg-[#FAF6EE] border-[#E6DEC9]'}`}>
                      <span className="text-[10px] uppercase font-bold block opacity-70">Empate</span>
                      <span className="text-xl font-extrabold text-[#A89A89]">{projDC.prob_empate}%</span>
                    </div>

                    <div className={`p-3 rounded-xl border ${darkMode ? 'bg-[#25221C] border-[#38332B]' : 'bg-[#FAF6EE] border-[#E6DEC9]'}`}>
                      <span className="text-[10px] uppercase font-bold block opacity-70">{c2Nome}</span>
                      <span className="text-xl font-extrabold text-[#85573B]">{projDC.prob_clube2}%</span>
                      <span className="text-[10px] block opacity-50 mt-1">xG {projDC.xg_clube2}</span>
                    </div>
                  </div>

                  {/* Maiores Goleadas Registradas */}
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider block opacity-70">
                      Maiores Goleadas no Acervo
                    </span>
                    {h2hData.maior_goleada_clube1 && (
                      <div className="text-xs flex items-center justify-between">
                        <span className="text-[#5A673E] font-semibold">{c1Nome}:</span>
                        <span>{h2hData.maior_goleada_clube1.placar} ({h2hData.maior_goleada_clube1.ano} - {h2hData.maior_goleada_clube1.campeonato})</span>
                      </div>
                    )}
                    {h2hData.maior_goleada_clube2 && (
                      <div className="text-xs flex items-center justify-between">
                        <span className="text-[#85573B] font-semibold">{c2Nome}:</span>
                        <span>{h2hData.maior_goleada_clube2.placar} ({h2hData.maior_goleada_clube2.ano} - {h2hData.maior_goleada_clube2.campeonato})</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-opacity-50">
                  Dados insuficientes para projeção preditiva.
                </div>
              )}
            </section>
          </div>

          {/* ÚLTIMOS CONFRONTOS */}
          {h2hData.partidas && h2hData.partidas.length > 0 && (
            <section className={`p-6 rounded-2xl border transition-all ${
              darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#FDFBF7] border-[#E6DEC9] shadow-sm'
            }`}>
              <h3 className="text-base font-bold font-serif mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#85573B]" />
                Últimos Confrontos Realizados
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-[#38332B] text-[#A89A89]' : 'border-[#EAE1D1] text-[#7A7063]'}`}>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Torneio</th>
                      <th className="py-2.5 px-3">Confronto</th>
                      <th className="py-2.5 px-3 text-center">Placar</th>
                      <th className="py-2.5 px-3">Estádio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {h2hData.partidas.slice(0, 15).map((p) => (
                      <tr key={p.id_partida} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap">{p.data || p.ano}</td>
                        <td className="py-2.5 px-3 font-medium whitespace-nowrap">{p.campeonato}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">{p.mandante} x {p.visitante}</td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-bold text-sm">
                          {p.placar || `${p.gols_mandante} x ${p.gols_visitante}`}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-opacity-70">{p.estadio || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
