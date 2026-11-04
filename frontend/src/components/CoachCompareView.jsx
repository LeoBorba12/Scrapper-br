import React, { useState, useEffect } from 'react';
import { 
  Users, Trophy, Search, RefreshCw, Award, Flame, 
  Share2, Sparkles, ChevronRight, ArrowRight, ShieldCheck, 
  BarChart3, AlertCircle, Compass, Target, Brain, Crown
} from 'lucide-react';
import { baixarCardDueloTreinadoresPNG } from '../utils/cardGenerator';

const DUELOS_PREDEFINIDOS = [
  { label: 'Duelo Europeu', t1: 'abel_ferreira', t2: 'jorge_jesus', subtitulo: 'A Revolução Tática Portuguesa no Brasil' },
  { label: 'Mestres dos Pontos Corridos', t1: 'muricy_ramalho', t2: 'vanderlei_luxemburgo', subtitulo: 'Tri do SPFC vs A Era de Ouro dos Anos 90/00' },
  { label: 'Arte vs Pragmatismo', t1: 'tele_santana', t2: 'felipao', subtitulo: 'O Jogo Bonito do Mestre vs O General Copeiro' },
  { label: 'Estrategistas da Amarelinha', t1: 'tite', t2: 'dorival_junior', subtitulo: 'Equilíbrio e Merecimento vs Ofensividade e Copas' },
  { label: 'Posicional vs Espontâneo', t1: 'fernando_diniz', t2: 'renato_gaucho', subtitulo: 'Aposento Tático Relacional vs Convicção Carioca' },
  { label: 'Mística Canarinho', t1: 'zagallo', t2: 'tele_santana', subtitulo: 'O Velho Lobo Tetracampeão vs A Poesia do Passe' }
];

const METRICAS_RADAR = [
  { key: 'ofensividade', label: 'Ofensividade', icon: Flame, desc: 'Volume de gols e agressividade em campo adversário' },
  { key: 'solidez_defensiva', label: 'Solidez Defensiva', icon: ShieldCheck, desc: 'Organização da linha baixa e média de gols sofridos' },
  { key: 'gestao_vestiario', label: 'Gestão de Vestiário', icon: Users, desc: 'Liderança emocional, controle de ego e união de grupo' },
  { key: 'decisividade_copas', label: 'Decisão em Copas', icon: Trophy, desc: 'Aproveitamento em mata-matas e finais históricas' },
  { key: 'longevidade', label: 'Longevidade', icon: Crown, desc: 'Capacidade de renovação e relevância por décadas' }
];

export default function CoachCompareView({
  darkMode,
  treinadorInicial1 = 'abel_ferreira',
  treinadorInicial2 = 'jorge_jesus'
}) {
  const [slug1, setSlug1] = useState(treinadorInicial1);
  const [slug2, setSlug2] = useState(treinadorInicial2);
  const [catalogo, setCatalogo] = useState([]);
  const [dueloData, setDueloData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // Carrega catálogo de treinadores disponíveis
  useEffect(() => {
    const carregarCatalogo = async () => {
      try {
        const token = localStorage.getItem('futstats_auth_token');
        const res = await fetch('/api/treinadores', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setCatalogo(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Erro ao listar treinadores:', err);
      }
    };
    carregarCatalogo();
  }, []);

  // Carrega comparativo entre dois treinadores
  const carregarComparativo = async (t1 = slug1, t2 = slug2) => {
    if (!t1 || !t2) return;
    setLoading(true);
    setErro(null);
    try {
      const token = localStorage.getItem('futstats_auth_token');
      const res = await fetch(`/api/treinadores/comparar?t1=${encodeURIComponent(t1)}&t2=${encodeURIComponent(t2)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        throw new Error('Não foi possível obter dados comparativos dos treinadores selecionados.');
      }
      const data = await res.json();
      setDueloData(data);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar confronto tático.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarComparativo(treinadorInicial1, treinadorInicial2);
  }, []);

  const selecionarDueloRapido = (t1, t2) => {
    setSlug1(t1);
    setSlug2(t2);
    carregarComparativo(t1, t2);
  };

  const t1 = dueloData?.treinador1;
  const t2 = dueloData?.treinador2;
  const h2h = dueloData?.duelo_direto;

  const totalTitulos1 = t1 ? Object.values(t1.palmares || {}).reduce((a, b) => a + b, 0) : 0;
  const totalTitulos2 = t2 ? Object.values(t2.palmares || {}).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* SELETOR E DUELOS RÁPIDOS */}
      <section className={`p-6 rounded-2xl border transition-all ${
        darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#FDFBF7] border-[#E6DEC9] shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 bg-[#5A673E]/15 text-[#5A673E]">
              <Brain className="w-3.5 h-3.5" /> Pranchetas & Filosofias Históricas
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-serif flex items-center gap-2.5">
              <Users className="w-6 h-6 text-[#85573B]" />
              Comparador de Mestres Táticos & Treinadores
            </h2>
            <p className={`text-sm mt-1 max-w-2xl ${darkMode ? 'text-[#C9BAA9]' : 'text-[#6B6255]'}`}>
              Análise comparativa de carreiras, estante de títulos oficiais (Palmarés), DNA tático e confrontos diretos documentados no acervo.
            </p>
          </div>

          {t1 && t2 && (
            <button
              onClick={() => baixarCardDueloTreinadoresPNG({
                treinador1: t1.nome,
                treinador2: t2.nome,
                apelido1: t1.apelido,
                apelido2: t2.apelido,
                aprov1: t1.aproveitamento,
                aprov2: t2.aproveitamento,
                titulos1: totalTitulos1,
                titulos2: totalTitulos2,
                jogosH2H: h2h?.total_jogos || 0,
                vit1H2H: h2h?.vitorias_t1 || 0,
                vit2H2H: h2h?.vitorias_t2 || 0,
                empH2H: h2h?.empates || 0
              })}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all bg-[#85573B] hover:bg-[#6D462E] text-white shadow-sm"
              title="Baixar card comparativo em alta resolução"
            >
              <Share2 className="w-4 h-4" />
              Exportar Card PNG
            </button>
          )}
        </div>

        {/* Chips de Duelos Predefinidos */}
        <div className="mb-6">
          <span className={`text-xs font-semibold uppercase tracking-wider block mb-2.5 ${darkMode ? 'text-[#8E8271]' : 'text-[#857B6C]'}`}>
            ⚡ Clássicos da Prancheta
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {DUELOS_PREDEFINIDOS.map((d) => {
              const ativo = (slug1 === d.t1 && slug2 === d.t2) || (slug1 === d.t2 && slug2 === d.t1);
              return (
                <button
                  key={d.label}
                  onClick={() => selecionarDueloRapido(d.t1, d.t2)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    ativo
                      ? 'bg-[#5A673E] text-white border-[#5A673E] shadow-sm'
                      : darkMode
                        ? 'bg-[#25221C] border-[#38332B] text-[#D8CEBF] hover:bg-[#302B24]'
                        : 'bg-[#F5EFE6] border-[#E2D8C3] text-[#423C32] hover:bg-[#EAE0CD]'
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>{d.label}</span>
                    {ativo && <span className="text-[10px] uppercase font-bold tracking-wider">Ativo</span>}
                  </div>
                  <div className={`text-[11px] mt-1 line-clamp-1 ${ativo ? 'text-white/80' : darkMode ? 'text-[#A89A89]' : 'text-[#7A7063]'}`}>
                    {d.subtitulo}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seletores Dropdown de Treinadores */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <label className={`block text-xs font-semibold uppercase mb-1.5 ${darkMode ? 'text-[#C9BAA9]' : 'text-[#6B6255]'}`}>
              Primeiro Treinador
            </label>
            <select
              value={slug1}
              onChange={(e) => setSlug1(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#85573B] ${
                darkMode ? 'bg-[#292621] border-[#443E34] text-white' : 'bg-white border-[#D6CCB6] text-black'
              }`}
            >
              {catalogo.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.nome} ({cat.titulos_total} títulos)
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={`block text-xs font-semibold uppercase mb-1.5 ${darkMode ? 'text-[#C9BAA9]' : 'text-[#6B6255]'}`}>
              Segundo Treinador (Rival)
            </label>
            <select
              value={slug2}
              onChange={(e) => setSlug2(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#85573B] ${
                darkMode ? 'bg-[#292621] border-[#443E34] text-white' : 'bg-white border-[#D6CCB6] text-black'
              }`}
            >
              {catalogo.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.nome} ({cat.titulos_total} títulos)
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <button
              onClick={() => carregarComparativo(slug1, slug2)}
              disabled={loading || !slug1 || !slug2 || slug1 === slug2}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-[#85573B] hover:bg-[#6D462E] disabled:opacity-50 text-white shadow-sm"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Duelo Tático
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

      {/* PAINEL PRINCIPAL DE CONFRONTO */}
      {t1 && t2 && (
        <>
          {/* CARDS LADO A LADO DOS MESTRES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Treinador 1 */}
            <div className={`p-6 rounded-2xl border transition-all ${
              darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#FDFBF7] border-[#E6DEC9] shadow-sm'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5A673E]">
                    {t1.nacionalidade} • {t1.jogos_carreira} jogos
                  </span>
                  <h3 className="text-2xl font-bold font-serif mt-1 text-[#1B1A17] dark:text-white">
                    {t1.nome}
                  </h3>
                  <div className="text-xs italic font-serif text-[#85573B] mt-0.5">
                    "{t1.apelido}"
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-black text-[#5A673E]">
                    {t1.aproveitamento}%
                  </div>
                  <span className={`text-[11px] uppercase tracking-wider font-semibold ${darkMode ? 'text-[#8E8271]' : 'text-[#857B6C]'}`}>
                    Aproveitamento
                  </span>
                </div>
              </div>

              {/* DNA Tático */}
              <div className={`mt-4 p-3.5 rounded-xl border text-xs ${
                darkMode ? 'bg-[#25221C] border-[#38332B] text-[#D8CEBF]' : 'bg-[#F5EFE6] border-[#E8DEC9] text-[#423C32]'
              }`}>
                <div className="font-bold flex items-center gap-1.5 text-[#85573B] mb-1">
                  <Compass className="w-3.5 h-3.5" /> Filosofia & Estilo de Jogo
                </div>
                <p className="leading-relaxed">{t1.estilo_tatico}</p>
              </div>

              {/* Clubes Principais */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className={`text-[11px] font-semibold uppercase mr-1 ${darkMode ? 'text-[#8E8271]' : 'text-[#857B6C]'}`}>
                  Passagens:
                </span>
                {t1.clubes_principais.map((c) => (
                  <span
                    key={c}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      darkMode ? 'bg-[#292621] border-[#3E382E] text-[#D8CEBF]' : 'bg-white border-[#E2D8C3] text-[#423C32]'
                    }`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Treinador 2 */}
            <div className={`p-6 rounded-2xl border transition-all ${
              darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#FDFBF7] border-[#E6DEC9] shadow-sm'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#85573B]">
                    {t2.nacionalidade} • {t2.jogos_carreira} jogos
                  </span>
                  <h3 className="text-2xl font-bold font-serif mt-1 text-[#1B1A17] dark:text-white">
                    {t2.nome}
                  </h3>
                  <div className="text-xs italic font-serif text-[#85573B] mt-0.5">
                    "{t2.apelido}"
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-black text-[#85573B]">
                    {t2.aproveitamento}%
                  </div>
                  <span className={`text-[11px] uppercase tracking-wider font-semibold ${darkMode ? 'text-[#8E8271]' : 'text-[#857B6C]'}`}>
                    Aproveitamento
                  </span>
                </div>
              </div>

              {/* DNA Tático */}
              <div className={`mt-4 p-3.5 rounded-xl border text-xs ${
                darkMode ? 'bg-[#25221C] border-[#38332B] text-[#D8CEBF]' : 'bg-[#F5EFE6] border-[#E8DEC9] text-[#423C32]'
              }`}>
                <div className="font-bold flex items-center gap-1.5 text-[#85573B] mb-1">
                  <Compass className="w-3.5 h-3.5" /> Filosofia & Estilo de Jogo
                </div>
                <p className="leading-relaxed">{t2.estilo_tatico}</p>
              </div>

              {/* Clubes Principais */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                <span className={`text-[11px] font-semibold uppercase mr-1 ${darkMode ? 'text-[#8E8271]' : 'text-[#857B6C]'}`}>
                  Passagens:
                </span>
                {t2.clubes_principais.map((c) => (
                  <span
                    key={c}
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      darkMode ? 'bg-[#292621] border-[#3E382E] text-[#D8CEBF]' : 'bg-white border-[#E2D8C3] text-[#423C32]'
                    }`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* DUELO DIRETO H2H NO BANCO DE DADOS */}
          <section className={`p-6 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#FDFBF7] border-[#E6DEC9] shadow-sm'
          }`}>
            <div className="text-center mb-6">
              <span className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-[#8E8271]' : 'text-[#857B6C]'}`}>
                Confronto Direto na Área Técnica
              </span>
              <h3 className="text-xl md:text-2xl font-black font-serif mt-1">
                {h2h?.total_jogos > 0 ? (
                  <span>{h2h.total_jogos} duelos diretos registrados</span>
                ) : (
                  <span>Sem confrontos diretos nas bases oficiais</span>
                )}
              </h3>
            </div>

            {h2h?.total_jogos > 0 ? (
              <>
                {/* Placar de Vitórias */}
                <div className="grid grid-cols-3 gap-4 items-center text-center max-w-lg mx-auto mb-6">
                  <div>
                    <div className="text-3xl font-black text-[#5A673E]">{h2h.vitorias_t1}</div>
                    <span className="text-xs font-medium text-[#1B1A17] dark:text-[#D8CEBF]">{t1.nome.split(' ')[0]}</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#8E8271]">{h2h.empates}</div>
                    <span className="text-xs text-[#8E8271]">Empates</span>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-[#85573B]">{h2h.vitorias_t2}</div>
                    <span className="text-xs font-medium text-[#1B1A17] dark:text-[#D8CEBF]">{t2.nome.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Lista de Partidas Recentes */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b ${darkMode ? 'border-[#38332B] text-[#8E8271]' : 'border-[#E6DEC9] text-[#857B6C]'}`}>
                        <th className="py-2.5 px-3">Data/Ano</th>
                        <th className="py-2.5 px-3">Competição</th>
                        <th className="py-2.5 px-3 text-right">Mandante (Técnico)</th>
                        <th className="py-2.5 px-3 text-center">Placar</th>
                        <th className="py-2.5 px-3">Visitante (Técnico)</th>
                        <th className="py-2.5 px-3">Vencedor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {h2h.partidas.map((p, idx) => (
                        <tr key={p.id_partida || idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-[#8E8271]">{p.data || p.ano}</td>
                          <td className="py-2.5 px-3 font-medium">{p.campeonato}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="font-semibold">{p.mandante}</span>
                            <span className="block text-[10px] text-[#8E8271]">{p.tecnico_mandante || '—'}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold font-mono text-sm">{p.placar}</td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold">{p.visitante}</span>
                            <span className="block text-[10px] text-[#8E8271]">{p.tecnico_visitante || '—'}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              p.vencedor === 'Empate' || p.vencedor === 'empate'
                                ? 'bg-zinc-500/20 text-zinc-400'
                                : 'bg-[#5A673E]/20 text-[#5A673E]'
                            }`}>
                              {p.vencedor}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className={`p-6 rounded-xl text-center text-xs border ${
                darkMode ? 'bg-[#25221C] border-[#38332B] text-[#A89A89]' : 'bg-[#F5EFE6] border-[#E8DEC9] text-[#7A7063]'
              }`}>
                Ambos os treinadores operaram em épocas, divisões ou contextos distintos onde não houve confronto direto documentado entre seus times em nosso banco de dados.
              </div>
            )}
          </section>

          {/* RADAR / DIMENSÕES TÁTICAS COMPARATIVAS */}
          <section className={`p-6 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#FDFBF7] border-[#E6DEC9] shadow-sm'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-[#8E8271]' : 'text-[#857B6C]'}`}>
                  Auditoria de Atributos da Prancheta
                </span>
                <h3 className="text-xl font-bold font-serif mt-1">
                  Radar Tático Comparado (0 a 100)
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-[#5A673E]">
                  <span className="w-3 h-3 rounded-full bg-[#5A673E]"></span> {t1.nome.split(' ')[0]}
                </span>
                <span className="flex items-center gap-1.5 text-[#85573B]">
                  <span className="w-3 h-3 rounded-full bg-[#85573B]"></span> {t2.nome.split(' ')[0]}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {METRICAS_RADAR.map((m) => {
                const val1 = t1.radar?.[m.key] || 50;
                const val2 = t2.radar?.[m.key] || 50;
                const IconComponent = m.icon;
                return (
                  <div key={m.key} className={`p-4 rounded-xl border ${
                    darkMode ? 'bg-[#25221C] border-[#38332B]' : 'bg-[#F5EFE6] border-[#E8DEC9]'
                  }`}>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold flex items-center gap-1.5 text-[#1B1A17] dark:text-[#EAE1D1]">
                        <IconComponent className="w-4 h-4 text-[#85573B]" />
                        {m.label}
                      </span>
                      <span className={`text-[11px] ${darkMode ? 'text-[#8E8271]' : 'text-[#857B6C]'}`}>
                        {m.desc}
                      </span>
                    </div>

                    {/* Barras de Comparação Lado a Lado */}
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-[#5A673E]">{t1.nome.split(' ')[0]}</span>
                          <span className="font-mono font-bold text-[#5A673E]">{val1}/100</span>
                        </div>
                        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-[#5A673E] h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${val1}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-[#85573B]">{t2.nome.split(' ')[0]}</span>
                          <span className="font-mono font-bold text-[#85573B]">{val2}/100</span>
                        </div>
                        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-[#85573B] h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${val2}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ESTANTE DE TÍTULOS COMPARADA (PALMARÉS) */}
          <section className={`p-6 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#FDFBF7] border-[#E6DEC9] shadow-sm'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-[#8E8271]' : 'text-[#857B6C]'}`}>
                  Estante de Títulos Oficiais
                </span>
                <h3 className="text-xl font-bold font-serif mt-1 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#E5A93C]" />
                  Palmarés Comparado
                </h3>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#8E8271]">
                {totalTitulos1} títulos vs {totalTitulos2} títulos
              </div>
            </div>

            {/* Grid de Troféus por Categoria */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {[
                { label: 'Mundiais', key: 'mundial' },
                { label: 'Libertadores', key: 'libertadores' },
                { label: 'Brasileirão', key: 'brasileirao' },
                { label: 'Copa do Brasil', key: 'copa_do_brasil' },
                { label: 'Estaduais', key: 'estaduais' },
                { label: 'Outros', key: 'outros' }
              ].map((trof) => {
                const qtd1 = t1.palmares?.[trof.key] || 0;
                const qtd2 = t2.palmares?.[trof.key] || 0;
                return (
                  <div
                    key={trof.key}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      darkMode ? 'bg-[#25221C] border-[#38332B]' : 'bg-[#F5EFE6] border-[#E8DEC9]'
                    }`}
                  >
                    <span className="block text-[11px] font-semibold uppercase text-[#8E8271] mb-1">
                      {trof.label}
                    </span>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className={`text-xl font-black ${qtd1 > qtd2 ? 'text-[#5A673E]' : 'text-[#1B1A17] dark:text-white'}`}>
                        {qtd1}
                      </span>
                      <span className="text-xs text-[#8E8271]">x</span>
                      <span className={`text-xl font-black ${qtd2 > qtd1 ? 'text-[#85573B]' : 'text-[#1B1A17] dark:text-white'}`}>
                        {qtd2}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Títulos de Destaque Lado a Lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl border ${
                darkMode ? 'bg-[#25221C] border-[#38332B]' : 'bg-[#F5EFE6] border-[#E8DEC9]'
              }`}>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#5A673E] mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Conquistas Marcantes de {t1.nome.split(' ')[0]}
                </h4>
                <ul className="space-y-1.5 text-xs">
                  {t1.titulos_destaque?.map((td, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#5A673E] font-bold mt-0.5">•</span>
                      <span>{td}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`p-4 rounded-xl border ${
                darkMode ? 'bg-[#25221C] border-[#38332B]' : 'bg-[#F5EFE6] border-[#E8DEC9]'
              }`}>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#85573B] mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Conquistas Marcantes de {t2.nome.split(' ')[0]}
                </h4>
                <ul className="space-y-1.5 text-xs">
                  {t2.titulos_destaque?.map((td, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#85573B] font-bold mt-0.5">•</span>
                      <span>{td}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
