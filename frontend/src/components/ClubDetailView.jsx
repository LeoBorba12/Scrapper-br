import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft, Shield, Calendar, MapPin, Trophy, AlertTriangle,
  RefreshCw, ChevronLeft, ChevronRight, Filter, TrendingUp,
  Award, Activity, Users, Flame, Clock, BarChart3, ExternalLink,
  CheckCircle2, Box, Sparkles
} from 'lucide-react';
import ClubBadge from './ClubBadge';

const TrophyGallery3D = React.lazy(() => import('./TrophyGallery3D'));

export default function ClubDetailView({
  clubeId,
  initialSubTab = 'visao-geral',
  onVoltar,
  onSelectJogador,
  onSelectPartida,
  darkMode
}) {
  const [subTab, setSubTab] = useState(initialSubTab); // 'visao-geral' | 'jogos' | 'elenco' | 'estatisticas' | 'historico'
  const [detalhe, setDetalhe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros de Recorte
  const [ano, setAno] = useState('2026');
  const [campeonato, setCampeonato] = useState('');
  const [mando, setMando] = useState('todos');

  // Estado de Jogos (Aba Jogos)
  const [jogosData, setJogosData] = useState(null);
  const [jogosLoading, setJogosLoading] = useState(false);
  const [jogosPage, setJogosPage] = useState(1);

  // Estado de Elenco (Aba Elenco - Fase 2)
  const [elencoData, setElencoData] = useState(null);
  const [elencoLoading, setElencoLoading] = useState(false);
  const [setorFiltro, setSetorFiltro] = useState('todos'); // 'todos' | 'goleiros' | 'defensores' | 'meio_campistas' | 'atacantes'

  // Estado de Estatísticas (Aba Estatísticas - Fase 2)
  const [estatisticasData, setEstatisticasData] = useState(null);
  const [estatisticasLoading, setEstatisticasLoading] = useState(false);

  // Estado de Histórico (Aba Histórico - Fase 2)
  const [historicoData, setHistoricoData] = useState(null);
  const [historicoLoading, setHistoricoLoading] = useState(false);
  const [modoVitrine3D, setModoVitrine3D] = useState(false);
  const [campanhasPage, setCampanhasPage] = useState(1);

  // Sincronizar parâmetros na URL do navegador sem recarregar a página
  const atualizarUrl = useCallback((novoId, novaSubTab, novoAno, novoCamp, novoMando) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'clube');
      url.searchParams.set('id', novoId.toString());
      url.searchParams.set('sub', novaSubTab);
      if (novoAno) url.searchParams.set('ano', novoAno);
      if (novoCamp) url.searchParams.set('camp', novoCamp);
      else url.searchParams.delete('camp');
      if (novoMando && novoMando !== 'todos') url.searchParams.set('mando', novoMando);
      else url.searchParams.delete('mando');
      window.history.pushState({}, '', url.toString());
    } catch (e) {
      // Ignorar caso em ambiente de testes ou SSR
    }
  }, []);

  // Carregar Dados da Visão Geral do Clube
  const carregarDetalhe = useCallback(async (cId, a, c, m) => {
    if (!cId) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (a) params.set('ano', a);
      if (c) params.set('campeonato', c);
      if (m && m !== 'todos') params.set('mando', m);

      const res = await fetch(`/api/clubes/detalhe/${cId}?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Clube canônico #${cId} não encontrado no acervo.`);
        }
        throw new Error(`Erro na API (${res.status}): Não foi possível obter os dados do clube.`);
      }
      const data = await res.json();
      setDetalhe(data);
      if (data.opcoes_filtros?.anos_disponiveis?.length && !data.opcoes_filtros.anos_disponiveis.includes(Number(a))) {
        const maisRecente = data.opcoes_filtros.anos_disponiveis[0].toString();
        setAno(maisRecente);
      }
    } catch (err) {
      setError(err.message || 'Erro ao consultar dados do clube');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar Lista Paginada de Jogos (Aba Jogos)
  const carregarJogos = useCallback(async (cId, a, c, m, p) => {
    if (!cId) return;
    setJogosLoading(true);
    try {
      const params = new URLSearchParams();
      if (a) params.set('ano', a);
      if (c) params.set('campeonato', c);
      if (m && m !== 'todos') params.set('mando', m);
      params.set('page', p.toString());
      params.set('limit', '15');

      const res = await fetch(`/api/clubes/detalhe/${cId}/jogos?${params.toString()}`);
      if (!res.ok) throw new Error(`Falha ao obter jogos (${res.status})`);
      const data = await res.json();
      setJogosData(data);
    } catch (err) {
      console.error('Erro ao carregar jogos do clube:', err);
    } finally {
      setJogosLoading(false);
    }
  }, []);

  // Carregar Elenco (Aba Elenco - Fase 2)
  const carregarElenco = useCallback(async (cId, a, c) => {
    if (!cId) return;
    setElencoLoading(true);
    try {
      const params = new URLSearchParams();
      if (a) params.set('ano', a);
      if (c) params.set('campeonato', c);

      const res = await fetch(`/api/clubes/detalhe/${cId}/elenco?${params.toString()}`);
      if (!res.ok) throw new Error(`Falha ao carregar elenco (${res.status})`);
      const data = await res.json();
      setElencoData(data);
    } catch (err) {
      console.error('Erro ao carregar elenco:', err);
    } finally {
      setElencoLoading(false);
    }
  }, []);

  // Carregar Estatísticas (Aba Estatísticas - Fase 2)
  const carregarEstatisticas = useCallback(async (cId, a, c, m) => {
    if (!cId) return;
    setEstatisticasLoading(true);
    try {
      const params = new URLSearchParams();
      if (a) params.set('ano', a);
      if (c) params.set('campeonato', c);
      if (m && m !== 'todos') params.set('mando', m);

      const res = await fetch(`/api/clubes/detalhe/${cId}/estatisticas?${params.toString()}`);
      if (!res.ok) throw new Error(`Falha ao carregar estatísticas (${res.status})`);
      const data = await res.json();
      setEstatisticasData(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setEstatisticasLoading(false);
    }
  }, []);

  // Carregar Histórico e Títulos (Aba Histórico - Fase 2)
  const carregarHistorico = useCallback(async (cId) => {
    if (!cId) return;
    setHistoricoLoading(true);
    try {
      const res = await fetch(`/api/clubes/detalhe/${cId}/historico`);
      if (!res.ok) throw new Error(`Falha ao carregar histórico (${res.status})`);
      const data = await res.json();
      setHistoricoData(data);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setHistoricoLoading(false);
    }
  }, []);

  // Efeito inicial e quando muda clubeId
  useEffect(() => {
    // Reset dos estados ao trocar de clube para evitar flashes de dados do clube anterior
    setDetalhe(null);
    setJogosData(null);
    setElencoData(null);
    setEstatisticasData(null);
    setHistoricoData(null);
    setJogosPage(1);

    const params = new URLSearchParams(window.location.search);
    const urlAno = params.get('ano') || '2026';
    const urlCamp = params.get('camp') || '';
    const urlMando = params.get('mando') || 'todos';
    const urlSub = params.get('sub') || initialSubTab;

    setAno(urlAno);
    setCampeonato(urlCamp);
    setMando(urlMando);
    setSubTab(urlSub);

    carregarDetalhe(clubeId, urlAno, urlCamp, urlMando);
    atualizarUrl(clubeId, urlSub, urlAno, urlCamp, urlMando);
  }, [clubeId, carregarDetalhe, initialSubTab, atualizarUrl]);

  // Escutar eventos de navegação do browser (popstate / voltar / avançar) para sub-abas e filtros
  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlSub = params.get('sub') || 'visao-geral';
        const urlAno = params.get('ano') || '2026';
        const urlCamp = params.get('camp') || '';
        const urlMando = params.get('mando') || 'todos';
        setSubTab(urlSub);
        setAno(urlAno);
        setCampeonato(urlCamp);
        setMando(urlMando);
      } catch {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Efeito para carregar a aba ativa
  useEffect(() => {
    if (subTab === 'jogos') {
      carregarJogos(clubeId, ano, campeonato, mando, jogosPage);
    } else if (subTab === 'elenco') {
      carregarElenco(clubeId, ano, campeonato);
    } else if (subTab === 'estatisticas') {
      carregarEstatisticas(clubeId, ano, campeonato, mando);
    } else if (subTab === 'historico') {
      carregarHistorico(clubeId);
    }
  }, [clubeId, subTab, ano, campeonato, mando, jogosPage, carregarJogos, carregarElenco, carregarEstatisticas, carregarHistorico]);

  // Handler de troca de aba
  const handleTrocaSubTab = (novaTab) => {
    setSubTab(novaTab);
    atualizarUrl(clubeId, novaTab, ano, campeonato, mando);
    if (novaTab === 'jogos' && !jogosData) {
      carregarJogos(clubeId, ano, campeonato, mando, 1);
    } else if (novaTab === 'elenco' && !elencoData) {
      carregarElenco(clubeId, ano, campeonato);
    } else if (novaTab === 'estatisticas' && !estatisticasData) {
      carregarEstatisticas(clubeId, ano, campeonato, mando);
    } else if (novaTab === 'historico' && !historicoData) {
      carregarHistorico(clubeId);
    }
  };

  // Handler de troca de ano ou campeonato
  const handleFiltroRecorte = (novoAno, novoCamp, novoMando) => {
    setAno(novoAno);
    setCampeonato(novoCamp);
    setMando(novoMando);
    setJogosPage(1);
    atualizarUrl(clubeId, subTab, novoAno, novoCamp, novoMando);
    carregarDetalhe(clubeId, novoAno, novoCamp, novoMando);
    if (subTab === 'jogos') {
      carregarJogos(clubeId, novoAno, novoCamp, novoMando, 1);
    } else if (subTab === 'elenco') {
      carregarElenco(clubeId, novoAno, novoCamp);
    } else if (subTab === 'estatisticas') {
      carregarEstatisticas(clubeId, novoAno, novoCamp, novoMando);
    }
  };

  // Estado de Carregamento Inicial
  if (loading && !detalhe) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
        <RefreshCw size={32} className="animate-spin" color="var(--accent)" style={{ margin: '0 auto 16px' }} />
        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Consultando Dossiê do Clube...
        </div>
        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Consolidando dados canônicos, partidas deduplicadas e métricas oficiais.
        </div>
      </div>
    );
  }

  // Estado de Erro
  if (error && !detalhe) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid #DC2626' }}>
        <AlertTriangle size={36} color="#DC2626" style={{ margin: '0 auto 12px' }} />
        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Não foi possível carregar as informações do clube
        </div>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 16px' }}>
          {error}
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => carregarDetalhe(clubeId, ano, campeonato, mando)}
            className="btn-secondary touch-tactile"
            style={{ padding: '8px 18px', borderRadius: 'var(--radius-control)', cursor: 'pointer' }}
          >
            <RefreshCw size={14} style={{ marginRight: '6px' }} />
            Tentar Novamente
          </button>
          <button
            onClick={onVoltar}
            className="btn-primary touch-tactile"
            style={{ padding: '8px 18px', borderRadius: 'var(--radius-control)', cursor: 'pointer' }}
          >
            Voltar à Lista Geral
          </button>
        </div>
      </div>
    );
  }

  const {
    identificacao,
    cobertura,
    opcoes_filtros,
    resumo_recorte,
    ultimos_resultados,
    artilheiros_recorte,
    atletas_mais_utilizados_recorte,
    metricas_avancadas_preview
  } = detalhe;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
      {/* ================= BARRA DE RETORNO / BREADCRUMB ================= */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <button
          onClick={onVoltar}
          className="touch-tactile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-control)',
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} color="var(--accent)" />
          <span>Voltar à Lista de Clubes</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="font-mono"
            style={{
              padding: '4px 10px',
              borderRadius: '12px',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)'
            }}
          >
            ID Canônico: <strong style={{ color: 'var(--text-primary)' }}>#{identificacao.clube_id}</strong>
          </span>
          {cobertura?.tem_metricas_bed_2026 && (
            <span
              className="font-mono"
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid var(--accent)',
                fontSize: '0.74rem',
                color: 'var(--accent)',
                fontWeight: 700
              }}
            >
              Métricas BED 2026 Ativas
            </span>
          )}
        </div>
      </div>

      {/* ================= CABEÇALHO CANÔNICO DO CLUBE ================= */}
      <div
        className="editorial-panel"
        style={{
          padding: '24px',
          backgroundColor: 'var(--surface-panel)',
          borderRadius: 'var(--radius-panel)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-editorial)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          {/* Escudo Oficial */}
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '14px',
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}
          >
            <ClubBadge nome={identificacao.nome} size={58} />
          </div>

          {/* Dados Centrais */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.04em' }}>
                Perfil Canônico • {identificacao.estado ? `${identificacao.estado} • Brasil` : 'Brasil'}
              </span>
              {identificacao.sigla && (
                <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  [{identificacao.sigla}]
                </span>
              )}
            </div>

            <h1 className="font-editorial" style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {identificacao.nome}
            </h1>

            {identificacao.nome_oficial && identificacao.nome_oficial !== identificacao.nome && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {identificacao.nome_oficial}
              </div>
            )}

            {/* Metadados Institucionais (Tratamento Honesto de Ausências) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {identificacao.cidade && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} color="var(--accent)" />
                  <span>{identificacao.cidade}{identificacao.estado ? ` - ${identificacao.estado}` : ''}</span>
                </div>
              )}
              {identificacao.estadio_nome && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={13} color="var(--accent)" />
                  <span>{identificacao.estadio_nome} {identificacao.estadio_capacidade ? `(${identificacao.estadio_capacidade.toLocaleString('pt-BR')} lug.)` : ''}</span>
                </div>
              )}
              {identificacao.fundacao && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} color="var(--text-muted)" />
                  <span>Fundação: {identificacao.fundacao}</span>
                </div>
              )}
              {identificacao.treinador_atual && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={13} color="var(--text-muted)" />
                  <span>Técnico: <strong>{identificacao.treinador_atual}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Card Resumo do Acervo */}
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'right'
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Acervo Documentado
            </div>
            <div className="font-mono" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {cobertura?.total_jogos_acervo?.toLocaleString('pt-BR') || '0'} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>partidas</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: '2px' }}>
              {cobertura?.ano_min && cobertura?.ano_max ? `Partidas oficiais de ${cobertura.ano_min} a ${cobertura.ano_max}` : 'Partidas catalogadas'}
            </div>
          </div>
        </div>

        {/* ================= BARRA DE ABAS DO CLUBE ================= */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', overflowX: 'auto' }}>
          {[
            { id: 'visao-geral', label: 'Visão Geral', icon: Activity },
            { id: 'jogos', label: 'Jogos', icon: Calendar },
            { id: 'elenco', label: 'Elenco', icon: Users },
            { id: 'estatisticas', label: 'Estatísticas', icon: TrendingUp },
            { id: 'historico', label: 'Histórico & Títulos', icon: Trophy }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTrocaSubTab(tab.id)}
                className="touch-tactile"
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-control)',
                  border: active ? '1px solid var(--accent)' : '1px solid transparent',
                  backgroundColor: active ? 'var(--surface-raised)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={14} color={active ? 'var(--accent)' : 'inherit'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= BARRA DE FILTROS DE RECORTE (TEMPORADA / COMPETIÇÃO / MANDO) ================= */}
      {subTab !== 'historico' && (
        <div
          className="editorial-panel"
          style={{
            padding: '12px 18px',
            backgroundColor: 'var(--surface-panel)',
            borderRadius: 'var(--radius-panel)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Filter size={15} color="var(--accent)" />
            <span style={{ fontWeight: 600 }}>Recorte Ativo:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Seletor de Temporada */}
            <select
              value={ano}
              onChange={(e) => handleFiltroRecorte(e.target.value, campeonato, mando)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--surface-card)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem'
              }}
            >
              <option value="todos">Todos os Anos</option>
              {(opcoes_filtros?.anos_disponiveis || []).map((a) => (
                <option key={a} value={a.toString()}>{a}</option>
              ))}
            </select>

            {/* Seletor de Competição */}
            <select
              value={campeonato}
              onChange={(e) => handleFiltroRecorte(ano, e.target.value, mando)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--surface-card)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                maxWidth: '220px'
              }}
            >
              <option value="">Todas as Competições</option>
              {(opcoes_filtros?.competicoes_disponiveis || []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Seletor de Mando (apenas para jogos e estatísticas) */}
            {(subTab === 'jogos' || subTab === 'visao-geral' || subTab === 'estatisticas') && (
              <select
                value={mando}
                onChange={(e) => handleFiltroRecorte(ano, campeonato, e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem'
                }}
              >
                <option value="todos">Todos os Mandos</option>
                <option value="casa">Apenas Mandante</option>
                <option value="fora">Apenas Visitante</option>
              </select>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 1: VISÃO GERAL (FASE 1)                                              */}
      {/* ========================================================================= */}
      {subTab === 'visao-geral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* CARDS DE KPIS DO RECORTE */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            <div className="soft-card" style={{ padding: '14px', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Jogos</div>
              <div className="font-mono tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {resumo_recorte.jogos}
              </div>
            </div>

            <div className="soft-card" style={{ padding: '14px', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>V - E - D</div>
              <div className="font-mono tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                <span style={{ color: '#15803D' }}>{resumo_recorte.vitorias}</span> - <span>{resumo_recorte.empates}</span> - <span style={{ color: '#DC2626' }}>{resumo_recorte.derrotas}</span>
              </div>
            </div>

            <div className="soft-card" style={{ padding: '14px', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Aproveitamento</div>
              <div className="font-mono tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)', marginTop: '2px' }}>
                {resumo_recorte.aproveitamento_pct}%
              </div>
            </div>

            <div className="soft-card" style={{ padding: '14px', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Gols Pró : Contra</div>
              <div className="font-mono tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {resumo_recorte.gols_pro} : {resumo_recorte.gols_contra}
              </div>
            </div>

            <div className="soft-card" style={{ padding: '14px', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Saldo de Gols</div>
              <div className="font-mono tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: resumo_recorte.saldo_gols > 0 ? '#15803D' : (resumo_recorte.saldo_gols < 0 ? '#DC2626' : 'var(--text-secondary)'), marginTop: '2px' }}>
                {resumo_recorte.saldo_gols > 0 ? `+${resumo_recorte.saldo_gols}` : resumo_recorte.saldo_gols}
              </div>
            </div>

            <div className="soft-card" style={{ padding: '14px', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Clean Sheets</div>
              <div className="font-mono tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0284C7', marginTop: '2px' }}>
                {resumo_recorte.clean_sheets}
              </div>
            </div>
          </div>

          {/* GRID: ÚLTIMOS RESULTADOS & ARTILHEIROS DO RECORTE */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* ÚLTIMOS RESULTADOS DEDUPLICADOS */}
            <div
              className="editorial-panel"
              style={{
                padding: '20px',
                backgroundColor: 'var(--surface-panel)',
                borderRadius: 'var(--radius-panel)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} color="var(--accent)" /> Últimos Jogos no Recorte
                </h3>
                <button
                  onClick={() => handleTrocaSubTab('jogos')}
                  style={{ background: 'none', border: 'none', fontSize: '0.76rem', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Ver Todos ({resumo_recorte.jogos}) &rarr;
                </button>
              </div>

              {ultimos_resultados?.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  Nenhum jogo disputado com os filtros selecionados.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {ultimos_resultados.map((j) => (
                    <div
                      key={j.id_partida}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          className="font-mono"
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            backgroundColor: j.resultado === 'V' ? 'rgba(21, 128, 61, 0.15)' : (j.resultado === 'E' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(220, 38, 38, 0.15)'),
                            color: j.resultado === 'V' ? '#15803D' : (j.resultado === 'E' ? '#CA8A04' : '#DC2626')
                          }}
                        >
                          {j.resultado}
                        </span>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {j.mando === 'casa' ? `vs ${j.adversario_nome}` : `@ ${j.adversario_nome}`}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {j.data} • {j.campeonato} {j.fase ? `• ${j.fase}` : (j.rodada ? `• ${j.rodada}` : '')}
                          </div>
                        </div>
                      </div>

                      <div className="font-mono tabular-nums" style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {j.placar}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ARTILHEIROS DO RECORTE */}
            <div
              className="editorial-panel"
              style={{
                padding: '20px',
                backgroundColor: 'var(--surface-panel)',
                borderRadius: 'var(--radius-panel)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={16} color="var(--accent)" /> Artilheiros no Recorte ({ano})
                </h3>
                <button
                  onClick={() => handleTrocaSubTab('elenco')}
                  style={{ background: 'none', border: 'none', fontSize: '0.76rem', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Ver Elenco Completo &rarr;
                </button>
              </div>

              {artilheiros_recorte?.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  Nenhum gol catalogado no recorte selecionado.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {artilheiros_recorte.map((art, idx) => (
                    <div
                      key={art.atleta}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', width: '18px' }}>
                          #{idx + 1}
                        </span>
                        <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {art.atleta}
                        </span>
                      </div>
                      <div className="font-mono tabular-nums" style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent)' }}>
                        {art.gols} {art.gols === 1 ? 'gol' : 'gols'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ATLETAS MAIS UTILIZADOS NO RECORTE */}
            <div
              className="editorial-panel"
              style={{
                padding: '20px',
                backgroundColor: 'var(--surface-panel)',
                borderRadius: 'var(--radius-panel)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} color="var(--accent)" /> Atletas Mais Utilizados ({ano})
                </h3>
                <button
                  onClick={() => handleTrocaSubTab('elenco')}
                  style={{ background: 'none', border: 'none', fontSize: '0.76rem', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Minutos & Titularidades &rarr;
                </button>
              </div>

              {!Array.isArray(atletas_mais_utilizados_recorte) || atletas_mais_utilizados_recorte.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  Nenhum registro de titularidade no recorte.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {atletas_mais_utilizados_recorte.map((at, idx) => (
                    <div
                      key={at.atleta}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', width: '18px' }}>
                          #{idx + 1}
                        </span>
                        <div
                          onClick={() => {
                            if (at.id_jogador && onSelectJogador) {
                              onSelectJogador(at.atleta, at.id_jogador);
                            }
                          }}
                          style={{
                            cursor: at.id_jogador ? 'pointer' : 'default',
                            fontSize: '0.86rem',
                            fontWeight: 600,
                            color: at.id_jogador ? 'var(--accent)' : 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>{at.atleta}</span>
                          {at.id_jogador && <ExternalLink size={11} />}
                        </div>
                      </div>
                      <div className="font-mono tabular-nums" style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {at.titularidades} {at.titularidades === 1 ? 'titularidade' : 'titularidades'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DESEMPENHO CASA X FORA E MÉDIAS */}
          {resumo_recorte?.desempenho_mando && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div
                className="soft-card"
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'var(--surface-panel)',
                  borderRadius: 'var(--radius-panel)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    🏟️ Desempenho em Casa
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {resumo_recorte.desempenho_mando.casa?.aproveitamento_pct}% aprov.
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  <span>{resumo_recorte.desempenho_mando.casa?.jogos} jogos</span>
                  <span className="font-mono">
                    <strong style={{ color: '#15803D' }}>{resumo_recorte.desempenho_mando.casa?.vitorias}V</strong> - {resumo_recorte.desempenho_mando.casa?.empates}E - <strong style={{ color: '#DC2626' }}>{resumo_recorte.desempenho_mando.casa?.derrotas}D</strong>
                  </span>
                  <span>Gols: {resumo_recorte.desempenho_mando.casa?.gols_pro}:{resumo_recorte.desempenho_mando.casa?.gols_contra}</span>
                </div>
              </div>

              <div
                className="soft-card"
                style={{
                  padding: '16px 20px',
                  backgroundColor: 'var(--surface-panel)',
                  borderRadius: 'var(--radius-panel)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ✈️ Desempenho Fora
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {resumo_recorte.desempenho_mando.fora?.aproveitamento_pct}% aprov.
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  <span>{resumo_recorte.desempenho_mando.fora?.jogos} jogos</span>
                  <span className="font-mono">
                    <strong style={{ color: '#15803D' }}>{resumo_recorte.desempenho_mando.fora?.vitorias}V</strong> - {resumo_recorte.desempenho_mando.fora?.empates}E - <strong style={{ color: '#DC2626' }}>{resumo_recorte.desempenho_mando.fora?.derrotas}D</strong>
                  </span>
                  <span>Gols: {resumo_recorte.desempenho_mando.fora?.gols_pro}:{resumo_recorte.desempenho_mando.fora?.gols_contra}</span>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW DE MÉTRICAS AVANÇADAS BED 2026 */}
          {metricas_avancadas_preview && (
            <div
              className="editorial-panel"
              style={{
                padding: '20px',
                backgroundColor: 'var(--surface-panel)',
                borderRadius: 'var(--radius-panel)',
                border: '1px solid var(--accent)',
                boxShadow: '0 4px 14px rgba(56, 189, 248, 0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="var(--accent)" />
                  <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Métricas Avançadas • Brasileirão em Dados 2026
                  </h3>
                </div>
                <button
                  onClick={() => handleTrocaSubTab('estatisticas')}
                  style={{ background: 'none', border: 'none', fontSize: '0.78rem', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Explorar Scouts Coletivos &rarr;
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>xG Criado</div>
                  <div className="font-mono tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#15803D', marginTop: '2px' }}>
                    {metricas_avancadas_preview.xg?.toFixed(2) || '—'}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>xG Concedido</div>
                  <div className="font-mono tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#DC2626', marginTop: '2px' }}>
                    {metricas_avancadas_preview.xg_contra?.toFixed(2) || '—'}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>xPTS (Pontos Esp.)</div>
                  <div className="font-mono tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent)', marginTop: '2px' }}>
                    {metricas_avancadas_preview.xpts?.toFixed(1) || '—'}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Posse Média</div>
                  <div className="font-mono tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {metricas_avancadas_preview.posse_pct ? `${metricas_avancadas_preview.posse_pct}%` : '—'}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>PPDA (Pressão)</div>
                  <div className="font-mono tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {metricas_avancadas_preview.ppda?.toFixed(1) || '—'}
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Field Tilt</div>
                  <div className="font-mono tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {metricas_avancadas_preview.field_tilt_pct ? `${metricas_avancadas_preview.field_tilt_pct}%` : '—'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: JOGOS (CALENDÁRIO PAGINADO - FASE 1)                               */}
      {/* ========================================================================= */}
      {subTab === 'jogos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {jogosLoading && !jogosData && (
            <div style={{ padding: '48px', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
              <RefreshCw size={28} className="animate-spin" color="var(--accent)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Carregando calendário de partidas...</div>
            </div>
          )}

          {!jogosLoading && jogosData && (
            <div style={{ backgroundColor: 'var(--surface-panel)', borderRadius: 'var(--radius-panel)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <div>Total no recorte: <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{jogosData.total_jogos}</strong> partidas</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Deduplicação determinística ativa</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {jogosData.jogos.map((j) => (
                  <div
                    key={j.id_partida}
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        className="font-mono"
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          backgroundColor: j.is_agendado ? 'var(--surface-raised)' : (j.resultado === 'V' ? 'rgba(21, 128, 61, 0.15)' : (j.resultado === 'E' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(220, 38, 38, 0.15)')),
                          color: j.is_agendado ? 'var(--text-muted)' : (j.resultado === 'V' ? '#15803D' : (j.resultado === 'E' ? '#CA8A04' : '#DC2626'))
                        }}
                      >
                        {j.is_agendado ? '—' : j.resultado}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {j.mando === 'casa' ? `vs ${j.adversario_nome}` : `@ ${j.adversario_nome}`}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {j.data} • {j.campeonato} {j.rodada ? `(Rodada ${j.rodada})` : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div className="font-mono tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {j.placar || 'vs'}
                      </div>
                      {j.duplicatas_associadas?.length > 0 && (
                        <div style={{ fontSize: '0.66rem', color: 'var(--accent)', fontWeight: 600 }}>[duplicata unificada]</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {jogosData.total_pages > 1 && (
                <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    disabled={jogosPage <= 1}
                    onClick={() => setJogosPage(p => Math.max(1, p - 1))}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Anterior
                  </button>
                  <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Pág. {jogosPage} de {jogosData.total_pages}
                  </span>
                  <button
                    disabled={jogosPage >= jogosData.total_pages}
                    onClick={() => setJogosPage(p => Math.min(jogosData.total_pages, p + 1))}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: ELENCO COMPLETO & SÚMULAS REAIS (FASE 2)                           */}
      {/* ========================================================================= */}
      {subTab === 'elenco' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* BARRA DE FILTROS POR SETOR */}
          <div
            className="editorial-panel"
            style={{
              padding: '12px 18px',
              backgroundColor: 'var(--surface-panel)',
              borderRadius: 'var(--radius-panel)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '4px' }}>
                Setores:
              </span>
              {[
                { id: 'todos', label: 'Todos', count: elencoData?.total_atletas },
                { id: 'goleiros', label: 'Goleiros', count: elencoData?.setores?.goleiros?.length },
                { id: 'defensores', label: 'Defensores', count: elencoData?.setores?.defensores?.length },
                { id: 'meio_campistas', label: 'Meio-Campistas', count: elencoData?.setores?.meio_campistas?.length },
                { id: 'atacantes', label: 'Atacantes', count: elencoData?.setores?.atacantes?.length },
                ...(elencoData?.setores?.outros?.length > 0 ? [{ id: 'outros', label: 'Posição a Confirmar', count: elencoData.setores.outros.length }] : [])
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSetorFiltro(s.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-control)',
                    border: setorFiltro === s.id ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                    backgroundColor: setorFiltro === s.id ? 'var(--accent)' : 'var(--surface-raised)',
                    color: setorFiltro === s.id ? 'var(--accent-foreground)' : 'var(--text-primary)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{s.label}</span>
                  {s.count != null && (
                    <span className="font-mono" style={{ fontSize: '0.7rem', opacity: 0.85 }}>
                      ({s.count})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Súmulas registradas em {ano} • {elencoData?.cobertura?.fonte_metricas || 'Súmulas Canônicas'}
            </div>
          </div>

          {/* BANNER DE SEMÂNTICA HONESTA DO ELENCO */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'rgba(56, 189, 248, 0.05)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '0.76rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Critério Metodológico:</strong> <strong>Jogos Atuados</strong> computa partidas com presença física em campo (titulares e substitutos confirmados). Atletas relacionados que permaneceram no <strong>Banco</strong> não são somados aos jogos disputados.
            </div>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Legenda das Posições:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                <span title="Posição confirmada diretamente na súmula tática do ano e competição selecionados" style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#15803D', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                  ● Confirmada no recorte: súmula com setor tático explícito no ano
                </span>
                <span title="Moda estatística de partidas como titular na carreira restrita ao intervalo 2023–2026" style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#1D4ED8', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                  ● Predominante no acervo (2023–2026): função mais frequente como titular na carreira dentro do acervo digitalizado (quando a edição atual usa rótulo genérico 'Titular'/'Substitute')
                </span>
                <span title="Ausência de codificação tática suficiente na súmula" style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(156, 163, 175, 0.15)', color: 'var(--text-muted)', border: '1px solid rgba(156, 163, 175, 0.25)' }}>
                  ● Posição a confirmar: sem detalhamento funcional na súmula
                </span>
                <span title="Posição confirmada por cadastro oficial não contaminado" style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(168, 85, 247, 0.12)', color: '#7E22CE', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
                  ● Cadastro validado: registro cadastral não contaminado
                </span>
              </div>
            </div>
            <div>
              Indicador <strong>—</strong> denota ausência de monitoramento da métrica para a competição (não falseado como zero).
            </div>
          </div>

          {elencoLoading && (
            <div style={{ padding: '60px 24px', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
              <RefreshCw size={28} className="animate-spin" color="var(--accent)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Consultando súmulas oficiais e agregando atletas...</div>
            </div>
          )}

          {!elencoLoading && elencoData && (elencoData.cobertura?.escalacoes_digitalizadas === false || parseInt(ano, 10) < 2023 || elencoData.total_atletas === 0) && (
            <div
              className="editorial-panel"
              style={{
                padding: '36px 24px',
                textAlign: 'center',
                backgroundColor: 'var(--surface-card)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '2rem' }}>📜</div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                Escalações detalhadas não digitalizadas para {ano}
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.5 }}>
                {elencoData.cobertura?.nota_recorte || `O acervo histórico do FutStats preserva fichas de partidas e gols desse período, porém as súmulas digitalizadas com listas individualizadas de atletas e escalações iniciam na temporada de 2023 (cobrindo o intervalo 2023–2026).`}
              </p>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', backgroundColor: 'var(--surface-raised)', padding: '6px 14px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                O elenco deste período não é preenchido com dados anacrônicos ou classificações fictícias.
              </div>
            </div>
          )}

          {!elencoLoading && elencoData && elencoData.total_atletas > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {['goleiros', 'defensores', 'meio_campistas', 'atacantes', 'outros']
                .filter(s => setorFiltro === 'todos' || setorFiltro === s)
                .map((setorKey) => {
                  const listaAtletas = elencoData.setores?.[setorKey] || [];
                  if (listaAtletas.length === 0) return null;

                  const titulosSetores = {
                    goleiros: 'Goleiros',
                    defensores: 'Defensores (Zagueiros e Laterais)',
                    meio_campistas: 'Meio-Campistas (Volantes e Meias)',
                    atacantes: 'Atacantes e Pontas',
                    outros: 'Atletas com Posição em Súmula a Confirmar'
                  };

                  return (
                    <div
                      key={setorKey}
                      style={{
                        backgroundColor: 'var(--surface-panel)',
                        borderRadius: 'var(--radius-panel)',
                        border: '1px solid var(--border-subtle)',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          padding: '12px 18px',
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--surface-raised)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {titulosSetores[setorKey]}
                        </h4>
                        <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          {listaAtletas.length} {listaAtletas.length === 1 ? 'atleta' : 'atletas'}
                        </span>
                      </div>

                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                              <th style={{ padding: '8px 12px', width: '40px', textAlign: 'center' }}>Nº</th>
                              <th style={{ padding: '8px 14px' }}>Atleta</th>
                              <th style={{ padding: '8px 12px' }}>Posição</th>
                              <th style={{ padding: '8px 10px', textAlign: 'center' }} title="Partidas efetivamente disputadas em campo">Jogos Atuados</th>
                              <th style={{ padding: '8px 10px', textAlign: 'center' }} title="Partidas iniciadas como titular">Titular</th>
                              <th style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-muted)' }} title="Relacionado no banco de reservas sem ingressar em campo">Banco</th>
                              <th style={{ padding: '8px 10px', textAlign: 'center', color: '#15803D' }}>Gols</th>
                              <th style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--accent)' }}>Ast</th>
                              <th style={{ padding: '8px 10px', textAlign: 'center' }}>Cartões (A/V)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {listaAtletas.map((a, idx) => (
                              <tr
                                key={idx}
                                style={{
                                  borderBottom: '1px solid var(--border-subtle)',
                                  transition: 'background-color 100ms ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-raised)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                              >
                                <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                  {a.num_camisa ? `#${a.num_camisa}` : '—'}
                                </td>
                                <td style={{ padding: '10px 14px' }}>
                                  <div
                                    onClick={() => {
                                      if (a.id_jogador && onSelectJogador) {
                                        onSelectJogador(a.atleta, a.id_jogador);
                                      }
                                    }}
                                    style={{
                                      cursor: a.id_jogador ? 'pointer' : 'default',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}
                                    title={a.id_jogador ? "Ver dossiê do atleta" : "Atleta sem perfil indexado"}
                                  >
                                    <strong style={{ color: a.id_jogador ? 'var(--accent)' : 'var(--text-primary)' }}>
                                      {a.atleta}
                                    </strong>
                                    {a.apelido && (
                                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                        ({a.apelido})
                                      </span>
                                    )}
                                    {a.id_jogador && <ExternalLink size={11} color="var(--accent)" />}
                                  </div>
                                  {a.nota_participacao && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                      {a.nota_participacao}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: '10px 12px' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{a.posicao}</span>
                                    {a.metodo_posicao === 'posicao_do_recorte' && (
                                      <span style={{
                                        fontSize: '0.62rem',
                                        padding: '1px 5px',
                                        borderRadius: '3px',
                                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                        color: '#15803D',
                                        border: '1px solid rgba(34, 197, 94, 0.25)',
                                        width: 'fit-content',
                                        lineHeight: 1.2
                                      }}>
                                        Confirmada no recorte
                                      </span>
                                    )}
                                    {a.metodo_posicao === 'predominante_em_escalacoes' && (
                                      <span style={{
                                        fontSize: '0.62rem',
                                        padding: '1px 5px',
                                        borderRadius: '3px',
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        color: '#1D4ED8',
                                        border: '1px solid rgba(59, 130, 246, 0.25)',
                                        width: 'fit-content',
                                        lineHeight: 1.2
                                      }}>
                                        Predominante no acervo
                                      </span>
                                    )}
                                    {(a.metodo_posicao === 'posicao_a_confirmar' || !a.metodo_posicao) && (
                                      <span style={{
                                        fontSize: '0.62rem',
                                        padding: '1px 5px',
                                        borderRadius: '3px',
                                        backgroundColor: 'rgba(156, 163, 175, 0.12)',
                                        color: 'var(--text-muted)',
                                        border: '1px solid rgba(156, 163, 175, 0.25)',
                                        width: 'fit-content',
                                        lineHeight: 1.2
                                      }}>
                                        Posição a confirmar
                                      </span>
                                    )}
                                    {a.metodo_posicao === 'cadastro_validado' && (
                                      <span style={{
                                        fontSize: '0.62rem',
                                        padding: '1px 5px',
                                        borderRadius: '3px',
                                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                                        color: '#7E22CE',
                                        border: '1px solid rgba(168, 85, 247, 0.25)',
                                        width: 'fit-content',
                                        lineHeight: 1.2
                                      }}>
                                        Cadastro validado
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>
                                  {a.jogos_disputados != null ? a.jogos_disputados : a.jogos}
                                </td>
                                <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                  {a.titularidades}
                                </td>
                                <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                  {a.reservas}
                                </td>
                                <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700, color: a.gols > 0 ? '#15803D' : 'var(--text-muted)' }}>
                                  {a.gols}
                                </td>
                                <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600, color: a.assistencias != null && a.assistencias > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                                  {a.assistencias != null ? a.assistencias : '—'}
                                </td>
                                <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center', fontSize: '0.76rem' }}>
                                  {a.cartoes_amarelos != null || a.cartoes_vermelhos != null ? (
                                    <span>
                                      {a.cartoes_amarelos > 0 && (
                                        <span style={{ color: '#CA8A04', marginRight: '6px' }}>🟨 {a.cartoes_amarelos}</span>
                                      )}
                                      {a.cartoes_vermelhos > 0 && (
                                        <span style={{ color: '#DC2626' }}>🟥 {a.cartoes_vermelhos}</span>
                                      )}
                                      {(!a.cartoes_amarelos && !a.cartoes_vermelhos) && (
                                        <span style={{ color: 'var(--text-muted)' }}>0</span>
                                      )}
                                    </span>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: ESTATÍSTICAS DETALHADAS & SCOUTS TEMPORAIS (FASE 2)                */}
      {/* ========================================================================= */}
      {subTab === 'estatisticas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {estatisticasLoading && (
            <div style={{ padding: '60px 24px', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
              <RefreshCw size={28} className="animate-spin" color="var(--accent)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Calculando distribuição temporal e scouts...</div>
            </div>
          )}

          {!estatisticasLoading && estatisticasData && (
            <>
              {/* BLOCO 1: MANDOS DE CAMPO (CASA VS FORA) */}
              <div
                className="editorial-panel"
                style={{
                  padding: '20px',
                  backgroundColor: 'var(--surface-panel)',
                  borderRadius: 'var(--radius-panel)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={17} color="var(--accent)" /> Desempenho e Força de Mando
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {/* Mandante */}
                  <div style={{ padding: '16px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803D' }}>EM CASA (MANDANTE)</span>
                      <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {estatisticasData.estatisticas_basicas.desempenho_mando.casa.jogos} jogos
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Gols Marcados</div>
                        <div className="font-mono tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#15803D' }}>
                          {estatisticasData.estatisticas_basicas.desempenho_mando.casa.gols_pro}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Méd: {estatisticasData.estatisticas_basicas.desempenho_mando.casa.media_gols_pro}/jogo
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Gols Sofridos</div>
                        <div className="font-mono tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#DC2626' }}>
                          {estatisticasData.estatisticas_basicas.desempenho_mando.casa.gols_contra}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Méd: {estatisticasData.estatisticas_basicas.desempenho_mando.casa.media_gols_contra}/jogo
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visitante */}
                  <div style={{ padding: '16px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>FORA DE CASA (VISITANTE)</span>
                      <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {estatisticasData.estatisticas_basicas.desempenho_mando.fora.jogos} jogos
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Gols Marcados</div>
                        <div className="font-mono tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#15803D' }}>
                          {estatisticasData.estatisticas_basicas.desempenho_mando.fora.gols_pro}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Méd: {estatisticasData.estatisticas_basicas.desempenho_mando.fora.media_gols_pro}/jogo
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Gols Sofridos</div>
                        <div className="font-mono tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#DC2626' }}>
                          {estatisticasData.estatisticas_basicas.desempenho_mando.fora.gols_contra}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Méd: {estatisticasData.estatisticas_basicas.desempenho_mando.fora.media_gols_contra}/jogo
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOCO 2: DISTRIBUIÇÃO TEMPORAL DE GOLS POR FAIXAS DE 15 MINUTOS */}
              <div
                className="editorial-panel"
                style={{
                  padding: '20px',
                  backgroundColor: 'var(--surface-panel)',
                  borderRadius: 'var(--radius-panel)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={17} color="var(--accent)" /> Distribuição Temporal dos Gols no Recorte
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '10px' }}>
                  {[
                    { key: '0_15', label: "0'–15'" },
                    { key: '16_30', label: "16'–30'" },
                    { key: '31_45', label: "31'–45'" },
                    { key: '46_60', label: "46'–60'" },
                    { key: '61_75', label: "61'–75'" },
                    { key: '76_90', label: "76'–90'" },
                    { key: 'acrescimos', label: "Acrésc." }
                  ].map((f) => {
                    const gp = estatisticasData.estatisticas_basicas.distribuicao_gols_temporais.gols_marcados[f.key] || 0;
                    const gc = estatisticasData.estatisticas_basicas.distribuicao_gols_temporais.gols_sofridos[f.key] || 0;
                    return (
                      <div
                        key={f.key}
                        style={{
                          padding: '12px 8px',
                          backgroundColor: 'var(--surface-card)',
                          borderRadius: 'var(--radius-card)',
                          border: '1px solid var(--border-subtle)',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          {f.label}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                          <span className="font-mono tabular-nums" style={{ fontSize: '1rem', fontWeight: 700, color: '#15803D' }}>
                            {gp}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>:</span>
                          <span className="font-mono tabular-nums" style={{ fontSize: '1rem', fontWeight: 700, color: '#DC2626' }}>
                            {gc}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Pró : Contra
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    marginTop: '14px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-card)',
                    backgroundColor: 'var(--surface-card)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.74rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45
                  }}
                >
                  {(() => {
                    const faixasValidas = ['0_15', '16_30', '31_45', '46_60', '61_75', '76_90', 'acrescimos_1t', 'acrescimos_2t', 'prorrogacao'];
                    const gpDist = estatisticasData.estatisticas_basicas?.distribuicao_gols_temporais?.gols_marcados || {};
                    const gcDist = estatisticasData.estatisticas_basicas?.distribuicao_gols_temporais?.gols_sofridos || {};
                    const gpComMinuto = faixasValidas.reduce((acc, k) => acc + (gpDist[k] || 0), 0);
                    const gcComMinuto = faixasValidas.reduce((acc, k) => acc + (gcDist[k] || 0), 0);
                    const gpTotal = estatisticasData.estatisticas_basicas?.gols_pro ?? 0;
                    const gcTotal = estatisticasData.estatisticas_basicas?.gols_contra ?? 0;

                    return (
                      <>
                        <strong style={{ color: 'var(--text-primary)' }}>ℹ️ Cobertura de Minutos no Recorte:</strong> A distribuição temporal contabiliza os gols de partidas com lance a lance digitalizado ({gpComMinuto} de {gpTotal} gols pró e {gcComMinuto} de {gcTotal} contra). Partidas sem minuto individual catalogado permanecem sem distribuição arbitrária.
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* BLOCO 3: BED 2026 */}
              {estatisticasData.metricas_avancadas_bed && (
                <div
                  className="editorial-panel"
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--surface-panel)',
                    borderRadius: 'var(--radius-panel)',
                    border: '1px solid var(--accent)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="var(--accent)" />
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Scouts Coletivos Avançados • Brasileirão em Dados 2026
                      </h3>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Fonte: {estatisticasData.metricas_avancadas_bed.fonte}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                    <div style={{ padding: '14px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>xG por Partida</div>
                      <div className="font-mono tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#15803D' }}>
                        {(estatisticasData.metricas_avancadas_bed.xg / (estatisticasData.metricas_avancadas_bed.jogos || 1)).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ padding: '14px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>xGA por Partida</div>
                      <div className="font-mono tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#DC2626' }}>
                        {(estatisticasData.metricas_avancadas_bed.xg_contra / (estatisticasData.metricas_avancadas_bed.jogos || 1)).toFixed(2)}
                      </div>
                    </div>
                    <div style={{ padding: '14px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Posse Média</div>
                      <div className="font-mono tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {estatisticasData.metricas_avancadas_bed.posse_pct}%
                      </div>
                    </div>
                    <div style={{ padding: '14px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Intensidade PPDA</div>
                      <div className="font-mono tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent)' }}>
                        {estatisticasData.metricas_avancadas_bed.ppda?.toFixed(1) || '—'}
                      </div>
                    </div>
                    <div style={{ padding: '14px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Linha Defensiva</div>
                      <div className="font-mono tabular-nums" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {estatisticasData.metricas_avancadas_bed.altura_defensiva ? `${estatisticasData.metricas_avancadas_bed.altura_defensiva}m` : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 5: HISTÓRICO, TÍTULOS & ARTILHEIROS NO ACERVO (FASE 2)                */}
      {/* ========================================================================= */}
      {subTab === 'historico' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {historicoLoading && (
            <div style={{ padding: '60px 24px', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
              <RefreshCw size={28} className="animate-spin" color="var(--accent)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Consultando acervo histórico e galeria de títulos...</div>
            </div>
          )}

          {!historicoLoading && historicoData && (
            <>
              {/* VITRINE DE TÍTULOS DOCUMENTADOS */}
              <div
                className="editorial-panel"
                style={{
                  padding: '20px',
                  backgroundColor: 'var(--surface-panel)',
                  borderRadius: 'var(--radius-panel)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={18} color="var(--accent)" />
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Vitrine de Títulos Oficiais ({historicoData.trofeus?.reduce((acc, t) => acc + (t.quantidade || 0), 0) || 0} conquistas)
                    </h3>
                  </div>

                  <button
                    onClick={() => setModoVitrine3D(!modoVitrine3D)}
                    className="touch-tactile"
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-control)',
                      border: '1px solid var(--accent)',
                      backgroundColor: modoVitrine3D ? 'var(--accent)' : 'var(--surface-raised)',
                      color: modoVitrine3D ? 'var(--accent-foreground)' : 'var(--text-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Box size={14} />
                    <span>{modoVitrine3D ? 'Ver Lista de Títulos' : 'Visualizador 3D (WebGL)'}</span>
                  </button>
                </div>

                {modoVitrine3D ? (
                  <React.Suspense fallback={
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: 'var(--accent)' }} />
                      <div style={{ fontSize: '0.85rem' }}>Carregando visualizador 3D...</div>
                    </div>
                  }>
                    <TrophyGallery3D clube={identificacao.nome} />
                  </React.Suspense>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                    {historicoData.trofeus?.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', gridColumn: '1 / -1' }}>
                        Nenhum título documentado na vitrine oficial para esta agremiação.
                      </div>
                    ) : (
                      historicoData.trofeus.map((t, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '14px',
                            backgroundColor: 'var(--surface-card)',
                            borderRadius: 'var(--radius-card)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px'
                          }}
                        >
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(234, 179, 8, 0.12)',
                              border: '1px solid #CA8A04',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <Trophy size={20} color="#CA8A04" />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                              <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                                {t.torneio}
                              </strong>
                              <span className="font-mono tabular-nums" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#CA8A04' }}>
                                {t.quantidade}x
                              </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                              {t.anos_conquistados || 'Anos a confirmar'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* GRID: MAIORES ARTILHEIROS NO ACERVO & ÍDOLOS HISTÓRICOS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {/* MAIORES ARTILHEIROS NO ACERVO */}
                <div
                  className="editorial-panel"
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--surface-panel)',
                    borderRadius: 'var(--radius-panel)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Flame size={17} color="var(--accent)" /> Maiores Artilheiros no Acervo
                    </h3>
                    <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(21, 128, 61, 0.12)', color: '#15803D', fontWeight: 600 }}>
                      Súmulas Digitais (1959–2026)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '14px', backgroundColor: 'var(--surface-raised)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    <div><strong>Origem:</strong> Tabela <code>gols</code> (JOIN <code>partidas</code>) • <strong>Lance a Lance:</strong> Sim</div>
                    <div><strong>Cobertura:</strong> {historicoData?.metadados_artilheiros_acervo?.cobertura_temporal || '1959–2026'} • <strong>Método:</strong> Digitalização de súmulas oficiais</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {historicoData.maiores_artilheiros?.map((art, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-control)',
                          backgroundColor: 'var(--surface-card)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: '20px' }}>
                            #{idx + 1}
                          </span>
                          <div>
                            <div
                              onClick={() => {
                                if (art.id_jogador && onSelectJogador) {
                                  onSelectJogador(art.atleta, art.id_jogador);
                                }
                              }}
                              style={{
                                cursor: art.id_jogador ? 'pointer' : 'default',
                                fontSize: '0.86rem',
                                fontWeight: 600,
                                color: art.id_jogador ? 'var(--accent)' : 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>{art.atleta}</span>
                              {art.id_jogador && <ExternalLink size={11} />}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {art.ano_inicio && art.ano_fim ? `De ${art.ano_inicio} a ${art.ano_fim}` : 'Período catalogado'}
                            </div>
                          </div>
                        </div>

                        <div className="font-mono tabular-nums" style={{ fontSize: '1rem', fontWeight: 700, color: '#15803D' }}>
                          {art.total_gols} {art.total_gols === 1 ? 'gol' : 'gols'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ÍDOLOS HISTÓRICOS CATALOGADOS */}
                <div
                  className="editorial-panel"
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--surface-panel)',
                    borderRadius: 'var(--radius-panel)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={17} color="var(--accent)" /> Ídolos e Lendas Catalogados
                    </h3>
                    <span style={{ fontSize: '0.68rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'rgba(56, 189, 248, 0.12)', color: 'var(--accent)', fontWeight: 600 }}>
                      Registro Histórico em Schema
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '14px', backgroundColor: 'var(--surface-raised)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)', lineHeight: 1.4 }}>
                    <div><strong>Tabela:</strong> <code>clubes_perfil</code> • <strong>Campo:</strong> <code>idolos_historicos_json</code></div>
                    <div><strong>Lance a lance:</strong> Ausente (sem partidas individuais na tabela <code>gols</code>)</div>
                    <div><strong>Data do registro:</strong> {historicoData.metadados_idolos_carreira?.data_importacao || '2026-11-05 21:12:45'} • <strong>Fonte:</strong> Não declarada no schema</div>
                  </div>

                  {historicoData.idolos_historicos?.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                      Nenhum perfil de ídolo catalogado individualmente no momento.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {historicoData.idolos_historicos.map((idolo, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 'var(--radius-control)',
                            backgroundColor: 'var(--surface-card)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                              {idolo.nome}
                            </strong>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                              {idolo.posicao} • {idolo.periodo}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {idolo.jogos ? `${idolo.jogos}j` : ''} {idolo.posicao === 'Goleiro' ? '• 0g' : (idolo.gols != null ? `• ${idolo.gols}g` : '')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* NOTA DE ESCOPO E RECONCILIAÇÃO HISTÓRICA */}
              <div
                style={{
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-card)',
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.76rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <div style={{ fontSize: '1rem', lineHeight: '1' }}>💡</div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Registro de Schema e Metadados Comprovados:</strong> A divergência entre o acervo de 107 gols e a contagem de 155 gols reflete fontes distintas no banco de dados. Os 107 gols estão registrados na tabela <code>gols</code> (com lance a lance e súmula partida a partida). Já o registro de 155 gols está armazenado na tabela <code>clubes_perfil</code> (campo <code>idolos_historicos_json</code>, cobertura 1961–1977, sem lance a lance individual, importado em {historicoData?.metadados_idolos_carreira?.data_importacao || '2026-11-05 21:12:45'}, campo fonte nulo no schema).
                </div>
              </div>

                            {/* CAMPANHAS HISTÓRICAS NO ACERVO */}
              <div
                className="editorial-panel"
                style={{
                  padding: '20px',
                  backgroundColor: 'var(--surface-panel)',
                  borderRadius: 'var(--radius-panel)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={17} color="var(--accent)" /> Campanhas Ano a Ano no Acervo ({historicoData.campanhas_historicas?.length || 0} temporadas)
                  </h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '8px 12px' }}>Temporada</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>J</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>V</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>E</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>D</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>GP</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>GC</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>SG</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>Pts</th>
                        <th style={{ padding: '8px 14px', textAlign: 'right' }}>Aprov.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoData.campanhas_historicas?.slice((campanhasPage - 1) * 15, campanhasPage * 15).map((c) => (
                        <tr
                          key={c.ano}
                          style={{ borderBottom: '1px solid var(--border-subtle)' }}
                        >
                          <td className="font-mono" style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {c.ano}
                          </td>
                          <td className="font-mono" style={{ padding: '8px 10px', textAlign: 'center' }}>{c.jogos}</td>
                          <td className="font-mono" style={{ padding: '8px 10px', textAlign: 'center', color: '#15803D' }}>{c.vitorias}</td>
                          <td className="font-mono" style={{ padding: '8px 10px', textAlign: 'center' }}>{c.empates}</td>
                          <td className="font-mono" style={{ padding: '8px 10px', textAlign: 'center', color: '#DC2626' }}>{c.derrotas}</td>
                          <td className="font-mono" style={{ padding: '8px 10px', textAlign: 'center' }}>{c.gols_pro}</td>
                          <td className="font-mono" style={{ padding: '8px 10px', textAlign: 'center' }}>{c.gols_contra}</td>
                          <td className="font-mono" style={{ padding: '8px 10px', textAlign: 'center', color: c.saldo_gols > 0 ? '#15803D' : (c.saldo_gols < 0 ? '#DC2626' : 'inherit') }}>
                            {c.saldo_gols > 0 ? `+${c.saldo_gols}` : c.saldo_gols}
                          </td>
                          <td className="font-mono" style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>
                            {c.pontos}
                          </td>
                          <td className="font-mono" style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 700 }}>
                            {c.aproveitamento_pct.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginação de Campanhas */}
                {historicoData.campanhas_historicas?.length > 15 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      disabled={campanhasPage <= 1}
                      onClick={() => setCampanhasPage(p => Math.max(1, p - 1))}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      Anterior
                    </button>
                    <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Página {campanhasPage} de {Math.ceil(historicoData.campanhas_historicas.length / 15)}
                    </span>
                    <button
                      disabled={campanhasPage >= Math.ceil(historicoData.campanhas_historicas.length / 15)}
                      onClick={() => setCampanhasPage(p => Math.min(Math.ceil(historicoData.campanhas_historicas.length / 15), p + 1))}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
