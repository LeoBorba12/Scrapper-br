import React, { useState, useEffect } from 'react';
import { 
  Swords, Trophy, Search, RefreshCw, Flame, 
  Share2, AlertCircle, BarChart3, Calendar
} from 'lucide-react';
import ClubBadge from './ClubBadge';
import { baixarCardDueloH2HPNG } from '../utils/cardGenerator';

const CLASSICOS_PREDEFINIDOS = [
  { label: 'Fla-Flu', c1: 'Flamengo', c2: 'Fluminense', regiao: 'Rio de Janeiro' },
  { label: 'Clássico dos Milhões', c1: 'Flamengo', c2: 'Vasco', regiao: 'Rio de Janeiro' },
  { label: 'Derby Paulista', c1: 'Palmeiras', c2: 'Corinthians', regiao: 'São Paulo' },
  { label: 'Gre-Nal', c1: 'Grêmio', c2: 'Internacional', regiao: 'Rio Grande do Sul' },
  { label: 'San-São', c1: 'Santos', c2: 'São Paulo', regiao: 'São Paulo' },
  { label: 'Majestoso', c1: 'Corinthians', c2: 'São Paulo', regiao: 'São Paulo' },
  { label: 'Clássico Mineiro', c1: 'Atlético-MG', c2: 'Cruzeiro', regiao: 'Minas Gerais' },
  { label: 'Ba-Vi', c1: 'Bahia', c2: 'Vitória', regiao: 'Bahia' },
  { label: 'Clássico da Saudade', c1: 'Santos', c2: 'Palmeiras', regiao: 'São Paulo' },
  { label: 'Clássico da Rivalidade', c1: 'Botafogo', c2: 'Flamengo', regiao: 'Rio de Janeiro' }
];

export default function ClubCompareView({
  darkMode,
  clubesList = [],
  clubeInicial1 = 'Flamengo',
  clubeInicial2 = 'Vasco'
}) {
  const [clube1, setClube1] = useState(clubeInicial1);
  const [clube2, setClube2] = useState(clubeInicial2);
  const [h2hData, setH2hData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const carregarConfronto = async (c1 = clube1, c2 = clube2) => {
    if (!c1 || !c2) return;
    setLoading(true);
    setErro(null);
    try {
      const token = localStorage.getItem('futstats_auth_token');
      const res = await fetch(`/api/clubes/comparar?clube1=${encodeURIComponent(c1)}&clube2=${encodeURIComponent(c2)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        throw new Error('Não foi possível carregar os dados do confronto.');
      }
      const data = await res.json();
      setH2hData(data);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar retrospecto.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarConfronto(clubeInicial1, clubeInicial2);
  }, []);

  const selecionarClassico = (c1, c2) => {
    setClube1(c1);
    setClube2(c2);
    carregarConfronto(c1, c2);
  };

  const c1Nome = h2hData?.clube1 || clube1;
  const c2Nome = h2hData?.clube2 || clube2;
  const total = h2hData?.total_jogos || 0;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* ================= SELETOR E CLÁSSICOS RÁPIDOS ================= */}
      <section className="editorial-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
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
              <Swords size={28} color="var(--negative)" />
              Comparador Histórico H2H de Clubes
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '780px', lineHeight: 1.55 }}>
              Confronto direto, estante de títulos oficiais (Palmarés), artilheiros e projeção preditiva Dixon-Coles.
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
              style={{ minHeight: '40px', padding: '9px 18px', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              <Share2 size={16} /> Exportar Card PNG
            </button>
          )}
        </div>

        {/* Chips de Clássicos Populares */}
        <div style={{ marginBottom: '22px' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
            🔥 Duelos Clássicos Populares
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
                    border: ativo ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                    backgroundColor: ativo ? 'var(--accent)' : 'var(--surface-card)',
                    color: ativo ? 'var(--accent-foreground)' : 'var(--text-primary)',
                    transition: 'all 0.18s ease'
                  }}
                >
                  {cl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs de Pesquisa Customizada */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Primeiro Clube
            </label>
            <input
              type="text"
              value={clube1}
              onChange={(e) => setClube1(e.target.value)}
              placeholder="Ex: Flamengo, Palmeiras, Grêmio..."
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
              placeholder="Ex: Vasco, Corinthians, Internacional..."
              className="soft-input"
              style={{ minHeight: '42px' }}
            />
          </div>

          <div>
            <button
              onClick={() => carregarConfronto()}
              disabled={loading || !clube1 || !clube2}
              className="btn-primary touch-tactile"
              style={{ width: '100%', minHeight: '42px', opacity: (loading || !clube1 || !clube2) ? 0.6 : 1 }}
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              Comparar
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
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{erro}</span>
          </div>
        )}
      </section>

      {/* ================= PAINEL PRINCIPAL DE RETROSPECTO ================= */}
      {h2hData && (
        <>
          {/* PLACAR HISTÓRICO GERAL & BARRAS DE PROPORÇÃO */}
          <section className="soft-card" style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                Retrospecto Oficial Consolidado
              </span>
              <h2 className="font-editorial tabular-nums" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                {total} <span style={{ fontSize: '0.95rem', fontWeight: 400, color: 'var(--text-secondary)' }}>jogos no acervo</span>
              </h2>
            </div>

            {/* Confronto Visual Lado a Lado */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center', textAlign: 'center' }}>
              {/* Clube 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ClubBadge clube={c1Nome} size={54} />
                <h3 className="font-editorial" style={{ fontSize: '1.25rem', fontWeight: 700, margin: '8px 0 2px 0' }}>{c1Nome}</h3>
                <div className="tabular-nums" style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--positive)', lineHeight: 1 }}>{vit1}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>vitórias ({pctVit1}%)</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {gols1} gols ({total > 0 ? (gols1 / total).toFixed(2) : 0}/j)
                </span>
              </div>

              {/* Empates */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  backgroundColor: 'var(--surface-raised)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  VS
                </div>
                <div className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1 }}>{emp}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>empates ({pctEmp}%)</span>
              </div>

              {/* Clube 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ClubBadge clube={c2Nome} size={54} />
                <h3 className="font-editorial" style={{ fontSize: '1.25rem', fontWeight: 700, margin: '8px 0 2px 0' }}>{c2Nome}</h3>
                <div className="tabular-nums" style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--negative)', lineHeight: 1 }}>{vit2}</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>vitórias ({pctVit2}%)</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {gols2} gols ({total > 0 ? (gols2 / total).toFixed(2) : 0}/j)
                </span>
              </div>
            </div>

            {/* Barra Visual de Divisão de Vitórias */}
            <div style={{
              width: '100%',
              height: '10px',
              borderRadius: '9999px',
              overflow: 'hidden',
              display: 'flex',
              marginTop: '24px',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ width: `${pctVit1}%`, backgroundColor: 'var(--positive)', height: '100%', transition: 'all 0.5s ease' }} title={`${c1Nome}: ${pctVit1}%`} />
              <div style={{ width: `${pctEmp}%`, backgroundColor: 'var(--text-secondary)', opacity: 0.5, height: '100%', transition: 'all 0.5s ease' }} title={`Empates: ${pctEmp}%`} />
              <div style={{ width: `${pctVit2}%`, backgroundColor: 'var(--negative)', height: '100%', transition: 'all 0.5s ease' }} title={`${c2Nome}: ${pctVit2}%`} />
            </div>

            {/* Nota Histórica Contextual */}
            {h2hData.nota_historica && (
              <div className="editorial-raised" style={{ marginTop: '20px', padding: '14px 18px', fontSize: '0.82rem', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--negative)' }}>📜 Contexto Centenário:</span>
                {h2hData.nota_historica}
              </div>
            )}
          </section>

          {/* PALMARÉS COMPARATIVO (ESTANTE DE TÍTULOS OFICIAIS) */}
          {(palmares1 || palmares2) && (
            <section className="soft-card" style={{ padding: '24px' }}>
              <h3 className="font-editorial" style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={22} color="var(--negative)" />
                Palmarés Comparativo Oficial (Grandes Taças)
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

          {/* ARTILHEIROS DO DUELO & PROJEÇÃO DIXON-COLES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Top Artilheiros do Confronto */}
            <section className="soft-card" style={{ padding: '24px' }}>
              <h3 className="font-editorial" style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={20} color="var(--negative)" />
                Maiores Artilheiros do Confronto
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
                      <span className="font-mono" style={{ fontWeight: 800, color: 'var(--negative)', fontSize: '0.9rem' }}>
                        {art.gols} gols
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Nenhum gol detalhado catalogado para este confronto.
                </div>
              )}
            </section>

            {/* Projeção Dixon-Coles 1X2 */}
            <section className="soft-card" style={{ padding: '24px' }}>
              <h3 className="font-editorial" style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart3 size={20} color="var(--positive)" />
                Projeção Preditiva Dixon-Coles (Próximo Duelo)
              </h3>

              {projDC ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Probabilidades calculadas via modelo bivariado calibrado pelo acervo histórico oficial.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
                    <div className="editorial-raised" style={{ padding: '14px 10px' }}>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, display: 'block', color: 'var(--text-secondary)' }}>{c1Nome}</span>
                      <span className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--positive)' }}>{projDC.prob_clube1}%</span>
                      <span className="font-mono" style={{ fontSize: '0.72rem', display: 'block', color: 'var(--text-secondary)', marginTop: '4px' }}>xG {projDC.xg_clube1}</span>
                    </div>

                    <div className="editorial-raised" style={{ padding: '14px 10px' }}>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, display: 'block', color: 'var(--text-secondary)' }}>Empate</span>
                      <span className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{projDC.prob_empate}%</span>
                    </div>

                    <div className="editorial-raised" style={{ padding: '14px 10px' }}>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, display: 'block', color: 'var(--text-secondary)' }}>{c2Nome}</span>
                      <span className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--negative)' }}>{projDC.prob_clube2}%</span>
                      <span className="font-mono" style={{ fontSize: '0.72rem', display: 'block', color: 'var(--text-secondary)', marginTop: '4px' }}>xG {projDC.xg_clube2}</span>
                    </div>
                  </div>

                  {/* Maiores Goleadas Registradas */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Maiores Goleadas no Acervo
                    </span>
                    {h2hData.maior_goleada_clube1 && (
                      <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--positive)', fontWeight: 600 }}>{c1Nome}:</span>
                        <span>{h2hData.maior_goleada_clube1.placar} ({h2hData.maior_goleada_clube1.ano} - {h2hData.maior_goleada_clube1.campeonato})</span>
                      </div>
                    )}
                    {h2hData.maior_goleada_clube2 && (
                      <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--negative)', fontWeight: 600 }}>{c2Nome}:</span>
                        <span>{h2hData.maior_goleada_clube2.placar} ({h2hData.maior_goleada_clube2.ano} - {h2hData.maior_goleada_clube2.campeonato})</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Dados insuficientes para projeção preditiva.
                </div>
              )}
            </section>
          </div>

          {/* ÚLTIMOS CONFRONTOS */}
          {h2hData.partidas && h2hData.partidas.length > 0 && (
            <section className="soft-card" style={{ padding: '24px' }}>
              <h3 className="font-editorial" style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color="var(--negative)" />
                Últimos Confrontos Realizados
              </h3>

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
                    {h2hData.partidas.slice(0, 15).map((p) => (
                      <tr key={p.id_partida}>
                        <td className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.data || p.ano}</td>
                        <td style={{ fontWeight: 600 }}>{p.campeonato}</td>
                        <td>{p.mandante} x {p.visitante}</td>
                        <td className="font-mono" style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
                          {p.placar || `${p.gols_mandante} x ${p.gols_visitante}`}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{p.estadio || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
