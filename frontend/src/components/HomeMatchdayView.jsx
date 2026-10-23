import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Swords,
  Calendar,
  Flame,
  Shield,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  Sparkles,
  History,
  BarChart3,
  Clock,
  Target,
  Filter,
  Search,
  Award,
  Activity,
  RefreshCw,
  Zap,
  ChevronLeft,
  ChevronDown
} from 'lucide-react';

// ============================================================================
// CONFIGURAÇÕES VISUAIS & IDENTIDADE DOS CLUBES BRASILEIROS
// ============================================================================
const CLUB_IDENTITIES = {
  'Flamengo': { sigla: 'FLA', cor1: '#C62828', cor2: '#111111', text: '#FFFFFF' },
  'Palmeiras': { sigla: 'PAL', cor1: '#006437', cor2: '#0B3B24', text: '#FFFFFF' },
  'Corinthians': { sigla: 'COR', cor1: '#111111', cor2: '#FFFFFF', text: '#FFFFFF' },
  'São Paulo': { sigla: 'SAO', cor1: '#BA0C2F', cor2: '#111111', text: '#FFFFFF' },
  'Santos': { sigla: 'SAN', cor1: '#FFFFFF', cor2: '#111111', text: '#111111' },
  'Grêmio': { sigla: 'GRE', cor1: '#0D82CA', cor2: '#111111', text: '#FFFFFF' },
  'Internacional': { sigla: 'INT', cor1: '#E50914', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Vasco': { sigla: 'VAS', cor1: '#111111', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Fluminense': { sigla: 'FLU', cor1: '#800020', cor2: '#006437', text: '#FFFFFF' },
  'Botafogo': { sigla: 'BOT', cor1: '#111111', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Cruzeiro': { sigla: 'CRU', cor1: '#005CA9', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Atlético-MG': { sigla: 'CAM', cor1: '#111111', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Atlético': { sigla: 'CAM', cor1: '#111111', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Bahia': { sigla: 'BAH', cor1: '#0072CE', cor2: '#E50914', text: '#FFFFFF' },
  'Vitória': { sigla: 'VIT', cor1: '#E50914', cor2: '#111111', text: '#FFFFFF' },
  'Athletico-PR': { sigla: 'CAP', cor1: '#C8102E', cor2: '#111111', text: '#FFFFFF' },
  'Athletico': { sigla: 'CAP', cor1: '#C8102E', cor2: '#111111', text: '#FFFFFF' },
  'Coritiba': { sigla: 'CFC', cor1: '#005030', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Fortaleza': { sigla: 'FOR', cor1: '#15325E', cor2: '#C8102E', text: '#FFFFFF' },
  'Ceará': { sigla: 'CSC', cor1: '#111111', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Sport': { sigla: 'SPT', cor1: '#C8102E', cor2: '#111111', text: '#FFFFFF' },
  'Goiás': { sigla: 'GOI', cor1: '#005030', cor2: '#FFFFFF', text: '#FFFFFF' },
  'América Mineiro': { sigla: 'AME', cor1: '#006437', cor2: '#111111', text: '#FFFFFF' },
  'Cuiabá': { sigla: 'CUI', cor1: '#006437', cor2: '#F59E0B', text: '#FFFFFF' },
  'Criciúma': { sigla: 'CRI', cor1: '#F59E0B', cor2: '#111111', text: '#111111' },
  'Bragantino': { sigla: 'RBB', cor1: '#E50914', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Red Bull Bragantino': { sigla: 'RBB', cor1: '#E50914', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Juventude': { sigla: 'JUV', cor1: '#006437', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Náutico': { sigla: 'NAU', cor1: '#E50914', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Londrina': { sigla: 'LEC', cor1: '#0D82CA', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Avaí': { sigla: 'AVA', cor1: '#0D82CA', cor2: '#FFFFFF', text: '#FFFFFF' }
};

// Renderizador visual de escudo/insígnia do clube em SVG
const ClubShield = ({ name, size = 38 }) => {
  const norm = Object.keys(CLUB_IDENTITIES).find(k => k.toLowerCase() === (name || '').toLowerCase());
  const cfg = norm ? CLUB_IDENTITIES[norm] : {
    sigla: (name || 'CLB').substring(0, 3).toUpperCase(),
    cor1: '#1E293B',
    cor2: '#334155',
    text: '#FFFFFF'
  };

  const id = `shd-${(name || 'team').replace(/[^a-zA-Z0-9]/g, '')}-${size}`;

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.4))'
      }}
      title={name}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.cor1} />
            <stop offset="100%" stopColor={cfg.cor2} />
          </linearGradient>
        </defs>
        {/* Formato clássico de escudo heráldico */}
        <path
          d="M 50,4 C 74,4 94,14 94,36 C 94,68 62,88 50,96 C 38,88 6,68 6,36 C 6,14 26,4 50,4 Z"
          fill={`url(#${id})`}
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="3.5"
        />
        {/* Monograma ou Sigla central */}
        <text
          x="50"
          y="56"
          fill={cfg.text}
          fontSize="24"
          fontWeight="800"
          fontFamily="Inter, system-ui, sans-serif"
          textAnchor="middle"
          letterSpacing="-0.04em"
        >
          {cfg.sigla}
        </text>
      </svg>
    </div>
  );
};

// Badges de Torneio coloridos
const getTournamentBadge = (camp) => {
  const c = (camp || '').toLowerCase();
  if (c.includes('libertadores')) {
    return { label: 'Libertadores', bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', text: '#FBBF24' };
  }
  if (c.includes('copa do brasil')) {
    return { label: 'Copa do Brasil', bg: 'rgba(255, 19, 177, 0.15)', border: '#FF13B1', text: '#FF4BC4' };
  }
  if (c.includes('sul-americana') || c.includes('conmebol')) {
    return { label: 'Sul-Americana', bg: 'rgba(0, 240, 255, 0.15)', border: '#00F0FF', text: '#38BDF8' };
  }
  if (c.includes('série b')) {
    return { label: 'Série B', bg: 'rgba(139, 92, 246, 0.15)', border: '#8B5CF6', text: '#A78BFA' };
  }
  if (c.includes('paulista') || c.includes('carioca') || c.includes('gaúcho') || c.includes('mineiro')) {
    return { label: 'Estadual', bg: 'rgba(156, 163, 175, 0.15)', border: '#6B7280', text: '#D1D5DB' };
  }
  return { label: 'Brasileirão', bg: 'rgba(199, 255, 0, 0.15)', border: '#C7FF00', text: '#C7FF00' };
};

export default function HomeMatchdayView({
  currentUser,
  overview,
  onNavigateTab,
  onSelectH2H,
  onSelectJogador,
  onRunOraculo,
  onLogout,
  apiFetch
}) {
  // Estado principal do Cockpit
  const [cockpitData, setCockpitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [filterRegion, setFilterRegion] = useState('Todos');
  const [rankingTab, setRankingTab] = useState('pontos'); // 'pontos' | 'vitorias' | 'aproveitamento' | 'gp'
  const [rankingMode, setRankingMode] = useState('ponderado'); // 'ponderado' (Pesos de Títulos/Campanhas) | 'campo' (Desempenho Real)
  const [rankingSearch, setRankingSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Carregar dados da Home Matchday Cockpit
  const carregarCockpit = async (dataQuery = '') => {
    try {
      setIsRefreshing(true);
      const url = dataQuery ? `/api/home/cockpit?date=${dataQuery}` : '/api/home/cockpit';
      let res;
      if (apiFetch) {
        res = await apiFetch(url);
      } else {
        const token = localStorage.getItem('futstats_auth_token');
        res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
      }
      if (res.ok) {
        const json = await res.json();
        setCockpitData(json);
        if (!selectedDate && json.data_selecionada) {
          setSelectedDate(json.data_selecionada);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados do Cockpit:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    carregarCockpit(selectedDate);
  }, [selectedDate]);

  // Lista de Tabus e Destaques filtrada por região
  const tabusFiltrados = useMemo(() => {
    if (!cockpitData?.tabus_destaques) return [];
    if (filterRegion === 'Todos') return cockpitData.tabus_destaques;
    return cockpitData.tabus_destaques.filter(t => t.regiao === filterRegion);
  }, [cockpitData, filterRegion]);

  // Ranking ordenado e filtrado (suporte dual: Ponderado de Títulos ou Desempenho de Campo)
  const rankingExibido = useMemo(() => {
    if (rankingMode === 'ponderado') {
      if (!cockpitData?.ranking_ponderado) return [];
      let list = [...cockpitData.ranking_ponderado];
      if (rankingSearch) {
        const q = rankingSearch.toLowerCase();
        list = list.filter(r => (r.clube || '').toLowerCase().includes(q));
      }
      return list;
    }

    if (!cockpitData?.ranking_historico) return [];
    let list = [...cockpitData.ranking_historico];

    if (rankingSearch) {
      const q = rankingSearch.toLowerCase();
      list = list.filter(r => (r.clube || '').toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      if (rankingTab === 'vitorias') return b.vitorias - a.vitorias;
      if (rankingTab === 'aproveitamento') return b.aproveitamento - a.aproveitamento;
      if (rankingTab === 'gp') return b.gp - a.gp;
      return b.pontos - a.pontos;
    });

    return list;
  }, [cockpitData, rankingMode, rankingTab, rankingSearch]);

  return (
    <div
      style={{
        backgroundColor: '#000000',
        color: '#FFFFFF',
        minHeight: '100vh',
        width: '100%',
        fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
        paddingBottom: '80px'
      }}
    >
      {/* ====================================================================
          1. TICKER HORIZONTAL DE JOGOS RECENTES / PRÓXIMOS (TOPO)
          ==================================================================== */}
      <section
        style={{
          borderBottom: '1px solid #222222',
          backgroundColor: 'rgba(12, 12, 12, 0.95)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          {/* Label fixo do Ticker */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              paddingRight: '12px',
              borderRight: '1px solid #2a2a2a',
              flexShrink: 0
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#C7FF00',
                boxShadow: '0 0 8px #C7FF00'
              }}
            />
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#8E8E93',
                textTransform: 'uppercase'
              }}
            >
              PARTIDAS
            </span>
          </div>

          {/* Carrossel / Faixa deslizante de jogos */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              padding: '2px 0'
            }}
          >
            {(cockpitData?.ticker_jogos || []).map((jogo) => {
              const badge = getTournamentBadge(jogo.campeonato);
              return (
                <div
                  key={jogo.id_partida}
                  onClick={() => onSelectH2H && onSelectH2H(jogo.mandante, jogo.visitante)}
                  style={{
                    backgroundColor: 'rgba(26, 26, 26, 0.65)',
                    border: '1px solid #343434',
                    borderRadius: '9999px',
                    padding: '4px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 180ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FF13B1';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 19, 177, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#343434';
                    e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.65)';
                  }}
                  title={`Confronto direto: ${jogo.mandante} x ${jogo.visitante}`}
                >
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: badge.bg,
                      color: badge.text,
                      border: `1px solid ${badge.border}40`,
                      borderRadius: '9999px',
                      padding: '1px 6px'
                    }}
                  >
                    {badge.label}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ClubShield name={jogo.mandante} size={18} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>
                      {jogo.mandante}
                    </span>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        color: jogo.finalizado ? '#C7FF00' : '#8E8E93',
                        padding: '0 3px'
                      }}
                    >
                      {jogo.placar}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>
                      {jogo.visitante}
                    </span>
                    <ClubShield name={jogo.visitante} size={18} />
                  </div>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: '#8E8E93',
                      borderLeft: '1px solid #333333',
                      paddingLeft: '8px'
                    }}
                  >
                    {jogo.data_formatada || jogo.data}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. COCKPIT HERO HEADER & CONTROLES INTELIGENTES
          ==================================================================== */}
      <section
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '28px 24px 20px 24px'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '20px',
            borderBottom: '1px solid #222222',
            paddingBottom: '20px'
          }}
        >
          {/* Título & Identidade Cyber-Editorial */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 19, 177, 0.1)',
                border: '1px solid rgba(255, 19, 177, 0.3)',
                marginBottom: '12px'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#FF13B1',
                  boxShadow: '0 0 6px #FF13B1'
                }}
              />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FF13B1', letterSpacing: '0.06em' }}>
                MATCHDAY COCKPIT • HISTÓRICO TOTAL DESDE 1902
              </span>
            </div>

            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                margin: '0 0 8px 0',
                color: '#FFFFFF'
              }}
            >
              A Memória e os Tabus do Futebol{' '}
              <span
                style={{
                  color: '#FF13B1',
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(255, 19, 177, 0.4)'
                }}
              >
                Brasileiro
              </span>
            </h1>

            <p style={{ fontSize: '0.94rem', color: '#8E8E93', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
              Painel analítico integrado: confrontos históricos, invencibilidades em clássicos,
              ranking acumulado de pontos e o que aconteceu neste mesmo dia através dos anos.
            </p>
          </div>

          {/* Controles de Data e Ações Rápidas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Seletor rápido de data para "Neste Dia" */}
            <div
              style={{
                backgroundColor: 'rgba(26, 26, 26, 0.7)',
                border: '1px solid #343434',
                borderRadius: '9999px',
                padding: '4px 6px 4px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Calendar size={15} color="#FF13B1" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#EAE5DA' }}>
                {cockpitData?.data_formatada || '23 de Outubro'}
              </span>
              <button
                onClick={() => {
                  const today = new Date().toISOString().slice(5, 10);
                  setSelectedDate(today);
                }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#FFFFFF',
                  borderRadius: '9999px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 150ms'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
              >
                Hoje
              </button>
              <button
                onClick={() => carregarCockpit(selectedDate)}
                style={{
                  backgroundColor: isRefreshing ? '#FF13B1' : 'transparent',
                  border: 'none',
                  color: '#8E8E93',
                  borderRadius: '9999px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title="Atualizar dados"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Botão de ação para Oráculo IA */}
            {onRunOraculo && (
              <button
                onClick={() => onRunOraculo('Quais são os maiores tabus ativos do futebol brasileiro hoje?')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '9999px',
                  padding: '9px 18px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 180ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#C7FF00';
                  e.currentTarget.style.color = '#C7FF00';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
              >
                <Sparkles size={15} color="#C7FF00" />
                Perguntar à IA
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. BENTO GRID PRINCIPAL
             Lado Esquerdo/Centro: Tabus H2H + Neste Dia na História
             Lado Direito: Ranking Histórico Acumulado
          ==================================================================== */}
      <main
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 390px',
          gap: '24px',
          alignItems: 'start'
        }}
        className="bento-container"
      >
        {/* ==================================================================
            COLUNA ESQUERDA / CENTRO: DESTAQUES H2H + NESTE DIA NA HISTÓRIA
            ================================================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* ----------------------------------------------------------------
              BLOCO A: TABUS E CONFRONTOS HISTÓRICOS (H2H)
              ---------------------------------------------------------------- */}
          <section>
            {/* Header da seção com filtros de região */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Swords size={20} color="#FF13B1" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                  Tabus e Confrontos Clássicos
                </h2>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#8E8E93',
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontWeight: 600
                  }}
                >
                  {tabusFiltrados.length} duelos
                </span>
              </div>

              {/* Filtros em pílulas */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Todos', 'São Paulo', 'Rio de Janeiro', 'Nacional'].map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setFilterRegion(reg)}
                    style={{
                      backgroundColor: filterRegion === reg ? '#FF13B1' : 'rgba(255, 255, 255, 0.06)',
                      color: filterRegion === reg ? '#FFFFFF' : '#8E8E93',
                      border: filterRegion === reg ? '1px solid #FF13B1' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '9999px',
                      padding: '4px 12px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 150ms ease'
                    }}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid de Cards de Destaque H2H */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                gap: '16px'
              }}
            >
              {tabusFiltrados.map((item, idx) => {
                // Cálculo das proporções na barra H2H
                const tot = item.total_jogos || 1;
                const pct1 = Math.round((item.vit_clube1 / tot) * 100);
                const pctEmp = Math.round((item.empates / tot) * 100);
                const pct2 = Math.round((item.vit_clube2 / tot) * 100);

                const isTabu = item.tag === 'Tabu Ativo';
                const isSupremacia = item.tag === 'Supremacia';

                return (
                  <div
                    key={`${item.clube1}-${item.clube2}-${idx}`}
                    style={{
                      backgroundColor: 'rgba(26, 26, 26, 0.65)',
                      border: isTabu ? '1px solid rgba(255, 19, 177, 0.4)' : '1px solid #343434',
                      borderRadius: '20px',
                      padding: '20px',
                      backdropFilter: 'blur(12px)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = isTabu ? '#FF13B1' : '#555555';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.45)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isTabu ? 'rgba(255, 19, 177, 0.4)' : '#343434';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Topo do Card: Apelido do Clássico e Badge de Categoria */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '14px'
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            color: '#8E8E93',
                            textTransform: 'uppercase'
                          }}
                        >
                          {item.apelido}
                        </span>

                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            backgroundColor: isTabu
                              ? 'rgba(255, 19, 177, 0.18)'
                              : isSupremacia
                              ? 'rgba(199, 255, 0, 0.15)'
                              : 'rgba(0, 240, 255, 0.15)',
                            color: isTabu ? '#FF13B1' : isSupremacia ? '#C7FF00' : '#00F0FF',
                            border: `1px solid ${isTabu ? '#FF13B1' : isSupremacia ? '#C7FF00' : '#00F0FF'}50`,
                            borderRadius: '9999px',
                            padding: '2px 8px'
                          }}
                        >
                          {item.tag}
                        </span>
                      </div>

                      {/* Confronto Visual Direto (Dois Clubes com Escudos Grandes) */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          padding: '8px 0 16px 0'
                        }}
                      >
                        {/* Clube 1 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <ClubShield name={item.clube1} size={42} />
                          <div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                              {item.clube1}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#8E8E93' }}>
                              <strong style={{ color: '#FFFFFF', fontSize: '0.85rem' }}>{item.vit_clube1}</strong> vitórias
                            </div>
                          </div>
                        </div>

                        {/* Placar de Empates Central */}
                        <div style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#666666',
                              textTransform: 'uppercase'
                            }}
                          >
                            EMPATES
                          </div>
                          <div
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: 800,
                              fontFamily: 'monospace',
                              color: '#8E8E93'
                            }}
                          >
                            {item.empates}
                          </div>
                        </div>

                        {/* Clube 2 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexDirection: 'row-reverse' }}>
                          <ClubShield name={item.clube2} size={42} />
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                              {item.clube2}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#8E8E93' }}>
                              <strong style={{ color: '#FFFFFF', fontSize: '0.85rem' }}>{item.vit_clube2}</strong> vitórias
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Barra de Proporção H2H (Estilo Cyber) */}
                      <div
                        style={{
                          width: '100%',
                          height: '6px',
                          borderRadius: '9999px',
                          overflow: 'hidden',
                          display: 'flex',
                          backgroundColor: '#222222',
                          margin: '6px 0 14px 0'
                        }}
                        title={`${item.clube1}: ${pct1}% | Empates: ${pctEmp}% | ${item.clube2}: ${pct2}%`}
                      >
                        <div style={{ width: `${pct1}%`, backgroundColor: '#FF13B1' }} />
                        <div style={{ width: `${pctEmp}%`, backgroundColor: '#444444' }} />
                        <div style={{ width: `${pct2}%`, backgroundColor: '#00F0FF' }} />
                      </div>

                      {/* Manchete Editorial Automática */}
                      <p
                        style={{
                          fontSize: '0.84rem',
                          color: '#E5E7EB',
                          lineHeight: 1.45,
                          margin: '0 0 12px 0',
                          fontWeight: 500
                        }}
                      >
                        {item.manchete}
                      </p>

                      {/* Último Confronto Realizado */}
                      {item.ultimo_jogo && (
                        <div
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid #282828',
                            borderRadius: '12px',
                            padding: '8px 12px',
                            fontSize: '0.74rem',
                            color: '#8E8E93',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '14px'
                          }}
                        >
                          <span>
                            Último duelo:{' '}
                            <strong style={{ color: '#FFFFFF' }}>
                              {item.ultimo_jogo.mandante} {item.ultimo_jogo.placar} {item.ultimo_jogo.visitante}
                            </strong>
                          </span>
                          <span style={{ color: '#666666' }}>{item.ultimo_jogo.campeonato}</span>
                        </div>
                      )}
                    </div>

                    {/* Botão de Ação CTA: Abrir Raio-X do Confronto */}
                    <button
                      onClick={() => onSelectH2H && onSelectH2H(item.clube1, item.clube2)}
                      style={{
                        backgroundColor: '#FF13B1',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '9999px',
                        padding: '9px 16px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                        transition: 'all 180ms ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FF4BC4';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FF13B1';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <span>Abrir Raio-X Histórico ({item.total_jogos} jogos)</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ----------------------------------------------------------------
              BLOCO B: NESTE DIA NA HISTÓRIA
              ---------------------------------------------------------------- */}
          <section
            style={{
              backgroundColor: 'rgba(18, 18, 18, 0.85)',
              border: '1px solid #343434',
              borderRadius: '24px',
              padding: '24px',
              backdropFilter: 'blur(16px)'
            }}
          >
            {/* Cabeçalho Editorial com Destaque de Data */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '20px',
                borderBottom: '1px solid #282828',
                paddingBottom: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <History size={20} color="#C7FF00" />
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                    Neste Dia na História
                  </h2>
                  <span
                    style={{
                      backgroundColor: 'rgba(199, 255, 0, 0.15)',
                      color: '#C7FF00',
                      border: '1px solid rgba(199, 255, 0, 0.3)',
                      borderRadius: '9999px',
                      padding: '2px 10px',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}
                  >
                    {cockpitData?.data_formatada || '23 de Outubro'}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#8E8E93', margin: 0 }}>
                  Clássicos inesquecíveis, decisões de títulos e maiores goleadas registradas nesta data.
                </p>
              </div>

              {/* Botão para abrir todos os jogos na aba de partidas */}
              <button
                onClick={() => onNavigateTab && onNavigateTab('playground')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '9999px',
                  padding: '6px 14px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Explorar Banco Completo</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Grid dos Jogos Marcantes neste dia */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '14px'
              }}
            >
              {(cockpitData?.neste_dia || []).map((m) => {
                const badge = getTournamentBadge(m.campeonato);
                return (
                  <div
                    key={m.id_partida}
                    onClick={() => onSelectH2H && onSelectH2H(m.mandante, m.visitante)}
                    style={{
                      backgroundColor: 'rgba(26, 26, 26, 0.7)',
                      border: '1px solid #333333',
                      borderRadius: '16px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 180ms ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#C7FF00';
                      e.currentTarget.style.backgroundColor = 'rgba(32, 32, 32, 0.9)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#333333';
                      e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.7)';
                    }}
                  >
                    <div>
                      {/* Topo do Card: Ano em Destaque e Torneio */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '10px'
                        }}
                      >
                        <span
                          style={{
                            fontSize: '1.1rem',
                            fontWeight: 900,
                            fontFamily: 'monospace',
                            color: '#FFFFFF',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '2px 8px'
                          }}
                        >
                          {m.ano}
                        </span>

                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}40`,
                            borderRadius: '9999px',
                            padding: '2px 8px'
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>

                      {/* Equipes e Placar Marcante */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ClubShield name={m.mandante} size={24} />
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                              {m.mandante}
                            </span>
                          </div>
                          <span style={{ fontSize: '1.05rem', fontWeight: 900, fontFamily: 'monospace', color: '#C7FF00' }}>
                            {m.gols_mandante}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ClubShield name={m.visitante} size={24} />
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                              {m.visitante}
                            </span>
                          </div>
                          <span style={{ fontSize: '1.05rem', fontWeight: 900, fontFamily: 'monospace', color: '#C7FF00' }}>
                            {m.gols_visitante}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rodapé do jogo com estádio ou fase */}
                    <div
                      style={{
                        borderTop: '1px solid #2a2a2a',
                        paddingTop: '8px',
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: '#8E8E93'
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                        {m.estadio || m.fase || 'Partida Histórica'}
                      </span>
                      <span style={{ color: '#FF13B1', fontWeight: 600 }}>Ver H2H →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ==================================================================
            COLUNA DIREITA: RANKING HISTÓRICO ACUMULADO
            ================================================================== */}
        <aside
          style={{
            backgroundColor: 'rgba(18, 18, 18, 0.9)',
            border: '1px solid #343434',
            borderRadius: '24px',
            padding: '22px',
            backdropFilter: 'blur(16px)',
            position: 'sticky',
            top: '64px'
          }}
        >
          {/* Cabeçalho do Ranking Histórico */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={20} color="#F59E0B" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                  Ranking Histórico
                </h2>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#F59E0B',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '9999px',
                  padding: '2px 8px'
                }}
              >
                Top 25
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#8E8E93', margin: '0 0 12px 0' }}>
              {rankingMode === 'ponderado' 
                ? 'Hegeomania histórica ponderada por títulos e campanhas (Mundial 280, Liberta 250, Brasileirão 170).' 
                : 'Acumulado geral de pontos e aproveitamento em jogos oficiais desde 1902.'}
            </p>

            {/* Alternador de Modo: Ponderado (Títulos) vs Campo (Jogos) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '4px',
                backgroundColor: '#0c0c0c',
                border: '1px solid #282828',
                borderRadius: '9999px',
                padding: '3px',
                marginBottom: '10px'
              }}
            >
              <button
                onClick={() => setRankingMode('ponderado')}
                style={{
                  backgroundColor: rankingMode === 'ponderado' ? '#FF13B1' : 'transparent',
                  color: rankingMode === 'ponderado' ? '#FFFFFF' : '#8E8E93',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '6px 0',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                🏆 Títulos & Campanhas
              </button>
              <button
                onClick={() => setRankingMode('campo')}
                style={{
                  backgroundColor: rankingMode === 'campo' ? '#FF13B1' : 'transparent',
                  color: rankingMode === 'campo' ? '#FFFFFF' : '#8E8E93',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '6px 0',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                ⚽ Jogos & Pontos
              </button>
            </div>
          </div>

          {/* Seletor de Métricas do Ranking em Modo Campo */}
          {rankingMode === 'campo' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '4px',
                backgroundColor: '#0c0c0c',
                border: '1px solid #282828',
                borderRadius: '9999px',
                padding: '3px',
                marginBottom: '14px'
              }}
            >
              {[
                { id: 'pontos', label: 'Pontos' },
                { id: 'vitorias', label: 'Vitórias' },
                { id: 'aproveitamento', label: 'Aprov %' },
                { id: 'gp', label: 'Gols' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRankingTab(tab.id)}
                  style={{
                    backgroundColor: rankingTab === tab.id ? '#FF13B1' : 'transparent',
                    color: rankingTab === tab.id ? '#FFFFFF' : '#8E8E93',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '5px 0',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Campo de Busca de Clube no Ranking */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid #2c2c2c',
              borderRadius: '9999px',
              padding: '6px 12px',
              marginBottom: '14px'
            }}
          >
            <Search size={14} color="#666666" />
            <input
              type="text"
              placeholder="Buscar clube no ranking..."
              value={rankingSearch}
              onChange={(e) => setRankingSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                fontSize: '0.78rem',
                width: '100%'
              }}
            />
          </div>

          {/* Tabela Dark Glass do Ranking */}
          <div
            style={{
              maxHeight: '520px',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            {rankingExibido.map((clube, idx) => {
              const pos = idx + 1;
              const isPodium = pos <= 3;
              const podiumColor = pos === 1 ? '#F59E0B' : pos === 2 ? '#D1D5DB' : '#B45309';

              return (
                <div
                  key={clube.clube}
                  onClick={() => onSelectH2H && onSelectH2H(clube.clube, 'Flamengo' === clube.clube ? 'Palmeiras' : 'Flamengo')}
                  style={{
                    backgroundColor: isPodium ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.015)',
                    border: '1px solid #262626',
                    borderRadius: '12px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 140ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FF13B1';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 19, 177, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#262626';
                    e.currentTarget.style.backgroundColor = isPodium ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.015)';
                  }}
                  title={`Ver histórico de ${clube.clube}`}
                >
                  {/* Posição + Escudo + Nome */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        color: isPodium ? podiumColor : '#666666',
                        textAlign: 'center'
                      }}
                    >
                      {pos}
                    </span>

                    <ClubShield name={clube.clube} size={24} />

                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                        {clube.clube}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#8E8E93' }}>
                        {rankingMode === 'ponderado' 
                          ? `${clube.titulos || 0} títulos • ${clube.campanhas || 0} edições`
                          : `${clube.jogos} jogos • ${clube.vitorias}V`}
                      </div>
                    </div>
                  </div>

                  {/* Valor Principal em Destaque */}
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        color: rankingMode === 'ponderado' ? '#C7FF00' : (rankingTab === 'aproveitamento' ? '#C7FF00' : '#FFFFFF')
                      }}
                    >
                      {rankingMode === 'ponderado' && `${(clube.pontos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} pts`}
                      {rankingMode === 'campo' && rankingTab === 'pontos' && `${clube.pontos} pts`}
                      {rankingMode === 'campo' && rankingTab === 'vitorias' && `${clube.vitorias} vit`}
                      {rankingMode === 'campo' && rankingTab === 'aproveitamento' && `${clube.aproveitamento}%`}
                      {rankingMode === 'campo' && rankingTab === 'gp' && `${clube.gp} gols`}
                    </div>
                    <div style={{ fontSize: '0.66rem', color: '#666666' }}>
                      {rankingMode === 'ponderado' ? (clube.uf || 'BR') : `SG: ${clube.sg > 0 ? `+${clube.sg}` : clube.sg}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rodapé do Ranking com Navegação para aba de Clubes */}
          <div
            style={{
              borderTop: '1px solid #282828',
              paddingTop: '14px',
              marginTop: '16px',
              textAlign: 'center'
            }}
          >
            <button
              onClick={() => onNavigateTab && onNavigateTab('times')}
              style={{
                backgroundColor: 'transparent',
                color: '#C7FF00',
                border: '1px solid rgba(199, 255, 0, 0.3)',
                borderRadius: '9999px',
                padding: '7px 16px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(199, 255, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <BarChart3 size={14} />
              <span>Ver Estatísticas Avançadas de Clubes</span>
            </button>
          </div>
        </aside>
      </main>

      {/* Estilos CSS responsivos integrados */}
      <style>{`
        @media (max-width: 1024px) {
          .bento-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
