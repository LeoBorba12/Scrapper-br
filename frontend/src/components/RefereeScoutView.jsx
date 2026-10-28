import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, ShieldCheck, Search, Filter, ArrowLeft, 
  Clock, AlertTriangle, ChevronRight, Award, Flame, Scale, TrendingUp,
  SlidersHorizontal, Check
} from 'lucide-react';
import MobileBottomSheet from './MobileBottomSheet';

const ARBITROS_DESTAQUE_CHIPS = [
  "Anderson Daronco",
  "Raphael Claus",
  "Wilton Sampaio",
  "Leandro Pedro Vuaden",
  "Marcelo de Lima Henrique",
  "Ricardo Marques Ribeiro",
  "Braulio da Silva Machado",
  "Ramon Abatti Abel"
];

export default function RefereeScoutView({ apiFetch, onSelectMatch }) {
  const [arbitrosList, setArbitrosList] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroRigor, setFiltroRigor] = useState('todos'); // 'todos' | 'rigoroso' | 'padrao' | 'fluir'
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Perfil selecionado
  const [selectedReferee, setSelectedReferee] = useState(null);
  const [refereeProfile, setRefereeProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [clubeFiltro, setClubeFiltro] = useState('');

  // 1. Carregar lista geral de destaques
  useEffect(() => {
    let isMounted = true;
    setLoadingList(true);
    const url = '/api/arbitros/destaques';
    const fetcher = apiFetch ? apiFetch(url) : fetch(url);
    fetcher
      .then(r => r.json())
      .then(d => {
        if (isMounted) {
          setArbitrosList(Array.isArray(d) ? d : []);
          setLoadingList(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingList(false);
      });
    return () => { isMounted = false; };
  }, [apiFetch]);

  // 2. Carregar perfil completo do árbitro
  const carregarPerfil = (nomeArbitro, clube = '') => {
    if (!nomeArbitro) return;
    setSelectedReferee(nomeArbitro);
    setLoadingProfile(true);
    const url = `/api/arbitros/perfil?nome=${encodeURIComponent(nomeArbitro)}${clube ? `&clube=${encodeURIComponent(clube)}` : ''}`;
    const fetcher = apiFetch ? apiFetch(url) : fetch(url);
    fetcher
      .then(r => r.json())
      .then(d => {
        setRefereeProfile(d);
        setLoadingProfile(false);
      })
      .catch(() => setLoadingProfile(false));
  };

  // Filtragem da lista geral
  const arbitrosFiltrados = useMemo(() => {
    return arbitrosList.filter(a => {
      const matchBusca = !busca || a.arbitro.toLowerCase().includes(busca.toLowerCase());
      if (!matchBusca) return false;
      if (filtroRigor === 'rigoroso') return a.media_cartoes >= 5.2;
      if (filtroRigor === 'padrao') return a.media_cartoes >= 4.5 && a.media_cartoes < 5.2;
      if (filtroRigor === 'fluir') return a.media_cartoes < 4.5;
      return true;
    });
  }, [arbitrosList, busca, filtroRigor]);

  // Métricas de topo para KPIs
  const kpisGerais = useMemo(() => {
    if (!arbitrosList.length) return null;
    const comScout = arbitrosList.filter(a => a.jogos_cartoes >= 10);
    const maisRigoroso = [...comScout].sort((a, b) => b.media_cartoes - a.media_cartoes)[0];
    const maisPenaltis = [...arbitrosList].sort((a, b) => b.media_penaltis - a.media_penaltis)[0];
    const maiorMandante = [...arbitrosList].sort((a, b) => b.pct_vit_mandante - a.pct_vit_mandante)[0];
    const mediaGeral2T = Math.round(
      arbitrosList.reduce((acc, curr) => acc + (curr.pct_cartoes_2t || 50), 0) / arbitrosList.length
    );

    return {
      maisRigoroso,
      maisPenaltis,
      maiorMandante,
      mediaGeral2T
    };
  }, [arbitrosList]);

  // Cor semântica do índice de rigor
  const getRigorBadge = (score, perfil) => {
    if (score >= 65) {
      return { bg: 'rgba(220, 38, 38, 0.12)', border: 'rgba(220, 38, 38, 0.3)', text: '#DC2626', label: perfil || 'Ultra Rigoroso' };
    }
    if (score >= 50) {
      return { bg: 'rgba(217, 119, 6, 0.12)', border: 'rgba(217, 119, 6, 0.3)', text: '#D97706', label: perfil || 'Disciplinador Padrão' };
    }
    return { bg: 'rgba(124, 143, 82, 0.15)', border: 'rgba(124, 143, 82, 0.35)', text: '#5A673E', label: perfil || 'Deixa Fluir' };
  };

  // ==================== VISÃO 2: PERFIL DETALHADO DO ÁRBITRO ====================
  if (selectedReferee) {
    const res = refereeProfile?.resumo || {};
    const badge = getRigorBadge(res.indice_rigor || 50, res.perfil_disciplinar);
    const dTempos = res.distribuicao_tempos || { pct_1t: 40, pct_2t: 60 };
    const dMando = res.distribuicao_mando || { pct_mandante: 52, pct_visitante: 48 };
    const faixas = res.faixas_minutos || {};
    const maxFaixa = Math.max(...Object.values(faixas).map(v => Number(v) || 0), 1);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Barra Superior de Retorno */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={() => { setSelectedReferee(null); setRefereeProfile(null); }}
            className="touch-tactile"
            style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              padding: '10px 18px',
              minHeight: '44px',
              borderRadius: 'var(--radius-control)',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Voltar ao Ranking de Árbitros</span>
          </button>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Raio-X Oficial do Apito • Base Consolidada FutStats 1902–2026
          </div>
        </div>

        {loadingProfile ? (
          <div className="editorial-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>⏳ Carregando súmulas e histórico disciplinar...</div>
            <span style={{ fontSize: '0.82rem' }}>Cruzando cartões, minutos, pênaltis e aproveitamento de clubes.</span>
          </div>
        ) : (
          <>
            {/* Header Editorial do Árbitro */}
            <div
              className="editorial-panel"
              style={{
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.4rem' }}>⚖️</span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      backgroundColor: badge.bg,
                      color: badge.text,
                      border: `1px solid ${badge.border}`
                    }}
                  >
                    {badge.label} • Rigor {res.indice_rigor || 50}/100
                  </span>
                </div>
                <h1 className="font-editorial" style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {selectedReferee}
                </h1>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '6px 0 0 0' }}>
                  Atuante no acervo entre <strong>{res.ano_min || '—'}</strong> e <strong>{res.ano_max || '—'}</strong> • Total de <strong>{res.total_jogos || 0}</strong> jogos catalogados (<strong>{res.jogos_com_cartoes || 0}</strong> com telemetria detalhada de cartões).
                </p>
              </div>

              {/* Box de Over 4.5 Cartões */}
              <div
                style={{
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-control)',
                  padding: '12px 18px',
                  textAlign: 'center',
                  minWidth: '150px'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Prob. Over 4.5 Cartões
                </div>
                <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 900, color: badge.text, margin: '2px 0' }}>
                  {res.prob_over_4_5_cartoes || 50}%
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  Média: {res.media_cartoes || 0} cartões/j
                </div>
              </div>
            </div>

            {/* Grid 4 KPIs do Árbitro */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div className="editorial-panel" style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  🟨 Cartões Amarelos
                </div>
                <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                  {res.media_amarelos || 0} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ jogo</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Total: {res.amarelos || 0} advertências
                </div>
              </div>

              <div className="editorial-panel" style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  🟥 Cartões Vermelhos
                </div>
                <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
                  {res.media_vermelhos || 0} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ jogo</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Total: {res.vermelhos || 0} expulsões
                </div>
              </div>

              <div className="editorial-panel" style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  🎯 Pênaltis Marcados
                </div>
                <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
                  {res.penaltis?.media_por_jogo || 0} <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ jogo</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Total: {res.penaltis?.total || 0} penalidades apitadas
                </div>
              </div>

              <div className="editorial-panel" style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                  🏟️ Viés do Mandante
                </div>
                <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {res.pct_mandante || 0}% <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>vitórias</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Empates: {res.pct_empate || 0}% • Visitante: {res.pct_visitante || 0}%
                </div>
              </div>
            </div>

            {/* Painel Tático: Distribuição 1T vs 2T & Mando */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {/* Barra Comparativa 1T vs 2T */}
              <div className="editorial-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color="var(--accent)" />
                    <span>Momento dos Cartões (1º Tempo vs 2º Tempo)</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rigor Crescente</span>
                </div>

                <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--surface-raised)', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: `${dTempos.pct_1t}%`,
                      backgroundColor: '#5A673E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '0.74rem',
                      fontWeight: 800
                    }}
                  >
                    1T: {dTempos.pct_1t}%
                  </div>
                  <div
                    style={{
                      width: `${dTempos.pct_2t}%`,
                      backgroundColor: '#B87550',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '0.74rem',
                      fontWeight: 800
                    }}
                  >
                    2T: {dTempos.pct_2t}%
                  </div>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {dTempos.pct_2t >= 58
                    ? `⚠️ Árbitro com forte tendência de retenção no primeiro tempo e aceleração disciplinar na etapa complementar (${dTempos.pct_2t}% dos cartões após o intervalo).`
                    : `⚖️ Distribuição equilibrada de advertências ao longo dos dois tempos de jogo.`}
                </p>

                {/* Histograma de Minutos */}
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'flex-end', gap: '8px', height: '80px', paddingTop: '10px' }}>
                  {Object.entries(faixas).map(([faixa, qtd]) => {
                    const altura = Math.max(Math.round((qtd / maxFaixa) * 60), 6);
                    return (
                      <div key={faixa} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span className="font-mono" style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>{qtd}</span>
                        <div
                          style={{
                            width: '100%',
                            height: `${altura}px`,
                            backgroundColor: faixa === '76-90+' ? '#DC2626' : (faixa === '31-45' ? '#D97706' : 'var(--accent)'),
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease'
                          }}
                        />
                        <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{faixa}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Distribuição por Mando (Mandante vs Visitante) */}
              <div className="editorial-panel" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Scale size={16} color="var(--accent)" />
                    <span>Equilíbrio de Advertências por Mando</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Casa x Fora</span>
                </div>

                <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--surface-raised)', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: `${dMando.pct_mandante}%`,
                      backgroundColor: 'var(--surface-control)',
                      borderRight: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-primary)',
                      fontSize: '0.74rem',
                      fontWeight: 800
                    }}
                  >
                    Mandante: {dMando.pct_mandante}%
                  </div>
                  <div
                    style={{
                      width: `${dMando.pct_visitante}%`,
                      backgroundColor: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontSize: '0.74rem',
                      fontWeight: 800
                    }}
                  >
                    Visitante: {dMando.pct_visitante}%
                  </div>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {Math.abs(dMando.pct_mandante - 50) <= 4
                    ? '🟢 Critério rigorosamente neutro entre mandantes e visitantes na aplicação de cartões.'
                    : dMando.pct_visitante > 54
                    ? '⚠️ Tendência estatística de maior rigor contra equipes visitantes sob pressão do estádio.'
                    : 'ℹ️ Leve propensão de advertências ao time mandante durante transições defensivas.'}
                </p>

                {/* Motivos Mais Frequentes */}
                {refereeProfile?.top_motivos?.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Principais Motivos de Súmula:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {refereeProfile.top_motivos.slice(0, 4).map((m, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                          <span style={{ color: 'var(--text-primary)' }}>• {m.motivo}</span>
                          <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{m.total}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tabela de Impacto por Clube */}
            {refereeProfile?.clubes_apitados?.length > 0 && (
              <div className="editorial-panel" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
                  🏟️ Clubes Mais Apitados e Aproveitamento de Pontos
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '8px 10px' }}>Clube</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>Jogos</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>V - E - D</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>Aproveitamento</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center' }}>Cartões Recebidos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refereeProfile.clubes_apitados.map((clb, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid var(--border-subtle)',
                            backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface-raised)'
                          }}
                        >
                          <td style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {clb.clube}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center' }}>
                            {clb.jogos}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {clb.vitorias}V - {clb.empates}E - {clb.derrotas}D
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 800, color: clb.aproveitamento_pct >= 55 ? '#5A673E' : (clb.aproveitamento_pct <= 35 ? '#DC2626' : 'var(--text-primary)') }}>
                            {clb.aproveitamento_pct}%
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', color: '#D97706', fontWeight: 700 }}>
                            {clb.cartoes_recebidos || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ==================== VISÃO 1: RANKING MASTER DE ÁRBITROS ====================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Cabeçalho Editorial */}
      <div>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Módulo de Governança & Disciplina • Pilar 2
        </div>
        <h1 className="font-editorial" style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
          Raio-X Avançado do Apito & Disciplina Tática
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '820px', lineHeight: 1.55, margin: 0 }}>
          Análise histórica de rigor dos juízes, propensão a cartões no 1º vs 2º tempo, frequência de pênaltis marcados e tendências de arbitragem em partidas do futebol brasileiro.
        </p>
      </div>

      {/* 4 KPIs de Destaque da Temporada/Acervo */}
      {kpisGerais && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
          <div
            className="editorial-panel touch-tactile"
            onClick={() => carregarPerfil(kpisGerais.maisRigoroso?.arbitro)}
            style={{ padding: '16px', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={14} /> Mais Rigoroso
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {kpisGerais.maisRigoroso?.arbitro}
            </div>
            <div className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Média de <strong>{kpisGerais.maisRigoroso?.media_cartoes}</strong> cartões/jogo
            </div>
          </div>

          <div
            className="editorial-panel touch-tactile"
            onClick={() => carregarPerfil(kpisGerais.maisPenaltis?.arbitro)}
            style={{ padding: '16px', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={14} /> Pênaltis Marcados
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {kpisGerais.maisPenaltis?.arbitro}
            </div>
            <div className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              <strong>{kpisGerais.maisPenaltis?.total_penaltis}</strong> pênaltis ({kpisGerais.maisPenaltis?.media_penaltis}/j)
            </div>
          </div>

          <div
            className="editorial-panel touch-tactile"
            onClick={() => carregarPerfil(kpisGerais.maiorMandante?.arbitro)}
            style={{ padding: '16px', cursor: 'pointer' }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#5A673E', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={14} /> Viés Mandante
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {kpisGerais.maiorMandante?.arbitro}
            </div>
            <div className="font-mono" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              <strong>{kpisGerais.maiorMandante?.pct_vit_mandante}%</strong> de vitórias do mandante
            </div>
          </div>

          <div className="editorial-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#B87550', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} /> Pico no 2º Tempo
            </div>
            <div className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '2px' }}>
              {kpisGerais.mediaGeral2T}%
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              dos cartões ocorrem na etapa complementar
            </div>
          </div>
        </div>
      )}

      {/* Botão de Filtro Mobile para abrir Bottom Sheet */}
      <div className="mobile-drawer-btn" style={{ width: '100%' }}>
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="touch-tactile btn-primary"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            fontSize: '0.88rem',
            fontWeight: 800,
            borderRadius: 'var(--radius-control)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <SlidersHorizontal size={16} />
          <span>⚡ Filtrar Rigor & Árbitros Populares</span>
        </button>
      </div>

      {/* Barra de Busca e Filtros de Rigor */}
      <div
        className="editorial-panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        {/* Input de Busca */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="var(--accent)" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar árbitro (ex: Daronco, Claus, Wilton, Vuaden)..."
            style={{
              flex: 1,
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.92rem',
              fontWeight: 600,
              outline: 'none'
            }}
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
            >
              Limpar
            </button>
          )}
        </div>

        {/* Chips de Filtro por Rigor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Critério:</span>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'rigoroso', label: '🔥 Mais Rigorosos (≥5.2)' },
            { id: 'padrao', label: '⚖️ Padrão (4.5 a 5.1)' },
            { id: 'fluir', label: '🟢 Deixa Fluir (<4.5)' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltroRigor(f.id)}
              className="touch-tactile"
              style={{
                backgroundColor: filtroRigor === f.id ? 'var(--accent)' : 'var(--surface-raised)',
                color: filtroRigor === f.id ? '#FFFFFF' : 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '4px 12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chips Rápidos de Árbitros Famosos */}
      <div className="touch-horizontal-scroll" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Acesso Rápido:
        </span>
        {ARBITROS_DESTAQUE_CHIPS.map((nome, idx) => (
          <button
            key={idx}
            onClick={() => carregarPerfil(nome)}
            className="touch-tactile"
            style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-control)',
              padding: '4px 10px',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {nome}
          </button>
        ))}
      </div>

      {/* Tabela Master de Árbitros */}
      <div className="editorial-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Tabela Analítica de Rigor Disciplinar
          </h3>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Exibindo {arbitrosFiltrados.length} juízes com amostragem oficial
          </span>
        </div>

        {loadingList ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Carregando ranking oficial de arbitragem...
          </div>
        ) : (
          <div>
            {/* Tabela Master Desktop (oculta em mobile) */}
            <div style={{ overflowX: 'auto' }}>
              <table className="referee-desktop-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 8px' }}>Árbitro</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Jogos</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Média Cartões</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>% no 2º Tempo</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Pênaltis / Jogo</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>% Vit. Mandante</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Índice de Rigor</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {arbitrosFiltrados.map((a, idx) => {
                    const badge = getRigorBadge(a.indice_rigor || 50, a.perfil_disciplinar);
                    return (
                      <tr
                        key={idx}
                        onClick={() => carregarPerfil(a.arbitro)}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface-raised)',
                          cursor: 'pointer',
                          transition: 'background-color 150ms ease'
                        }}
                      >
                        <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {a.arbitro}
                        </td>
                        <td className="font-mono" style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {a.total_jogos}
                        </td>
                        <td className="font-mono" style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 800, color: a.media_cartoes >= 5.2 ? '#DC2626' : (a.media_cartoes >= 4.5 ? '#D97706' : '#5A673E') }}>
                          {a.media_cartoes || '—'}
                        </td>
                        <td className="font-mono" style={{ padding: '12px 8px', textAlign: 'center', color: a.pct_cartoes_2t >= 65 ? '#DC2626' : 'var(--text-secondary)' }}>
                          {a.pct_cartoes_2t ? `${a.pct_cartoes_2t}%` : '—'}
                        </td>
                        <td className="font-mono" style={{ padding: '12px 8px', textAlign: 'center', color: a.media_penaltis >= 0.1 ? 'var(--accent)' : 'var(--text-muted)' }}>
                          {a.media_penaltis || '0.00'}
                        </td>
                        <td className="font-mono" style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {a.pct_vit_mandante}%
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '10px',
                              backgroundColor: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`
                            }}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
                            Raio-X <ChevronRight size={14} />
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Visualização em Cards Táteis para Telas Mobile (< 768px) */}
            <div className="referee-mobile-cards">
              {arbitrosFiltrados.map((a, idx) => {
                const badge = getRigorBadge(a.indice_rigor || 50, a.perfil_disciplinar);
                return (
                  <div
                    key={idx}
                    onClick={() => carregarPerfil(a.arbitro)}
                    className="touch-tactile"
                    style={{
                      backgroundColor: 'var(--surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-control)',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--text-primary)' }}>
                        {a.arbitro}
                      </div>
                      <span
                        style={{
                          fontSize: '0.70rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '10px',
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                      <div style={{ backgroundColor: 'var(--surface-card)', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Média Cartões</div>
                        <div className="font-mono" style={{ fontWeight: 800, fontSize: '0.92rem', color: a.media_cartoes >= 5.2 ? '#DC2626' : 'var(--text-primary)' }}>
                          {a.media_cartoes || '—'}
                        </div>
                      </div>
                      <div style={{ backgroundColor: 'var(--surface-card)', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Jogos</div>
                        <div className="font-mono" style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                          {a.total_jogos}
                        </div>
                      </div>
                      <div style={{ backgroundColor: 'var(--surface-card)', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vit. Mandante</div>
                        <div className="font-mono" style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                          {a.pct_vit_mandante}%
                        </div>
                      </div>
                    </div>

                    <button
                      className="touch-tactile btn-primary"
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: 'var(--radius-control)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <span>Abrir Raio-X Completo</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Drawer Tátil Mobile para Filtro de Rigor e Árbitros Populares */}
      <MobileBottomSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="⚡ Filtrar Rigor & Árbitros"
        subtitle="Escolha o critério disciplinar e selecione juízes populares com 1 toque"
      >
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
            ⚖️ Critério Disciplinar:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { id: 'todos', label: 'Todos os Árbitros', icone: '🌐' },
              { id: 'rigoroso', label: 'Mais Rigorosos (≥5.2)', icone: '🔥' },
              { id: 'padrao', label: 'Padrão (4.5 a 5.1)', icone: '⚖️' },
              { id: 'fluir', label: 'Deixa Fluir (<4.5)', icone: '🟢' }
            ].map((f) => {
              const isAtivo = filtroRigor === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setFiltroRigor(f.id);
                    setIsMobileFilterOpen(false);
                  }}
                  className="touch-tactile"
                  style={{
                    backgroundColor: isAtivo ? 'var(--accent)' : 'var(--surface-raised)',
                    color: isAtivo ? '#FFFFFF' : 'var(--text-primary)',
                    border: isAtivo ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-control)',
                    padding: '12px 10px',
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{f.icone}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{f.label}</span>
                  {isAtivo && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
            ⭐ Árbitros Mais Famosos:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {ARBITROS_DESTAQUE_CHIPS.map((nome, idx) => (
              <button
                key={idx}
                onClick={() => {
                  carregarPerfil(nome);
                  setIsMobileFilterOpen(false);
                }}
                className="touch-tactile"
                style={{
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-control)',
                  padding: '10px 12px',
                  fontSize: '0.80rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{nome}</span>
                <span style={{ fontSize: '0.70rem', color: 'var(--accent)' }}>➔</span>
              </button>
            ))}
          </div>
        </div>
      </MobileBottomSheet>
    </div>
  );
}
