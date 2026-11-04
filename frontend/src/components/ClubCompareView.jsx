import React, { useState, useEffect } from 'react';
import {
  Swords, Trophy, Search, RefreshCw, Flame,
  Share2, AlertCircle, BarChart3, Calendar,
  Clock, History, Filter, ShieldCheck, Sparkles, MapPin, Award
} from 'lucide-react';
import ClubBadge from './ClubBadge';
import { baixarCardDueloH2HPNG } from '../utils/cardGenerator';

const CLASSICOS_PREDEFINIDOS = [
  { label: 'Derby Paulista', c1: 'Palmeiras', c2: 'Corinthians', regiao: 'São Paulo' },
  { label: 'Fla-Flu', c1: 'Flamengo', c2: 'Fluminense', regiao: 'Rio de Janeiro' },
  { label: 'Clássico dos Milhões', c1: 'Flamengo', c2: 'Vasco', regiao: 'Rio de Janeiro' },
  { label: 'Gre-Nal', c1: 'Grêmio', c2: 'Internacional', regiao: 'Rio Grande do Sul' },
  { label: 'Majestoso', c1: 'Corinthians', c2: 'São Paulo', regiao: 'São Paulo' },
  { label: 'San-São', c1: 'Santos', c2: 'São Paulo', regiao: 'São Paulo' },
  { label: 'Clássico Mineiro', c1: 'Atlético-MG', c2: 'Cruzeiro', regiao: 'Minas Gerais' },
  { label: 'Ba-Vi', c1: 'Bahia', c2: 'Vitória', regiao: 'Bahia' },
  { label: 'Clássico da Saudade', c1: 'Santos', c2: 'Palmeiras', regiao: 'São Paulo' },
  { label: 'Clássico da Rivalidade', c1: 'Botafogo', c2: 'Flamengo', regiao: 'Rio de Janeiro' }
];

export default function ClubCompareView({
  darkMode,
  clubesList = [],
  clubeInicial1 = 'Palmeiras',
  clubeInicial2 = 'Corinthians'
}) {
  const [clube1, setClube1] = useState(clubeInicial1);
  const [clube2, setClube2] = useState(clubeInicial2);
  const [decada, setDecada] = useState('todas');
  const [campeonato, setCampeonato] = useState('todos');
  const [mando, setMando] = useState('todos');
  const [h2hData, setH2hData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const carregarConfronto = async (
    c1 = clube1,
    c2 = clube2,
    dec = decada,
    camp = campeonato,
    man = mando
  ) => {
    if (!c1 || !c2) return;
    setLoading(true);
    setErro(null);
    try {
      const token = localStorage.getItem('futstats_auth_token');
      const params = new URLSearchParams({
        clube1: c1,
        clube2: c2,
        decada: dec,
        campeonato: camp,
        mando: man
      });

      const res = await fetch(`/api/clubes/comparar?${params.toString()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        throw new Error('Não foi possível carregar os dados do confronto secular.');
      }
      const data = await res.json();
      setH2hData(data);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar retrospecto histórico.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarConfronto(clubeInicial1, clubeInicial2, 'todas', 'todos', 'todos');
  }, []);

  const selecionarClassico = (c1, c2) => {
    setClube1(c1);
    setClube2(c2);
    setDecada('todas');
    setCampeonato('todos');
    setMando('todos');
    carregarConfronto(c1, c2, 'todas', 'todos', 'todos');
  };

  const aplicarFiltroDecada = (novaDecada) => {
    setDecada(novaDecada);
    carregarConfronto(clube1, clube2, novaDecada, campeonato, mando);
  };

  const aplicarFiltroCampeonato = (novoCamp) => {
    setCampeonato(novoCamp);
    carregarConfronto(clube1, clube2, decada, novoCamp, mando);
  };

  const aplicarFiltroMando = (novoMando) => {
    setMando(novoMando);
    carregarConfronto(clube1, clube2, decada, campeonato, novoMando);
  };

  const c1Nome = h2hData?.clube1 || clube1;
  const c2Nome = h2hData?.clube2 || clube2;
  const total = h2hData?.total_jogos || 0;
  const totalGeral = h2hData?.total_jogos_geral || total;
  const vit1 = h2hData?.vitorias_clube1 || 0;
  const vit2 = h2hData?.vitorias_clube2 || 0;
  const emp = h2hData?.empates || 0;
  const gols1 = h2hData?.gols_clube1 || 0;
  const gols2 = h2hData?.gols_clube2 || 0;

  const pctVit1 = total > 0 ? ((vit1 / total) * 100).toFixed(1) : 0;
  const pctVit2 = total > 0 ? ((vit2 / total) * 100).toFixed(1) : 0;
  const pctEmp = total > 0 ? ((emp / total) * 100).toFixed(1) : 0;

  const palmares1 = h2hData?.palmares_clube1;
  const palmares2 = h2hData?.palmares_clube2;
  const projDC = h2hData?.projecao_dixon_coles;
  const artilheiros = h2hData?.artilheiros_confronto || [];
  const linhaTempo = h2hData?.linha_do_tempo;
  const decadasResumo = h2hData?.decadas_resumo || [];
  const efemerides = h2hData?.efemerides_confronto || [];
  const filtrosDisp = h2hData?.filtros_disponiveis || {};
  const fontesLimitacoes = h2hData?.fontes_e_limitacoes;
  const efemerideHoje = efemerides.find(e => e.no_dia_de_hoje);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* ================= HEADER EDITORIAL DO CONFRONTO SECULAR ================= */}
      <section className="editorial-panel" style={{ padding: '28px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '4px', backgroundColor: 'rgba(133, 87, 59, 0.12)', color: 'var(--secondary, #85573B)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              <History size={14} />
              Acervo Histórico Secular • Preservação Oficial
            </div>
            <h1 className="font-editorial" style={{
              fontSize: '2.2rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: '2px 0 6px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Swords size={30} color="var(--secondary, #85573B)" />
              Confronto Direto Secular (H2H)
            </h1>
            <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', maxWidth: '820px', lineHeight: 1.6 }}>
              Retrospecto centenário documentado desde o início do século XX, linha do tempo de decisões históricas, filtros multidimensionais e modelo bivariado Dixon-Coles com incerteza individual calibrada.
            </p>
          </div>

          {h2hData && (
            <button
              onClick={() => baixarCardDueloH2HPNG({
                clube1: c1Nome,
                clube2: c2Nome,
                vitorias1: vit1,
                vitorias2: vit2,
                empates: emp,
                totalJogos: total
              })}
              className="btn-primary touch-tactile"
              style={{ minHeight: '42px', padding: '10px 20px', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              <Share2 size={16} /> Exportar Card Histórico
            </button>
          )}
        </div>

        {/* Chips de Grandes Clássicos Nacionais */}
        <div style={{ marginBottom: '22px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
            🔥 Clássicos Seculares em Destaque
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CLASSICOS_PREDEFINIDOS.map((cl) => {
              const ativo = (clube1.toLowerCase() === cl.c1.toLowerCase() && clube2.toLowerCase() === cl.c2.toLowerCase()) ||
                            (clube1.toLowerCase() === cl.c2.toLowerCase() && clube2.toLowerCase() === cl.c1.toLowerCase());
              return (
                <button
                  key={cl.label}
                  onClick={() => selecionarClassico(cl.c1, cl.c2)}
                  className="touch-tactile"
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: ativo ? '2px solid var(--primary, #5A673E)' : '1px solid var(--border-subtle)',
                    backgroundColor: ativo ? 'var(--primary, #5A673E)' : 'var(--surface-card)',
                    color: ativo ? '#FFFFFF' : 'var(--text-primary)',
                    transition: 'all 0.18s ease'
                  }}
                >
                  {cl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs de Pesquisa de Clubes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Primeiro Clube
            </label>
            <input
              type="text"
              value={clube1}
              onChange={(e) => setClube1(e.target.value)}
              placeholder="Ex: Palmeiras, Flamengo, Grêmio..."
              className="soft-input"
              style={{ minHeight: '42px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Segundo Clube (Rival)
            </label>
            <input
              type="text"
              value={clube2}
              onChange={(e) => setClube2(e.target.value)}
              placeholder="Ex: Corinthians, Fluminense, Vasco..."
              className="soft-input"
              style={{ minHeight: '42px' }}
            />
          </div>

          <div>
            <button
              onClick={() => carregarConfronto(clube1, clube2, decada, campeonato, mando)}
              disabled={loading || !clube1 || !clube2}
              className="btn-primary touch-tactile"
              style={{ width: '100%', minHeight: '42px', opacity: (loading || !clube1 || !clube2) ? 0.6 : 1 }}
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              Consultar Acervo
            </button>
          </div>
        </div>

        {erro && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-control)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#EF4444',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{erro}</span>
          </div>
        )}
      </section>

      {/* ================= BANNER DE EFEMÉRIDE DO DUELO (QUANDO HÁ CONEXÃO NA DATA) ================= */}
      {efemerides && efemerides.length > 0 && (
        <section className="editorial-raised" style={{
          padding: '18px 24px',
          borderLeft: '4px solid var(--secondary, #85573B)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--secondary, #85573B)" />
              <span className="font-editorial" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {efemerideHoje ? 'Neste Dia na História deste Duelo' : 'Efemérides Notáveis Catalogadas no Acervo'}
              </span>
            </div>
            {efemerideHoje && (
              <span className="pill-neutral" style={{ backgroundColor: 'var(--secondary, #85573B)', color: '#FFFFFF', fontWeight: 700, fontSize: '0.72rem' }}>
                ⭐ Duelo Histórico na Mesma Data
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {efemerides.slice(0, 3).map((ef) => (
              <div
                key={ef.id_partida}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: ef.no_dia_de_hoje ? 'rgba(133, 87, 59, 0.08)' : 'var(--surface-card)',
                  border: ef.no_dia_de_hoje ? '1px solid var(--secondary, #85573B)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  <span className="font-mono">{ef.data || ef.ano}</span>
                  <span style={{ fontWeight: 600 }}>{ef.campeonato}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{ef.mandante} x {ef.visitante}</span>
                  <span className="font-mono tabular-nums" style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--secondary, #85573B)' }}>
                    {ef.placar}
                  </span>
                </div>
                {ef.fase && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Fase: {ef.fase}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= CONTEÚDO PRINCIPAL DO H2H ================= */}
      {h2hData && (
        <>
          {/* ================= BARRA DE FILTROS MULTIDIMENSIONAIS ================= */}
          <section className="soft-card" style={{ padding: '18px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Filter size={18} color="var(--primary, #5A673E)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
                Filtros Multidimensionais do Acervo
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                ({total} de {totalGeral} partidas no recorte atual)
              </span>
            </div>

            {/* Linha 1: Década */}
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Filtrar por Década:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button
                  onClick={() => aplicarFiltroDecada('todas')}
                  className="touch-tactile"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: decada === 'todas' ? '2px solid var(--primary, #5A673E)' : '1px solid var(--border-subtle)',
                    backgroundColor: decada === 'todas' ? 'var(--primary, #5A673E)' : 'var(--surface-raised)',
                    color: decada === 'todas' ? '#FFFFFF' : 'var(--text-primary)'
                  }}
                >
                  Todas as Décadas
                </button>
                {(filtrosDisp.decadas || []).map((d) => (
                  <button
                    key={d}
                    onClick={() => aplicarFiltroDecada(d)}
                    className="touch-tactile"
                    style={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: decada === d ? '2px solid var(--primary, #5A673E)' : '1px solid var(--border-subtle)',
                      backgroundColor: decada === d ? 'var(--primary, #5A673E)' : 'var(--surface-raised)',
                      color: decada === d ? '#FFFFFF' : 'var(--text-primary)'
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Linha 2: Competição e Mando */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Competição:
                </label>
                <select
                  value={campeonato}
                  onChange={(e) => aplicarFiltroCampeonato(e.target.value)}
                  className="soft-input"
                  style={{ minHeight: '38px', fontSize: '0.8rem' }}
                >
                  <option value="todos">Todos os Campeonatos</option>
                  {(filtrosDisp.campeonatos || []).map((cp) => (
                    <option key={cp} value={cp}>{cp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Mando de Campo:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => aplicarFiltroMando('todos')}
                    className="touch-tactile"
                    style={{
                      flex: 1,
                      minHeight: '38px',
                      borderRadius: '4px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      border: mando === 'todos' ? '2px solid var(--primary, #5A673E)' : '1px solid var(--border-subtle)',
                      backgroundColor: mando === 'todos' ? 'var(--primary, #5A673E)' : 'var(--surface-raised)',
                      color: mando === 'todos' ? '#FFFFFF' : 'var(--text-primary)'
                    }}
                  >
                    Geral
                  </button>
                  <button
                    onClick={() => aplicarFiltroMando('c1')}
                    className="touch-tactile"
                    style={{
                      flex: 1,
                      minHeight: '38px',
                      borderRadius: '4px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      border: mando === 'c1' ? '2px solid var(--primary, #5A673E)' : '1px solid var(--border-subtle)',
                      backgroundColor: mando === 'c1' ? 'var(--primary, #5A673E)' : 'var(--surface-raised)',
                      color: mando === 'c1' ? '#FFFFFF' : 'var(--text-primary)'
                    }}
                  >
                    Mando {c1Nome}
                  </button>
                  <button
                    onClick={() => aplicarFiltroMando('c2')}
                    className="touch-tactile"
                    style={{
                      flex: 1,
                      minHeight: '38px',
                      borderRadius: '4px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      border: mando === 'c2' ? '2px solid var(--primary, #5A673E)' : '1px solid var(--border-subtle)',
                      backgroundColor: mando === 'c2' ? 'var(--primary, #5A673E)' : 'var(--surface-raised)',
                      color: mando === 'c2' ? '#FFFFFF' : 'var(--text-primary)'
                    }}
                  >
                    Mando {c2Nome}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ================= RETROSPECTO GERAL DO RECORTE ================= */}
          <section className="soft-card" style={{ padding: '28px 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                Balanço do Confronto no Recorte
              </span>
              <h2 className="font-editorial tabular-nums" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                {total} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-secondary)' }}>partidas documentadas</span>
              </h2>
              {h2hData.tabu_invicto && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '8px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(90, 103, 62, 0.12)',
                  color: 'var(--primary, #5A673E)',
                  fontSize: '0.76rem',
                  fontWeight: 700
                }}>
                  🛡️ Tabu Ativo: {h2hData.tabu_invicto.clube} invicto há {h2hData.tabu_invicto.jogos} jogos
                </div>
              )}
            </div>

            {/* Confronto Lado a Lado */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ClubBadge clube={c1Nome} size={60} />
                <h3 className="font-editorial" style={{ fontSize: '1.3rem', fontWeight: 700, margin: '10px 0 2px 0' }}>{c1Nome}</h3>
                <div className="tabular-nums" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary, #5A673E)', lineHeight: 1 }}>{vit1}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>vitórias ({pctVit1}%)</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {gols1} gols ({total > 0 ? (gols1 / total).toFixed(2) : 0}/j)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  backgroundColor: 'var(--surface-raised)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  VS
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1 }}>{emp}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>empates ({pctEmp}%)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ClubBadge clube={c2Nome} size={60} />
                <h3 className="font-editorial" style={{ fontSize: '1.3rem', fontWeight: 700, margin: '10px 0 2px 0' }}>{c2Nome}</h3>
                <div className="tabular-nums" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--secondary, #85573B)', lineHeight: 1 }}>{vit2}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>vitórias ({pctVit2}%)</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {gols2} gols ({total > 0 ? (gols2 / total).toFixed(2) : 0}/j)
                </span>
              </div>
            </div>

            {/* Barra Visual de Proporção */}
            <div style={{
              width: '100%',
              height: '12px',
              borderRadius: '9999px',
              overflow: 'hidden',
              display: 'flex',
              marginTop: '26px',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ width: `${pctVit1}%`, backgroundColor: 'var(--primary, #5A673E)', height: '100%', transition: 'all 0.5s ease' }} title={`${c1Nome}: ${pctVit1}%`} />
              <div style={{ width: `${pctEmp}%`, backgroundColor: 'var(--text-secondary)', opacity: 0.4, height: '100%', transition: 'all 0.5s ease' }} title={`Empates: ${pctEmp}%`} />
              <div style={{ width: `${pctVit2}%`, backgroundColor: 'var(--secondary, #85573B)', height: '100%', transition: 'all 0.5s ease' }} title={`${c2Nome}: ${pctVit2}%`} />
            </div>

            {h2hData.nota_historica && (
              <div className="editorial-raised" style={{ marginTop: '22px', padding: '16px 20px', fontSize: '0.85rem', lineHeight: 1.6, borderLeft: '4px solid var(--secondary, #85573B)' }}>
                <span style={{ fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--secondary, #85573B)' }}>
                  📜 Crônica e Contexto Histórico:
                </span>
                {h2hData.nota_historica}
              </div>
            )}
          </section>

          {/* ================= LINHA DO TEMPO SECULAR: MARCOS HISTÓRICOS ================= */}
          {linhaTempo && (
            <section className="soft-card" style={{ padding: '28px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <History size={22} color="var(--secondary, #85573B)" />
                <h3 className="font-editorial" style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                  Linha do Tempo Secular: Marcos e Decisões Históricas
                </h3>
              </div>

              {/* Grid dos 4 Grandes Marcos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {/* 1. Primeiro Confronto */}
                {linhaTempo.primeiro_jogo && (
                  <div className="editorial-raised" style={{ padding: '16px', borderTop: '3px solid var(--primary, #5A673E)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Primeiro Duelo Documentado
                    </span>
                    <div className="font-mono" style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {linhaTempo.primeiro_jogo.data || linhaTempo.primeiro_jogo.ano}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, margin: '4px 0', color: 'var(--primary, #5A673E)' }}>
                      {linhaTempo.primeiro_jogo.mandante} {linhaTempo.primeiro_jogo.placar} {linhaTempo.primeiro_jogo.visitante}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {linhaTempo.primeiro_jogo.campeonato} • {linhaTempo.primeiro_jogo.estadio || 'Estádio não documentado'}
                    </div>
                  </div>
                )}

                {/* 2. Maior Goleada Clube 1 */}
                {h2hData.maior_goleada_clube1 && (
                  <div className="editorial-raised" style={{ padding: '16px', borderTop: '3px solid var(--primary, #5A673E)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Maior Goleada {c1Nome}
                    </span>
                    <div className="font-mono tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary, #5A673E)' }}>
                      {h2hData.maior_goleada_clube1.placar}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, margin: '4px 0' }}>
                      Ano: {h2hData.maior_goleada_clube1.ano} ({h2hData.maior_goleada_clube1.data || ''})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {h2hData.maior_goleada_clube1.campeonato}
                    </div>
                  </div>
                )}

                {/* 3. Maior Goleada Clube 2 */}
                {h2hData.maior_goleada_clube2 && (
                  <div className="editorial-raised" style={{ padding: '16px', borderTop: '3px solid var(--secondary, #85573B)' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Maior Goleada {c2Nome}
                    </span>
                    <div className="font-mono tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--secondary, #85573B)' }}>
                      {h2hData.maior_goleada_clube2.placar}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, margin: '4px 0' }}>
                      Ano: {h2hData.maior_goleada_clube2.ano} ({h2hData.maior_goleada_clube2.data || ''})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {h2hData.maior_goleada_clube2.campeonato}
                    </div>
                  </div>
                )}

                {/* 4. Recorde de Público / Jogo Mais Gols */}
                {linhaTempo.recorde_publico && (
                  <div className="editorial-raised" style={{ padding: '16px', borderTop: '3px solid #D97706' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Recorde de Público Súmula
                    </span>
                    <div className="font-mono tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#D97706' }}>
                      {linhaTempo.recorde_publico.publico.toLocaleString('pt-BR')} torcedores
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, margin: '4px 0' }}>
                      {linhaTempo.recorde_publico.data} ({linhaTempo.recorde_publico.placar})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {linhaTempo.recorde_publico.estadio || 'Estádio Oficial'}
                    </div>
                  </div>
                )}
              </div>

              {/* Principais Decisões e Mata-matas */}
              {linhaTempo.principais_decisoes && linhaTempo.principais_decisoes.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                    🏆 Finais e Decisões Históricas Catalogadas ({linhaTempo.principais_decisoes.length})
                  </span>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="editorial-table">
                      <thead>
                        <tr>
                          <th style={{ width: '90px' }}>Data</th>
                          <th>Torneio</th>
                          <th>Fase</th>
                          <th>Duelo</th>
                          <th style={{ textAlign: 'center', width: '90px' }}>Placar</th>
                          <th>Estádio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {linhaTempo.principais_decisoes.map((dec) => (
                          <tr key={dec.id_partida}>
                            <td className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{dec.data || dec.ano}</td>
                            <td style={{ fontWeight: 600 }}>{dec.campeonato}</td>
                            <td style={{ color: 'var(--secondary, #85573B)', fontWeight: 600, fontSize: '0.82rem' }}>{dec.fase}</td>
                            <td>{dec.mandante} x {dec.visitante}</td>
                            <td className="font-mono tabular-nums" style={{ textAlign: 'center', fontWeight: 800 }}>
                              {dec.placar}
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{dec.estadio || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ================= DOMINÂNCIA SECULAR POR DÉCADAS ================= */}
          {decadasResumo.length > 0 && (
            <section className="soft-card" style={{ padding: '28px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <BarChart3 size={22} color="var(--primary, #5A673E)" />
                <h3 className="font-editorial" style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
                  Dominância Secular por Décadas (1910s a 2020s)
                </h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="editorial-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Década</th>
                      <th style={{ textAlign: 'center' }}>Total Jogos</th>
                      <th style={{ textAlign: 'center' }}>Vitórias {c1Nome}</th>
                      <th style={{ textAlign: 'center' }}>Empates</th>
                      <th style={{ textAlign: 'center' }}>Vitórias {c2Nome}</th>
                      <th style={{ textAlign: 'center' }}>Gols Marcados</th>
                      <th>Proporção Visual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decadasResumo.map((dec) => {
                      const t = dec.total_jogos;
                      const p1 = t > 0 ? (dec.vitorias_clube1 / t) * 100 : 0;
                      const pe = t > 0 ? (dec.empates / t) * 100 : 0;
                      const p2 = t > 0 ? (dec.vitorias_clube2 / t) * 100 : 0;
                      return (
                        <tr key={dec.decada}>
                          <td className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{dec.decada}</td>
                          <td className="tabular-nums" style={{ textAlign: 'center', fontWeight: 600 }}>{dec.total_jogos}</td>
                          <td className="tabular-nums" style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary, #5A673E)' }}>{dec.vitorias_clube1}</td>
                          <td className="tabular-nums" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{dec.empates}</td>
                          <td className="tabular-nums" style={{ textAlign: 'center', fontWeight: 700, color: 'var(--secondary, #85573B)' }}>{dec.vitorias_clube2}</td>
                          <td className="font-mono tabular-nums" style={{ textAlign: 'center', fontSize: '0.78rem' }}>{dec.gols_clube1} x {dec.gols_clube2}</td>
                          <td style={{ minWidth: '130px' }}>
                            <div style={{
                              width: '100%',
                              height: '8px',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              display: 'flex',
                              backgroundColor: 'var(--surface-raised)'
                            }}>
                              <div style={{ width: `${p1}%`, backgroundColor: 'var(--primary, #5A673E)' }} />
                              <div style={{ width: `${pe}%`, backgroundColor: 'var(--text-secondary)', opacity: 0.3 }} />
                              <div style={{ width: `${p2}%`, backgroundColor: 'var(--secondary, #85573B)' }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ================= LEITURA ANALÍTICA ATUAL: DIXON-COLES + INCERTEZA CONFORMAL ================= */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Top Artilheiros do Confronto */}
            <section className="soft-card" style={{ padding: '24px' }}>
              <h3 className="font-editorial" style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={20} color="var(--secondary, #85573B)" />
                Maiores Artilheiros Históricos do Duelo
              </h3>

              {artilheiros.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {artilheiros.slice(0, 7).map((art, idx) => (
                    <div 
                      key={idx}
                      className="editorial-raised"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', fontSize: '0.82rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          backgroundColor: idx === 0 ? '#E5A93C' : 'var(--surface-card)',
                          color: idx === 0 ? '#1B1A17' : 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)'
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ fontWeight: 700 }}>{art.atleta}</span>
                        <span className="pill-neutral" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                          {art.clube}
                        </span>
                      </div>
                      <span className="font-mono" style={{ fontWeight: 800, color: 'var(--secondary, #85573B)', fontSize: '0.9rem' }}>
                        {art.gols} gols
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Gols de súmulas parciais em processo de indexação histórica.
                </div>
              )}
            </section>

            {/* Projeção Dixon-Coles com Intervalo Conformal */}
            <section className="soft-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 className="font-editorial" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={20} color="var(--primary, #5A673E)" />
                  Probabilidade Justa & Incerteza Conformal
                </h3>
                <span className="pill-neutral" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                  Dixon-Coles 95% Holdout
                </span>
              </div>

              {projDC ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    Probabilidade justa baseada em Poisson bivariado com intervalos conformais empíricos individuais ($q_{0.95}|y - p|$).
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
                    {/* C1 */}
                    <div className="editorial-raised" style={{ padding: '14px 10px', position: 'relative' }}>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, display: 'block', color: 'var(--text-secondary)' }}>{c1Nome}</span>
                      <span className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary, #5A673E)' }}>{projDC.prob_clube1}%</span>
                      {projDC.conformal_clube1 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          IC 95%: [{projDC.conformal_clube1.intervalo_95[0]}% - {projDC.conformal_clube1.intervalo_95[1]}%]
                        </div>
                      )}
                      <span className="font-mono" style={{ fontSize: '0.72rem', display: 'block', color: 'var(--text-secondary)', marginTop: '2px' }}>xG {projDC.xg_clube1}</span>
                    </div>

                    {/* Empate */}
                    <div className="editorial-raised" style={{ padding: '14px 10px' }}>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, display: 'block', color: 'var(--text-secondary)' }}>Empate</span>
                      <span className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{projDC.prob_empate}%</span>
                      {projDC.conformal_empate && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          IC 95%: [{projDC.conformal_empate.intervalo_95[0]}% - {projDC.conformal_empate.intervalo_95[1]}%]
                        </div>
                      )}
                    </div>

                    {/* C2 */}
                    <div className="editorial-raised" style={{ padding: '14px 10px' }}>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, display: 'block', color: 'var(--text-secondary)' }}>{c2Nome}</span>
                      <span className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--secondary, #85573B)' }}>{projDC.prob_clube2}%</span>
                      {projDC.conformal_clube2 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          IC 95%: [{projDC.conformal_clube2.intervalo_95[0]}% - {projDC.conformal_clube2.intervalo_95[1]}%]
                        </div>
                      )}
                      <span className="font-mono" style={{ fontSize: '0.72rem', display: 'block', color: 'var(--text-secondary)', marginTop: '2px' }}>xG {projDC.xg_clube2}</span>
                    </div>
                  </div>

                  {/* Alerta de Superfavourito se >= 60% */}
                  {(projDC.prob_clube1 >= 60 || projDC.prob_clube2 >= 60) && (
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-control)',
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      fontSize: '0.78rem',
                      color: '#B91C1C',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <AlertCircle size={16} style={{ flexShrink: 0 }} />
                      <span>
                        <strong>Atenção Metodológica:</strong> Probabilidade individual elevada (&ge;60%). O backtest indica subestimação do mercado sharp nesta faixa (amostra de alta dispersão).
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Amostra insuficiente para projeção preditiva.
                </div>
              )}
            </section>
          </div>

          {/* ================= PALMARÉS COMPARATIVO OFICIAL ================= */}
          {(palmares1 || palmares2) && (
            <section className="soft-card" style={{ padding: '24px' }}>
              <h3 className="font-editorial" style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={22} color="var(--secondary, #85573B)" />
                Palmarés Oficial Comparado (Estante de Títulos)
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Palmarés Clube 1 */}
                <div className="editorial-raised" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <ClubBadge clube={c1Nome} size={28} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c1Nome}</span>
                  </div>
                  {palmares1 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Mundial FIFA:</span>
                        <span className="font-mono" style={{ fontWeight: 700 }}>{palmares1.mundial || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Libertadores:</span>
                        <span className="font-mono" style={{ fontWeight: 700 }}>{palmares1.libertadores || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Brasileirão Série A:</span>
                        <span className="font-mono" style={{ fontWeight: 700 }}>{palmares1.brasileirao || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Copa do Brasil:</span>
                        <span className="font-mono" style={{ fontWeight: 700 }}>{palmares1.copa_do_brasil || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Estaduais:</span>
                        <span className="font-mono" style={{ fontWeight: 700 }}>{palmares1.estaduais || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Outros Oficiais:</span>
                        <span className="font-mono" style={{ fontWeight: 700 }}>{palmares1.internacionais || palmares1.copa_nordeste || 0}</span>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Títulos em processo de homologação.</span>
                  )}
                </div>

                {/* Palmarés Clube 2 */}
                <div className="editorial-raised" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <ClubBadge clube={c2Nome} size={28} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c2Nome}</span>
                  </div>
                  {palmares2 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Mundial FIFA:</span>
                        <span className="font-mono" style={{ fontWeight: 700 }}>{palmares2.mundial || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Libertadores:</span>
                        <span className="font-mono" style={{ fontWeight: 700 }}>{palmares2.libertadores || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Brasileirão Série A:</span>
                        <span className="font-mono" style={{ fontWeight: 700 }}>{palmares2.brasileirao || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Copa do Brasil:</span>
                        <span className="font-mono" style={{ fontWeight: 700 }}>{palmares2.copa_do_brasil || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Estaduais:</span>
                        <span className="font-mono" style={{ fontWeight: 700 }}>{palmares2.estaduais || 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Outros Oficiais:</span>
                        <span className="font-mono" style={{ fontWeight: 700 }}>{palmares2.internacionais || palmares2.copa_nordeste || 0}</span>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Títulos em processo de homologação.</span>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ================= PARTIDAS RECENTES DO RECORTE ================= */}
          {h2hData.partidas && h2hData.partidas.length > 0 && (
            <section className="soft-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 className="font-editorial" style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={20} color="var(--secondary, #85573B)" />
                  Partidas do Recorte ({h2hData.partidas.length} exibidas)
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  Ordenação cronológica decrescente
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="editorial-table">
                  <thead>
                    <tr>
                      <th style={{ width: '90px' }}>Data</th>
                      <th>Torneio</th>
                      <th>Confronto</th>
                      <th style={{ textAlign: 'center', width: '90px' }}>Placar</th>
                      <th>Estádio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {h2hData.partidas.map((p) => (
                      <tr key={p.id_partida}>
                        <td className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.data || p.ano}</td>
                        <td style={{ fontWeight: 600 }}>{p.campeonato}</td>
                        <td>{p.mandante} x {p.visitante}</td>
                        <td className="font-mono tabular-nums" style={{ textAlign: 'center', fontWeight: 800, fontSize: '0.95rem' }}>
                          {p.placar || `${p.gols_mandante} x ${p.gols_visitante}`}
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{p.estadio || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ================= SELO DE TRANSPARÊNCIA E FONTES ================= */}
          {fontesLimitacoes && (
            <footer className="editorial-raised" style={{
              padding: '18px 22px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <ShieldCheck size={20} color="var(--primary, #5A673E)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
                  Transparência de Acervo & Governança Metodológica
                </strong>
                <span>
                  Período documentado: {fontesLimitacoes.periodo_coberto} ({fontesLimitacoes.total_partidas_secular} partidas seculares registradas). {fontesLimitacoes.aviso_metodologico}
                </span>
              </div>
            </footer>
          )}
        </>
      )}
    </div>
  );
}
