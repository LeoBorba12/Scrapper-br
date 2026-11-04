import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, TrendingUp, Target, Shield, Crosshair, ArrowRight, 
  ChevronLeft, ChevronRight, Activity, Users, Award, Sparkles, Filter 
} from 'lucide-react';
import ClubBadge from './ClubBadge';

export default function TournamentStatsView({ darkMode }) {
  const [modoCalculo, setModoCalculo] = useState('total'); // 'total' | 'por_jogo'
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('equipes'); // 'equipes' | 'jogadores'
  const [subAbaJogadores, setSubAbaJogadores] = useState('ataque'); // 'ataque' | 'criacao' | 'defesa' | 'goleiros'

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch('/api/campeonatos/estatisticas-completas?edicao=210277&ano=2026')
      .then(res => res.json())
      .then(json => {
        if (isMounted) {
          setDados(json);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Falha ao carregar estatísticas do campeonato:', err);
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const equipes = dados?.equipes || [];
  const lideres = dados?.lideres || {};

  const rankingChutes = useMemo(() => {
    return [...equipes].sort((a, b) => 
      modoCalculo === 'total' ? (b.chutes_total - a.chutes_total) : (b.chutes_jogo - a.chutes_jogo)
    ).slice(0, 10);
  }, [equipes, modoCalculo]);

  const rankingDefesas = useMemo(() => {
    return [...equipes].sort((a, b) => 
      modoCalculo === 'total' ? (b.defesas_total - a.defesas_total) : (b.defesas_jogo - a.defesas_jogo)
    ).slice(0, 10);
  }, [equipes, modoCalculo]);

  const rankingCruzamentos = useMemo(() => {
    return [...equipes].sort((a, b) => 
      modoCalculo === 'total' ? (b.cruzamentos_certos_total - a.cruzamentos_certos_total) : (b.cruzamentos_certos_jogo - a.cruzamentos_certos_jogo)
    ).slice(0, 10);
  }, [equipes, modoCalculo]);

  const rankingXG = useMemo(() => {
    return [...equipes].sort((a, b) => (b.xg_pro - a.xg_pro)).slice(0, 10);
  }, [equipes]);

  return (
    <div 
      style={{
        maxWidth: 'var(--content-max)',
        margin: '0 auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Header Editorial do Campeonato */}
      <div 
        className="editorial-panel"
        style={{
          padding: '24px 28px',
          backgroundColor: 'var(--surface-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-panel)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--surface-raised)',
              color: 'var(--accent)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}
          >
            <Trophy size={13} />
            <span>Estatísticas Oficiais • Temporada 2026</span>
          </div>

          <h1 
            className="font-editorial"
            style={{
              fontSize: '1.85rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em'
            }}
          >
            Brasileirão Série A 2026
          </h1>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Hub oficial de Scouts e Métricas Avançadas (xG, xGOT, defesas, desarmes e cruzamentos)
            atualizado diariamente às 01:00 AM na VM.
          </p>
        </div>

        {/* Toggle de Modo: Equipes vs Jogadores */}
        <div 
          style={{
            display: 'flex',
            gap: '4px',
            padding: '4px',
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-control)'
          }}
        >
          <button
            onClick={() => setAbaAtiva('equipes')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-control)',
              fontSize: '0.8rem',
              fontWeight: abaAtiva === 'equipes' ? 700 : 500,
              backgroundColor: abaAtiva === 'equipes' ? 'var(--accent)' : 'transparent',
              color: abaAtiva === 'equipes' ? 'var(--accent-foreground)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Estatísticas de Equipes
          </button>
          <button
            onClick={() => setAbaAtiva('jogadores')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-control)',
              fontSize: '0.8rem',
              fontWeight: abaAtiva === 'jogadores' ? 700 : 500,
              backgroundColor: abaAtiva === 'jogadores' ? 'var(--accent)' : 'transparent',
              color: abaAtiva === 'jogadores' ? 'var(--accent-foreground)' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Estatísticas de Jogadores
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Carregando scouts oficiais...
        </div>
      ) : (
        <>
          {/* ================= SEÇÃO DE EQUIPES (Espelho fiel do OGol) ================= */}
          {abaAtiva === 'equipes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '12px'
                }}
              >
                <div>
                  <h2 
                    className="font-editorial"
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: 0
                    }}
                  >
                    ESTATÍSTICAS DE EQUIPAS
                  </h2>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Scouts agregados dos 20 clubes participantes na Série A.
                  </span>
                </div>

                {/* Seletor TOTAL / POR JOGO */}
                <div 
                  style={{
                    display: 'flex',
                    gap: '4px',
                    padding: '3px',
                    backgroundColor: 'var(--surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-control)'
                  }}
                >
                  <button
                    onClick={() => setModoCalculo('total')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-control)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      backgroundColor: modoCalculo === 'total' ? 'var(--surface-card)' : 'transparent',
                      color: modoCalculo === 'total' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      boxShadow: modoCalculo === 'total' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    TOTAL
                  </button>
                  <button
                    onClick={() => setModoCalculo('por_jogo')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-control)',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      backgroundColor: modoCalculo === 'por_jogo' ? 'var(--surface-card)' : 'transparent',
                      color: modoCalculo === 'por_jogo' ? 'var(--text-primary)' : 'var(--text-secondary)',
                      boxShadow: modoCalculo === 'por_jogo' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    POR JOGO
                  </button>
                </div>
              </div>

              {/* Grid de Caixas de Estatísticas de Equipes */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '20px'
                }}
              >
                <CardEquipeRanking
                  titulo="Chutes"
                  subtitulo={modoCalculo === 'total' ? 'Finalizações Totais' : 'Média por Jogo'}
                  dados={rankingChutes}
                  campoValor={modoCalculo === 'total' ? 'chutes_total' : 'chutes_jogo'}
                  unidade=""
                />
                <CardEquipeRanking
                  titulo="Defesas"
                  subtitulo={modoCalculo === 'total' ? 'Intervenções do Goleiro' : 'Média por Jogo'}
                  dados={rankingDefesas}
                  campoValor={modoCalculo === 'total' ? 'defesas_total' : 'defesas_jogo'}
                  unidade=""
                />
                <CardEquipeRanking
                  titulo="Cruzamentos Certos"
                  subtitulo={modoCalculo === 'total' ? 'Bolas na Área Completadas' : 'Média por Jogo'}
                  dados={rankingCruzamentos}
                  campoValor={modoCalculo === 'total' ? 'cruzamentos_certos_total' : 'cruzamentos_certos_jogo'}
                  unidade=""
                />
                <CardEquipeRanking
                  titulo="Gols Esperados (xG)"
                  subtitulo="Qualidade das Chances Produzidas"
                  dados={rankingXG}
                  campoValor="xg_pro"
                  unidade=" xG"
                />
              </div>
            </div>
          )}

          {/* ================= SEÇÃO DE JOGADORES (LÍDERES INDIVIDUAIS) ================= */}
          {abaAtiva === 'jogadores' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '12px'
                }}
              >
                <div>
                  <h2 
                    className="font-editorial"
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      margin: 0
                    }}
                  >
                    LÍDERES ESTATÍSTICOS INDIVIDUAIS
                  </h2>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Rankings consolidados dos 700+ atletas da Série A 2026.
                  </span>
                </div>

                <div 
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    padding: '4px',
                    backgroundColor: 'var(--surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-control)'
                  }}
                >
                  {[
                    { id: 'ataque', label: 'Gols & Finalizações' },
                    { id: 'criacao', label: 'Criação & Passes' },
                    { id: 'defesa', label: 'Desarmes & Intercepções' },
                    { id: 'goleiros', label: 'Goleiros & Defesas' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSubAbaJogadores(tab.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-control)',
                        fontSize: '0.76rem',
                        fontWeight: subAbaJogadores === tab.id ? 700 : 500,
                        backgroundColor: subAbaJogadores === tab.id ? 'var(--accent)' : 'transparent',
                        color: subAbaJogadores === tab.id ? 'var(--accent-foreground)' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid de Líderes Individuais */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px'
                }}
              >
                {subAbaJogadores === 'ataque' && (
                  <>
                    <CardAtletaRanking
                      titulo="Artilharia (Gols)"
                      atletas={lideres.artilheiros || []}
                      campoPrincipal="gols"
                      rotuloPrincipal="Gols"
                      campoSecundario="xg"
                      rotuloSecundario="xG"
                    />
                    <CardAtletaRanking
                      titulo="Gols Esperados (xG)"
                      atletas={lideres.xg || []}
                      campoPrincipal="xg"
                      rotuloPrincipal="xG"
                      campoSecundario="gols"
                      rotuloSecundario="Gols"
                    />
                    <CardAtletaRanking
                      titulo="Chutes Totais"
                      atletas={lideres.chutes || []}
                      campoPrincipal="chutes_totais"
                      rotuloPrincipal="Chutes"
                      campoSecundario="chutes_gol"
                      rotuloSecundario="No Gol"
                    />
                  </>
                )}

                {subAbaJogadores === 'criacao' && (
                  <>
                    <CardAtletaRanking
                      titulo="Assistências"
                      atletas={lideres.assistencias || []}
                      campoPrincipal="assistencias"
                      rotuloPrincipal="Assists"
                      campoSecundario="oportunidades_criadas"
                      rotuloSecundario="Chances"
                    />
                    <CardAtletaRanking
                      titulo="Cruzamentos Certos"
                      atletas={lideres.cruzamentos || []}
                      campoPrincipal="cruzamentos_certos"
                      rotuloPrincipal="Cruzamentos"
                      campoSecundario="assistencias"
                      rotuloSecundario="Assists"
                    />
                    <CardAtletaRanking
                      titulo="Passes Certos"
                      atletas={lideres.passes || []}
                      campoPrincipal="passes_certos"
                      rotuloPrincipal="Passes"
                      campoSecundario="jogos"
                      rotuloSecundario="Jogos"
                    />
                  </>
                )}

                {subAbaJogadores === 'defesa' && (
                  <>
                    <CardAtletaRanking
                      titulo="Desarmes Ganhos"
                      atletas={lideres.desarmes || []}
                      campoPrincipal="desarmes_ganhos"
                      rotuloPrincipal="Desarmes"
                      campoSecundario="interceptacoes"
                      rotuloSecundario="Intercep."
                    />
                    <CardAtletaRanking
                      titulo="Interceptações"
                      atletas={(lideres.desarmes || []).map(a => ({ ...a, val: a.interceptacoes }))}
                      campoPrincipal="interceptacoes"
                      rotuloPrincipal="Intercep."
                      campoSecundario="desarmes_ganhos"
                      rotuloSecundario="Desarmes"
                    />
                  </>
                )}

                {subAbaJogadores === 'goleiros' && (
                  <>
                    <CardAtletaRanking
                      titulo="Defesas Totais"
                      atletas={lideres.defesas || []}
                      campoPrincipal="defesas_totais"
                      rotuloPrincipal="Defesas"
                      campoSecundario="defesas_area"
                      rotuloSecundario="Na Área"
                    />
                    <CardAtletaRanking
                      titulo="Defesas Dentro da Área"
                      atletas={(lideres.defesas || []).map(a => ({ ...a, val: a.defesas_area }))}
                      campoPrincipal="defesas_area"
                      rotuloPrincipal="Na Área"
                      campoSecundario="defesas_totais"
                      rotuloSecundario="Totais"
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Subcomponente de Card de Ranking de Equipes
function CardEquipeRanking({ titulo, subtitulo, dados, campoValor, unidade }) {
  const [expandido, setExpandido] = useState(false);
  const itens = expandido ? dados : dados.slice(0, 5);

  return (
    <div 
      className="editorial-panel"
      style={{
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-panel)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-editorial)',
        boxSizing: 'border-box'
      }}
    >
      <div>
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '8px',
            marginBottom: '12px'
          }}
        >
          <h3 
            className="font-editorial"
            style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}
          >
            {titulo}
          </h3>
          <span 
            className="font-mono"
            style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}
          >
            {subtitulo}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {itens.map((equipe, idx) => {
            const val = equipe[campoValor] ?? 0;
            const formattedVal = typeof val === 'number' && !Number.isInteger(val) ? val.toFixed(2) : val;

            return (
              <div 
                key={equipe.clube + idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: idx === 0 ? 'var(--surface-raised)' : 'transparent',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span 
                    className="font-mono"
                    style={{
                      width: '18px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: idx < 3 ? 'var(--accent)' : 'var(--text-muted)'
                    }}
                  >
                    {idx + 1}
                  </span>
                  <ClubBadge nome={equipe.clube} size={20} />
                  <span 
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: idx === 0 ? 700 : 500,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {equipe.clube}
                  </span>
                </div>

                <span 
                  className="font-mono"
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    flexShrink: 0,
                    marginLeft: '8px'
                  }}
                >
                  {formattedVal}{unidade}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {dados.length > 5 && (
        <button
          onClick={() => setExpandido(!expandido)}
          style={{
            marginTop: '14px',
            paddingTop: '10px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: 'none',
            cursor: 'pointer',
            fontSize: '0.74rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--accent)',
            textAlign: 'center',
            width: '100%'
          }}
        >
          {expandido ? 'Recolher' : 'Ver lista completa'}
        </button>
      )}
    </div>
  );
}

// Subcomponente de Card de Ranking de Atletas
function CardAtletaRanking({ titulo, atletas, campoPrincipal, rotuloPrincipal, campoSecundario, rotuloSecundario }) {
  const [expandido, setExpandido] = useState(false);
  const lista = expandido ? atletas : atletas.slice(0, 5);

  return (
    <div 
      className="editorial-panel"
      style={{
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-panel)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-editorial)',
        boxSizing: 'border-box'
      }}
    >
      <div>
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '8px',
            marginBottom: '12px'
          }}
        >
          <h3 
            className="font-editorial"
            style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}
          >
            {titulo}
          </h3>
          <span 
            className="font-mono"
            style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}
          >
            {rotuloPrincipal}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {lista.map((atleta, idx) => {
            const valPri = atleta[campoPrincipal] ?? 0;
            const valSec = atleta[campoSecundario] ?? 0;
            const formattedPri = typeof valPri === 'number' && !Number.isInteger(valPri) ? valPri.toFixed(2) : valPri;
            const formattedSec = typeof valSec === 'number' && !Number.isInteger(valSec) ? valSec.toFixed(2) : valSec;

            return (
              <div 
                key={atleta.atleta + idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: idx === 0 ? 'var(--surface-raised)' : 'transparent',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span 
                    className="font-mono"
                    style={{
                      width: '18px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: idx < 3 ? 'var(--accent)' : 'var(--text-muted)'
                    }}
                  >
                    {idx + 1}
                  </span>
                  <ClubBadge nome={atleta.clube} size={18} />
                  <div style={{ overflow: 'hidden' }}>
                    <p 
                      style={{
                        margin: 0,
                        fontSize: '0.8rem',
                        fontWeight: idx === 0 ? 700 : 500,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {atleta.atleta}
                    </p>
                    <p 
                      style={{
                        margin: 0,
                        fontSize: '0.68rem',
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {atleta.posicao ? `${atleta.posicao} • ` : ''}{atleta.clube}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                  <div 
                    className="font-mono"
                    style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}
                  >
                    {formattedPri}
                  </div>
                  {rotuloSecundario && (
                    <div 
                      className="font-mono"
                      style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}
                    >
                      {formattedSec} {rotuloSecundario}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {atletas.length > 5 && (
        <button
          onClick={() => setExpandido(!expandido)}
          style={{
            marginTop: '14px',
            paddingTop: '10px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderBottom: 'none',
            cursor: 'pointer',
            fontSize: '0.74rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--accent)',
            textAlign: 'center',
            width: '100%'
          }}
        >
          {expandido ? 'Recolher' : 'Ver lista completa'}
        </button>
      )}
    </div>
  );
}
