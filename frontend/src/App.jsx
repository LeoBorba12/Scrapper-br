import React, { useState, useEffect } from 'react';
import { 
  Trophy, CloudRain, Swords, Search, Copy, Check, Sparkles, 
  Sun, Moon, Flame, ShieldAlert, Calendar, MapPin, BarChart3, 
  ArrowRight, RefreshCw, Share2
} from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('h2h'); // 'h2h', 'playground', 'clima', 'tweets'

  // Overview
  const [overview, setOverview] = useState(null);

  // Tab 1: H2H state
  const [clubesList, setClubesList] = useState([]);
  const [clube1, setClube1] = useState('Flamengo');
  const [clube2, setClube2] = useState('Vasco');
  const [h2hData, setH2hData] = useState(null);
  const [h2hLoading, setH2hLoading] = useState(false);

  // Tab 2: Playground state
  const [campeonatosList, setCampeonatosList] = useState([]);
  const [pgClube, setPgClube] = useState('');
  const [pgCamp, setPgCamp] = useState('');
  const [pgCenario, setPgCenario] = useState('todos');
  const [pgBusca, setPgBusca] = useState('');
  const [pgPage, setPgPage] = useState(1);
  const [partidasData, setPartidasData] = useState(null);
  const [partidasLoading, setPartidasLoading] = useState(false);

  // Tab 3: Clima state
  const [climaData, setClimaData] = useState(null);
  const [climaLoading, setClimaLoading] = useState(false);

  // Feedback de cópia do Twitter
  const [copiedKey, setCopiedKey] = useState(null);

  // Alternar modo escuro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Carregar dados iniciais (overview, clubes, campeonatos)
  useEffect(() => {
    fetch('/api/overview')
      .then(r => r.json())
      .then(d => setOverview(d))
      .catch(() => {});

    fetch('/api/clubes')
      .then(r => r.json())
      .then(d => setClubesList(d))
      .catch(() => {});

    fetch('/api/campeonatos')
      .then(r => r.json())
      .then(d => setCampeonatosList(d))
      .catch(() => {});
  }, []);

  // Buscar H2H
  const carregarH2H = () => {
    if (!clube1 || !clube2) return;
    setH2hLoading(true);
    fetch(`/api/h2h?clube1=${encodeURIComponent(clube1)}&clube2=${encodeURIComponent(clube2)}`)
      .then(r => r.json())
      .then(d => {
        setH2hData(d);
        setH2hLoading(false);
      })
      .catch(() => setH2hLoading(false));
  };

  useEffect(() => {
    carregarH2H();
  }, []);

  // Buscar Partidas no Playground
  const carregarPartidas = (p = 1) => {
    setPartidasLoading(true);
    const params = new URLSearchParams({
      page: p,
      limit: 15,
      clube: pgClube,
      campeonato: pgCamp,
      cenario: pgCenario,
      busca: pgBusca
    });
    fetch(`/api/partidas?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        setPartidasData(d);
        setPartidasLoading(false);
      })
      .catch(() => setPartidasLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'playground' && !partidasData) {
      carregarPartidas(1);
    }
  }, [activeTab]);

  // Carregar dados do clima
  useEffect(() => {
    if (activeTab === 'clima' && !climaData) {
      setClimaLoading(true);
      fetch('/api/clima-futebol')
        .then(r => r.json())
        .then(d => {
          setClimaData(d);
          setClimaLoading(false);
        })
        .catch(() => setClimaLoading(false));
    }
  }, [activeTab]);

  // Função auxiliar para copiar texto do tweet
  const copiarTweet = (texto, key) => {
    navigator.clipboard.writeText(texto);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px' }}>
      
      {/* HEADER DA DASHBOARD */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
              FutStats & Clima
            </h1>
            <span className="badge badge-blue">Soft UI Evolution</span>
            <span className="badge badge-green">43.980 Jogos</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Central analítica de futebol e meteorologia para a equipe de moderação e Twitter/X
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {overview && (
            <div className="soft-card" style={{ padding: '8px 14px', display: 'flex', gap: '16px', alignItems: 'center', fontSize: '0.82rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Período: </span>
                <strong className="font-mono">{overview.ano_min} - {overview.ano_max}</strong>
              </div>
              <div style={{ height: '14px', width: '1px', backgroundColor: 'var(--border)' }} />
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Gols Catalogados: </span>
                <strong className="font-mono">{overview.total_gols?.toLocaleString('pt-BR')}</strong>
              </div>
            </div>
          )}

          <button 
            className="btn-secondary" 
            onClick={() => setDarkMode(!darkMode)}
            title="Alternar Modo Claro / Escuro"
            style={{ padding: '10px 12px' }}
          >
            {darkMode ? <Sun size={18} color="#FFB6C1" /> : <Moon size={18} color="#0369A1" />}
          </button>
        </div>
      </header>

      {/* NAVEGAÇÃO ENTRE ABAS */}
      <nav style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '24px', overflowX: 'auto' }}>
        <button 
          className={activeTab === 'h2h' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('h2h')}
        >
          <Swords size={18} /> Raio-X de Confrontos (H2H)
        </button>

        <button 
          className={activeTab === 'playground' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('playground')}
        >
          <Search size={18} /> Explorador de Jogos & Gols
        </button>

        <button 
          className={activeTab === 'clima' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('clima')}
        >
          <CloudRain size={18} /> Futebol x Clima
        </button>

        <button 
          className={activeTab === 'tweets' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('tweets')}
        >
          <Sparkles size={18} /> Gerador de Tweets & Posts
        </button>
      </nav>

      {/* ABA 1: RAIO-X H2H */}
      {activeTab === 'h2h' && (
        <section>
          {/* SELETOR DE CLUBES */}
          <div className="soft-card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Swords size={20} color="#87CEEB" /> Escolha os Clubes do Duelo
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Primeiro Clube
                </label>
                <input 
                  type="text" 
                  className="soft-input"
                  value={clube1}
                  onChange={e => setClube1(e.target.value)}
                  placeholder="Ex: Flamengo, Palmeiras, Corinthians..."
                  list="clubes-sugestoes"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Segundo Clube (Rival)
                </label>
                <input 
                  type="text" 
                  className="soft-input"
                  value={clube2}
                  onChange={e => setClube2(e.target.value)}
                  placeholder="Ex: Vasco, São Paulo, Santos..."
                  list="clubes-sugestoes"
                />
              </div>

              <div>
                <button className="btn-primary" style={{ width: '100%' }} onClick={carregarH2H} disabled={h2hLoading}>
                  {h2hLoading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
                  Comparar Retrospecto
                </button>
              </div>
            </div>

            <datalist id="clubes-sugestoes">
              {clubesList.map(c => (
                <option key={c.nome} value={c.nome} />
              ))}
            </datalist>
          </div>

          {/* RESULTADO DO CONFRONTO */}
          {h2hData && (
            <div>
              {/* PLACAR GERAL RESUMO */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="soft-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Vitórias de {h2hData.clube1}</div>
                  <div className="font-mono" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#0369A1' }}>
                    {h2hData.vitorias_clube1}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {h2hData.total_jogos > 0 ? ((h2hData.vitorias_clube1 / h2hData.total_jogos) * 100).toFixed(1) : 0}% dos jogos
                  </div>
                </div>

                <div className="soft-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Empates</div>
                  <div className="font-mono" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#64748B' }}>
                    {h2hData.empates}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {h2hData.total_jogos > 0 ? ((h2hData.empates / h2hData.total_jogos) * 100).toFixed(1) : 0}% dos jogos
                  </div>
                </div>

                <div className="soft-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Vitórias de {h2hData.clube2}</div>
                  <div className="font-mono" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#BE185D' }}>
                    {h2hData.vitorias_clube2}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {h2hData.total_jogos > 0 ? ((h2hData.vitorias_clube2 / h2hData.total_jogos) * 100).toFixed(1) : 0}% dos jogos
                  </div>
                </div>

                <div className="soft-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total de Jogos Oficiais</div>
                  <div className="font-mono" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                    {h2hData.total_jogos}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Gols: {h2hData.gols_clube1} x {h2hData.gols_clube2}
                  </div>
                </div>
              </div>

              {/* CARD DE TABU E MAIORES GOLEADAS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {h2hData.tabu_invicto && (
                  <div className="soft-card" style={{ padding: '18px', borderLeft: '4px solid #90EE90' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <ShieldAlert size={20} color="#15803D" />
                      <strong style={{ fontSize: '0.95rem' }}>Tabu de Invencibilidade Ativo</strong>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      O <strong>{h2hData.tabu_invicto.clube}</strong> não perde este confronto há 
                      <strong className="font-mono"> {h2hData.tabu_invicto.jogos} jogos consecutivos</strong>.
                    </p>
                  </div>
                )}

                {h2hData.maior_goleada_clube1 && (
                  <div className="soft-card" style={{ padding: '18px' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Maior Goleada de {h2hData.clube1}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                        {h2hData.maior_goleada_clube1.mandante} {h2hData.maior_goleada_clube1.placar} {h2hData.maior_goleada_clube1.visitante}
                      </span>
                      <span className="badge badge-blue font-mono">{h2hData.maior_goleada_clube1.data}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {h2hData.maior_goleada_clube1.campeonato} • {h2hData.maior_goleada_clube1.estadio || 'Estádio não informado'}
                    </div>
                  </div>
                )}

                {h2hData.maior_goleada_clube2 && (
                  <div className="soft-card" style={{ padding: '18px' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Maior Goleada de {h2hData.clube2}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                        {h2hData.maior_goleada_clube2.mandante} {h2hData.maior_goleada_clube2.placar} {h2hData.maior_goleada_clube2.visitante}
                      </span>
                      <span className="badge badge-pink font-mono">{h2hData.maior_goleada_clube2.data}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {h2hData.maior_goleada_clube2.campeonato} • {h2hData.maior_goleada_clube2.estadio || 'Estádio não informado'}
                    </div>
                  </div>
                )}
              </div>

              {/* GERADOR RÁPIDO DE TWEET DESTE CONFRONTO */}
              <div className="soft-card" style={{ padding: '20px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(135,206,235,0.08), rgba(255,182,193,0.08))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="#0369A1" />
                    <strong>Snippet para Postagem no Twitter / X</strong>
                  </div>
                  <button 
                    className="btn-primary" 
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                    onClick={() => {
                      const tweet = `📊 RAIO-X HISTÓRICO | ${h2hData.clube1} x ${h2hData.clube2}\n\n` +
                        `Em ${h2hData.total_jogos} confrontos oficiais desde 1950:\n` +
                        `🔹 ${h2hData.vitorias_clube1} vitórias do ${h2hData.clube1}\n` +
                        `🔸 ${h2hData.vitorias_clube2} vitórias do ${h2hData.clube2}\n` +
                        `🤝 ${h2hData.empates} empates\n` +
                        `⚽ Gols: ${h2hData.gols_clube1} x ${h2hData.gols_clube2}\n` +
                        (h2hData.tabu_invicto ? `🔥 Tabu ativo: ${h2hData.tabu_invicto.clube} invicto há ${h2hData.tabu_invicto.jogos} jogos!\n` : '') +
                        `\n#Futebol #Estatísticas #${h2hData.clube1.replace(/[^a-zA-Z0-9]/g, '')} #${h2hData.clube2.replace(/[^a-zA-Z0-9]/g, '')}`;
                      copiarTweet(tweet, 'h2h-tweet');
                    }}
                  >
                    {copiedKey === 'h2h-tweet' ? <Check size={16} /> : <Copy size={16} />}
                    {copiedKey === 'h2h-tweet' ? 'Copiado!' : 'Copiar Texto para Tweet'}
                  </button>
                </div>
                <div className="font-mono" style={{ fontSize: '0.85rem', whiteSpace: 'pre-line', backgroundColor: 'var(--surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {`📊 RAIO-X HISTÓRICO | ${h2hData.clube1} x ${h2hData.clube2}\n\n` +
                   `Em ${h2hData.total_jogos} confrontos oficiais desde 1950:\n` +
                   `🔹 ${h2hData.vitorias_clube1} vitórias do ${h2hData.clube1}\n` +
                   `🔸 ${h2hData.vitorias_clube2} vitórias do ${h2hData.clube2}\n` +
                   `🤝 ${h2hData.empates} empates\n` +
                   `⚽ Gols: ${h2hData.gols_clube1} x ${h2hData.gols_clube2}\n` +
                   (h2hData.tabu_invicto ? `🔥 Tabu ativo: ${h2hData.tabu_invicto.clube} invicto há ${h2hData.tabu_invicto.jogos} jogos!\n` : '')}
                </div>
              </div>

              {/* LISTA DOS ÚLTIMOS CONFRONTOS */}
              <div className="soft-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '14px' }}>
                  Últimos 30 Jogos Entre as Equipes
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 8px' }}>Data</th>
                        <th style={{ padding: '10px 8px' }}>Competição</th>
                        <th style={{ padding: '10px 8px' }}>Fase</th>
                        <th style={{ padding: '10px 8px', textAlign: 'right' }}>Mandante</th>
                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>Placar</th>
                        <th style={{ padding: '10px 8px' }}>Visitante</th>
                        <th style={{ padding: '10px 8px' }}>Estádio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {h2hData.partidas.map(p => (
                        <tr key={p.id_partida} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="font-mono" style={{ padding: '10px 8px', fontSize: '0.82rem' }}>{p.data}</td>
                          <td style={{ padding: '10px 8px' }}>{p.campeonato}</td>
                          <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.fase || '-'}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: p.vencedor === p.mandante ? '700' : '400' }}>
                            {p.mandante}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '700' }}>
                            <span className="badge badge-blue">{p.placar}</span>
                          </td>
                          <td style={{ padding: '10px 8px', fontWeight: p.vencedor === p.visitante ? '700' : '400' }}>
                            {p.visitante}
                          </td>
                          <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {p.estadio || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ABA 2: PLAYGROUND DE JOGOS & GOLS */}
      {activeTab === 'playground' && (
        <section>
          {/* FILTROS DO PLAYGROUND */}
          <div className="soft-card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={20} color="#87CEEB" /> Filtro Avançado de Partidas
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Clube</label>
                <input 
                  type="text" 
                  className="soft-input" 
                  placeholder="Nome do clube..."
                  value={pgClube}
                  onChange={e => setPgClube(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Campeonato</label>
                <select 
                  className="soft-input"
                  value={pgCamp}
                  onChange={e => setPgCamp(e.target.value)}
                >
                  <option value="">Todos os Torneios</option>
                  {campeonatosList.map(c => (
                    <option key={c.campeonato} value={c.campeonato}>
                      {c.campeonato} ({c.jogos} jogos)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Cenário</label>
                <select 
                  className="soft-input"
                  value={pgCenario}
                  onChange={e => setPgCenario(e.target.value)}
                >
                  <option value="todos">Todos os Jogos</option>
                  <option value="goleadas">Goleadas (Diferença ≥ 4 ou ≥ 6 gols)</option>
                  <option value="finais">Finais & Decisões</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Busca Livre (Estádio, Árbitro)</label>
                <input 
                  type="text" 
                  className="soft-input" 
                  placeholder="Ex: Maracanã, Wright..."
                  value={pgBusca}
                  onChange={e => setPgBusca(e.target.value)}
                />
              </div>

              <div>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => carregarPartidas(1)}>
                  <Search size={16} /> Filtrar Jogos
                </button>
              </div>
            </div>
          </div>

          {/* LISTA DE RESULTADOS DO PLAYGROUND */}
          <div className="soft-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>
                {partidasData ? `${partidasData.total.toLocaleString('pt-BR')} partidas encontradas` : 'Carregando...'}
              </h3>

              {partidasData && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                    disabled={partidasData.page <= 1}
                    onClick={() => {
                      setPgPage(partidasData.page - 1);
                      carregarPartidas(partidasData.page - 1);
                    }}
                  >
                    Anterior
                  </button>
                  <span className="badge badge-blue font-mono">Página {partidasData.page}</span>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                    disabled={partidasData.page * partidasData.limit >= partidasData.total}
                    onClick={() => {
                      setPgPage(partidasData.page + 1);
                      carregarPartidas(partidasData.page + 1);
                    }}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {partidasData?.partidas.map(p => (
                <div 
                  key={p.id_partida}
                  style={{ 
                    padding: '14px 18px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="badge badge-blue font-mono">{p.data}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>{p.campeonato}</span>
                      {p.fase && <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>({p.fase})</span>}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {p.estadio} {p.cidade && `• ${p.cidade}/${p.estado}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: p.vencedor === p.mandante ? '700' : '500', width: '40%', textAlign: 'right' }}>
                      {p.mandante}
                    </div>
                    <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '800', padding: '0 16px', color: '#0369A1' }}>
                      {p.placar}
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: p.vencedor === p.visitante ? '700' : '500', width: '40%', textAlign: 'left' }}>
                      {p.visitante}
                    </div>
                  </div>

                  {/* AUTORES DOS GOLS (SE HOUVER) */}
                  {p.gols && p.gols.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px dashed var(--border)', paddingTop: '6px', marginTop: '6px' }}>
                      ⚽ <strong>Gols: </strong>
                      {p.gols.map((g, idx) => (
                        <span key={idx}>
                          {g.atleta} ({g.clube} {g.minuto}')
                          {idx < p.gols.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ABA 3: FUTEBOL X CLIMA */}
      {activeTab === 'clima' && (
        <section>
          <div className="soft-card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CloudRain size={22} color="#87CEEB" /> O Efeito do Clima nas Partidas (2015 a 2024)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Cruzamento entre o histórico de partidas oficiais e a base meteorológica de 12 capitais brasileiras.
            </p>
          </div>

          {climaData ? (
            <div>
              {/* COMPARAÇÃO CHUVA VS TEMPO SECO */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {climaData.impacto_chuva.map((item, idx) => (
                  <div key={idx} className="soft-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className={`badge ${item.cond_chuva === 'Com Chuva' ? 'badge-blue' : 'badge-pink'}`}>
                        {item.cond_chuva}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.total_jogos.toLocaleString('pt-BR')} jogos</span>
                    </div>

                    <div style={{ margin: '14px 0' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Média de Gols por Jogo</div>
                      <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: '700', color: '#0369A1' }}>
                        {item.media_gols}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                      Vitória do Mandante: <strong className="font-mono">{item.pct_vit_mandante}%</strong>
                      <br />
                      Média Mandante: <strong className="font-mono">{item.media_mandante}</strong> | Visitante: <strong className="font-mono">{item.media_visitante}</strong>
                    </div>
                  </div>
                ))}

                {/* TEMPERATURA */}
                <div className="soft-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Flame size={18} color="#FFB6C1" />
                    <strong>Gols por Faixa Térmica</strong>
                  </div>
                  {climaData.impacto_temperatura.map((t, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                      <span>{t.faixa_temp}</span>
                      <strong className="font-mono">{t.media_gols} gols/jogo ({t.total_jogos})</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* JOGOS SOB TEMPORAL */}
              <div className="soft-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CloudRain size={18} color="#0369A1" /> Top Jogos com Chuva Torrencial no Brasil (&gt; 30mm)
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '8px' }}>Data</th>
                        <th style={{ padding: '8px' }}>Cidade</th>
                        <th style={{ padding: '8px' }}>Chuva</th>
                        <th style={{ padding: '8px' }}>Temp.</th>
                        <th style={{ padding: '8px' }}>Partida</th>
                        <th style={{ padding: '8px' }}>Placar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {climaData.jogos_chuva_extrema.map((j, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="font-mono" style={{ padding: '8px' }}>{j.data}</td>
                          <td style={{ padding: '8px' }}>{j.cidade}</td>
                          <td className="font-mono" style={{ padding: '8px', color: '#0369A1', fontWeight: '700' }}>{j.precipitacao_mm} mm</td>
                          <td className="font-mono" style={{ padding: '8px' }}>{j.temperatura_media}°C</td>
                          <td style={{ padding: '8px' }}>{j.mandante} x {j.visitante}</td>
                          <td className="font-mono" style={{ padding: '8px', fontWeight: '700' }}>{j.placar}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="soft-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Carregando análises meteorológicas...
            </div>
          )}
        </section>
      )}

      {/* ABA 4: GERADOR DE POSTS & TWEETS */}
      {activeTab === 'tweets' && (
        <section>
          <div className="soft-card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="#87CEEB" /> Gerador de Fios e Posts para o Twitter / X
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Copie com 1 clique modelos de postagens de alto engajamento prontos com estatísticas do nosso banco de dados.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* CARD MODELO 1: DIA DE CLÁSSICO */}
            <div className="soft-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-blue">Template: Dia de Clássico</span>
                </div>
                <div className="font-mono" style={{ fontSize: '0.85rem', whiteSpace: 'pre-line', backgroundColor: 'var(--bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {`🔥 HOJE É DIA DE CLÁSSICO! Quem leva a melhor?\n\n` +
                   `Histórico oficial do confronto:\n` +
                   `⚔️ 109 jogos desde 1950\n` +
                   `🔴 43 vitórias do Flamengo\n` +
                   `⚪ 31 vitórias do Vasco\n` +
                   `🤝 35 empates\n\n` +
                   `Qual o seu palpite para o jogo de hoje? Deixe nos comentários! 👇⚽`}
                </div>
              </div>
              <button 
                className="btn-primary" 
                style={{ marginTop: '14px' }}
                onClick={() => copiarTweet(
                  `🔥 HOJE É DIA DE CLÁSSICO! Quem leva a melhor?\n\n` +
                  `Histórico oficial do confronto:\n` +
                  `⚔️ 109 jogos desde 1950\n` +
                  `🔴 43 vitórias do Flamengo\n` +
                  `⚪ 31 vitórias do Vasco\n` +
                  `🤝 35 empates\n\n` +
                  `Qual o seu palpite para o jogo de hoje? Deixe nos comentários! 👇⚽\n#Futebol #Brasileirao #Classico`,
                  'tweet-classico'
                )}
              >
                {copiedKey === 'tweet-classico' ? <Check size={16} /> : <Copy size={16} />}
                {copiedKey === 'tweet-classico' ? 'Copiado para Área de Transferência!' : 'Copiar Tweet'}
              </button>
            </div>

            {/* CARD MODELO 2: CURIOSIDADE CLIMA X FUTEBOL */}
            <div className="soft-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-green">Template: Curiosidade Clima</span>
                </div>
                <div className="font-mono" style={{ fontSize: '0.85rem', whiteSpace: 'pre-line', backgroundColor: 'var(--bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {`🌧️ O gramado molhado realmente gera mais gols no futebol brasileiro?\n\n` +
                   `Analisamos mais de 7.000 jogos entre 2015 e 2024 cruzando com estações meteorológicas:\n\n` +
                   `☔ Jogos com chuva: 2.37 gols por partida\n` +
                   `☀️ Jogos com tempo seco: 2.38 gols por partida\n\n` +
                   `A diferença na média de gols é de menos de 1%, desmistificando o mito de que 'chuva é garantia de gol'!`}
                </div>
              </div>
              <button 
                className="btn-primary" 
                style={{ marginTop: '14px' }}
                onClick={() => copiarTweet(
                  `🌧️ O gramado molhado realmente gera mais gols no futebol brasileiro?\n\n` +
                  `Analisamos mais de 7.000 jogos entre 2015 e 2024 cruzando com estações meteorológicas:\n\n` +
                  `☔ Jogos com chuva: 2.37 gols por partida\n` +
                  `☀️ Jogos com tempo seco: 2.38 gols por partida\n\n` +
                  `A diferença na média de gols é de menos de 1%, desmistificando o mito de que 'chuva é garantia de gol'!\n#Futebol #Dados #Curiosidade`,
                  'tweet-clima'
                )}
              >
                {copiedKey === 'tweet-clima' ? <Check size={16} /> : <Copy size={16} />}
                {copiedKey === 'tweet-clima' ? 'Copiado para Área de Transferência!' : 'Copiar Tweet'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ marginTop: '48px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          FutStats & Clima • Feito com <strong style={{ color: 'var(--text-main)' }}>Soft UI Evolution</strong>
        </div>
        <div className="font-mono">
          43.980 jogos oficiais • 42.133 gols detalhados • 12 capitais climáticas
        </div>
      </footer>

    </div>
  );
}
