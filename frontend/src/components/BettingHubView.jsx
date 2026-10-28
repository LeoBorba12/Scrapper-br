import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Percent,
  Flame,
  Target,
  ShieldCheck,
  ShieldAlert,
  Award,
  ChevronRight,
  Filter,
  Search,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  BarChart3,
  Swords,
  Zap,
  Info,
  DollarSign,
  UserCheck,
  Scale,
  History
} from 'lucide-react';
import ClubBadge from './ClubBadge';
import KellyCalculatorModal from './KellyCalculatorModal';


// ============================================================================
// CONFIGURAÇÕES VISUAIS & IDENTIDADE DOS CLUBES
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
  'Bahia': { sigla: 'BAH', cor1: '#0072CE', cor2: '#E50914', text: '#FFFFFF' },
  'Vitória': { sigla: 'VIT', cor1: '#E50914', cor2: '#111111', text: '#FFFFFF' },
  'Athletico-PR': { sigla: 'CAP', cor1: '#C8102E', cor2: '#111111', text: '#FFFFFF' },
  'Coritiba': { sigla: 'CFC', cor1: '#005030', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Fortaleza': { sigla: 'FOR', cor1: '#15325E', cor2: '#C8102E', text: '#FFFFFF' },
  'Ceará': { sigla: 'CSC', cor1: '#111111', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Sport': { sigla: 'SPT', cor1: '#C8102E', cor2: '#111111', text: '#FFFFFF' },
  'Goiás': { sigla: 'GOI', cor1: '#005030', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Cuiabá': { sigla: 'CUI', cor1: '#006437', cor2: '#F59E0B', text: '#FFFFFF' },
  'Criciúma': { sigla: 'CRI', cor1: '#F59E0B', cor2: '#111111', text: '#111111' },
  'Red Bull Bragantino': { sigla: 'RBB', cor1: '#E50914', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Remo': { sigla: 'REM', cor1: '#15325E', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Chapecoense': { sigla: 'CHA', cor1: '#006437', cor2: '#FFFFFF', text: '#FFFFFF' },
  'Juventude': { sigla: 'JUV', cor1: '#006437', cor2: '#FFFFFF', text: '#FFFFFF' }
};

const getTeamIdentity = (nome) => {
  if (!nome) return { sigla: 'FUT', cor1: '#4F5C35', cor2: '#2B2923', text: '#FFFFFF' };
  const found = CLUB_IDENTITIES[nome];
  if (found) return found;
  for (const key of Object.keys(CLUB_IDENTITIES)) {
    if (nome.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(nome.toLowerCase())) {
      return CLUB_IDENTITIES[key];
    }
  }
  return {
    sigla: nome.substring(0, 3).toUpperCase(),
    cor1: '#4F5C35',
    cor2: '#2B2923',
    text: '#FFFFFF'
  };
};

const formatOdd = (val) => {
  if (val === null || val === undefined) return '—';
  const num = Number(val);
  return isNaN(num) ? '—' : num.toFixed(2);
};

export default function BettingHubView({
  currentUser,
  apiFetch,
  onNavigateTab,
  onSelectH2H
}) {
  // Estados principais
  const [hubData, setHubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [mercadoFiltro, setMercadoFiltro] = useState('todos'); // 'todos', 'ev_plus', '1x2', 'over_2_5', 'btts', 'cartoes', 'jogadores'
  const [campeonatoFiltro, setCampeonatoFiltro] = useState('todos');
  const [anoFiltro, setAnoFiltro] = useState('recentes'); // 'recentes', '2026', '2025', '2024', 'todos'
  const [partidasLimit, setPartidasLimit] = useState(100);
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState('ev'); // 'ev', 'data', 'prob_casa', 'prob_over'

  // Modal Raio-X Partida
  const [modalPartidaId, setModalPartidaId] = useState(null);
  const [analisePartida, setAnalisePartida] = useState(null);
  const [analiseLoading, setAnaliseLoading] = useState(false);

  // Jogadores / Anytime Scorer state
  const [jogadoresData, setJogadoresData] = useState(null);
  const [jogadoresLoading, setJogadoresLoading] = useState(false);
  const [jogadoresBusca, setJogadoresBusca] = useState('');
  const [jogadoresPosicao, setJogadoresPosicao] = useState('todos');
  const [jogadoresOrdenacao, setJogadoresOrdenacao] = useState('prob_gol');

  // Backtesting & Track Record State
  const [backtestingData, setBacktestingData] = useState(null);
  const [backtestingLoading, setBacktestingLoading] = useState(false);
  const [backtestingMercado, setBacktestingMercado] = useState('todos');
  const [backtestingTemporada, setBacktestingTemporada] = useState('recentes');

  // Modal Calculadora de Kelly
  const [kellyModalOpen, setKellyModalOpen] = useState(false);
  const [kellySelectedData, setKellySelectedData] = useState({
    odd: 2.00,
    prob: 55.0,
    market: 'Aposta de Valor (+EV)',
    match: ''
  });

  const abrirCalculadoraKelly = (odd = 2.00, prob = 55.0, market = 'Aposta +EV', match = '') => {
    setKellySelectedData({
      odd: Number(odd) || 2.00,
      prob: Number(prob) || 55.0,
      market,
      match
    });
    setKellyModalOpen(true);
  };


  // Carregar dados do Hub
  const carregarHub = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (mercadoFiltro !== 'todos') params.append('mercado', mercadoFiltro);
      if (anoFiltro === 'todos') {
        params.append('ano', 'todos');
      } else if (anoFiltro === '2026' || anoFiltro === '2025' || anoFiltro === '2024') {
        params.append('ano', anoFiltro);
      }
      params.append('limit', String(partidasLimit));
      
      const res = await apiFetch(`/api/apostas/hub?${params.toString()}`);
      if (!res.ok) throw new Error(`Falha na requisição: ${res.status}`);
      const data = await res.json();
      setHubData(data);
    } catch (err) {
      console.error('Erro ao carregar Betting Hub:', err);
      setError('Não foi possível carregar os dados de apostas no momento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarHub();
  }, [mercadoFiltro, anoFiltro, partidasLimit]);

  // Carregar Jogadores quando selecionada a subseção
  const carregarJogadores = async () => {
    setJogadoresLoading(true);
    try {
      const params = new URLSearchParams();
      if (jogadoresBusca) params.append('busca', jogadoresBusca);
      if (jogadoresPosicao !== 'todos') params.append('posicao', jogadoresPosicao);
      params.append('ordenar', jogadoresOrdenacao);
      params.append('limit', '50');

      const res = await apiFetch(`/api/apostas/jogadores?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJogadoresData(data);
      }
    } catch (err) {
      console.error('Erro ao carregar jogadores apostas:', err);
    } finally {
      setJogadoresLoading(false);
    }
  };

  useEffect(() => {
    if (mercadoFiltro === 'jogadores') {
      carregarJogadores();
    }
  }, [mercadoFiltro, jogadoresPosicao, jogadoresOrdenacao]);

  // Carregar Backtesting Histórico
  const carregarBacktesting = async () => {
    setBacktestingLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('temporada', backtestingTemporada);
      if (backtestingMercado !== 'todos') params.append('mercado', backtestingMercado);
      params.append('limit', '80');
      const res = await apiFetch(`/api/apostas/backtesting?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBacktestingData(data);
      }
    } catch (err) {
      console.error('Erro ao carregar backtesting:', err);
    } finally {
      setBacktestingLoading(false);
    }
  };

  useEffect(() => {
    if (mercadoFiltro === 'backtesting') {
      carregarBacktesting();
    }
  }, [mercadoFiltro, backtestingTemporada, backtestingMercado]);


  // Carregar Raio-X Detalhado da Partida
  const abrirRaioX = async (idPartida) => {
    setModalPartidaId(idPartida);
    setAnaliseLoading(true);
    setAnalisePartida(null);
    try {
      const res = await apiFetch(`/api/apostas/analise?id_partida=${idPartida}`);
      if (res.ok) {
        const data = await res.json();
        setAnalisePartida(data);
      }
    } catch (err) {
      console.error('Erro ao carregar análise de jogo:', err);
    } finally {
      setAnaliseLoading(false);
    }
  };

  // Campeonatos distintos disponíveis na lista
  const campeonatosDisponiveis = useMemo(() => {
    if (!hubData?.partidas) return [];
    const setCamps = new Set();
    hubData.partidas.forEach(p => {
      if (p.campeonato) setCamps.add(p.campeonato);
    });
    return Array.from(setCamps);
  }, [hubData]);

  // Partidas filtradas e ordenadas
  const partidasFiltradas = useMemo(() => {
    if (!hubData?.partidas) return [];
    let list = [...hubData.partidas];

    if (campeonatoFiltro !== 'todos') {
      list = list.filter(p => p.campeonato === campeonatoFiltro);
    }

    if (busca.trim()) {
      const termo = busca.toLowerCase();
      list = list.filter(p =>
        (p.mandante && p.mandante.toLowerCase().includes(termo)) ||
        (p.visitante && p.visitante.toLowerCase().includes(termo)) ||
        (p.estadio && p.estadio.toLowerCase().includes(termo))
      );
    }

    // Ordenação
    if (ordenacao === 'ev') {
      list.sort((a, b) => {
        const evA = a.melhor_aposta?.ev || -999;
        const evB = b.melhor_aposta?.ev || -999;
        return evB - evA;
      });
    } else if (ordenacao === 'prob_casa') {
      list.sort((a, b) => (b.probabilidades?.prob_mandante || 0) - (a.probabilidades?.prob_mandante || 0));
    } else if (ordenacao === 'prob_over') {
      list.sort((a, b) => (b.probabilidades?.prob_over_2_5 || 0) - (a.probabilidades?.prob_over_2_5 || 0));
    }

    return list;
  }, [hubData, campeonatoFiltro, busca, ordenacao]);

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* ==================================================================== */}
      {/* HEADER PRINCIPAL EDITORIAL & BETTING COCKPIT                         */}
      {/* ==================================================================== */}
      <section
        style={{
          backgroundColor: 'var(--surface-panel)',
          borderRadius: 'var(--radius-panel)',
          border: '1px solid var(--border-subtle)',
          padding: '24px 28px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-editorial)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-control)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                <Percent size={14} /> Modelagem Poisson & +EV
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: 'var(--positive-bg)',
                  color: 'var(--positive)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-control)',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                <Zap size={14} /> Algoritmo Ativo
              </span>
            </div>

            <h1
              className="font-editorial"
              style={{
                fontSize: '1.9rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: '4px 0 8px 0'
              }}
            >
              Betting Hub & Estatísticas Avançadas
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '780px', lineHeight: 1.5, margin: 0 }}>
              Precificação matemática independente de Odds Justas (Fair Odds) via Poisson bivariado, detecção de valor esperado (+EV),
              tendências de gols (Over/Under 1.5, 2.5), Ambas Marcam (BTTS) e índice disciplinar de árbitros.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => abrirCalculadoraKelly(2.10, 52.0, 'Simulação de Gestão de Banca', 'Calculadora Livre')}
              className="touch-tactile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '0.84rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--accent-soft)',
                border: '1px solid var(--accent)',
                color: 'var(--accent)',
                cursor: 'pointer'
              }}
            >
              <Scale size={15} />
              <span>Calculadora de Stake (Kelly)</span>
            </button>

            <button
              onClick={() => {
                carregarHub();
                if (mercadoFiltro === 'jogadores') carregarJogadores();
                if (mercadoFiltro === 'backtesting') carregarBacktesting();
              }}
              className="btn-secondary touch-tactile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '0.84rem',
                borderRadius: 'var(--radius-control)',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} className={loading || backtestingLoading ? 'animate-spin' : ''} />
              <span>Atualizar Dados</span>
            </button>
          </div>

        </div>

        {/* METRICS STRIP / INDICADORES GLOBAIS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginTop: '22px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--surface-raised)',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Partidas com Odds no Banco
            </div>
            <div className="font-mono tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {(hubData?.total_banco_odds || 9252).toLocaleString('pt-BR')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent)', marginTop: '2px', fontWeight: 600 }}>
              {hubData?.total_temporada ? `${hubData.total_temporada.toLocaleString('pt-BR')} recentes (2025–2026)` : '9.252 no acervo histórico'}
            </div>
          </div>

          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--positive-bg)',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--positive)'
            }}
          >
            <div style={{ fontSize: '0.76rem', color: 'var(--positive)', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Flame size={14} /> Apostas com +EV
            </div>
            <div className="font-mono tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--positive)', marginTop: '4px' }}>
              {hubData?.total_com_ev || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--positive)', marginTop: '2px' }}>
              Odd Casa &gt; Probabilidade Calculada
            </div>
          </div>

          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--surface-raised)',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Favoráveis ao Over 2.5
            </div>
            <div className="font-mono tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {hubData?.total_over_2_5_favoravel || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Probabilidade estatística &ge; 52%
            </div>
          </div>

          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--surface-raised)',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Favoráveis ao BTTS (Ambas)
            </div>
            <div className="font-mono tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {hubData?.total_btts_favoravel || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Ambas Marcam provável &ge; 52%
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* TICKER DE JOGOS & ODDS DA RODADA (HORIZONTAL SCROLL)                  */}
      {/* ==================================================================== */}
      {hubData?.partidas && hubData.partidas.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ticker de Odds & Probabilidades em Destaque
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Arraste para os lados &bull; Valores Justos vs Casa
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'thin'
            }}
          >
            {hubData.partidas.slice(0, 10).map((p) => {
              const idM = getTeamIdentity(p.mandante);
              const idV = getTeamIdentity(p.visitante);
              return (
                <div
                  key={p.id_partida}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver Raio-X estatístico do confronto ${p.mandante} contra ${p.visitante}`}
                  onClick={() => abrirRaioX(p.id_partida)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      abrirRaioX(p.id_partida);
                    }
                  }}
                  style={{
                    flex: '0 0 290px',
                    backgroundColor: 'var(--surface-panel)',
                    border: p.has_ev ? '1px solid var(--positive)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-control)',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'transform 120ms ease, box-shadow 120ms ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>{p.campeonato || 'Futebol'}</span>
                    <span className="font-mono">{p.data || 'Hoje'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ClubBadge nome={p.mandante} size={22} />
                      <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {p.mandante}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>x</span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {p.visitante}
                      </span>
                      <ClubBadge nome={p.visitante} size={22} />
                    </div>
                  </div>

                  {/* ODDS 1X2 STRIP */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '4px',
                      backgroundColor: 'var(--surface-raised)',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-control)',
                      textAlign: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>1 (Casa)</div>
                      <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                        {formatOdd(p.odd_mandante)}
                      </div>
                      <div style={{ fontSize: '0.64rem', color: 'var(--accent)' }}>
                        {p.probabilidades?.prob_mandante != null ? `${p.probabilidades.prob_mandante}%` : '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>X (Empate)</div>
                      <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                        {formatOdd(p.odd_empate)}
                      </div>
                      <div style={{ fontSize: '0.64rem', color: 'var(--accent)' }}>
                        {p.probabilidades?.prob_empate != null ? `${p.probabilidades.prob_empate}%` : '—'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>2 (Fora)</div>
                      <div className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                        {formatOdd(p.odd_visitante)}
                      </div>
                      <div style={{ fontSize: '0.64rem', color: 'var(--accent)' }}>
                        {p.probabilidades?.prob_visitante != null ? `${p.probabilidades.prob_visitante}%` : '—'}
                      </div>
                    </div>
                  </div>

                  {/* DESTAQUE DE VALOR */}
                  {p.melhor_aposta && (
                    <div
                      style={{
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: 'var(--positive)',
                        fontWeight: 600
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Flame size={12} /> {p.melhor_aposta.tipo}
                      </span>
                      <span className="font-mono">+{p.melhor_aposta.ev}% EV</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* SEÇÃO RADAR DO APOSTADOR / TENDÊNCIAS QUENTES                         */}
      {/* ==================================================================== */}
      {hubData?.tendencias_quentes && hubData.tendencias_quentes.length > 0 && (
        <section
          style={{
            backgroundColor: 'var(--surface-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-panel)',
            padding: '18px 22px',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Flame size={18} color="var(--accent)" />
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Radar do Apostador &bull; Tendências em Tempo Real
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '10px'
            }}
          >
            {hubData.tendencias_quentes.map((t, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-control)',
                  padding: '10px 14px'
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {t}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* BARRA DE FILTROS & SELEÇÃO DE MERCADO                                 */}
      {/* ==================================================================== */}
      <section
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}
      >
        {/* ABAS DE MERCADO */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'todos', label: 'Todos os Jogos' },
            { id: 'ev_plus', label: 'Apostas de Valor (+EV)', icon: Flame, badge: hubData?.total_com_ev },
            { id: 'over_2_5', label: 'Gols (Over/Under 2.5)', icon: Target },
            { id: 'btts', label: 'Ambas Marcam (BTTS)', icon: Percent },
            { id: 'jogadores', label: 'Jogadores & Anytime Scorer', icon: UserCheck },
            { id: 'backtesting', label: 'Track Record & Backtesting', icon: History, badge: 'Green/Red' }
          ].map((m) => {
            const Icon = m.icon;
            const active = mercadoFiltro === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMercadoFiltro(m.id)}
                className="touch-tactile"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-control)',
                  fontSize: '0.84rem',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  border: active ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  backgroundColor: active ? 'var(--accent)' : 'var(--surface-panel)',
                  color: active ? 'var(--accent-foreground)' : 'var(--text-primary)',
                  transition: 'background-color 140ms ease'
                }}
              >
                {Icon && <Icon size={14} />}
                <span>{m.label}</span>
                {m.badge !== undefined && (
                  <span
                    style={{
                      backgroundColor: active ? 'var(--accent-foreground)' : 'var(--positive-bg)',
                      color: active ? 'var(--accent)' : 'var(--positive)',
                      borderRadius: '10px',
                      padding: '1px 6px',
                      fontSize: '0.68rem',
                      fontWeight: 700
                    }}
                  >
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* BUSCA E FILTROS COMPLEMENTARES (QUANDO NÃO EM JOGADORES OU BACKTESTING) */}
        {mercadoFiltro !== 'jogadores' && mercadoFiltro !== 'backtesting' && (

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar time ou estádio..."
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  fontSize: '0.82rem',
                  backgroundColor: 'var(--surface-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-control)',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Seletor de Temporada / Acervo */}
            <select
              value={anoFiltro}
              onChange={(e) => {
                setAnoFiltro(e.target.value);
                setPartidasLimit(100);
              }}
              style={{
                padding: '7px 12px',
                fontSize: '0.82rem',
                backgroundColor: 'var(--surface-panel)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-control)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
              aria-label="Filtrar por temporada ou acervo histórico"
            >
              <option value="recentes">Recentes (2025–2026)</option>
              <option value="2026">Temporada 2026</option>
              <option value="2025">Temporada 2025</option>
              <option value="2024">Temporada 2024</option>
              <option value="todos">Acervo Completo (9.252 Jogos)</option>
            </select>

            {campeonatosDisponiveis.length > 1 && (
              <select
                value={campeonatoFiltro}
                onChange={(e) => setCampeonatoFiltro(e.target.value)}
                style={{
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                  backgroundColor: 'var(--surface-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-control)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="todos">Todos Campeonatos</option>
                {campeonatosDisponiveis.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              style={{
                padding: '7px 12px',
                fontSize: '0.82rem',
                backgroundColor: 'var(--surface-panel)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-control)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              <option value="ev">Maior Valor (+EV)</option>
              <option value="prob_casa">Probabilidade Casa</option>
              <option value="prob_over">Probabilidade Over 2.5</option>
            </select>
          </div>
        )}
      </section>

      {/* ==================================================================== */}
      {/* CONTEÚDO PRINCIPAL: CARDS DE PARTIDAS OU PAINEL DE JOGADORES         */}
      {/* ==================================================================== */}

      {/* CASO 1: ABA DE JOGADORES (ANYTIME SCORER & PROPS) */}
      {mercadoFiltro === 'jogadores' ? (
        <section
          style={{
            backgroundColor: 'var(--surface-panel)',
            borderRadius: 'var(--radius-panel)',
            border: '1px solid var(--border-subtle)',
            padding: '24px',
            boxShadow: 'var(--shadow-editorial)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                Mercado de Atletas & Marcadores (Anytime Goalscorer)
              </h2>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                Probabilidades calibradas de gol a qualquer momento, odds justas estimadas, finalizações no alvo e risco de cartão.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Filtrar atleta..."
                value={jogadoresBusca}
                onChange={(e) => setJogadoresBusca(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && carregarJogadores()}
                style={{
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-control)',
                  color: 'var(--text-primary)'
                }}
              />

              <select
                value={jogadoresPosicao}
                onChange={(e) => setJogadoresPosicao(e.target.value)}
                style={{
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-control)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="todos">Todas Posições</option>
                <option value="Atacante">Atacantes</option>
                <option value="Meio-campo">Meias</option>
                <option value="Defensor">Defensores</option>
              </select>

              <select
                value={jogadoresOrdenacao}
                onChange={(e) => setJogadoresOrdenacao(e.target.value)}
                style={{
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-control)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="prob_gol">Maior Chance de Gol</option>
                <option value="chutes">Mais Chutes / Jogo</option>
                <option value="cartoes">Mais Cartões / Jogo</option>
                <option value="gols">Total de Gols</option>
              </select>
            </div>
          </div>

          {/* DESTAQUES TOP ARTILHEIROS */}
          {jogadoresData?.top_anytime_scorers && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                Top 5 Favoritos a Gol (Anytime Scorer)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                {jogadoresData.top_anytime_scorers.map((j) => (
                  <div
                    key={j.id_jogador}
                    style={{
                      backgroundColor: 'var(--surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-control)',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{j.posicao}</span>
                        <span style={{ fontSize: '0.68rem', backgroundColor: 'var(--positive-bg)', color: 'var(--positive)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          {j.perfil_aposta}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {j.nome}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        {j.clube_atual || 'Brasileirão'} &bull; {j.total_gols ?? 0} gols em {j.total_jogos ?? 0}j
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Prob. Gol</div>
                        <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent)' }}>
                          {j.prob_marcar_gol != null ? `${j.prob_marcar_gol}%` : '—'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Odd Justa</div>
                        <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatOdd(j.odd_justa_gol)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TABELA DE JOGADORES */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Atleta / Clube</th>
                  <th style={{ padding: '10px 12px' }}>Posição</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Jogos</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Gols</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Chutes/J</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Prob. Gol</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Odd Justa</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Odd Estimada Casa</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Risco Cartão</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Perfil</th>
                </tr>
              </thead>
              <tbody>
                {jogadoresLoading ? (
                  <tr>
                    <td colSpan={10} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                      Carregando dados estatísticos dos atletas...
                    </td>
                  </tr>
                ) : (jogadoresData?.jogadores || []).map((j) => (
                  <tr key={j.id_jogador} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 100ms ease' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{j.nome}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{j.clube_atual}</div>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{j.posicao}</td>
                    <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'center' }}>{j.total_jogos ?? 0}</td>
                    <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{j.total_gols ?? 0}</td>
                    <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {j.media_chutes_gol ?? '—'} <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>({j.pontaria_pct != null ? `${j.pontaria_pct}%` : '—'})</span>
                    </td>
                    <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>
                      {j.prob_marcar_gol != null ? `${j.prob_marcar_gol}%` : '—'}
                    </td>
                    <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>
                      {formatOdd(j.odd_justa_gol)}
                    </td>
                    <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--positive)', fontWeight: 700 }}>
                      {formatOdd(j.odd_casa_estimada)}
                    </td>
                    <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {j.prob_levar_cartao != null ? `${j.prob_levar_cartao}%` : '—'} <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>(@{formatOdd(j.odd_justa_cartao)})</span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: j.perfil_aposta === 'Artilheiro Decisivo' ? 'var(--positive-bg)' : 'var(--surface-raised)',
                          color: j.perfil_aposta === 'Artilheiro Decisivo' ? 'var(--positive)' : 'var(--text-secondary)',
                          fontWeight: 600
                        }}
                      >
                        {j.perfil_aposta}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : mercadoFiltro === 'backtesting' ? (
        /* CASO 2: TRACK RECORD & BACKTESTING HISTÓRICO */
        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* PAINEL DE CONTROLE DO BACKTESTING */}
          <div
            style={{
              backgroundColor: 'var(--surface-panel)',
              borderRadius: 'var(--radius-panel)',
              border: '1px solid var(--border-subtle)',
              padding: '20px 24px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span
                  style={{
                    backgroundColor: 'var(--positive-bg)',
                    color: 'var(--positive)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  Auditoria Matemática Ativa
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Amostra empírica de partidas finalizadas com odds de fechamento
                </span>
              </div>
              <h2
                className="font-editorial"
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0
                }}
              >
                Track Record & Validação Quantitativa
              </h2>
            </div>

            {/* SELETORES DE ESCOPO DO BACKTESTING */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={backtestingTemporada}
                onChange={(e) => setBacktestingTemporada(e.target.value)}
                style={{
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-control)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="recentes">Recentes (2025–2026)</option>
                <option value="2026">Temporada 2026</option>
                <option value="2025">Temporada 2025</option>
                <option value="2024">Temporada 2024</option>
                <option value="todas">Todo o Acervo Histórico</option>
              </select>

              <select
                value={backtestingMercado}
                onChange={(e) => setBacktestingMercado(e.target.value)}
                style={{
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-control)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="todos">Todos os Mercados</option>
                <option value="ev_plus">Apostas de Valor (+EV)</option>
                <option value="over_1_5">Over 1.5 Gols</option>
                <option value="over_2_5">Gols (Over 2.5)</option>
                <option value="btts">Ambas Marcam (BTTS)</option>
                <option value="favorito_1x2">Favoritos 1X2</option>
              </select>
            </div>
          </div>

          {backtestingLoading ? (
            <div
              style={{
                backgroundColor: 'var(--surface-panel)',
                borderRadius: 'var(--radius-panel)',
                border: '1px solid var(--border-subtle)',
                padding: '60px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}
            >
              <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 14px', color: 'var(--accent)' }} />
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Auditando prognósticos históricos contra placares reais...
              </div>
            </div>
          ) : backtestingData ? (
            <>
              {/* METRICS STRIP / 4 CARDS DE INDICADORES */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '14px'
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--surface-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-control)',
                    padding: '16px 18px'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Jogos Analisados
                  </span>
                  <div className="font-mono tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {backtestingData.total_partidas_analisadas}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {backtestingData.total_apostas_avaliadas} prognósticos testados
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--surface-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-control)',
                    padding: '16px 18px'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Taxa de Acerto Geral
                  </span>
                  <div className="font-mono tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--positive)', marginTop: '4px' }}>
                    {backtestingData.taxa_acerto_geral}%
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Prognósticos com status GREEN
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--surface-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-control)',
                    padding: '16px 18px'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Lucro Acumulado
                  </span>
                  <div
                    className="font-mono tabular-nums"
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      color: backtestingData.lucro_total_unidades >= 0 ? 'var(--positive)' : 'var(--negative)',
                      marginTop: '4px'
                    }}
                  >
                    {backtestingData.lucro_total_unidades >= 0 ? '+' : ''}{backtestingData.lucro_total_unidades} u
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Unidades de 1u fixa por entrada
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--surface-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-control)',
                    padding: '16px 18px'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    ROI Médio
                  </span>
                  <div
                    className="font-mono tabular-nums"
                    style={{
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      color: backtestingData.roi_geral_pct >= 0 ? 'var(--positive)' : 'var(--negative)',
                      marginTop: '4px'
                    }}
                  >
                    {backtestingData.roi_geral_pct >= 0 ? '+' : ''}{backtestingData.roi_geral_pct}%
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Retorno sobre volume apostado
                  </span>
                </div>
              </div>

              {/* CARDS COMPARATIVOS POR MERCADO */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px'
                }}
              >
                {Object.entries(backtestingData.metricas_mercados || {}).map(([key, m]) => (
                  <div
                    key={key}
                    style={{
                      backgroundColor: 'var(--surface-panel)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-control)',
                      padding: '14px 16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{m.nome}</strong>
                      <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {m.apostas} entradas
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Acurácia:</span>
                      <strong className="font-mono" style={{ fontSize: '1.05rem', color: 'var(--positive)' }}>
                        {m.taxa_acerto_pct}% ({m.greens}G / {m.reds}R)
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Lucro / ROI:</span>
                      <strong
                        className="font-mono"
                        style={{
                          fontSize: '0.88rem',
                          color: m.lucro_unidades >= 0 ? 'var(--positive)' : 'var(--negative)'
                        }}
                      >
                        {m.lucro_unidades >= 0 ? '+' : ''}{m.lucro_unidades}u ({m.roi_pct >= 0 ? '+' : ''}{m.roi_pct}%)
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* LISTAGEM DETALHADA DE JOGOS AUDITADOS */}
              <div
                style={{
                  backgroundColor: 'var(--surface-panel)',
                  borderRadius: 'var(--radius-panel)',
                  border: '1px solid var(--border-subtle)',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3
                    className="font-editorial"
                    style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}
                  >
                    Histórico Transparente de Partidas Auditadas
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Exibindo as últimas {backtestingData.historico_partidas?.length || 0} partidas com prognósticos
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {backtestingData.historico_partidas?.map((partida) => (
                    <div
                      key={partida.id_partida}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: 'var(--surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-control)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      {/* CABEÇALHO DO JOGO */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {partida.data}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                            &bull; {partida.campeonato}
                          </span>
                        </div>

                        {/* PLACAR REAL */}
                        <div
                          className="font-mono"
                          style={{
                            backgroundColor: 'var(--surface-page)',
                            padding: '3px 10px',
                            borderRadius: '4px',
                            fontWeight: 800,
                            fontSize: '0.84rem',
                            color: 'var(--text-primary)'
                          }}
                        >
                          Placar Final: {partida.placar}
                        </div>
                      </div>

                      {/* CONFRONTO */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClubBadge nome={partida.mandante} size={20} />
                        <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{partida.mandante}</strong>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>x</span>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{partida.visitante}</strong>
                        <ClubBadge nome={partida.visitante} size={20} />
                      </div>

                      {/* LISTA DE PROGNÓSTICOS DA PARTIDA */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                        {partida.prognosticos?.map((prog, idx) => {
                          const isGreen = prog.resultado === 'GREEN';
                          return (
                            <div
                              key={idx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                backgroundColor: isGreen ? 'var(--positive-bg)' : 'var(--negative-bg, rgba(198, 40, 40, 0.12))',
                                border: isGreen ? '1px solid var(--positive)' : '1px solid var(--negative, #C62828)',
                                fontSize: '0.76rem'
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 800,
                                  color: isGreen ? 'var(--positive)' : 'var(--negative, #C62828)'
                                }}
                              >
                                {isGreen ? '✅ GREEN' : '❌ RED'}
                              </span>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                {prog.mercado}
                              </span>
                              <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>
                                @{formatOdd(prog.odd)} ({prog.prob_modelo}%)
                              </span>
                              <span
                                className="font-mono"
                                style={{
                                  fontWeight: 700,
                                  color: isGreen ? 'var(--positive)' : 'var(--negative, #C62828)'
                                }}
                              >
                                {prog.lucro_unidades >= 0 ? '+' : ''}{prog.lucro_unidades}u
                              </span>

                              <button
                                type="button"
                                onClick={() => abrirCalculadoraKelly(prog.odd, prog.prob_modelo, prog.mercado, `${partida.mandante} x ${partida.visitante}`)}
                                title="Calcular Stake no Critério de Kelly"
                                className="touch-tactile"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--accent)',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <Scale size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </section>
      ) : (
        /* CASO 3: LISTA DE PARTIDAS COM ODDS & MERCADOS */
        <section>
          {loading ? (
            <div
              style={{
                backgroundColor: 'var(--surface-panel)',
                borderRadius: 'var(--radius-panel)',
                border: '1px solid var(--border-subtle)',
                padding: '60px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}
            >
              <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 14px', color: 'var(--accent)' }} />
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Calculando modelos de probabilidades e Fair Odds...
              </div>
              <div style={{ fontSize: '0.84rem', marginTop: '6px' }}>
                Cruzando dados de partidas com acervo de apostas e distribuições de Poisson.
              </div>
            </div>
          ) : partidasFiltradas.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--surface-panel)',
                borderRadius: 'var(--radius-panel)',
                border: '1px solid var(--border-subtle)',
                padding: '48px 20px',
                textAlign: 'center'
              }}
            >
              <AlertTriangle size={32} color="var(--negative)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>Nenhuma partida encontrada</div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Tente ajustar os filtros de busca ou escolher outro mercado esportivo.
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Exibindo <strong className="font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>{partidasFiltradas.length}</strong> de <strong className="font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>{(hubData?.total_filtrado || hubData?.total_temporada || 2362).toLocaleString('pt-BR')}</strong> partidas catalogadas com probabilidades
                </span>
                {hubData?.partidas && hubData.partidas.length < (hubData?.total_filtrado || 0) && (
                  <span style={{ fontSize: '0.74rem', color: 'var(--accent)', fontWeight: 600 }}>
                    Role até o fim para carregar mais jogos
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
                  gap: '16px'
                }}
              >
              {partidasFiltradas.map((p) => {
                const idM = getTeamIdentity(p.mandante);
                const idV = getTeamIdentity(p.visitante);
                const prob = p.probabilidades || {};
                const ev = p.ev || {};
                const melhor = p.melhor_aposta;

                return (
                  <div
                    key={p.id_partida}
                    style={{
                      backgroundColor: 'var(--surface-panel)',
                      borderRadius: 'var(--radius-panel)',
                      border: p.has_ev ? '1.5px solid var(--positive)' : '1px solid var(--border-subtle)',
                      padding: '18px 20px',
                      boxShadow: 'var(--shadow-editorial)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'border-color 140ms ease, box-shadow 140ms ease'
                    }}
                  >
                    <div>
                      {/* HEADER DO CARD */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {p.campeonato || 'Brasileirão'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                            &bull; {p.data}
                          </span>
                        </div>

                        {p.has_ev && melhor && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: 'var(--positive-bg)',
                              color: 'var(--positive)',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            <Flame size={12} /> +EV +{melhor.ev}%
                          </span>
                        )}
                      </div>

                      {/* CONFRONTO: MANDANTE X VISITANTE */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          backgroundColor: 'var(--surface-raised)',
                          borderRadius: 'var(--radius-control)',
                          marginBottom: '14px'
                        }}
                      >
                        {/* Mandante */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                          <ClubBadge nome={p.mandante} size={32} />
                          <div style={{ minWidth: 0, overflow: 'hidden' }}>
                            <div
                              style={{
                                fontSize: '0.92rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                              title={p.mandante}
                            >
                              {p.mandante}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              xG est. {p.xg_mandante_estimado || '1.4'}
                            </div>
                          </div>
                        </div>

                        {/* Placar ou x */}
                        <div style={{ textAlign: 'center', padding: '0 10px', flexShrink: 0 }}>
                          {p.gols_mandante !== null && p.gols_visitante !== null ? (
                            <div className="font-mono tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                              {p.gols_mandante} - {p.gols_visitante}
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                              x
                            </div>
                          )}
                          {p.horario && (
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              {p.horario}
                            </div>
                          )}
                        </div>

                        {/* Visitante */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0, justifyContent: 'flex-end', textAlign: 'right' }}>
                          <div style={{ minWidth: 0, overflow: 'hidden' }}>
                            <div
                              style={{
                                fontSize: '0.92rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                              title={p.visitante}
                            >
                              {p.visitante}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              xG est. {p.xg_visitante_estimado || '1.1'}
                            </div>
                          </div>
                          <ClubBadge nome={p.visitante} size={32} />
                        </div>
                      </div>

                      {/* GRADE COMPARATIVA: ODD DA CASA VS FAIR ODD FUTSTATS */}
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                          Mercado 1X2 &bull; Odd Casa vs Probabilidade Poisson
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: '6px'
                          }}
                        >
                          {/* 1 (Mandante) */}
                          <div
                            style={{
                              backgroundColor: 'var(--surface-raised)',
                              borderRadius: 'var(--radius-control)',
                              padding: '8px 10px',
                              border: ev.mandante && ev.mandante > 0 ? '1px solid var(--positive)' : '1px solid var(--border-subtle)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              <span>1</span>
                              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{prob.prob_mandante != null ? `${prob.prob_mandante}%` : '—'}</span>
                            </div>
                            <div className="font-mono" style={{ fontSize: '0.94rem', fontWeight: 700, margin: '2px 0' }}>
                              {formatOdd(p.odd_mandante)}
                            </div>
                            <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                              Justa: <span className="font-mono">@{formatOdd(prob.fair_odd_mandante)}</span>
                            </div>
                          </div>

                          {/* X (Empate) */}
                          <div
                            style={{
                              backgroundColor: 'var(--surface-raised)',
                              borderRadius: 'var(--radius-control)',
                              padding: '8px 10px',
                              border: ev.empate && ev.empate > 0 ? '1px solid var(--positive)' : '1px solid var(--border-subtle)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              <span>X</span>
                              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{prob.prob_empate != null ? `${prob.prob_empate}%` : '—'}</span>
                            </div>
                            <div className="font-mono" style={{ fontSize: '0.94rem', fontWeight: 700, margin: '2px 0' }}>
                              {formatOdd(p.odd_empate)}
                            </div>
                            <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                              Justa: <span className="font-mono">@{formatOdd(prob.fair_odd_empate)}</span>
                            </div>
                          </div>

                          {/* 2 (Visitante) */}
                          <div
                            style={{
                              backgroundColor: 'var(--surface-raised)',
                              borderRadius: 'var(--radius-control)',
                              padding: '8px 10px',
                              border: ev.visitante && ev.visitante > 0 ? '1px solid var(--positive)' : '1px solid var(--border-subtle)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              <span>2</span>
                              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{prob.prob_visitante != null ? `${prob.prob_visitante}%` : '—'}</span>
                            </div>
                            <div className="font-mono" style={{ fontSize: '0.94rem', fontWeight: 700, margin: '2px 0' }}>
                              {formatOdd(p.odd_visitante)}
                            </div>
                            <div style={{ fontSize: '0.66rem', color: 'var(--text-secondary)' }}>
                              Justa: <span className="font-mono">@{formatOdd(prob.fair_odd_visitante)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* LINHAS DE MERCADO SECUNDÁRIAS: OVER 2.5 & BTTS */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px',
                          marginBottom: '14px'
                        }}
                      >
                        <div
                          style={{
                            padding: '8px 10px',
                            backgroundColor: 'var(--surface-raised)',
                            borderRadius: 'var(--radius-control)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <span>Over 2.5 Gols</span>
                            <span style={{ fontWeight: 700, color: prob.prob_over_2_5 >= 50 ? 'var(--positive)' : 'var(--text-secondary)' }}>
                              {prob.prob_over_2_5 != null ? `${prob.prob_over_2_5}%` : '—'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                            <span className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                              Odd {formatOdd(p.odd_over_2_5)}
                            </span>
                            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                              Justa: @{formatOdd(prob.fair_odd_over_2_5)}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '8px 10px',
                            backgroundColor: 'var(--surface-raised)',
                            borderRadius: 'var(--radius-control)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <span>Ambas Marcam (Sim)</span>
                            <span style={{ fontWeight: 700, color: prob.prob_btts_sim >= 50 ? 'var(--positive)' : 'var(--text-secondary)' }}>
                              {prob.prob_btts_sim != null ? `${prob.prob_btts_sim}%` : '—'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                            <span className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                              Odd {formatOdd(p.odd_btts_sim)}
                            </span>
                            <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                              Justa: @{formatOdd(prob.fair_odd_btts_sim)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* TENDÊNCIAS DO JOGO */}
                      {p.tendencias && p.tendencias.length > 0 && (
                        <div style={{ marginBottom: '14px' }}>
                          {p.tendencias.slice(0, 2).map((t, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.74rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '4px'
                              }}
                            >
                              <CheckCircle2 size={12} color="var(--positive)" />
                              <span>{t}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* BOTÕES DE AÇÃO DO CARD */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                      {p.has_ev && melhor && (
                        <button
                          type="button"
                          onClick={() => abrirCalculadoraKelly(melhor.odd, melhor.prob, melhor.mercado, `${p.mandante} x ${p.visitante}`)}
                          className="touch-tactile"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: 'var(--positive-bg)',
                            color: 'var(--positive)',
                            border: '1px solid var(--positive)',
                            borderRadius: 'var(--radius-control)',
                            fontSize: '0.80rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Scale size={14} />
                          <span>Calcular Stake de Kelly ({melhor.mercado})</span>
                        </button>
                      )}

                      <button
                        onClick={() => abrirRaioX(p.id_partida)}
                        style={{
                          width: '100%',
                          padding: '9px 14px',
                          backgroundColor: 'var(--surface-raised)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-control)',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'background-color 140ms ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-soft)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-raised)'}
                      >
                        <BarChart3 size={15} />
                        <span>Raio-X Aprofundado &bull; Cartões & Minutagem</span>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>

                );
              })}
            </div>

            {/* PAGINAÇÃO / CARREGAR MAIS PARTIDAS */}
            {hubData?.partidas && hubData.partidas.length < (hubData?.total_filtrado || 0) && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button
                  onClick={() => setPartidasLimit(prev => prev + 50)}
                  disabled={loading}
                  style={{
                    padding: '12px 28px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-control)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-editorial)'
                  }}
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>
                    Carregar Mais Partidas (+50) &bull; Exibindo {hubData.partidas.length} de {(hubData?.total_filtrado || 0).toLocaleString('pt-BR')}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </section>
    )}

      {/* ==================================================================== */}
      {/* MODAL / DRAWER DE RAIO-X ANALÍTICO DA PARTIDA                        */}
      {/* ==================================================================== */}
      {modalPartidaId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(27, 26, 23, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !analiseLoading) {
              setModalPartidaId(null);
            }
          }}
        >
          <div
            className="modal-dialog-content"
            style={{
              backgroundColor: 'var(--surface-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-panel)',
              width: '100%',
              maxWidth: '840px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-editorial)',
              padding: '28px',
              position: 'relative'
            }}
          >
            {/* Header Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Raio-X Estatístico de Confronto
                </span>
                <h2
                  className="font-editorial"
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    margin: '4px 0',
                    color: 'var(--text-primary)'
                  }}
                >
                  {analisePartida?.partida?.mandante || 'Mandante'} x {analisePartida?.partida?.visitante || 'Visitante'}
                </h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {analisePartida?.partida?.campeonato} &bull; {analisePartida?.partida?.data} &bull; {analisePartida?.partida?.estadio || 'Estádio Oficial'}
                </div>
              </div>

              <button
                onClick={() => setModalPartidaId(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '6px',
                  borderRadius: 'var(--radius-control)'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {analiseLoading ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={30} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--accent)' }} />
                Carregando histórico profundo de gols, tempos e arbitragem...
              </div>
            ) : analisePartida ? (
              <div>
                {/* RADAR DO APOSTADOR / INSIGHTS TÁTICOS */}
                {analisePartida.insights_apostador && analisePartida.insights_apostador.length > 0 && (
                  <div
                    style={{
                      backgroundColor: 'var(--surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-control)',
                      padding: '16px',
                      marginBottom: '20px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '10px' }}>
                      <Flame size={16} /> Insights Chave para o Apostador
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {analisePartida.insights_apostador.map((ins, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                          <CheckCircle2 size={14} color="var(--positive)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{ins}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MATRIZ DE PLACARES MAIS PROVÁVEIS (POISSON) */}
                {analisePartida.probabilidades?.top_placares && (
                  <div style={{ marginBottom: '22px' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Top 5 Placares Exatos Mais Prováveis (Modelo Bivariado)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                      {analisePartida.probabilidades.top_placares.map((pl, idx) => (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: 'var(--surface-raised)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-control)',
                            padding: '10px',
                            textAlign: 'center'
                          }}
                        >
                          <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {pl.placar}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--accent)', fontWeight: 600, marginTop: '2px' }}>
                            {pl.prob}% de chance
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* COMPARATIVO DE FORMA RECENTE (ÚLTIMOS 10 JOGOS) */}
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Forma Recente nos Últimos 10 Jogos
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
                    {/* Mandante */}
                    <div
                      style={{
                        backgroundColor: 'var(--surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-control)',
                        padding: '14px'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                        {analisePartida.partida?.mandante}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                        {analisePartida.forma_recente?.mandante?.forma_string?.map((f, idx) => (
                          <span
                            key={idx}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: f === 'V' ? 'var(--positive-bg)' : f === 'E' ? 'var(--surface-panel)' : 'var(--negative-bg)',
                              color: f === 'V' ? 'var(--positive)' : f === 'E' ? 'var(--text-secondary)' : 'var(--negative)'
                            }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <div>Média Gols Pró: <strong>{analisePartida.forma_recente?.mandante?.media_gp ?? '—'}</strong></div>
                        <div>Média Gols Contra: <strong>{analisePartida.forma_recente?.mandante?.media_gc ?? '—'}</strong></div>
                        <div>Baliza Inviolada: <strong>{analisePartida.forma_recente?.mandante?.clean_sheets_pct != null ? `${analisePartida.forma_recente?.mandante?.clean_sheets_pct}%` : '—'}</strong></div>
                        <div>Over 2.5: <strong>{analisePartida.forma_recente?.mandante?.over_2_5_pct != null ? `${analisePartida.forma_recente?.mandante?.over_2_5_pct}%` : '—'}</strong></div>
                      </div>
                    </div>

                    {/* Visitante */}
                    <div
                      style={{
                        backgroundColor: 'var(--surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-control)',
                        padding: '14px'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                        {analisePartida.partida?.visitante}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                        {analisePartida.forma_recente?.visitante?.forma_string?.map((f, idx) => (
                          <span
                            key={idx}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              backgroundColor: f === 'V' ? 'var(--positive-bg)' : f === 'E' ? 'var(--surface-panel)' : 'var(--negative-bg)',
                              color: f === 'V' ? 'var(--positive)' : f === 'E' ? 'var(--text-secondary)' : 'var(--negative)'
                            }}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <div>Média Gols Pró: <strong>{analisePartida.forma_recente?.visitante?.media_gp ?? '—'}</strong></div>
                        <div>Média Gols Contra: <strong>{analisePartida.forma_recente?.visitante?.media_gc ?? '—'}</strong></div>
                        <div>Baliza Inviolada: <strong>{analisePartida.forma_recente?.visitante?.clean_sheets_pct != null ? `${analisePartida.forma_recente?.visitante?.clean_sheets_pct}%` : '—'}</strong></div>
                        <div>Over 2.5: <strong>{analisePartida.forma_recente?.visitante?.over_2_5_pct != null ? `${analisePartida.forma_recente?.visitante?.over_2_5_pct}%` : '—'}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ANÁLISE DE GOLS: 1T VS 2T E MINUTAGEM TÍPICA */}
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Distribuição dos Gols por Tempo de Jogo
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
                    <div
                      style={{
                        backgroundColor: 'var(--surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-control)',
                        padding: '12px 14px'
                      }}
                    >
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                        {analisePartida.partida?.mandante}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem' }}>
                        <div>1º Tempo: <strong className="font-mono">{analisePartida.analise_gols_tempo?.mandante?.pct_primeiro_tempo != null ? `${analisePartida.analise_gols_tempo?.mandante?.pct_primeiro_tempo}%` : '—'}</strong></div>
                        <div>2º Tempo: <strong className="font-mono" style={{ color: 'var(--accent)' }}>{analisePartida.analise_gols_tempo?.mandante?.pct_segundo_tempo != null ? `${analisePartida.analise_gols_tempo?.mandante?.pct_segundo_tempo}%` : '—'}</strong></div>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: 'var(--surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-control)',
                        padding: '12px 14px'
                      }}
                    >
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                        {analisePartida.partida?.visitante}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem' }}>
                        <div>1º Tempo: <strong className="font-mono">{analisePartida.analise_gols_tempo?.visitante?.pct_primeiro_tempo != null ? `${analisePartida.analise_gols_tempo?.visitante?.pct_primeiro_tempo}%` : '—'}</strong></div>
                        <div>2º Tempo: <strong className="font-mono" style={{ color: 'var(--accent)' }}>{analisePartida.analise_gols_tempo?.visitante?.pct_segundo_tempo != null ? `${analisePartida.analise_gols_tempo?.visitante?.pct_segundo_tempo}%` : '—'}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PERFIL DO ÁRBITRO E CARTÕES */}
                {analisePartida.arbitro && (
                  <div
                    style={{
                      backgroundColor: 'var(--surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-control)',
                      padding: '14px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Árbitro Escalado &bull; Índice de Agressividade
                      </div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {analisePartida.arbitro.nome}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        Perfil: <strong>{analisePartida.arbitro.perfil || 'Equilibrado'}</strong> ({analisePartida.arbitro.jogos ?? 0} jogos catalogados)
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Média Cartões</div>
                        <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                          {analisePartida.arbitro.media_cartoes ?? '—'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Prob. Over 4.5</div>
                        <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent)' }}>
                          {analisePartida.arbitro.prob_over_4_5_cartoes != null ? `${analisePartida.arbitro.prob_over_4_5_cartoes}%` : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}


      {/* MODAL CALCULADORA DE KELLY & GESTÃO DE BANCA */}
      <KellyCalculatorModal
        isOpen={kellyModalOpen}
        onClose={() => setKellyModalOpen(false)}
        initialOdd={kellySelectedData.odd}
        initialProb={kellySelectedData.prob}
        initialMarket={kellySelectedData.market}
        initialMatch={kellySelectedData.match}
      />
    </div>
  );
}

