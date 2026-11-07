import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight, ArrowUpDown,
  Filter, Shield, TrendingUp, Award, Activity, AlertTriangle,
  RotateCcw, ExternalLink
} from 'lucide-react';
import ClubBadge from './ClubBadge';
import ClubDetailView from './ClubDetailView';

export default function EditorialClubes({
  timesAnalise,
  timesLoading,
  timesRecorte,
  setTimesRecorte,
  timesCampeonato,
  setTimesCampeonato,
  timesSearch,
  setTimesSearch,
  onRecarregar,
  onSelectJogador,
  darkMode
}) {
  // Estado para clube selecionado (ID canônico)
  const [selectedClubeId, setSelectedClubeId] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      return id ? parseInt(id, 10) : null;
    } catch {
      return null;
    }
  });

  // Modo de visualização na página geral: 'tabela_oficial' | 'forma_recente'
  const [modoVisualizacao, setModoVisualizacao] = useState('tabela_oficial');

  // Estado da Lista Geral de Clubes (API Canônica)
  const [listaData, setListaData] = useState(null);
  const [listaLoading, setListaLoading] = useState(false);
  const [listaError, setListaError] = useState(null);

  // Filtros e Ordenação da Lista Geral
  const [busca, setBusca] = useState('');
  const [ano, setAno] = useState('2026');
  const [campeonato, setCampeonato] = useState('');
  const [sortBy, setSortBy] = useState('pontos');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Escutar eventos de navegação do browser (popstate / back / forward)
  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        setSelectedClubeId(id ? parseInt(id, 10) : null);
      } catch {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Buscar dados da listagem geral
  const carregarListaGeral = useCallback(async (b, a, c, s, o, p) => {
    setListaLoading(true);
    setListaError(null);
    try {
      const params = new URLSearchParams();
      if (b && b.trim()) params.set('busca', b.trim());
      if (a) params.set('ano', a);
      if (c) params.set('campeonato', c);
      if (s) params.set('sort', s);
      if (o) params.set('order', o);
      params.set('page', p.toString());
      params.set('limit', limit.toString());

      const res = await fetch(`/api/clubes/lista-geral?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Erro na API (${res.status}): Não foi possível obter a listagem de clubes.`);
      }
      const data = await res.json();
      setListaData(data);
    } catch (err) {
      setListaError(err.message || 'Erro ao carregar lista de clubes');
    } finally {
      setListaLoading(false);
    }
  }, [limit]);

  // Carregar quando mudar filtros ou paginação
  useEffect(() => {
    if (modoVisualizacao === 'tabela_oficial' && !selectedClubeId) {
      carregarListaGeral(busca, ano, campeonato, sortBy, sortOrder, page);
    }
  }, [modoVisualizacao, selectedClubeId, busca, ano, campeonato, sortBy, sortOrder, page, carregarListaGeral]);

  // Ao selecionar um clube: atualiza ID e reflete na URL
  const handleSelectClube = (clubeId) => {
    if (!clubeId) return;
    setSelectedClubeId(clubeId);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'clube');
      url.searchParams.set('id', clubeId.toString());
      url.searchParams.set('sub', 'visao-geral');
      window.history.pushState({}, '', url.toString());
    } catch {}
  };

  // Ao voltar da visão de detalhe
  const handleVoltar = () => {
    setSelectedClubeId(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'times');
      url.searchParams.delete('id');
      url.searchParams.delete('sub');
      url.searchParams.delete('ano');
      url.searchParams.delete('camp');
      url.searchParams.delete('mando');
      window.history.pushState({}, '', url.toString());
    } catch {}
  };

  // Alternar ordenação de coluna
  const handleSort = (coluna) => {
    if (sortBy === coluna) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(coluna);
      setSortOrder('desc');
    }
    setPage(1);
  };

  // Se um clube estiver selecionado, renderiza o ClubDetailView
  if (selectedClubeId) {
    return (
      <ClubDetailView
        clubeId={selectedClubeId}
        onVoltar={handleVoltar}
        onSelectJogador={onSelectJogador}
        darkMode={darkMode}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* ================= HEADER EDITORIAL DA PÁGINA GERAL ================= */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Acervo Oficial de Clubes • Arquitetura Canônica 2026
          </div>
          <h1
            className="font-editorial"
            style={{
              fontSize: '2.1rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: '0 0 6px 0'
            }}
          >
            Panorama Geral de Clubes
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '780px', margin: 0, lineHeight: 1.5 }}>
            Consulte o desempenho oficial consolidado com identificação canônica, resolução de apelidos e deduplicação determinística de partidas.
          </p>
        </div>

        {/* Toggle de visualização: Tabela Oficial x Forma Recente */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--surface-raised)', padding: '4px', borderRadius: 'var(--radius-control)', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setModoVisualizacao('tabela_oficial')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-control)',
              fontSize: '0.8rem',
              fontWeight: modoVisualizacao === 'tabela_oficial' ? 700 : 500,
              backgroundColor: modoVisualizacao === 'tabela_oficial' ? 'var(--surface-card)' : 'transparent',
              color: modoVisualizacao === 'tabela_oficial' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: modoVisualizacao === 'tabela_oficial' ? '1px solid var(--border-subtle)' : 'none',
              cursor: 'pointer'
            }}
          >
            📋 Tabela Canônica
          </button>
          <button
            onClick={() => setModoVisualizacao('forma_recente')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-control)',
              fontSize: '0.8rem',
              fontWeight: modoVisualizacao === 'forma_recente' ? 700 : 500,
              backgroundColor: modoVisualizacao === 'forma_recente' ? 'var(--surface-card)' : 'transparent',
              color: modoVisualizacao === 'forma_recente' ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: modoVisualizacao === 'forma_recente' ? '1px solid var(--border-subtle)' : 'none',
              cursor: 'pointer'
            }}
          >
            ⚡ Forma Recente
          </button>
        </div>
      </div>

      {/* ================= SEÇÃO: TABELA CANÔNICA ================= */}
      {modoVisualizacao === 'tabela_oficial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* BARRA DE FILTROS E BUSCA UNIVERSAL */}
          <div
            className="editorial-panel"
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              backgroundColor: 'var(--surface-card)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {/* Campo de Busca Universal */}
            <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '220px' }}>
              <Search
                size={16}
                color="var(--text-secondary)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar clube por nome ou apelido (ex: Furacão, Galo, Mengão)..."
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface-page)',
                  color: 'var(--text-primary)',
                  fontSize: '0.86rem'
                }}
              />
            </div>

            {/* Filtros de Temporada e Torneio */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Ano:</span>
                <select
                  value={ano}
                  onChange={(e) => {
                    setAno(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--surface-page)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem'
                  }}
                >
                  <option value="">Histórico Completo</option>
                  {(listaData?.anos_disponiveis || [2026, 2025, 2024, 2023, 2022, 2021, 2020]).map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Torneio:</span>
                <select
                  value={campeonato}
                  onChange={(e) => {
                    setCampeonato(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--surface-page)',
                    color: 'var(--text-primary)',
                    fontSize: '0.84rem',
                    maxWidth: '220px'
                  }}
                >
                  <option value="">Todas as Competições</option>
                  {(listaData?.campeonatos_disponiveis || [
                    'Brasileirão Série A', 'Copa do Brasil', 'Libertadores', 'Paulista', 'Carioca', 'Mineiro', 'Gaúcho'
                  ]).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Botão Reset */}
              {(busca || campeonato || ano !== '2026') && (
                <button
                  onClick={() => {
                    setBusca('');
                    setAno('2026');
                    setCampeonato('');
                    setPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--surface-raised)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Limpar todos os filtros"
                >
                  <RotateCcw size={14} /> Limpar
                </button>
              )}
            </div>
          </div>

          {/* ESTADO: CARREGANDO */}
          {listaLoading && (
            <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
              <RefreshCw size={28} className="animate-spin" color="var(--accent)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Consultando catálogo oficial e consolidando partidas deduplicadas...
              </div>
            </div>
          )}

          {/* ESTADO: ERRO */}
          {!listaLoading && listaError && (
            <div style={{ padding: '32px 24px', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid #DC2626', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={32} color="#DC2626" />
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Não foi possível carregar a listagem de clubes
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '480px', textAlign: 'center' }}>
                {listaError}
              </div>
              <button
                onClick={() => carregarListaGeral(busca, ano, campeonato, sortBy, sortOrder, page)}
                className="btn-primary"
                style={{ marginTop: '8px', padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} /> Tentar Novamente
              </button>
            </div>
          )}

          {/* ESTADO: VAZIO LEGÍTIMO */}
          {!listaLoading && !listaError && listaData && listaData.clubes?.length === 0 && (
            <div style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
              <Shield size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Nenhum clube encontrado
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 16px' }}>
                {busca
                  ? `Não encontramos registros para o termo "${busca}" nos filtros selecionados.`
                  : 'Nenhum clube disputou partidas com os filtros ativos.'}
              </div>
              <button
                onClick={() => {
                  setBusca('');
                  setAno('');
                  setCampeonato('');
                  setPage(1);
                }}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                Ver todos os clubes do acervo
              </button>
            </div>
          )}

          {/* ESTADO: TABELA DE RESULTADOS */}
          {!listaLoading && !listaError && listaData && listaData.clubes?.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--surface-card)',
                borderRadius: 'var(--radius-card)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden'
              }}
            >
              {/* Barra superior com contador e paginação rápida */}
              <div
                style={{
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <div>
                  Exibindo <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{listaData.clubes.length}</strong> de <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{listaData.total}</strong> clubes catalogados
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Clique no nome do clube para abrir o perfil individual
                </div>
              </div>

              {/* Tabela de Estatísticas */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-raised)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 14px', width: '50px', textAlign: 'center' }}>#</th>
                      <th
                        onClick={() => handleSort('nome')}
                        style={{ padding: '10px 14px', cursor: 'pointer', userSelect: 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Clube</span>
                          <ArrowUpDown size={12} color={sortBy === 'nome' ? 'var(--accent)' : 'var(--text-muted)'} />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('jogos')}
                        style={{ padding: '10px 10px', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <span>J</span>
                          <ArrowUpDown size={12} color={sortBy === 'jogos' ? 'var(--accent)' : 'var(--text-muted)'} />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('vitorias')}
                        style={{ padding: '10px 10px', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <span>V</span>
                          <ArrowUpDown size={12} color={sortBy === 'vitorias' ? 'var(--accent)' : 'var(--text-muted)'} />
                        </div>
                      </th>
                      <th style={{ padding: '10px 10px', textAlign: 'center' }}>E</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center' }}>D</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center' }}>GP</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center' }}>GC</th>
                      <th
                        onClick={() => handleSort('saldo_gols')}
                        style={{ padding: '10px 10px', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <span>SG</span>
                          <ArrowUpDown size={12} color={sortBy === 'saldo_gols' ? 'var(--accent)' : 'var(--text-muted)'} />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('pontos')}
                        style={{ padding: '10px 10px', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <span style={{ fontWeight: 700 }}>Pts</span>
                          <ArrowUpDown size={12} color={sortBy === 'pontos' ? 'var(--accent)' : 'var(--text-muted)'} />
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('aproveitamento')}
                        style={{ padding: '10px 14px', textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          <span style={{ fontWeight: 700 }}>Aprov.</span>
                          <ArrowUpDown size={12} color={sortBy === 'aproveitamento' ? 'var(--accent)' : 'var(--text-muted)'} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaData.clubes.map((c, idx) => {
                      const posicao = (page - 1) * limit + idx + 1;
                      return (
                        <tr
                          key={c.clube_id}
                          onClick={() => handleSelectClube(c.clube_id)}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                            transition: 'background-color 120ms ease'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-raised)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <td className="font-mono" style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {posicao}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <ClubBadge nome={c.nome} size={28} />
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>{c.nome}</span>
                                  {c.sigla && (
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                      ({c.sigla})
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                                  {c.cidade && c.estado ? `${c.cidade} - ${c.estado}` : c.estado || c.cidade || ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="font-mono" style={{ padding: '12px 10px', textAlign: 'center', color: 'var(--text-primary)' }}>
                            {c.jogos}
                          </td>
                          <td className="font-mono" style={{ padding: '12px 10px', textAlign: 'center', color: '#15803D', fontWeight: 600 }}>
                            {c.vitorias}
                          </td>
                          <td className="font-mono" style={{ padding: '12px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {c.empates}
                          </td>
                          <td className="font-mono" style={{ padding: '12px 10px', textAlign: 'center', color: '#DC2626' }}>
                            {c.derrotas}
                          </td>
                          <td className="font-mono" style={{ padding: '12px 10px', textAlign: 'center', color: 'var(--text-primary)' }}>
                            {c.gols_pro}
                          </td>
                          <td className="font-mono" style={{ padding: '12px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {c.gols_contra}
                          </td>
                          <td className="font-mono" style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600, color: c.saldo_gols > 0 ? '#15803D' : (c.saldo_gols < 0 ? '#DC2626' : 'var(--text-secondary)') }}>
                            {c.saldo_gols > 0 ? `+${c.saldo_gols}` : c.saldo_gols}
                          </td>
                          <td className="font-mono" style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 700, color: 'var(--accent)', fontSize: '0.92rem' }}>
                            {c.pontos}
                          </td>
                          <td className="font-mono" style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: (c.aproveitamento ?? c.aproveitamento_pct ?? 0) >= 60 ? '#15803D' : ((c.aproveitamento ?? c.aproveitamento_pct ?? 0) < 35 ? '#DC2626' : 'var(--text-primary)') }}>
                            {(c.aproveitamento ?? c.aproveitamento_pct ?? 0).toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINAÇÃO INFERIOR */}
              <div
                style={{
                  padding: '14px 20px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Página <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{listaData.pagina}</strong> de <strong className="font-mono" style={{ color: 'var(--text-primary)' }}>{listaData.total_paginas}</strong>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={listaData.pagina <= 1}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-control)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--surface-raised)',
                      color: listaData.pagina <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                      fontSize: '0.82rem',
                      cursor: listaData.pagina <= 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>

                  <button
                    onClick={() => setPage(p => Math.min(listaData.total_paginas, p + 1))}
                    disabled={listaData.pagina >= listaData.total_paginas}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-control)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--surface-raised)',
                      color: listaData.pagina >= listaData.total_paginas ? 'var(--text-muted)' : 'var(--text-primary)',
                      fontSize: '0.82rem',
                      cursor: listaData.pagina >= listaData.total_paginas ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Próxima <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= SEÇÃO: MODO SECUNDÁRIO (FORMA RECENTE) ================= */}
      {modoVisualizacao === 'forma_recente' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            className="editorial-panel"
            style={{
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              backgroundColor: 'var(--surface-card)',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Amostra Recente:</span>
              {['5', '10', '20'].map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setTimesRecorte(r);
                    if (onRecarregar) onRecarregar(r, timesCampeonato);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: timesRecorte === r ? 'var(--accent)' : 'var(--surface-raised)',
                    color: timesRecorte === r ? 'var(--accent-foreground)' : 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  Últimos {r} jogos
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Torneio:</span>
              <select
                value={timesCampeonato}
                onChange={e => {
                  setTimesCampeonato(e.target.value);
                  if (onRecarregar) onRecarregar(timesRecorte, e.target.value);
                }}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface-page)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem'
                }}
              >
                <option value="">Todas as Competições</option>
                <option value="Brasileirão Série A">Brasileirão Série A</option>
                <option value="Copa do Brasil">Copa do Brasil</option>
                <option value="Libertadores">Libertadores</option>
                <option value="Paulista">Paulista</option>
                <option value="Carioca">Carioca</option>
              </select>
            </div>
          </div>

          {/* Tabela de Forma Recente */}
          {timesLoading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)' }}>
              <RefreshCw size={28} className="animate-spin" color="var(--accent)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Carregando métricas de forma recente...</div>
            </div>
          ) : (
            <div style={{ backgroundColor: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-raised)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 14px' }}>Clube</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center' }}>Jogos</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center' }}>V-E-D</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center' }}>Gols Pró/Contra</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center' }}>Clean Sheets</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center' }}>BTTS %</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Aproveitamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(timesAnalise || []).map((t, idx) => (
                      <tr
                        key={idx}
                        onClick={() => {
                          if (t.clube_id) handleSelectClube(t.clube_id);
                        }}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          cursor: t.clube_id ? 'pointer' : 'default'
                        }}
                      >
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ClubBadge nome={t.clube || t.nome} size={24} />
                            <strong style={{ color: 'var(--text-primary)' }}>{t.clube || t.nome}</strong>
                          </div>
                        </td>
                        <td className="font-mono" style={{ padding: '12px 10px', textAlign: 'center' }}>{t.jogos ?? 0}</td>
                        <td className="font-mono" style={{ padding: '12px 10px', textAlign: 'center' }}>
                          <span style={{ color: '#15803D' }}>{t.vitorias ?? 0}</span>-<span>{t.empates ?? 0}</span>-<span style={{ color: '#DC2626' }}>{t.derrotas ?? 0}</span>
                        </td>
                        <td className="font-mono" style={{ padding: '12px 10px', textAlign: 'center' }}>
                          {t.gols_pro ?? t.gols_marcados ?? 0} : {t.gols_contra ?? t.gols_sofridos ?? 0}
                        </td>
                        <td className="font-mono" style={{ padding: '12px 10px', textAlign: 'center' }}>
                          {t.clean_sheets_pct != null ? `${t.clean_sheets_pct}%` : '—'}
                        </td>
                        <td className="font-mono" style={{ padding: '12px 10px', textAlign: 'center' }}>
                          {t.btts_pct != null ? `${t.btts_pct}%` : '—'}
                        </td>
                        <td className="font-mono" style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>
                          {t.aproveitamento ?? 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
