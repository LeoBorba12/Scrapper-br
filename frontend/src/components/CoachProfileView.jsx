import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, Trophy, Search, RefreshCw, Award, Flame,
  ShieldCheck, Brain, Crown, ArrowRight, Calendar,
  Activity, Target, ChevronRight, Check
} from 'lucide-react';

const DESTAQUES_TECNICOS_CHIPS = [
  "Abel Ferreira",
  "Jorge Jesus",
  "Dorival Júnior",
  "Renato Gaúcho",
  "Fernando Diniz",
  "Rogério Ceni",
  "Tite",
  "Cuca",
  "Mano Menezes",
  "Telê Santana",
  "Zagallo",
  "Luiz Felipe Scolari",
  "Muricy Ramalho",
  "Vanderlei Luxemburgo"
];

export default function CoachProfileView({ darkMode }) {
  const [listaTecnicos, setListaTecnicos] = useState([]);
  const [loadingLista, setLoadingLista] = useState(true);
  const [busca, setBusca] = useState('');
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState('Abel Ferreira');
  const [detalhe, setDetalhe] = useState(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState(false);
  const [erro, setErro] = useState(null);

  // 1. Carregar lista de técnicos
  useEffect(() => {
    let isMounted = true;
    setLoadingLista(true);
    fetch('/api/tecnicos/lista-completa')
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setListaTecnicos(data.tecnicos || []);
          setLoadingLista(false);
        }
      })
      .catch(err => {
        console.error('Falha ao listar técnicos:', err);
        if (isMounted) setLoadingLista(false);
      });
    return () => { isMounted = false; };
  }, []);

  // 2. Carregar detalhe completo do técnico selecionado
  useEffect(() => {
    if (!tecnicoSelecionado) return;
    let isMounted = true;
    setLoadingDetalhe(true);
    setErro(null);

    fetch(`/api/tecnicos/detalhe-completo?nome=${encodeURIComponent(tecnicoSelecionado)}`)
      .then(res => {
        if (!res.ok) throw new Error('Não foi possível carregar o perfil do técnico.');
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          setDetalhe(data);
          setLoadingDetalhe(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setErro(err.message);
          setLoadingDetalhe(false);
        }
      });
    return () => { isMounted = false; };
  }, [tecnicoSelecionado]);

  // Filtragem da lista para o dropdown/busca
  const tecnicosFiltrados = useMemo(() => {
    if (!busca) return listaTecnicos;
    const b = busca.toLowerCase();
    return listaTecnicos.filter(t => t.nome.toLowerCase().includes(b));
  }, [listaTecnicos, busca]);

  const perfil = detalhe?.perfil || {};
  const historico = detalhe?.historico_competicoes || [];
  const confrontos = detalhe?.confrontos_relevantes || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* ================= SELETOR E BUSCA DE TÉCNICO ================= */}
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
              <Brain size={14} /> Dossiê Oficial de Treinadores
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
              <Users size={28} color="var(--accent)" />
              Página de Técnicos e Mestres Táticos
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '780px', lineHeight: 1.55, margin: 0 }}>
              Trajetória profissional, clubes comandados, títulos oficiais conquistados, aproveitamento global e histórico detalhado por competição no acervo canônico.
            </p>
          </div>
        </div>

        {/* Chips Rápidos */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
          {DESTAQUES_TECNICOS_CHIPS.map((nome) => {
            const isAtivo = tecnicoSelecionado.toLowerCase() === nome.toLowerCase();
            return (
              <button
                key={nome}
                onClick={() => { setTecnicoSelecionado(nome); setBusca(''); }}
                className="touch-tactile"
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: isAtivo ? 800 : 600,
                  border: isAtivo ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  backgroundColor: isAtivo ? 'var(--accent)' : 'var(--surface-raised)',
                  color: isAtivo ? '#FFFFFF' : 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {nome}
              </button>
            );
          })}
        </div>

        {/* Campo de Busca e Dropdown de Todos os 135 Técnicos */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar entre os 135 técnicos catalogados..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
                fontSize: '0.86rem'
              }}
            />
          </div>

          <div style={{ flex: '1 1 280px', minWidth: '240px' }}>
            <select
              value={tecnicoSelecionado}
              onChange={(e) => setTecnicoSelecionado(e.target.value)}
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
              {tecnicosFiltrados.map(t => (
                <option key={t.id_tecnico || t.nome} value={t.nome}>
                  {t.nome} ({t.nacionalidade || 'BR'} • {t.total_jogos} jogos • {t.aproveitamento_pct}%)
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ================= CONTEÚDO PRINCIPAL: PERFIL DO TÉCNICO ================= */}
      {loadingDetalhe ? (
        <div className="editorial-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="w-10 h-10 border-4 border-t-transparent border-[#85573B] rounded-full animate-spin mb-4" style={{ margin: '0 auto 16px auto' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Consultando súmulas do acervo...</div>
          <span style={{ fontSize: '0.84rem' }}>Compilando títulos, aproveitamento e confrontos de {tecnicoSelecionado}.</span>
        </div>
      ) : erro ? (
        <div className="editorial-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--negative)' }}>
          <p style={{ fontWeight: 700 }}>{erro}</p>
        </div>
      ) : (
        <>
          {/* Header do Perfil */}
          <section className="editorial-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--positive-bg)',
                    color: 'var(--positive)'
                  }}>
                    {perfil.nacionalidade || 'Não disponível'}
                  </span>
                  {perfil.idade && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {perfil.idade} anos
                    </span>
                  )}
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    • Esquema: <strong>{perfil.esquema_preferido || 'Não disponível'}</strong>
                  </span>
                </div>
                <h2 className="font-editorial" style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {perfil.nome}
                </h2>
                {perfil.nome_completo && perfil.nome_completo !== perfil.nome && (
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    {perfil.nome_completo}
                  </p>
                )}

                {/* Clubes Treinados */}
                {perfil.clubes?.length > 0 && (
                  <div style={{ marginTop: '14px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                      Clubes Comandados na Carreira:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {perfil.clubes.map((c, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '3px 10px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--surface-raised)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)'
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Box de Aproveitamento Principal */}
              <div
                style={{
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-panel)',
                  padding: '16px 24px',
                  textAlign: 'center',
                  minWidth: '160px'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Aproveitamento Global
                </div>
                <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: 900, color: perfil.aproveitamento_pct >= 55 ? '#5A673E' : (perfil.aproveitamento_pct <= 40 ? '#DC2626' : 'var(--text-primary)'), margin: '2px 0' }}>
                  {perfil.aproveitamento_pct || 0}%
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {perfil.total_jogos || 0} partidas computadas
                </div>
              </div>
            </div>

            {/* Estante de Títulos Conquistados */}
            {perfil.titulos?.length > 0 && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Trophy size={14} /> Títulos e Conquistas Oficiais ({perfil.titulos.length})
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                  {perfil.titulos.map((t, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        backgroundColor: 'var(--surface-raised)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Award size={13} color="var(--accent)" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Grid de KPIs Canônicos de Carreira */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <div className="editorial-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Total de Partidas
              </div>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {perfil.total_jogos || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Carreira oficial
              </div>
            </div>

            <div className="editorial-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Vitórias
              </div>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#5A673E', marginTop: '4px' }}>
                {perfil.vitorias || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {perfil.total_jogos ? Math.round(((perfil.vitorias || 0) / perfil.total_jogos) * 100) : 0}% dos jogos
              </div>
            </div>

            <div className="editorial-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Empates
              </div>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                {perfil.empates || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {perfil.total_jogos ? Math.round(((perfil.empates || 0) / perfil.total_jogos) * 100) : 0}% dos jogos
              </div>
            </div>

            <div className="editorial-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Derrotas
              </div>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
                {perfil.derrotas || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {perfil.total_jogos ? Math.round(((perfil.derrotas || 0) / perfil.total_jogos) * 100) : 0}% dos jogos
              </div>
            </div>

            <div className="editorial-panel" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                Gols Pró vs Contra
              </div>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                {perfil.gols_pro || 0} <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)', fontWeight: 600 }}>: {perfil.gols_contra || 0}</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Saldo: <strong>{(perfil.gols_pro || 0) - (perfil.gols_contra || 0) >= 0 ? `+${(perfil.gols_pro || 0) - (perfil.gols_contra || 0)}` : (perfil.gols_pro || 0) - (perfil.gols_contra || 0)}</strong>
              </div>
            </div>
          </div>

          {/* ================= HISTÓRICO POR COMPETIÇÃO E TEMPORADA ================= */}
          <section className="editorial-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--accent)" /> Histórico por Competição e Temporada
            </h3>

            {historico.length === 0 ? (
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                Partidas detalhadas de súmula individual ainda em fase de catalogação para este treinador.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px 12px' }}>Competição</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Ano</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Jogos</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>V - E - D</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Gols (GP : GC)</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Saldo</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Aproveitamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map((h, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface-raised)'
                        }}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {h.campeonato}
                        </td>
                        <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {h.ano}
                        </td>
                        <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>
                          {h.jogos}
                        </td>
                        <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {h.vitorias}V - {h.empates}E - {h.derrotas}D
                        </td>
                        <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'center' }}>
                          {h.gols_pro} : {h.gols_contra}
                        </td>
                        <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: h.saldo_gols > 0 ? '#5A673E' : (h.saldo_gols < 0 ? '#DC2626' : 'var(--text-muted)') }}>
                          {h.saldo_gols > 0 ? `+${h.saldo_gols}` : h.saldo_gols}
                        </td>
                        <td className="font-mono" style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: h.aproveitamento_pct >= 55 ? '#5A673E' : (h.aproveitamento_pct <= 40 ? '#DC2626' : 'var(--text-primary)') }}>
                          {h.aproveitamento_pct}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ================= CONFRONTOS MAIS RELEVANTES / RECENTES ================= */}
          {confrontos.length > 0 && (
            <section className="editorial-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--accent)" /> Confrontos Relevantes Comandados
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {confrontos.map((c, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-control)',
                      backgroundColor: 'var(--surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>{c.campeonato} • {c.data || c.ano}</span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 800,
                        backgroundColor: c.resultado === 'V' ? 'var(--positive-bg)' : (c.resultado === 'D' ? 'var(--negative-bg)' : 'var(--surface)'),
                        color: c.resultado === 'V' ? 'var(--positive)' : (c.resultado === 'D' ? 'var(--negative)' : 'var(--text-muted)')
                      }}>
                        {c.resultado === 'V' ? 'Vitória' : (c.resultado === 'D' ? 'Derrota' : 'Empate')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {c.time} ({c.mando})
                      </span>
                      <span className="font-mono" style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {c.placar}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        {c.adversario}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
