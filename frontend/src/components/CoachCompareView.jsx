import React, { useState, useEffect } from 'react';
import { 
  Users, Trophy, Search, RefreshCw, Award, Flame, 
  Share2, ShieldCheck, Brain, Crown, Compass, AlertCircle
} from 'lucide-react';
import { baixarCardDueloTreinadoresPNG } from '../utils/cardGenerator';

const DUELOS_PREDEFINIDOS = [
  { label: 'Duelo Europeu', t1: 'abel_ferreira', t2: 'jorge_jesus', subtitulo: 'A Revolução Tática Portuguesa no Brasil' },
  { label: 'Mestres dos Pontos Corridos', t1: 'muricy_ramalho', t2: 'vanderlei_luxemburgo', subtitulo: 'Tri do SPFC vs A Era de Ouro dos Anos 90/00' },
  { label: 'Arte vs Pragmatismo', t1: 'tele_santana', t2: 'felipao', subtitulo: 'O Jogo Bonito do Mestre vs O General Copeiro' },
  { label: 'Estrategistas da Amarelinha', t1: 'tite', t2: 'dorival_junior', subtitulo: 'Equilíbrio e Merecimento vs Ofensividade e Copas' },
  { label: 'Posicional vs Espontâneo', t1: 'fernando_diniz', t2: 'renato_gaucho', subtitulo: 'Aposento Tático Relacional vs Convicção Carioca' },
  { label: 'Mística Canarinho', t1: 'zagallo', t2: 'tele_santana', subtitulo: 'O Velho Lobo Tetracampeão vs A Poesia do Passe' }
];

const METRICAS_RADAR = [
  { key: 'ofensividade', label: 'Ofensividade', icon: Flame, desc: 'Volume de gols e agressividade em campo adversário' },
  { key: 'solidez_defensiva', label: 'Solidez Defensiva', icon: ShieldCheck, desc: 'Organização da linha baixa e média de gols sofridos' },
  { key: 'gestao_vestiario', label: 'Gestão de Vestiário', icon: Users, desc: 'Liderança emocional, controle de ego e união de grupo' },
  { key: 'decisividade_copas', label: 'Decisão em Copas', icon: Trophy, desc: 'Aproveitamento em mata-matas e finais históricas' },
  { key: 'longevidade', label: 'Longevidade', icon: Crown, desc: 'Capacidade de renovação e relevância por décadas' }
];

export default function CoachCompareView({
  darkMode,
  treinadorInicial1 = 'abel_ferreira',
  treinadorInicial2 = 'jorge_jesus'
}) {
  const [slug1, setSlug1] = useState(treinadorInicial1);
  const [slug2, setSlug2] = useState(treinadorInicial2);
  const [catalogo, setCatalogo] = useState([]);
  const [dueloData, setDueloData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  // Carrega catálogo de treinadores disponíveis
  useEffect(() => {
    const carregarCatalogo = async () => {
      try {
        const token = localStorage.getItem('futstats_auth_token');
        const res = await fetch('/api/treinadores', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setCatalogo(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Erro ao listar treinadores:', err);
      }
    };
    carregarCatalogo();
  }, []);

  // Carrega comparativo entre dois treinadores
  const carregarComparativo = async (t1 = slug1, t2 = slug2) => {
    if (!t1 || !t2) return;
    setLoading(true);
    setErro(null);
    try {
      const token = localStorage.getItem('futstats_auth_token');
      const res = await fetch(`/api/treinadores/comparar?t1=${encodeURIComponent(t1)}&t2=${encodeURIComponent(t2)}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        throw new Error('Não foi possível obter dados comparativos dos treinadores selecionados.');
      }
      const data = await res.json();
      setDueloData(data);
    } catch (e) {
      setErro(e.message || 'Erro ao carregar confronto tático.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarComparativo(treinadorInicial1, treinadorInicial2);
  }, []);

  const selecionarDueloRapido = (t1, t2) => {
    setSlug1(t1);
    setSlug2(t2);
    carregarComparativo(t1, t2);
  };

  const t1 = dueloData?.treinador1;
  const t2 = dueloData?.treinador2;
  const h2h = dueloData?.duelo_direto;

  const totalTitulos1 = t1 ? Object.values(t1.palmares || {}).reduce((a, b) => a + b, 0) : 0;
  const totalTitulos2 = t2 ? Object.values(t2.palmares || {}).reduce((a, b) => a + b, 0) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* ================= PAINEL SUPERIOR: CONTROLES E DUELOS ================= */}
      <section className="editorial-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
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
              <Brain size={14} /> Pranchetas & Filosofias Históricas
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
              Comparador de Mestres Táticos & Treinadores
            </h1>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '780px', lineHeight: 1.55 }}>
              Análise comparativa de carreiras, estante de títulos oficiais (Palmarés), DNA tático e confrontos diretos documentados no acervo.
            </p>
          </div>

          {t1 && t2 && (
            <button
              onClick={() => baixarCardDueloTreinadoresPNG({
                treinador1: t1.nome,
                treinador2: t2.nome,
                apelido1: t1.apelido,
                apelido2: t2.apelido,
                aprov1: t1.aproveitamento,
                aprov2: t2.aproveitamento,
                titulos1: totalTitulos1,
                titulos2: totalTitulos2,
                jogosH2H: h2h?.total_jogos || 0,
                vit1H2H: h2h?.vitorias_t1 || 0,
                vit2H2H: h2h?.vitorias_t2 || 0,
                empH2H: h2h?.empates || 0
              })}
              className="btn-primary touch-tactile"
              style={{ minHeight: '40px', padding: '9px 18px', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}
              title="Baixar card comparativo em alta resolução para redes sociais"
            >
              <Share2 size={16} /> Exportar Card PNG
            </button>
          )}
        </div>

        {/* Chips de Duelos Predefinidos */}
        <div style={{ marginBottom: '22px' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
            ⚡ Clássicos da Prancheta
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
            {DUELOS_PREDEFINIDOS.map((d) => {
              const ativo = (slug1 === d.t1 && slug2 === d.t2) || (slug1 === d.t2 && slug2 === d.t1);
              return (
                <button
                  key={d.label}
                  onClick={() => selecionarDueloRapido(d.t1, d.t2)}
                  className="touch-tactile"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-control)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: ativo ? '2px solid var(--accent)' : '1px solid var(--border-subtle)',
                    backgroundColor: ativo ? 'var(--surface-raised)' : 'var(--surface-card)',
                    color: 'var(--text-primary)',
                    boxShadow: ativo ? 'var(--shadow-editorial)' : 'none',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                    <span>{d.label}</span>
                    {ativo && (
                      <span style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--accent)',
                        color: 'var(--accent-foreground)'
                      }}>
                        Ativo
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.35 }}>
                    {d.subtitulo}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seletores Dropdown de Treinadores */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Primeiro Treinador
            </label>
            <select
              value={slug1}
              onChange={(e) => setSlug1(e.target.value)}
              className="soft-input"
              style={{ minHeight: '42px', cursor: 'pointer' }}
            >
              {catalogo.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.nome} ({cat.titulos_total} títulos)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Segundo Treinador (Rival)
            </label>
            <select
              value={slug2}
              onChange={(e) => setSlug2(e.target.value)}
              className="soft-input"
              style={{ minHeight: '42px', cursor: 'pointer' }}
            >
              {catalogo.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.nome} ({cat.titulos_total} títulos)
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={() => carregarComparativo(slug1, slug2)}
              disabled={loading || !slug1 || !slug2 || slug1 === slug2}
              className="btn-primary touch-tactile"
              style={{ width: '100%', minHeight: '42px', opacity: (loading || !slug1 || !slug2 || slug1 === slug2) ? 0.6 : 1 }}
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              Duelo Tático
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

      {/* ================= PAINEL PRINCIPAL DE CONFRONTO ================= */}
      {t1 && t2 && (
        <>
          {/* CARDS LADO A LADO DOS MESTRES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Card Treinador 1 */}
            <div className="soft-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)' }}>
                    {t1.nacionalidade} • {t1.jogos_carreira} jogos
                  </span>
                  <h2 className="font-editorial" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 2px 0' }}>
                    {t1.nome}
                  </h2>
                  <div style={{ fontSize: '0.85rem', fontStyle: 'italic', fontFamily: 'var(--font-editorial)', color: 'var(--negative)' }}>
                    "{t1.apelido}"
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="tabular-nums" style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--positive)', lineHeight: 1 }}>
                    {t1.aproveitamento}%
                  </div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Aproveitamento
                  </span>
                </div>
              </div>

              {/* DNA Tático */}
              <div className="editorial-raised" style={{ padding: '14px 16px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--negative)', marginBottom: '4px' }}>
                  <Compass size={15} /> Filosofia & Estilo de Jogo
                </div>
                <p style={{ color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                  {t1.estilo_tatico}
                </p>
              </div>

              {/* Clubes Principais */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginRight: '4px' }}>
                  Passagens:
                </span>
                {t1.clubes_principais.map((c) => (
                  <span
                    key={c}
                    className="pill-neutral"
                    style={{ padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Treinador 2 */}
            <div className="soft-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--negative)' }}>
                    {t2.nacionalidade} • {t2.jogos_carreira} jogos
                  </span>
                  <h2 className="font-editorial" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 2px 0' }}>
                    {t2.nome}
                  </h2>
                  <div style={{ fontSize: '0.85rem', fontStyle: 'italic', fontFamily: 'var(--font-editorial)', color: 'var(--negative)' }}>
                    "{t2.apelido}"
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="tabular-nums" style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--negative)', lineHeight: 1 }}>
                    {t2.aproveitamento}%
                  </div>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Aproveitamento
                  </span>
                </div>
              </div>

              {/* DNA Tático */}
              <div className="editorial-raised" style={{ padding: '14px 16px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--negative)', marginBottom: '4px' }}>
                  <Compass size={15} /> Filosofia & Estilo de Jogo
                </div>
                <p style={{ color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                  {t2.estilo_tatico}
                </p>
              </div>

              {/* Clubes Principais */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginRight: '4px' }}>
                  Passagens:
                </span>
                {t2.clubes_principais.map((c) => (
                  <span
                    key={c}
                    className="pill-neutral"
                    style={{ padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* DUELO DIRETO H2H NO BANCO DE DADOS */}
          <section className="soft-card" style={{ padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                Confronto Direto na Área Técnica
              </span>
              <h3 className="font-editorial" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {h2h?.total_jogos > 0 ? (
                  <span>{h2h.total_jogos} duelos diretos registrados no banco</span>
                ) : (
                  <span>Sem confrontos diretos nas bases oficiais</span>
                )}
              </h3>
            </div>

            {h2h?.total_jogos > 0 ? (
              <>
                {/* Placar de Vitórias */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  gap: '20px',
                  alignItems: 'center',
                  textAlign: 'center',
                  maxWidth: '460px',
                  margin: '0 auto 24px',
                  padding: '16px',
                  backgroundColor: 'var(--surface-raised)',
                  borderRadius: 'var(--radius-panel)'
                }}>
                  <div>
                    <div className="tabular-nums" style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--positive)', lineHeight: 1 }}>
                      {h2h.vitorias_t1}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {t1.nome.split(' ')[0]}
                    </span>
                  </div>
                  <div>
                    <div className="tabular-nums" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-secondary)', lineHeight: 1 }}>
                      {h2h.empates}
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Empates</span>
                  </div>
                  <div>
                    <div className="tabular-nums" style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--negative)', lineHeight: 1 }}>
                      {h2h.vitorias_t2}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {t2.nome.split(' ')[0]}
                    </span>
                  </div>
                </div>

                {/* Tabela de Partidas Recentes */}
                <div style={{ overflowX: 'auto' }}>
                  <table className="editorial-table">
                    <thead>
                      <tr>
                        <th style={{ width: '100px' }}>Data/Ano</th>
                        <th>Competição</th>
                        <th style={{ textAlign: 'right' }}>Mandante (Técnico)</th>
                        <th style={{ textAlign: 'center', width: '90px' }}>Placar</th>
                        <th>Visitante (Técnico)</th>
                        <th>Vencedor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {h2h.partidas.map((p, idx) => (
                        <tr key={p.id_partida || idx}>
                          <td className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {p.data || p.ano}
                          </td>
                          <td style={{ fontWeight: 600 }}>{p.campeonato}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600 }}>{p.mandante}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{p.tecnico_mandante || '—'}</div>
                          </td>
                          <td className="font-mono" style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}>
                            {p.placar}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{p.visitante}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{p.tecnico_visitante || '—'}</div>
                          </td>
                          <td>
                            <span className={p.vencedor === 'Empate' || p.vencedor === 'empate' ? 'pill-neutral' : 'pill-olive'} style={{ padding: '2px 8px' }}>
                              {p.vencedor}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="editorial-raised" style={{ padding: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Ambos os treinadores operaram em épocas, divisões ou contextos distintos onde não houve confronto direto documentado entre suas equipes no acervo histórico.
              </div>
            )}
          </section>

          {/* RADAR / DIMENSÕES TÁTICAS COMPARATIVAS */}
          <section className="soft-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                  Auditoria de Atributos da Prancheta
                </span>
                <h3 className="font-editorial" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
                  Radar Tático Comparado (0 a 100)
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--positive)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--positive)' }}></span>
                  {t1.nome.split(' ')[0]}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--negative)' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--negative)' }}></span>
                  {t2.nome.split(' ')[0]}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {METRICAS_RADAR.map((m) => {
                const val1 = t1.radar?.[m.key] || 50;
                const val2 = t2.radar?.[m.key] || 50;
                const IconComponent = m.icon;
                return (
                  <div key={m.key} className="editorial-raised" style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                        <IconComponent size={16} color="var(--accent)" />
                        {m.label}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        {m.desc}
                      </span>
                    </div>

                    {/* Barras de Comparação Lado a Lado */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--positive)' }}>{t1.nome.split(' ')[0]}</span>
                          <span className="font-mono" style={{ fontWeight: 700, color: 'var(--positive)' }}>{val1}/100</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${val1}%`,
                              height: '100%',
                              backgroundColor: 'var(--positive)',
                              borderRadius: '9999px',
                              transition: 'width 0.5s ease'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--negative)' }}>{t2.nome.split(' ')[0]}</span>
                          <span className="font-mono" style={{ fontWeight: 700, color: 'var(--negative)' }}>{val2}/100</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${val2}%`,
                              height: '100%',
                              backgroundColor: 'var(--negative)',
                              borderRadius: '9999px',
                              transition: 'width 0.5s ease'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ESTANTE DE TÍTULOS COMPARADA (PALMARÉS) */}
          <section className="soft-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                  Estante de Títulos Oficiais
                </span>
                <h3 className="font-editorial" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trophy size={20} color="#E5A93C" />
                  Palmarés Comparado
                </h3>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                {totalTitulos1} títulos vs {totalTitulos2} títulos
              </div>
            </div>

            {/* Grid de Troféus por Categoria */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Mundiais', key: 'mundial' },
                { label: 'Libertadores', key: 'libertadores' },
                { label: 'Brasileirão', key: 'brasileirao' },
                { label: 'Copa do Brasil', key: 'copa_do_brasil' },
                { label: 'Estaduais', key: 'estaduais' },
                { label: 'Outros', key: 'outros' }
              ].map((trof) => {
                const qtd1 = t1.palmares?.[trof.key] || 0;
                const qtd2 = t2.palmares?.[trof.key] || 0;
                return (
                  <div
                    key={trof.key}
                    className="editorial-raised"
                    style={{ padding: '12px 10px', textAlign: 'center' }}
                  >
                    <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      {trof.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <span className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: qtd1 > qtd2 ? 'var(--positive)' : 'var(--text-primary)' }}>
                        {qtd1}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>x</span>
                      <span className="tabular-nums" style={{ fontSize: '1.4rem', fontWeight: 800, color: qtd2 > qtd1 ? 'var(--negative)' : 'var(--text-primary)' }}>
                        {qtd2}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Títulos de Destaque Lado a Lado */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="editorial-raised" style={{ padding: '16px' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--positive)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} /> Conquistas Marcantes de {t1.nome.split(' ')[0]}
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                  {t1.titulos_destaque?.map((td, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span style={{ color: 'var(--positive)', fontWeight: 800 }}>•</span>
                      <span style={{ color: 'var(--text-primary)' }}>{td}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="editorial-raised" style={{ padding: '16px' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--negative)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} /> Conquistas Marcantes de {t2.nome.split(' ')[0]}
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                  {t2.titulos_destaque?.map((td, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <span style={{ color: 'var(--negative)', fontWeight: 800 }}>•</span>
                      <span style={{ color: 'var(--text-primary)' }}>{td}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
