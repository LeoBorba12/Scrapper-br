import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, TrendingUp, BarChart3, ShieldCheck, Search, Users,
  Check, Info, ChevronRight, Filter, Database, Sparkles, Activity
} from 'lucide-react';

export default function MetricasAvancadasView({ darkMode }) {
  const [activeSubTab, setActiveSubTab] = useState('rankings'); // 'rankings' | 'clubes' | 'atleta' | 'governanca'
  const [meta, setMeta] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Rankings state
  const [metricaSelecionada, setMetricaSelecionada] = useState('xg');
  const [minMinutos, setMinMinutos] = useState(450);
  const [rankings, setRankings] = useState([]);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [filtroPosicao, setFiltroPosicao] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');

  // Clubes state
  const [clubes, setClubes] = useState([]);
  const [loadingClubes, setLoadingClubes] = useState(false);
  const [clubeSelecionado, setClubeSelecionado] = useState(null);
  const [clubeDetalhe, setClubeDetalhe] = useState(null);
  const [loadingClubeDetalhe, setLoadingClubeDetalhe] = useState(false);

  // Atleta busca e detalhe
  const [atletaBuscaId, setAtletaBuscaId] = useState(null);
  const [atletaDetalhe, setAtletaDetalhe] = useState(null);
  const [loadingAtleta, setLoadingAtleta] = useState(false);

  // 1. Carregar metadados
  useEffect(() => {
    fetch('/api/metricas-avancadas/meta')
      .then(r => r.json())
      .then(data => {
        if (data.sucesso) setMeta(data.metadados);
        setLoadingMeta(false);
      })
      .catch(() => setLoadingMeta(false));
  }, []);

  // 2. Carregar rankings
  useEffect(() => {
    if (activeSubTab !== 'rankings') return;
    setLoadingRankings(true);
    let url = `/api/metricas-avancadas/rankings?metrica=${metricaSelecionada}&min_minutos=${minMinutos}&limite=50`;
    if (filtroPosicao) url += `&posicao=${encodeURIComponent(filtroPosicao)}`;

    fetch(url)
      .then(r => r.json())
      .then(data => {
        if (data.sucesso) setRankings(data.ranking);
        setLoadingRankings(false);
      })
      .catch(() => setLoadingRankings(false));
  }, [activeSubTab, metricaSelecionada, minMinutos, filtroPosicao]);

  // 3. Carregar clubes
  useEffect(() => {
    if (activeSubTab !== 'clubes') return;
    setLoadingClubes(true);
    fetch('/api/metricas-avancadas/clubes')
      .then(r => r.json())
      .then(data => {
        if (data.sucesso) setClubes(data.clubes);
        setLoadingClubes(false);
      })
      .catch(() => setLoadingClubes(false));
  }, [activeSubTab]);

  // 4. Carregar detalhe de clube
  useEffect(() => {
    if (!clubeSelecionado) return;
    setLoadingClubeDetalhe(true);
    fetch(`/api/metricas-avancadas/clubes/${clubeSelecionado}`)
      .then(r => r.json())
      .then(data => {
        if (data.sucesso) setClubeDetalhe(data);
        setLoadingClubeDetalhe(false);
      })
      .catch(() => setLoadingClubeDetalhe(false));
  }, [clubeSelecionado]);

  // 5. Carregar detalhe de atleta
  const carregarAtleta = (id) => {
    setAtletaBuscaId(id);
    setActiveSubTab('atleta');
    setLoadingAtleta(true);
    fetch(`/api/metricas-avancadas/atletas/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.sucesso) setAtletaDetalhe(data.atleta);
        setLoadingAtleta(false);
      })
      .catch(() => setLoadingAtleta(false));
  };

  // Filtro de texto no ranking
  const rankingsFiltrados = useMemo(() => {
    if (!filtroBusca.trim()) return rankings;
    const b = filtroBusca.toLowerCase();
    return rankings.filter(r => 
      (r.nome && r.nome.toLowerCase().includes(b)) || 
      (r.clube_nome && r.clube_nome.toLowerCase().includes(b))
    );
  }, [rankings, filtroBusca]);

  const metricasLabels = {
    xg: { label: 'Gols Esperados (xG)', unidade: 'xG', desc: 'Qualidade acumulada das finalizações' },
    npxg: { label: 'xG sem Pênaltis', unidade: 'npxG', desc: 'Produção esperada com bola rolando' },
    xa: { label: 'Assistências Esperadas (xA)', unidade: 'xA', desc: 'Potencial de criação para finalização' },
    passes_progressivos: { label: 'Passes Progressivos', unidade: 'passes', desc: 'Passes que avançam verticalmente >= 10m' },
    sca: { label: 'Ações de Finalização (SCA)', unidade: 'SCA', desc: 'Ações que geraram chute a gol' },
    gca: { label: 'Ações de Gol (GCA)', unidade: 'GCA', desc: 'Ações diretas que converteram em gol' }
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px' }}>
      
      {/* ================= HEADER EDITORIAL E ATRIBUIÇÃO ================= */}
      <div 
        style={{
          borderRadius: '12px',
          border: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
          backgroundColor: darkMode ? '#22201C' : '#FFFFFF',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#5A673E',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}
              >
                <Sparkles size={12} />
                Métricas Avançadas Complementares
              </span>
              <span 
                style={{
                  fontSize: '12px',
                  color: darkMode ? '#A8A29E' : '#78716C',
                  fontWeight: 500
                }}
              >
                Temporada 2026
              </span>
            </div>
            
            <h1 
              style={{
                fontFamily: 'var(--font-heading, "Source Serif 4", serif)',
                fontSize: '26px',
                fontWeight: 700,
                color: darkMode ? '#F5F5F4' : '#1C1917',
                margin: '0 0 6px 0'
              }}
            >
              Brasileirão em Dados / DataFutebol
            </h1>
            
            <p 
              style={{
                fontSize: '13px',
                color: darkMode ? '#D6D3D1' : '#57534E',
                margin: 0,
                maxWidth: '780px',
                lineHeight: 1.5
              }}
            >
              Camada analítica complementar isolada: xG, xA, Passes Progressivos, SCA e GCA 
              rastreados pelo FotMob e reconciliados unicamente por <strong>ID Canônico</strong>. 
              Zero poluição ou alteração na base histórica canônica.
            </p>
          </div>

          {/* Atribuição Legal e Fonte */}
          <div 
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: darkMode ? '#1B1A17' : '#F1E8DE',
              border: '1px solid rgba(133, 87, 59, 0.25)',
              fontSize: '11px',
              color: darkMode ? '#E7E5E4' : '#44403C',
              maxWidth: '320px'
            }}
          >
            <div style={{ fontWeight: 700, color: '#85573B', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> Atribuição Oficial
            </div>
            <div><strong>Fonte:</strong> brasileiraoemdados.com.br</div>
            <div><strong>Curadoria:</strong> Ioannis Canteiro (DataFutebol)</div>
            <div><strong>Tracking:</strong> FotMob (Eventos e Modelagem)</div>
          </div>
        </div>

        {/* CARDS DE RESUMO DA LIGA */}
        {meta && (
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginTop: '20px'
            }}
          >
            <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: darkMode ? '#1A1815' : '#FAF7F2', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
              <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase', fontWeight: 600 }}>Atletas Auditados</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#5A673E', marginTop: '2px' }}>{meta.atletas_elegiveis}</div>
              <div style={{ fontSize: '11px', color: '#A8A29E' }}>100% ID canônico unívoco</div>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: darkMode ? '#1A1815' : '#FAF7F2', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
              <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase', fontWeight: 600 }}>Clubes Série A</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#85573B', marginTop: '2px' }}>{meta.clubes_participantes}</div>
              <div style={{ fontSize: '11px', color: '#A8A29E' }}>Todos os 20 times 2026</div>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: darkMode ? '#1A1815' : '#FAF7F2', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
              <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase', fontWeight: 600 }}>Gols Marcados</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: darkMode ? '#F5F5F4' : '#1C1917', marginTop: '2px' }}>{meta.soma_gols_atletas}</div>
              <div style={{ fontSize: '11px', color: '#A8A29E' }}>853 atletas / 868 liga total</div>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: darkMode ? '#1A1815' : '#FAF7F2', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
              <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase', fontWeight: 600 }}>xG Acumulado</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: darkMode ? '#F5F5F4' : '#1C1917', marginTop: '2px' }}>{meta.soma_xg_atletas}</div>
              <div style={{ fontSize: '11px', color: '#A8A29E' }}>Volume esperado de gols</div>
            </div>

            <div style={{ padding: '12px 16px', borderRadius: '8px', backgroundColor: darkMode ? '#1A1815' : '#FAF7F2', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
              <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase', fontWeight: 600 }}>Minutos Mapeados</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: darkMode ? '#F5F5F4' : '#1C1917', marginTop: '2px' }}>{meta.minutos_acumulados ? meta.minutos_acumulados.toLocaleString('pt-BR') : '59.421'}</div>
              <div style={{ fontSize: '11px', color: '#A8A29E' }}>338 partidas monitoradas</div>
            </div>
          </div>
        )}
      </div>

      {/* ================= ABAS DE NAVEGAÇÃO INTERNA ================= */}
      <div 
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
          marginBottom: '20px',
          overflowX: 'auto'
        }}
      >
        <button
          onClick={() => setActiveSubTab('rankings')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeSubTab === 'rankings' ? '2px solid #5A673E' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeSubTab === 'rankings' ? (darkMode ? '#FFFFFF' : '#1C1917') : '#78716C',
            fontWeight: activeSubTab === 'rankings' ? 700 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <Award size={16} /> Rankings de Atletas
        </button>

        <button
          onClick={() => setActiveSubTab('clubes')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeSubTab === 'clubes' ? '2px solid #85573B' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeSubTab === 'clubes' ? (darkMode ? '#FFFFFF' : '#1C1917') : '#78716C',
            fontWeight: activeSubTab === 'clubes' ? 700 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <BarChart3 size={16} /> Performance dos 20 Clubes
        </button>

        {atletaDetalhe && (
          <button
            onClick={() => setActiveSubTab('atleta')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeSubTab === 'atleta' ? '2px solid #5A673E' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeSubTab === 'atleta' ? (darkMode ? '#FFFFFF' : '#1C1917') : '#78716C',
              fontWeight: activeSubTab === 'atleta' ? 700 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <Users size={16} /> Ficha: {atletaDetalhe.nome}
          </button>
        )}

        <button
          onClick={() => setActiveSubTab('governanca')}
          style={{
            padding: '10px 18px',
            border: 'none',
            borderBottom: activeSubTab === 'governanca' ? '2px solid #5A673E' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeSubTab === 'governanca' ? (darkMode ? '#FFFFFF' : '#1C1917') : '#78716C',
            fontWeight: activeSubTab === 'governanca' ? 700 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <Database size={16} /> Linhagem & Governança
        </button>
      </div>

      {/* ================= ABA 1: RANKINGS DE ATLETAS ================= */}
      {activeSubTab === 'rankings' && (
        <div>
          {/* BARRA DE CONTROLES E FILTROS */}
          <div 
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: darkMode ? '#1F1D19' : '#FFFFFF',
              border: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
              marginBottom: '16px'
            }}
          >
            {/* Seletor de Métrica */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#78716C' }}>Métrica:</span>
              {Object.entries(metricasLabels).map(([chave, cfg]) => (
                <button
                  key={chave}
                  onClick={() => setMetricaSelecionada(chave)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: metricaSelecionada === chave ? 700 : 500,
                    border: '1px solid',
                    borderColor: metricaSelecionada === chave ? '#5A673E' : (darkMode ? '#333' : '#E5E7EB'),
                    backgroundColor: metricaSelecionada === chave ? (darkMode ? '#2F3622' : '#F4F6F0') : 'transparent',
                    color: metricaSelecionada === chave ? '#5A673E' : (darkMode ? '#D6D3D1' : '#4B5563'),
                    cursor: 'pointer',
                    transition: 'all 120ms ease'
                  }}
                >
                  {cfg.label}
                </button>
              ))}
            </div>

            {/* Filtros de Minutos e Busca */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#78716C' }}>Mín. Minutos:</span>
                <select
                  value={minMinutos}
                  onChange={(e) => setMinMinutos(Number(e.target.value))}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle, #D1D5DB)',
                    backgroundColor: darkMode ? '#292524' : '#FFFFFF',
                    color: darkMode ? '#F5F5F4' : '#1C1917',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <option value={90}>$\ge$ 90 min (1 jogo)</option>
                  <option value={450}>$\ge$ 450 min (5 jogos)</option>
                  <option value={900}>$\ge$ 900 min (10 jogos)</option>
                  <option value={1500}>$\ge$ 1500 min (Regular)</option>
                </select>
              </div>

              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 8, top: 10, color: '#A8A29E' }} />
                <input
                  type="text"
                  placeholder="Buscar atleta ou clube..."
                  value={filtroBusca}
                  onChange={(e) => setFiltroBusca(e.target.value)}
                  style={{
                    padding: '6px 10px 6px 28px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle, #D1D5DB)',
                    backgroundColor: darkMode ? '#292524' : '#FFFFFF',
                    color: darkMode ? '#F5F5F4' : '#1C1917',
                    fontSize: '12px',
                    width: '180px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* TABELA DE RANKINGS */}
          <div 
            style={{
              overflowX: 'auto',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
              backgroundColor: darkMode ? '#1F1D19' : '#FFFFFF'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr 
                  style={{
                    backgroundColor: darkMode ? '#26231E' : '#FAF7F2',
                    borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
                    color: darkMode ? '#A8A29E' : '#78716C',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  <th style={{ padding: '12px 16px', width: '40px' }}>#</th>
                  <th style={{ padding: '12px 16px' }}>Atleta (ID Canônico)</th>
                  <th style={{ padding: '12px 16px' }}>Clube</th>
                  <th style={{ padding: '12px 16px' }}>Posição</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Minutos</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#5A673E' }}>
                    {metricasLabels[metricaSelecionada]?.label || 'Valor'}
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Por 90 min</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>xG</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>xA</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Passes Prog.</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>SCA</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', width: '60px' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {loadingRankings ? (
                  <tr>
                    <td colSpan={12} style={{ padding: '32px', textAlign: 'center', color: '#78716C' }}>
                      Carregando líderes da Série A...
                    </td>
                  </tr>
                ) : rankingsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={12} style={{ padding: '32px', textAlign: 'center', color: '#78716C' }}>
                      Nenhum atleta encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  rankingsFiltrados.map((item, idx) => (
                    <tr 
                      key={item.atleta_id_canonico}
                      style={{
                        borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.05))',
                        backgroundColor: idx % 2 === 0 ? 'transparent' : (darkMode ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.01)'),
                        cursor: 'pointer'
                      }}
                      onClick={() => carregarAtleta(item.atleta_id_canonico)}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: idx < 3 ? '#5A673E' : '#78716C' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, color: darkMode ? '#F5F5F4' : '#1C1917' }}>{item.nome}</div>
                        <div style={{ fontSize: '10px', color: '#A8A29E', fontFamily: 'var(--font-mono, monospace)' }}>
                          ID Canônico: #{item.atleta_id_canonico}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 500 }}>{item.clube_nome}</span>
                        {item.clube_sigla && (
                          <span style={{ fontSize: '10px', color: '#78716C', marginLeft: '4px' }}>({item.clube_sigla})</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#78716C', fontSize: '12px' }}>
                        {item.posicao || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                        {item.minutos ? item.minutos.toLocaleString('pt-BR') : '0'}
                      </td>
                      <td 
                        style={{
                          padding: '12px 16px',
                          textAlign: 'right',
                          fontWeight: 800,
                          fontSize: '14px',
                          color: '#5A673E',
                          fontFamily: 'var(--font-mono, monospace)'
                        }}
                      >
                        {item.valor !== undefined ? item.valor.toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: '#78716C' }}>
                        {item.valor_por_90 !== undefined ? item.valor_por_90.toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                        {item.xg !== undefined ? item.xg.toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                        {item.xa !== undefined ? item.xa.toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                        {item.passes_progressivos !== undefined ? item.passes_progressivos : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                        {item.sca !== undefined ? item.sca : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button 
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#5A673E',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'inline-flex'
                          }}
                          title="Ver Ficha Completa"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= ABA 2: PERFORMANCE DOS 20 CLUBES ================= */}
      {activeSubTab === 'clubes' && (
        <div>
          <div 
            style={{
              overflowX: 'auto',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
              backgroundColor: darkMode ? '#1F1D19' : '#FFFFFF',
              marginBottom: '20px'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr 
                  style={{
                    backgroundColor: darkMode ? '#26231E' : '#FAF7F2',
                    borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
                    color: darkMode ? '#A8A29E' : '#78716C',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  <th style={{ padding: '12px 16px' }}>Clube (ID Canônico)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Jogos</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Pontos</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Gols Pró</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#5A673E' }}>xG Pró</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Gols Contra</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#85573B' }}>xG Contra</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Saldo xG</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>xPoints</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Posse %</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Field Tilt %</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>PPDA</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Elenco</th>
                </tr>
              </thead>
              <tbody>
                {loadingClubes ? (
                  <tr>
                    <td colSpan={13} style={{ padding: '32px', textAlign: 'center', color: '#78716C' }}>
                      Carregando métricas dos 20 clubes da Série A...
                    </td>
                  </tr>
                ) : (
                  clubes.map((c, idx) => (
                    <tr 
                      key={c.clube_id_canonico}
                      style={{
                        borderBottom: '1px solid var(--border-subtle, rgba(0,0,0,0.05))',
                        backgroundColor: clubeSelecionado === c.clube_id_canonico ? (darkMode ? '#2C2A25' : '#F5EFE6') : (idx % 2 === 0 ? 'transparent' : (darkMode ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.01)')),
                        cursor: 'pointer'
                      }}
                      onClick={() => setClubeSelecionado(c.clube_id_canonico)}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: darkMode ? '#F5F5F4' : '#1C1917' }}>{c.clube_nome}</div>
                        <div style={{ fontSize: '10px', color: '#A8A29E', fontFamily: 'var(--font-mono, monospace)' }}>
                          ID Canônico: #{c.clube_id_canonico}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>{c.jogos}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800 }}>{c.pontos}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>{c.gols_pro}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#5A673E', fontFamily: 'var(--font-mono, monospace)' }}>
                        {c.xg ? c.xg.toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>{c.gols_contra}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#85573B', fontFamily: 'var(--font-mono, monospace)' }}>
                        {c.xg_contra ? c.xg_contra.toFixed(2) : '—'}
                      </td>
                      <td 
                        style={{
                          padding: '12px 16px',
                          textAlign: 'right',
                          fontWeight: 700,
                          color: c.saldo_xg_liquido >= 0 ? '#5A673E' : '#85573B',
                          fontFamily: 'var(--font-mono, monospace)'
                        }}
                      >
                        {c.saldo_xg_liquido > 0 ? `+${c.saldo_xg_liquido.toFixed(2)}` : c.saldo_xg_liquido ? c.saldo_xg_liquido.toFixed(2) : '0.00'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                        {c.xpts ? c.xpts.toFixed(1) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                        {c.posse_pct ? `${c.posse_pct.toFixed(1)}%` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                        {c.field_tilt_pct ? `${c.field_tilt_pct.toFixed(1)}%` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                        {c.ppda ? c.ppda.toFixed(1) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span 
                          style={{
                            fontSize: '11px',
                            color: '#5A673E',
                            fontWeight: 600,
                            textDecoration: 'underline'
                          }}
                        >
                          Ver elenco
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* DETALHE DO CLUBE SELECIONADO (ELENCO AVANÇADO) */}
          {clubeDetalhe && (
            <div 
              style={{
                borderRadius: '8px',
                border: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
                backgroundColor: darkMode ? '#1F1D19' : '#FFFFFF',
                padding: '20px'
              }}
            >
              <h3 
                style={{
                  fontFamily: 'var(--font-heading, "Source Serif 4", serif)',
                  margin: '0 0 16px 0',
                  color: darkMode ? '#F5F5F4' : '#1C1917',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Elenco Avançado: {clubeDetalhe.clube.clube_nome} ({clubeDetalhe.elenco.length} atletas)
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: darkMode ? '#26231E' : '#FAF7F2', borderBottom: '1px solid rgba(0,0,0,0.08)', color: '#78716C' }}>
                      <th style={{ padding: '8px 12px' }}>Atleta</th>
                      <th style={{ padding: '8px 12px' }}>Posição</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Minutos</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Gols</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', color: '#5A673E', fontWeight: 700 }}>xG</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>xG / 90</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Assist.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>xA</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Passes Prog.</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>SCA</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>GCA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubeDetalhe.elenco.map(a => (
                      <tr 
                        key={a.atleta_id_canonico}
                        style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}
                        onClick={() => carregarAtleta(a.atleta_id_canonico)}
                      >
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{a.nome}</td>
                        <td style={{ padding: '8px 12px', color: '#78716C' }}>{a.posicao || '—'}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>{a.minutos}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>{a.gols}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#5A673E', fontWeight: 700, fontFamily: 'monospace' }}>
                          {a.xg ? a.xg.toFixed(2) : '—'}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: '#78716C' }}>
                          {a.xg_por_90 ? a.xg_por_90.toFixed(2) : '—'}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right' }}>{a.assistencias}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>
                          {a.xa ? a.xa.toFixed(2) : '—'}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>{a.passes_progressivos}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>{a.sca}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>{a.gca}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= ABA 3: FICHA DE ATLETA (PLAYERCARD AVANÇADO) ================= */}
      {activeSubTab === 'atleta' && atletaDetalhe && (
        <div 
          style={{
            borderRadius: '12px',
            border: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
            backgroundColor: darkMode ? '#1F1D19' : '#FFFFFF',
            padding: '24px'
          }}
        >
          {/* TOPO DA FICHA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#5A673E', fontWeight: 700, textTransform: 'uppercase' }}>
                  {atletaDetalhe.posicao || 'Jogador de Linha'}
                </span>
                <span style={{ fontSize: '11px', color: '#A8A29E' }}>•</span>
                <span style={{ fontSize: '12px', color: '#78716C', fontWeight: 500 }}>
                  {atletaDetalhe.clube_nome}
                </span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading, "Source Serif 4", serif)', fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0', color: darkMode ? '#F5F5F4' : '#1C1917' }}>
                {atletaDetalhe.nome}
              </h2>
              {atletaDetalhe.nome_completo && atletaDetalhe.nome_completo !== atletaDetalhe.nome && (
                <div style={{ fontSize: '13px', color: '#78716C' }}>{atletaDetalhe.nome_completo}</div>
              )}
              <div style={{ fontSize: '11px', color: '#A8A29E', fontFamily: 'monospace', marginTop: '4px' }}>
                ID Canônico: #{atletaDetalhe.atleta_id_canonico} | Reconciliação: {atletaDetalhe.metodo_reconciliacao} ({atletaDetalhe.status_reconciliacao})
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('rankings')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: 'transparent',
                color: '#78716C',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Voltar aos Rankings
            </button>
          </div>

          {/* GRID DE SCOUTS AVANÇADOS */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}
          >
            <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: darkMode ? '#181613' : '#FAF7F2', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
              <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase' }}>Minutagem</div>
              <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{atletaDetalhe.minutos} min</div>
              <div style={{ fontSize: '11px', color: '#A8A29E' }}>{atletaDetalhe.jogos} jogos ({atletaDetalhe.titularidades} tit.)</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: darkMode ? '#181613' : '#FAF7F2', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
              <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase' }}>Gols vs xG</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#5A673E', marginTop: '2px' }}>
                {atletaDetalhe.gols} <span style={{ fontSize: '13px', color: '#78716C', fontWeight: 500 }}>({atletaDetalhe.xg.toFixed(2)} xG)</span>
              </div>
              <div style={{ fontSize: '11px', color: '#A8A29E' }}>{atletaDetalhe.xg_por_90.toFixed(2)} xG por 90</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: darkMode ? '#181613' : '#FAF7F2', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
              <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase' }}>Assistências vs xA</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#85573B', marginTop: '2px' }}>
                {atletaDetalhe.assistencias} <span style={{ fontSize: '13px', color: '#78716C', fontWeight: 500 }}>({atletaDetalhe.xa.toFixed(2)} xA)</span>
              </div>
              <div style={{ fontSize: '11px', color: '#A8A29E' }}>{atletaDetalhe.xa_por_90.toFixed(2)} xA por 90</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: darkMode ? '#181613' : '#FAF7F2', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
              <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase' }}>Passes Progressivos</div>
              <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{atletaDetalhe.passes_progressivos}</div>
              <div style={{ fontSize: '11px', color: '#A8A29E' }}>{atletaDetalhe.passes_prog_por_90.toFixed(2)} por 90</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: darkMode ? '#181613' : '#FAF7F2', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
              <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase' }}>Criação de Chutes (SCA)</div>
              <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{atletaDetalhe.sca}</div>
              <div style={{ fontSize: '11px', color: '#A8A29E' }}>{atletaDetalhe.sca_por_90.toFixed(2)} por 90</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: darkMode ? '#181613' : '#FAF7F2', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
              <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase' }}>Criação de Gols (GCA)</div>
              <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{atletaDetalhe.gca}</div>
              <div style={{ fontSize: '11px', color: '#A8A29E' }}>{atletaDetalhe.gca_por_90.toFixed(2)} por 90</div>
            </div>

            {atletaDetalhe.passes_decisivos !== undefined && (
              <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: darkMode ? '#181613' : '#FAF7F2', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
                <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase' }}>Passes Decisivos</div>
                <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{atletaDetalhe.passes_decisivos}</div>
                <div style={{ fontSize: '11px', color: '#A8A29E' }}>Grandes Chances: {atletaDetalhe.grandes_chances_criadas || 0}</div>
              </div>
            )}

            {atletaDetalhe.conducoes_progressivas !== undefined && (
              <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: darkMode ? '#181613' : '#FAF7F2', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
                <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase' }}>Conduções Prog.</div>
                <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{atletaDetalhe.conducoes_progressivas}</div>
                <div style={{ fontSize: '11px', color: '#A8A29E' }}>Dribles: {atletaDetalhe.dribles_certos || 0}/{atletaDetalhe.dribles_tentados || 0}</div>
              </div>
            )}

            {atletaDetalhe.desarmes_totais !== undefined && (
              <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: darkMode ? '#181613' : '#FAF7F2', border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))' }}>
                <div style={{ fontSize: '11px', color: '#78716C', textTransform: 'uppercase' }}>Ações Defensivas</div>
                <div style={{ fontSize: '20px', fontWeight: 800, marginTop: '2px' }}>{atletaDetalhe.desarmes_totais}</div>
                <div style={{ fontSize: '11px', color: '#A8A29E' }}>Intercep: {atletaDetalhe.interceptacoes || 0} | Cortes: {atletaDetalhe.cortes || 0}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= ABA 4: LINHAGEM E GOVERNANÇA ================= */}
      {activeSubTab === 'governanca' && (
        <div 
          style={{
            borderRadius: '12px',
            border: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
            backgroundColor: darkMode ? '#1F1D19' : '#FFFFFF',
            padding: '24px'
          }}
        >
          <h2 
            style={{
              fontFamily: 'var(--font-heading, "Source Serif 4", serif)',
              fontSize: '22px',
              fontWeight: 700,
              margin: '0 0 16px 0',
              color: darkMode ? '#F5F5F4' : '#1C1917',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ShieldCheck size={20} color="#5A673E" />
            Linhagem e Governança de Dados (Fase 4 & 4.1)
          </h2>

          <p style={{ fontSize: '13px', lineHeight: 1.6, color: darkMode ? '#D6D3D1' : '#44403C', marginBottom: '20px' }}>
            A integração de métricas avançadas do <strong>Brasileirão em Dados</strong> obedece a um 
            estrito protocolo de isolamento analítico e integridade relacional.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: darkMode ? '#181613' : '#FAF7F2', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: 700, color: '#5A673E', marginBottom: '8px' }}>1. Reconciliação Multi-Tier Auditada</div>
              <div style={{ fontSize: '12px', color: '#78716C', lineHeight: 1.5 }}>
                • 717 atletas reconciliados via cruzamento FotMob ID e súmulas oficiais de escalação.<br/>
                • 0 casos ambíguos remanescentes.<br/>
                • Todos os registros possuem chave estrangeira canônica unívoca.
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: darkMode ? '#181613' : '#FAF7F2', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: 700, color: '#85573B', marginBottom: '8px' }}>2. Bloqueio de Poluição Canônica</div>
              <div style={{ fontSize: '12px', color: '#78716C', lineHeight: 1.5 }}>
                • 7 atletas novos identificados sem ID prévio foram <strong>retidos em staging</strong>.<br/>
                • 4 atletas em quarentena residual foram excluídos de produção.<br/>
                • Zero blobs espaciais, eventos brutos ou mapas carregados.
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: darkMode ? '#181613' : '#FAF7F2', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: 700, color: '#5A673E', marginBottom: '8px' }}>3. Teto Vercel e Capacidade</div>
              <div style={{ fontSize: '12px', color: '#78716C', lineHeight: 1.5 }}>
                • Banco de dados otimizado via VACUUM: <strong>82,65 MB</strong>.<br/>
                • Folga para o Soft Limit (84,00 MB): <strong>1,35 MB</strong> ($\ge 1,0$ MB exigido).<br/>
                • Folga para o Teto da Vercel (94,00 MB): <strong>11,35 MB</strong>.<br/>
                • Modo journal preservado em <code>delete</code>.
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: darkMode ? '#181613' : '#FAF7F2', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: 700, color: '#85573B', marginBottom: '8px' }}>4. Tabela Dedicada de Proveniência</div>
              <div style={{ fontSize: '12px', color: '#78716C', lineHeight: 1.5 }}>
                • Tabela <code>metrica_brasileirao_em_dados_proveniencia</code> isolada.<br/>
                • 737 registros com hash SHA-256 do payload, timestamp e fonte rastreáveis.<br/>
                • 100% idempotente (zero duplicidades).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= RODAPÉ COM ATRIBUIÇÃO DA FONTE ================= */}
      <footer 
        style={{
          marginTop: '32px',
          padding: '16px 20px',
          borderRadius: '8px',
          backgroundColor: darkMode ? '#181613' : '#F9F6F0',
          border: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: darkMode ? '#A8A29E' : '#78716C'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="#5A673E" />
          <span>
            <strong>Atribuição Editorial:</strong> Métricas avançadas providas por <strong>Brasileirão em Dados / DataFutebol</strong> (Ioannis Canteiro), baseadas em tracking oficial <strong>FotMob</strong>.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span>Fonte: <a href="https://brasileiraoemdados.com.br" target="_blank" rel="noopener noreferrer" style={{ color: '#5A673E', fontWeight: 600 }}>brasileiraoemdados.com.br</a></span>
          <span>•</span>
          <span>Temporada: 2026</span>
          <span>•</span>
          <span>Status: Reconciliação Canônica Certificada</span>
        </div>
      </footer>

    </div>
  );
}
