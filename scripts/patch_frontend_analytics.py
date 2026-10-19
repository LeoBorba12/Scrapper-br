import re

FRONTEND_FILE = "frontend/src/App.jsx"

with open(FRONTEND_FILE, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Adicionar estados para a Tab Times
ESTADOS_TIMES = '''
  // Tab: Análise de Times & Histórico Recente
  const [timesAnalise, setTimesAnalise] = useState([]);
  const [timesLoading, setTimesLoading] = useState(false);
  const [timesRecorte, setTimesRecorte] = useState('10');
  const [timesCampeonato, setTimesCampeonato] = useState('');
  const [timesSearch, setTimesSearch] = useState('');
  const [timesSortBy, setTimesSortBy] = useState('aproveitamento');
  const [timesSortAsc, setTimesSortAsc] = useState(false);
  const [selectedTeamRecent, setSelectedTeamRecent] = useState(null);

  const carregarAnaliseTimes = (recorte = timesRecorte, camp = timesCampeonato) => {
    setTimesLoading(true);
    const params = new URLSearchParams({ recorte });
    if (camp) params.append('campeonato', camp);
    apiFetch(`/api/times/analise-recente?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        setTimesAnalise(d.times || []);
        setTimesLoading(false);
      })
      .catch(() => setTimesLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'times' && timesAnalise.length === 0 && currentUser) {
      carregarAnaliseTimes();
    }
  }, [activeTab, currentUser]);
'''

if "timesAnalise" not in code:
    target_state = "const [aovivoLoading, setAovivoLoading] = useState(false);"
    if target_state in code:
        code = code.replace(target_state, target_state + "\n" + ESTADOS_TIMES, 1)
        print("-> Estados da Tab Times inseridos com sucesso!")

# 2. Adicionar Botão de Navegação da Tab Times
BOTAO_NAV_TIMES = '''
          {/* Times & Análise Recente */}
          <button
            onClick={() => { setActiveTab('times'); if (timesAnalise.length === 0) carregarAnaliseTimes(); }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: activeTab === 'times' ? '#12141A' : 'transparent',
                color: activeTab === 'times' ? '#FFFFFF' : '#8A8F9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease',
                boxShadow: activeTab === 'times' ? '0 6px 16px -2px rgba(18, 20, 26, 0.25)' : 'none'
              }}
            >
              <BarChart3 size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 600, color: activeTab === 'times' ? '#12141A' : '#9499A8' }}>
              Times
            </span>
          </button>
'''

if "setActiveTab('times')" not in code:
    target_nav = "{/* Jogadores */}"
    if target_nav in code:
        code = code.replace(target_nav, BOTAO_NAV_TIMES + "\n          " + target_nav, 1)
        print("-> Botão da Tab Times inserido na barra de navegação!")

# 3. Inserir Minutagem e Evolução Anual no Perfil do Atleta
ENRIQUECIMENTO_JOGADOR = '''
                {/* MINUTAGEM & DISTRIBUIÇÃO DOS GOLS */}
                {playerProfile.distribuicao_minutos && (
                  <div className="soft-card" style={{ padding: '20px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ⏱️ Minutagem & Momento dos Gols
                      </h3>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span className="badge badge-blue">
                          1º Tempo: {playerProfile.distribuicao_tempos?.['1T'] || 0} gols ({Math.round(((playerProfile.distribuicao_tempos?.['1T'] || 0) / (playerProfile.resumo?.total_gols || 1)) * 100)}%)
                        </span>
                        <span className="badge badge-green">
                          2º Tempo: {playerProfile.distribuicao_tempos?.['2T'] || 0} gols ({Math.round(((playerProfile.distribuicao_tempos?.['2T'] || 0) / (playerProfile.resumo?.total_gols || 1)) * 100)}%)
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                      {Object.entries(playerProfile.distribuicao_minutos).map(([faixa, qtd]) => {
                        const maxF = Math.max(...Object.values(playerProfile.distribuicao_minutos), 1);
                        const pct = Math.round((qtd / maxF) * 100);
                        const isClutch = faixa === '76-90+';
                        return (
                          <div key={faixa} style={{ padding: '12px', backgroundColor: 'var(--surface-hover)', borderRadius: '8px', textAlign: 'center', border: isClutch ? '1px solid #10B981' : '1px solid var(--border)' }}>
                            <div style={{ fontSize: '0.78rem', color: isClutch ? '#10B981' : 'var(--text-muted)', fontWeight: isClutch ? '700' : '500' }}>
                              {faixa}' {isClutch ? '🔥 Clutch' : ''}
                            </div>
                            <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '700', margin: '4px 0', color: 'var(--text)' }}>
                              {qtd}
                            </div>
                            <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, backgroundColor: isClutch ? '#10B981' : '#3B82F6', borderRadius: '3px' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* HISTÓRICO TEMPORADA A TEMPORADA */}
                {playerProfile.historico_temporadas?.length > 0 && (
                  <div className="soft-card" style={{ padding: '20px', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📅 Evolução Temporada a Temporada (Ano a Ano)
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '8px 6px' }}>Temporada</th>
                            <th style={{ padding: '8px 6px' }}>Clubes Defendidos</th>
                            <th style={{ padding: '8px 6px', textAlign: 'center' }}>Partidas</th>
                            <th style={{ padding: '8px 6px', textAlign: 'center' }}>Gols</th>
                            <th style={{ padding: '8px 6px', textAlign: 'center' }}>Média G/J</th>
                            <th style={{ padding: '8px 6px', textAlign: 'center' }}>🟨</th>
                            <th style={{ padding: '8px 6px', textAlign: 'center' }}>🟥</th>
                          </tr>
                        </thead>
                        <tbody>
                          {playerProfile.historico_temporadas.map((t) => (
                            <tr key={t.ano} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td className="font-mono" style={{ padding: '8px 6px', fontWeight: '700' }}>{t.ano}</td>
                              <td style={{ padding: '8px 6px' }}>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {t.clubes.map(clb => (
                                    <span key={clb} className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{clb}</span>
                                  ))}
                                </div>
                              </td>
                              <td className="font-mono" style={{ padding: '8px 6px', textAlign: 'center' }}>{t.jogos}</td>
                              <td className="font-mono" style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '700', color: '#15803D' }}>{t.gols}</td>
                              <td className="font-mono" style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>{t.media_gols}</td>
                              <td className="font-mono" style={{ padding: '8px 6px', textAlign: 'center', color: '#D97706' }}>{t.amarelos}</td>
                              <td className="font-mono" style={{ padding: '8px 6px', textAlign: 'center', color: '#DC2626' }}>{t.vermelhos}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
'''

if "Minutagem & Momento dos Gols" not in code:
    target_perfil_partidas = "{/* LISTA COMPLETA DAS PARTIDAS DO ATLETA */}"
    if target_perfil_partidas in code:
        code = code.replace(target_perfil_partidas, ENRIQUECIMENTO_JOGADOR + "\n              " + target_perfil_partidas, 1)
        print("-> Minutagem e Evolução Anual inseridos no perfil do atleta!")

# 4. Inserir a Seção Completa da Tab Times
SECAO_TIMES = '''
      {/* ABA: TABELA ANALÍTICA DE TIMES & MOMENTO RECENTE */}
      {activeTab === 'times' && (
        <section>
          {/* HEADER & FILTROS */}
          <div className="soft-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <BarChart3 size={24} color="#10B981" /> Tabela Analítica de Times & Momento Recente
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
                  Compare a forma recente, médias de gols pró/contra, solidez defensiva (clean sheets) e tendências dos clubes.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  className="btn-secondary"
                  onClick={() => carregarAnaliseTimes(timesRecorte, timesCampeonato)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                  disabled={timesLoading}
                >
                  <RefreshCw size={15} className={timesLoading ? 'animate-spin' : ''} />
                  Atualizar
                </button>
              </div>
            </div>

            {/* SELETORES DE RECORTE E COMPETIÇÃO */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '20px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }}>Recorte:</span>
                {['5', '10', '15', '20'].map(rec => (
                  <button
                    key={rec}
                    onClick={() => { setTimesRecorte(rec); carregarAnaliseTimes(rec, timesCampeonato); }}
                    className={timesRecorte === rec ? 'badge badge-green' : 'badge'}
                    style={{ cursor: 'pointer', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid var(--border)' }}
                  >
                    Últimos {rec} Jogos
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }}>Competição:</span>
                {[
                  { id: '', label: 'Geral' },
                  { id: 'Série A', label: 'Brasileirão Série A' },
                  { id: 'Série B', label: 'Série B' },
                  { id: 'Copa do Brasil', label: 'Copa do Brasil' }
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setTimesCampeonato(c.id); carregarAnaliseTimes(timesRecorte, c.id); }}
                    className={timesCampeonato === c.id ? 'badge badge-blue' : 'badge'}
                    style={{ cursor: 'pointer', padding: '6px 10px', fontSize: '0.8rem', border: '1px solid var(--border)' }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <div style={{ marginLeft: 'auto', minWidth: '220px' }}>
                <input
                  type="text"
                  className="soft-input"
                  placeholder="Filtrar time..."
                  value={timesSearch}
                  onChange={e => setTimesSearch(e.target.value)}
                  style={{ height: '36px', fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* 4 CARDS RESUMO DO RECORTE */}
          {timesAnalise.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {(() => {
                const melhorAprov = [...timesAnalise].sort((a,b) => b.aproveitamento - a.aproveitamento)[0];
                const melhorAtaque = [...timesAnalise].sort((a,b) => b.media_gols_pro - a.media_gols_pro)[0];
                const melhorDefesa = [...timesAnalise].sort((a,b) => b.clean_sheets_pct - a.clean_sheets_pct)[0];
                const maiorOver = [...timesAnalise].sort((a,b) => b.over_2_5_pct - a.over_2_5_pct)[0];

                return (
                  <>
                    <div className="soft-card" style={{ padding: '16px', borderTop: '3px solid #10B981' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>🔥 Melhor Aproveitamento Recente</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '4px' }}>{melhorAprov?.clube}</div>
                      <div className="font-mono" style={{ fontSize: '1rem', color: '#10B981', fontWeight: '600' }}>
                        {melhorAprov?.aproveitamento}% ({melhorAprov?.vitorias}V-{melhorAprov?.empates}E-{melhorAprov?.derrotas}D)
                      </div>
                    </div>

                    <div className="soft-card" style={{ padding: '16px', borderTop: '3px solid #3B82F6' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⚡ Melhor Ataque Recente</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '4px' }}>{melhorAtaque?.clube}</div>
                      <div className="font-mono" style={{ fontSize: '1rem', color: '#3B82F6', fontWeight: '600' }}>
                        {melhorAtaque?.media_gols_pro} gols/j ({melhorAtaque?.gols_pro} no recorte)
                      </div>
                    </div>

                    <div className="soft-card" style={{ padding: '16px', borderTop: '3px solid #8B5CF6' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>🛡️ Mais Jogos Sem Sofrer Gols</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '4px' }}>{melhorDefesa?.clube}</div>
                      <div className="font-mono" style={{ fontSize: '1rem', color: '#8B5CF6', fontWeight: '600' }}>
                        {melhorDefesa?.clean_sheets_pct}% ({melhorDefesa?.clean_sheets} clean sheets)
                      </div>
                    </div>

                    <div className="soft-card" style={{ padding: '16px', borderTop: '3px solid #F59E0B' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>🎯 Tendência Over 2.5 Gols</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', marginTop: '4px' }}>{maiorOver?.clube}</div>
                      <div className="font-mono" style={{ fontSize: '1rem', color: '#F59E0B', fontWeight: '600' }}>
                        {maiorOver?.over_2_5_pct}% dos jogos ({maiorOver?.over_2_5} partidas)
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* TABELA ANALÍTICA PRINCIPAL */}
          <div className="soft-card" style={{ padding: '20px', marginBottom: '24px' }}>
            {timesLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
                Calculando histórico recente dos clubes...
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 8px' }}>#</th>
                      <th style={{ padding: '10px 8px' }}>Clube</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>Forma Recente</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', cursor: 'pointer' }} onClick={() => { setTimesSortBy('aproveitamento'); setTimesSortAsc(!timesSortAsc); }}>
                        Aprov. % {timesSortBy === 'aproveitamento' ? (timesSortAsc ? '↑' : '↓') : ''}
                      </th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>J</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>V</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>E</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>D</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', cursor: 'pointer' }} onClick={() => { setTimesSortBy('gols_pro'); setTimesSortAsc(!timesSortAsc); }}>
                        GP {timesSortBy === 'gols_pro' ? (timesSortAsc ? '↑' : '↓') : ''}
                      </th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', cursor: 'pointer' }} onClick={() => { setTimesSortBy('gols_contra'); setTimesSortAsc(!timesSortAsc); }}>
                        GC {timesSortBy === 'gols_contra' ? (timesSortAsc ? '↑' : '↓') : ''}
                      </th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', cursor: 'pointer' }} onClick={() => { setTimesSortBy('saldo_gols'); setTimesSortAsc(!timesSortAsc); }}>
                        SG {timesSortBy === 'saldo_gols' ? (timesSortAsc ? '↑' : '↓') : ''}
                      </th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>Média GP</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', cursor: 'pointer' }} onClick={() => { setTimesSortBy('clean_sheets_pct'); setTimesSortAsc(!timesSortAsc); }}>
                        Clean Sheets % {timesSortBy === 'clean_sheets_pct' ? (timesSortAsc ? '↑' : '↓') : ''}
                      </th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', cursor: 'pointer' }} onClick={() => { setTimesSortBy('btts_pct'); setTimesSortAsc(!timesSortAsc); }}>
                        BTTS (Ambas) % {timesSortBy === 'btts_pct' ? (timesSortAsc ? '↑' : '↓') : ''}
                      </th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', cursor: 'pointer' }} onClick={() => { setTimesSortBy('over_2_5_pct'); setTimesSortAsc(!timesSortAsc); }}>
                        Over 2.5 % {timesSortBy === 'over_2_5_pct' ? (timesSortAsc ? '↑' : '↓') : ''}
                      </th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timesAnalise
                      .filter(t => !timesSearch || t.clube.toLowerCase().includes(timesSearch.toLowerCase()))
                      .sort((a, b) => {
                        const valA = a[timesSortBy] ?? 0;
                        const valB = b[timesSortBy] ?? 0;
                        return timesSortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
                      })
                      .map((t, idx) => (
                        <tr 
                          key={t.clube} 
                          style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                          onClick={() => setSelectedTeamRecent(t)}
                          className="hover-row"
                        >
                          <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                          <td style={{ padding: '10px 8px', fontWeight: '600' }}>{t.clube}</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                              {t.sequencia.map((r, ri) => (
                                <span
                                  key={ri}
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    fontSize: '0.65rem',
                                    fontWeight: '700',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FFF',
                                    backgroundColor: r === 'V' ? '#10B981' : (r === 'E' ? '#F59E0B' : '#EF4444')
                                  }}
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '700' }}>
                            <span style={{ color: t.aproveitamento >= 60 ? '#10B981' : (t.aproveitamento <= 35 ? '#EF4444' : '#F59E0B') }}>
                              {t.aproveitamento}%
                            </span>
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center' }}>{t.jogos}</td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', color: '#10B981' }}>{t.vitorias}</td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', color: '#F59E0B' }}>{t.empates}</td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', color: '#EF4444' }}>{t.derrotas}</td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center' }}>{t.gols_pro}</td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center' }}>{t.gols_contra}</td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', color: t.saldo_gols > 0 ? '#10B981' : (t.saldo_gols < 0 ? '#EF4444' : 'inherit') }}>
                            {t.saldo_gols > 0 ? `+${t.saldo_gols}` : t.saldo_gols}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center' }}>{t.media_gols_pro}</td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center' }}>{t.clean_sheets_pct}%</td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center' }}>{t.btts_pct}%</td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center' }}>{t.over_2_5_pct}%</td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            <button
                              className="btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={(e) => { e.stopPropagation(); setSelectedTeamRecent(t); }}
                            >
                              Ver Jogos
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* MODAL / GAVETA DE PARTIDAS RECENTES DO CLUBE */}
          {selectedTeamRecent && (
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '16px'
              }}
              onClick={() => setSelectedTeamRecent(null)}
            >
              <div 
                className="soft-card" 
                style={{ 
                  maxWidth: '750px', 
                  width: '100%', 
                  maxHeight: '85vh', 
                  overflowY: 'auto', 
                  padding: '24px', 
                  backgroundColor: 'var(--surface)' 
                }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                      {selectedTeamRecent.clube} — Últimos {selectedTeamRecent.jogos} Jogos
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <span className="badge badge-green">Aprov: {selectedTeamRecent.aproveitamento}%</span>
                      <span className="badge badge-blue">GP: {selectedTeamRecent.gols_pro} | GC: {selectedTeamRecent.gols_contra}</span>
                      <span className="badge">Clean Sheets: {selectedTeamRecent.clean_sheets_pct}%</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedTeamRecent(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '8px' }}>Data</th>
                        <th style={{ padding: '8px' }}>Torneio</th>
                        <th style={{ padding: '8px' }}>Mando</th>
                        <th style={{ padding: '8px' }}>Adversário</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Placar</th>
                        <th style={{ padding: '8px', textAlign: 'center' }}>Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTeamRecent.partidas_recentes?.map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="font-mono" style={{ padding: '8px', color: 'var(--text-muted)' }}>{p.data}</td>
                          <td style={{ padding: '8px' }}><span className="badge badge-blue">{p.campeonato}</span></td>
                          <td style={{ padding: '8px' }}>{p.mando}</td>
                          <td style={{ padding: '8px', fontWeight: '600' }}>{p.adversario}</td>
                          <td className="font-mono" style={{ padding: '8px', textAlign: 'center', fontWeight: '700' }}>{p.placar}</td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <span
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                color: '#FFF',
                                backgroundColor: p.resultado === 'V' ? '#10B981' : (p.resultado === 'E' ? '#F59E0B' : '#EF4444')
                              }}
                            >
                              {p.resultado === 'V' ? 'Vitória' : (p.resultado === 'E' ? 'Empate' : 'Derrota')}
                            </span>
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
'''

if "{activeTab === 'times' && (" not in code:
    target_secao_jogadores = "{/* ABA 3: ORÁCULO & IA ANALISTA */}"
    if target_secao_jogadores in code:
        code = code.replace(target_secao_jogadores, SECAO_TIMES + "\n      " + target_secao_jogadores, 1)
        print("-> Seção completa da Tab Times inserida com sucesso!")

with open(FRONTEND_FILE, "w", encoding="utf-8") as f:
    f.write(code)

print("Patch aplicado com sucesso em frontend/src/App.jsx!")
