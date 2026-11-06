import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy, TrendingUp, Target, Shield, Crosshair, ArrowRight,
  ChevronLeft, ChevronRight, Activity, Users, Award, Sparkles, Filter,
  Calendar, Flame, BarChart3, Check
} from 'lucide-react';

const COMPETICOES_DESTAQUE = [
  "Campeonato Brasileiro Série A",
  "Campeonato Brasileiro Série B",
  "Copa Libertadores",
  "Copa do Brasil",
  "Campeonato Paulista",
  "Campeonato Carioca",
  "Copa Sul-Americana",
  "Campeonato Gaúcho"
];

export default function CompetitionDetailView({ darkMode }) {
  const [listaCompeticoes, setListaCompeticoes] = useState([]);
  const [loadingLista, setLoadingLista] = useState(true);
  const [competicaoSelecionada, setCompeticaoSelecionada] = useState("Campeonato Brasileiro Série A");
  const [anoSelecionado, setAnoSelecionado] = useState("");
  const [detalheEdicao, setDetalheEdicao] = useState(null);
  const [loadingEdicao, setLoadingEdicao] = useState(false);
  const [abaInterna, setAbaInterna] = useState('classificacao'); // 'classificacao' | 'artilharia' | 'calendario' | 'historico'

  // 1. Carregar lista geral de competições
  useEffect(() => {
    let isMounted = true;
    setLoadingLista(true);
    fetch('/api/competicoes/lista-geral')
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setListaCompeticoes(data.competicoes || []);
          setLoadingLista(false);
        }
      })
      .catch(err => {
        console.error('Falha ao carregar competições:', err);
        if (isMounted) setLoadingLista(false);
      });
    return () => { isMounted = false; };
  }, []);

  // 2. Carregar detalhe da edição
  useEffect(() => {
    if (!competicaoSelecionada) return;
    let isMounted = true;
    setLoadingEdicao(true);

    const url = `/api/competicoes/detalhe-edicao?nome=${encodeURIComponent(competicaoSelecionada)}${anoSelecionado ? `&ano=${anoSelecionado}` : ''}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setDetalheEdicao(data);
          if (data.ano && (!anoSelecionado || anoSelecionado !== String(data.ano))) {
            setAnoSelecionado(String(data.ano));
          }
          setLoadingEdicao(false);
        }
      })
      .catch(err => {
        console.error('Falha ao carregar edição da competição:', err);
        if (isMounted) setLoadingEdicao(false);
      });
    return () => { isMounted = false; };
  }, [competicaoSelecionada, anoSelecionado]);

  const visao = detalheEdicao?.visao_geral || {};
  const classificacao = detalheEdicao?.classificacao || [];
  const artilharia = detalheEdicao?.artilharia || [];
  const partidas = detalheEdicao?.calendario_partidas || [];
  const momentos = detalheEdicao?.momentos_historicos || {};
  const edicoesDisponiveis = detalheEdicao?.edicoes_disponiveis || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* ================= CONTROLES E SELEÇÃO DE EDIÇÃO ================= */}
      <section className="editorial-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              backgroundColor: 'var(--positive-bg)',
              color: 'var(--positive)',
              marginBottom: '10px'
            }}>
              <Trophy size={14} /> Acervo Secular Canônico
            </div>
            <h1 className="font-editorial" style={{
              fontSize: '2rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: '2px 0 6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <Trophy size={28} color="var(--accent)" />
              Página de Competições & Edições Históricas
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '780px', lineHeight: 1.55, margin: 0 }}>
              Classificação oficial calculada diretamente das 115.753 partidas, artilharia por edição, estatísticas coletivas de mando e maiores jogos da história do futebol brasileiro.
            </p>
          </div>
        </div>

        {/* Chips de Competições Rápidas */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
          {COMPETICOES_DESTAQUE.map((comp) => {
            const isAtiva = competicaoSelecionada === comp;
            return (
              <button
                key={comp}
                onClick={() => {
                  setCompeticaoSelecionada(comp);
                  setAnoSelecionado(""); // reseta ano para pegar o mais recente da nova competição
                }}
                className="touch-tactile"
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: isAtiva ? 800 : 600,
                  border: isAtiva ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  backgroundColor: isAtiva ? 'var(--accent)' : 'var(--surface-raised)',
                  color: isAtiva ? '#FFFFFF' : 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {comp}
              </button>
            );
          })}
        </div>

        {/* Seletores: Competição e Temporada */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 320px', minWidth: '260px' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Selecionar Competição:
            </label>
            <select
              value={competicaoSelecionada}
              onChange={(e) => {
                setCompeticaoSelecionada(e.target.value);
                setAnoSelecionado("");
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                fontWeight: 600
              }}
            >
              {listaCompeticoes.map(c => (
                <option key={c.nome} value={c.nome}>
                  {c.nome} ({c.total_partidas} jogos • {c.ano_inicio}–{c.ano_fim})
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: '0 1 180px', minWidth: '140px' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Edição / Ano:
            </label>
            <select
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                fontWeight: 700
              }}
            >
              {edicoesDisponiveis.map(e => (
                <option key={e.ano} value={e.ano}>
                  {e.ano} ({e.jogos} jogos)
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ================= ESTADO DE CARREGAMENTO ================= */}
      {loadingEdicao ? (
        <div className="editorial-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="w-10 h-10 border-4 border-t-transparent border-[#85573B] rounded-full animate-spin mb-4" style={{ margin: '0 auto 16px auto' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Processando súmulas da edição...</div>
          <span style={{ fontSize: '0.84rem' }}>Calculando tabela, artilharia e gols de {competicaoSelecionada} {anoSelecionado}.</span>
        </div>
      ) : (
        <>
          {/* ================= VISÃO GERAL & MÉTRICAS COLETIVAS ================= */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
            <div className="editorial-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Partidas na Edição
              </div>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {visao.total_partidas || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Jogos computados
              </div>
            </div>

            <div className="editorial-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Total de Gols
              </div>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
                {visao.total_gols || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Média: <strong>{visao.media_gols || 0}</strong> por jogo
              </div>
            </div>

            <div className="editorial-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Vitórias Mandante
              </div>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#5A673E', marginTop: '4px' }}>
                {visao.vitorias_mandante_pct || 0}%
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {visao.vitorias_mandante || 0} vitórias em casa
              </div>
            </div>

            <div className="editorial-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Empates
              </div>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                {visao.empates_pct || 0}%
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {visao.empates || 0} igualdades
              </div>
            </div>

            <div className="editorial-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Vitórias Visitante
              </div>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#85573B', marginTop: '4px' }}>
                {visao.vitorias_visitante_pct || 0}%
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {visao.vitorias_visitante || 0} vitórias fora
              </div>
            </div>
          </div>

          {/* ================= ABAS INTERNAS DA COMPETIÇÃO ================= */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            {[
              { id: 'classificacao', label: 'Tabela de Classificação', icon: Trophy },
              { id: 'artilharia', label: 'Artilharia da Edição', icon: Target },
              { id: 'calendario', label: 'Partidas e Resultados', icon: Calendar },
              { id: 'historico', label: 'Momentos Históricos da Competição', icon: Sparkles }
            ].map(aba => {
              const Icon = aba.icon;
              const ativa = abaInterna === aba.id;
              return (
                <button
                  key={aba.id}
                  onClick={() => setAbaInterna(aba.id)}
                  className="touch-tactile"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '0.84rem',
                    fontWeight: ativa ? 800 : 600,
                    backgroundColor: ativa ? 'var(--surface-raised)' : 'transparent',
                    border: ativa ? '1px solid var(--border-subtle)' : '1px solid transparent',
                    color: ativa ? 'var(--text-primary)' : 'var(--text-secondary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={15} color={ativa ? 'var(--accent)' : 'inherit'} />
                  {aba.label}
                </button>
              );
            })}
          </div>

          {/* ================= ABA 1: TABELA DE CLASSIFICAÇÃO ================= */}
          {abaInterna === 'classificacao' && (
            <section className="editorial-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Tabela Oficial • {competicaoSelecionada} {anoSelecionado}
                </h3>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Ordenação: Pts &gt; V &gt; SG &gt; GP
                </span>
              </div>

              {classificacao.length === 0 ? (
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Esta edição não possui formato de tabela de pontos catalogado.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '10px 8px', width: '48px', textAlign: 'center' }}>Pos</th>
                        <th style={{ padding: '10px 12px' }}>Clube</th>
                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>PTS</th>
                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>J</th>
                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>V</th>
                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>E</th>
                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>D</th>
                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>GP</th>
                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>GC</th>
                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>SG</th>
                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classificacao.map((c, idx) => (
                        <tr
                          key={c.clube}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface-raised)'
                          }}
                        >
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 800, color: c.posicao <= 4 ? '#5A673E' : (c.posicao > classificacao.length - 4 ? '#DC2626' : 'var(--text-secondary)') }}>
                            {c.posicao}º
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {c.clube}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 900, color: 'var(--text-primary)' }}>
                            {c.pontos}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center' }}>
                            {c.jogos}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', color: '#5A673E', fontWeight: 700 }}>
                            {c.vitorias}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', color: '#D97706' }}>
                            {c.empates}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', color: '#DC2626' }}>
                            {c.derrotas}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center' }}>
                            {c.gols_pro}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center' }}>
                            {c.gols_contra}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: c.saldo_gols > 0 ? '#5A673E' : (c.saldo_gols < 0 ? '#DC2626' : 'var(--text-muted)') }}>
                            {c.saldo_gols > 0 ? `+${c.saldo_gols}` : c.saldo_gols}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 800 }}>
                            {c.aproveitamento_pct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* ================= ABA 2: ARTILHARIA DA EDIÇÃO ================= */}
          {abaInterna === 'artilharia' && (
            <section className="editorial-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
                Artilharia Oficial da Edição • {competicaoSelecionada} {anoSelecionado}
              </h3>
              {artilharia.length === 0 ? (
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                  Gols individuais da edição sem autoria catalogada ou dados não disponíveis na súmula desta temporada.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  {artilharia.map((art, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: 'var(--surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: idx === 0 ? 'var(--accent)' : 'var(--text-muted)', width: '28px' }}>
                          {idx + 1}º
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                            {art.atleta}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                            {art.clube}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent)' }}>
                          {art.total_gols}
                        </span>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          gols
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ================= ABA 3: CALENDÁRIO DE PARTIDAS ================= */}
          {abaInterna === 'calendario' && (
            <section className="editorial-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
                Calendário de Partidas • {competicaoSelecionada} {anoSelecionado}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {partidas.map(p => (
                  <div
                    key={p.id_partida}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-control)',
                      backgroundColor: 'var(--surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>{p.fase || (p.rodada ? `Rodada ${p.rodada}` : 'Partida')}</span>
                      <span>{p.data || anoSelecionado}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)', flex: 1 }}>
                        {p.mandante}
                      </span>
                      <span className="font-mono" style={{ fontWeight: 900, fontSize: '1.05rem', color: 'var(--text-primary)', padding: '0 10px' }}>
                        {p.placar || `${p.gols_mandante ?? '-'} x ${p.gols_visitante ?? '-'}`}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-secondary)', flex: 1, textAlign: 'right' }}>
                        {p.visitante}
                      </span>
                    </div>
                    {p.estadio && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        📍 {p.estadio}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ================= ABA 4: MOMENTOS HISTÓRICOS DA COMPETIÇÃO ================= */}
          {abaInterna === 'historico' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Maiores Goleadas */}
              <section className="editorial-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flame size={18} color="var(--accent)" /> Maiores Goleadas da História ({competicaoSelecionada})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                  {momentos.maiores_goleadas?.map((g, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 18px',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: 'var(--surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span>Edição de {g.ano}</span>
                        <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Diferença: {g.diferenca_gols} gols</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          {g.mandante}
                        </span>
                        <span className="font-mono" style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--accent)' }}>
                          {g.placar}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          {g.visitante}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Jogos com mais gols */}
              <section className="editorial-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="var(--accent)" /> Partidas com Mais Gols Marcados ({competicaoSelecionada})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                  {momentos.jogos_mais_gols?.map((j, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 18px',
                        borderRadius: 'var(--radius-control)',
                        backgroundColor: 'var(--surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        <span>Edição de {j.ano}</span>
                        <span style={{ fontWeight: 700, color: 'var(--positive)' }}>Total: {j.total_gols} gols</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          {j.mandante}
                        </span>
                        <span className="font-mono" style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--positive)' }}>
                          {j.placar}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          {j.visitante}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
