import React, { useState, useEffect } from 'react';
import {
  Shield, Trophy, Calendar, MapPin, User, Award, ArrowLeft,
  DollarSign, TrendingUp, Star, Flame, Zap, LayoutGrid, List,
  ChevronRight, ExternalLink, Activity
} from 'lucide-react';
import ClubBadge from './ClubBadge';
import TrophyGallery3D from './TrophyGallery3D';
import SeloCoberturaClube from './SeloCoberturaClube';

export default function ClubProfileView({ clube, onVoltar, onSelectJogador }) {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('elenco'); // 'elenco' | 'torneios' | 'trofeus' | 'idolos'
  const [visualizacaoElenco, setVisualizacaoElenco] = useState('tabela'); // 'tabela' | 'cards'

  useEffect(() => {
    if (!clube) return;
    let isMounted = true;
    setLoading(true);

    fetch(`/api/clubes/perfil-completo?clube=${encodeURIComponent(clube)}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setPerfil(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar perfil do clube:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [clube]);

  if (loading) {
    return (
      <div 
        className="editorial-panel"
        style={{
          padding: '60px',
          textAlign: 'center',
          backgroundColor: 'var(--surface-panel)',
          borderRadius: 'var(--radius-panel)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-secondary)'
        }}
      >
        <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '12px' }} />
        <h3 className="font-editorial" style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
          Consultando dossiê oficial do {clube}...
        </h3>
        <p style={{ margin: '6px 0 0 0', fontSize: '0.84rem' }}>
          Recuperando dados cadastrais, elenco 2026, comissão técnica e histórico de partidas.
        </p>
      </div>
    );
  }

  if (!perfil || !perfil.info) {
    return (
      <div className="editorial-panel" style={{ padding: '30px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Não foi possível carregar as informações do clube.</p>
        <button onClick={onVoltar} className="btn-touch" style={{ padding: '8px 16px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--accent)', color: '#FFF' }}>
          Voltar à Lista Geral
        </button>
      </div>
    );
  }

  const { info, ranking, comissao_tecnica, elenco, lideres, ultimos_jogos, historico_campeonatos } = perfil;
  const todosAtletas = [
    ...(elenco.goleiros || []),
    ...(elenco.defensores || []),
    ...(elenco.meio_campistas || []),
    ...(elenco.atacantes || [])
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', width: '100%' }}>
      {/* ================= BOTAO VOLTAR & BREADCRUMB ================= */}
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
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
          }}
        >
          <ArrowLeft size={15} style={{ color: 'var(--accent)' }} />
          <span>Voltar à Lista Geral de Clubes</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span 
            className="font-mono"
            style={{
              padding: '4px 10px',
              borderRadius: '12px',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              fontSize: '0.74rem',
              fontWeight: 700
            }}
          >
            #{ranking.posicao || '—'} Power Ranking FutStats
          </span>
          <span
            className="font-mono"
            style={{
              padding: '4px 8px',
              borderRadius: '12px',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.72rem'
            }}
          >
            {ranking.pontos || 0} pts ponderados
          </span>
        </div>
      </div>

      {/* ================= HERO CARD DO CLUBE (ESTILO OGOL) ================= */}
      <div
        className="editorial-panel"
        style={{
          padding: '26px',
          backgroundColor: 'var(--surface-panel)',
          borderRadius: 'var(--radius-panel)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-editorial)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          {/* Escudo + Título + Fundação */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div 
              style={{ 
                width: '74px', 
                height: '74px', 
                borderRadius: '14px', 
                backgroundColor: 'var(--surface-card)', 
                border: '1px solid var(--border-subtle)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            >
              <ClubBadge team={info.nome} size={58} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <span 
                  style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.04em',
                    color: 'var(--accent)'
                  }}
                >
                  Perfil Oficial do Clube • {info.estado}
                </span>
                {info.alcunhas && (
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    • {info.alcunhas}
                  </span>
                )}
              </div>

              <h1 
                className="font-editorial"
                style={{
                  margin: 0,
                  fontSize: '2.1rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)'
                }}
              >
                {info.nome}
              </h1>

              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {info.nome_oficial}
              </div>
              <div style={{ marginTop: '8px' }}>
                <SeloCoberturaClube coberturaPct={info.cobertura_pct || (info.fundacao ? 100 : 70)} />
              </div>
            </div>
          </div>

          {/* Valor de Mercado Consolidado */}
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'right',
              minWidth: '170px'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: 600 }}>
              Valor Estimado do Elenco
            </div>
            <div className="font-mono" style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--accent)', marginTop: '2px' }}>
              € {info.valor_elenco_milhoes_eur ? info.valor_elenco_milhoes_eur.toFixed(1) : '—'} M
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              ~ R$ {((info.valor_elenco_milhoes_eur || 0) * 6.10).toFixed(0)} milhões
            </div>
          </div>
        </div>

        {/* Barra de Fatos Rápidos / Informações Cadastrais */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '16px'
          }}
        >
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Fundação</span>
            <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {info.fundacao || '—'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Estádio Oficial</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {info.estadio_nome || '—'}
            </span>
            {info.estadio_capacidade && (
              <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: '4px' }}>
                ({info.estadio_capacidade.toLocaleString('pt-BR')} lug.)
              </span>
            )}
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Presidente</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {info.presidente || '—'}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Comandante Técnico</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>
              {comissao_tecnica.nome || info.treinador_atual || '—'}
            </span>
            {comissao_tecnica.esquema_preferido && (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>
                {comissao_tecnica.esquema_preferido} • {comissao_tecnica.aproveitamento_pct}% aprov.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ================= ABAS DO PERFIL DO CLUBE ================= */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '8px',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'elenco', label: 'Elenco 2026 & Líderes', icon: User, count: todosAtletas.length },
            { id: 'torneios', label: 'Desempenho por Torneios', icon: Activity, count: historico_campeonatos.length },
            { id: 'trofeus', label: 'Sala de Troféus (Réplicas 3D)', icon: Trophy, count: perfil.trofeus?.length || 0 },
            { id: 'idolos', label: 'Grandes Ídolos & Lendas', icon: Award, count: info.idolos_historicos?.length || 0 }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="touch-tactile"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid',
                  borderColor: isSelected ? 'var(--accent)' : 'var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--accent)' : 'var(--surface-raised)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span 
                    className="font-mono"
                    style={{
                      fontSize: '0.68rem',
                      padding: '1px 5px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--border-subtle)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-primary)'
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Seletor de Visualização do Elenco (Cards vs Tabela) */}
        {activeTab === 'elenco' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--surface-card)', padding: '3px', borderRadius: 'var(--radius-control)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setVisualizacaoElenco('tabela')}
              title="Visualização em Tabela Técnica"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '0.72rem',
                fontWeight: visualizacaoElenco === 'tabela' ? 700 : 500,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: visualizacaoElenco === 'tabela' ? 'var(--accent)' : 'transparent',
                color: visualizacaoElenco === 'tabela' ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <List size={13} />
              <span>Tabela</span>
            </button>
            <button
              onClick={() => setVisualizacaoElenco('cards')}
              title="Visualização em Cards por Posição"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '0.72rem',
                fontWeight: visualizacaoElenco === 'cards' ? 700 : 500,
                borderRadius: '4px',
                border: 'none',
                backgroundColor: visualizacaoElenco === 'cards' ? 'var(--accent)' : 'transparent',
                color: visualizacaoElenco === 'cards' ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <LayoutGrid size={13} />
              <span>Cards</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= CONTEUDO DA ABA 1: ELENCO & LÍDERES ================= */}
      {activeTab === 'elenco' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Bloco 1: Líderes Estatísticos da Temporada */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={15} style={{ color: 'var(--accent)' }} />
              <h3 className="font-editorial" style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                Destaques Individuais na Temporada 2026
              </h3>
            </div>

            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', 
                gap: '12px' 
              }}
            >
              {/* Artilheiro */}
              <div 
                className="editorial-panel" 
                style={{ 
                  padding: '14px', 
                  backgroundColor: 'var(--surface-card)',
                  cursor: lideres.artilheiro ? 'pointer' : 'default',
                  border: '1px solid var(--border-subtle)'
                }}
                onClick={() => lideres.artilheiro && onSelectJogador && onSelectJogador(lideres.artilheiro.atleta, lideres.artilheiro.id_jogador)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                    Artilheiro
                  </span>
                  <Award size={14} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lideres.artilheiro?.atleta || '—'}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                  <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {lideres.artilheiro?.gols ?? 0}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>gols marcados</span>
                </div>
              </div>

              {/* Garçom */}
              <div 
                className="editorial-panel" 
                style={{ 
                  padding: '14px', 
                  backgroundColor: 'var(--surface-card)',
                  cursor: lideres.assistencias ? 'pointer' : 'default',
                  border: '1px solid var(--border-subtle)'
                }}
                onClick={() => lideres.assistencias && onSelectJogador && onSelectJogador(lideres.assistencias.atleta, lideres.assistencias.id_jogador)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                    Líder em Assistências
                  </span>
                  <Zap size={14} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lideres.assistencias?.atleta || '—'}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                  <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {lideres.assistencias?.assistencias ?? 0}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>passes p/ gol</span>
                </div>
              </div>

              {/* Melhor Nota */}
              <div 
                className="editorial-panel" 
                style={{ 
                  padding: '14px', 
                  backgroundColor: 'var(--surface-card)',
                  cursor: lideres.melhor_nota ? 'pointer' : 'default',
                  border: '1px solid var(--border-subtle)'
                }}
                onClick={() => lideres.melhor_nota && onSelectJogador && onSelectJogador(lideres.melhor_nota.atleta, lideres.melhor_nota.id_jogador)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                    Maior Nota Média
                  </span>
                  <Star size={14} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lideres.melhor_nota?.atleta || '—'}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                  <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {lideres.melhor_nota?.nota_media ? Number(lideres.melhor_nota.nota_media).toFixed(2) : '—'}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>avaliação SofaScore</span>
                </div>
              </div>

              {/* Mais Desarmes */}
              <div 
                className="editorial-panel" 
                style={{ 
                  padding: '14px', 
                  backgroundColor: 'var(--surface-card)',
                  cursor: lideres.desarmes ? 'pointer' : 'default',
                  border: '1px solid var(--border-subtle)'
                }}
                onClick={() => lideres.desarmes && onSelectJogador && onSelectJogador(lideres.desarmes.atleta, lideres.desarmes.id_jogador)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                    Líder em Desarmes
                  </span>
                  <Shield size={14} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lideres.desarmes?.atleta || '—'}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                  <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {lideres.desarmes?.desarmes_ganhos ?? 0}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>recuperações de bola</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bloco 2: Forma Recente (Últimos Jogos) */}
          {ultimos_jogos && ultimos_jogos.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                Forma Recente (Últimos {ultimos_jogos.length} confrontos oficiais)
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {ultimos_jogos.map((j, jIdx) => {
                  const bg = j.resultado === 'V' ? '#2e7d32' : j.resultado === 'E' ? '#ed6c02' : '#d32f2f';
                  return (
                    <div
                      key={jIdx}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: 'var(--surface-card)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      title={`${j.data} • ${j.campeonato} • ${j.mando}: ${j.placar} vs ${j.adversario}`}
                    >
                      <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          backgroundColor: bg,
                          color: '#FFFFFF',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {j.resultado}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.74rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{j.placar}</span>
                        <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{j.adversario}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bloco 3: O Elenco Completo (Tabela ou Cards) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="font-editorial" style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                Plantel de Atletas ({todosAtletas.length} jogadores registrados)
              </h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Clique no jogador para abrir sua página e dossiê completo
              </span>
            </div>

            {visualizacaoElenco === 'tabela' ? (
              /* TABELA TÉCNICA */
              <div
                style={{
                  width: '100%',
                  overflowX: 'auto',
                  backgroundColor: 'var(--surface-card)',
                  borderRadius: 'var(--radius-panel)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-editorial)'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-raised)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 600 }}>Atleta</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Posição</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>Jogos</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>Minutos</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>Gols</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>Assist.</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>Nota</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>Valor de Mercado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todosAtletas.map((at, idx) => (
                      <tr
                        key={idx}
                        onClick={() => onSelectJogador && onSelectJogador(at.atleta, at.id_jogador)}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'background-color 0.12s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-raised)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <td style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{at.atleta}</span>
                          <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                          <span 
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: 'var(--surface-raised)',
                              fontSize: '0.72rem',
                              fontWeight: 600
                            }}
                          >
                            {at.posicao || '—'}
                          </span>
                        </td>
                        <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center' }}>{at.jogos || 0}</td>
                        <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>{at.minutos || 0}'</td>
                        <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700, color: at.gols > 0 ? 'var(--accent)' : 'inherit' }}>
                          {at.gols || 0}
                        </td>
                        <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center' }}>{at.assistencias || 0}</td>
                        <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>
                          {at.nota_media ? Number(at.nota_media).toFixed(2) : '—'}
                        </td>
                        <td className="font-mono" style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                          € {(at.valor_eur ? (at.valor_eur / 1_000_000).toFixed(1) : '1.2')} M
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* CARDS COMPACTOS SETORIZADOS */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {[
                  { titulo: 'Goleiros', lista: elenco.goleiros },
                  { titulo: 'Defensores (Zagueiros & Laterais)', lista: elenco.defensores },
                  { titulo: 'Meio-Campistas & Volantes', lista: elenco.meio_campistas },
                  { titulo: 'Atacantes & Pontas', lista: elenco.atacantes }
                ].map((setor, sIdx) => {
                  if (!setor.lista || setor.lista.length === 0) return null;
                  return (
                    <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {setor.titulo} ({setor.lista.length})
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '10px' }}>
                        {setor.lista.map((at, atIdx) => (
                          <div
                            key={atIdx}
                            onClick={() => onSelectJogador && onSelectJogador(at.atleta, at.id_jogador)}
                            className="touch-tactile"
                            style={{
                              padding: '12px',
                              backgroundColor: 'var(--surface-card)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-control)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '8px',
                              transition: 'transform 0.15s ease, border-color 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.borderColor = 'var(--accent)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.borderColor = 'var(--border-subtle)';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                                {at.atleta}
                              </span>
                              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                              <span>{at.posicao}</span>
                              <span className="font-mono">€ {at.valor_eur ? (at.valor_eur / 1_000_000).toFixed(1) : '1.2'} M</span>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                              <span>{at.jogos || 0} jogos ({at.minutos || 0}')</span>
                              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
                                {at.gols || 0}G • {at.assistencias || 0}A
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= CONTEUDO DA ABA 2: DESEMPENHO POR TORNEIOS ================= */}
      {activeTab === 'torneios' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h3 className="font-editorial" style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              Campanhas em Torneios (Atuais & Passados)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Retrospecto consolidado extraído de 115.000+ partidas oficiais disputadas pelo {info.nome}.
            </p>
          </div>

          <div
            style={{
              width: '100%',
              overflowX: 'auto',
              backgroundColor: 'var(--surface-card)',
              borderRadius: 'var(--radius-panel)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-editorial)'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-raised)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>Ano</th>
                  <th style={{ padding: '10px 12px', fontWeight: 600 }}>Competição</th>
                  <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>Jogos</th>
                  <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>Vitórias</th>
                  <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>Empates</th>
                  <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>Derrotas</th>
                  <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>GP</th>
                  <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>GC</th>
                  <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>SG</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>Aprov. %</th>
                </tr>
              </thead>
              <tbody>
                {historico_campeonatos.map((h, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="font-mono" style={{ padding: '10px 14px', fontWeight: 700 }}>{h.ano}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{h.campeonato}</td>
                    <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center' }}>{h.jogos}</td>
                    <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center', color: '#2e7d32', fontWeight: 600 }}>{h.vitorias}</td>
                    <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center', color: '#ed6c02' }}>{h.empates}</td>
                    <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center', color: '#d32f2f' }}>{h.derrotas}</td>
                    <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center' }}>{h.gols_pro}</td>
                    <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center' }}>{h.gols_contra}</td>
                    <td className="font-mono" style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700, color: h.saldo > 0 ? '#2e7d32' : h.saldo < 0 ? '#d32f2f' : 'inherit' }}>
                      {h.saldo > 0 ? `+${h.saldo}` : h.saldo}
                    </td>
                    <td className="font-mono" style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: 'var(--accent)' }}>
                      {h.aproveitamento}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= CONTEUDO DA ABA 3: SALA DE TROFÉUS (3D) ================= */}
      {activeTab === 'trofeus' && (
        <div style={{ width: '100%' }}>
          <TrophyGallery3D clube={info.nome} />
        </div>
      )}

      {/* ================= CONTEUDO DA ABA 4: ÍDOLOS HISTÓRICOS ================= */}
      {activeTab === 'idolos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h3 className="font-editorial" style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
              Galeria de Grandes Ídolos & Lendas Eternas
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Jogadores históricos que marcaram época e conquistaram as maiores glórias pelo {info.nome}.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '14px'
            }}
          >
            {(info.idolos_historicos || []).map((idolo, idx) => (
              <div
                key={idx}
                className="editorial-panel"
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--surface-card)',
                  borderRadius: 'var(--radius-panel)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                    {idolo.posicao}
                  </span>
                  <Award size={15} style={{ color: 'var(--accent)' }} />
                </div>

                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {idolo.nome}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={13} style={{ color: 'var(--text-muted)' }} />
                  <span>{idolo.periodo}</span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                  <span>{idolo.jogos} partidas</span>
                  <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {idolo.gols} gols
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
