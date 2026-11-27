import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldAlert, Trophy, HelpCircle, Sliders, RotateCcw, BookOpen, CheckCircle2 } from 'lucide-react';
import ClubBadge from './ClubBadge';
import { MetricTooltip } from './EconometriaVisuals';

const METODOLOGIAS_GUIA = [
  {
    titulo: '1. Pi-Ratings Dinâmicos (Casa e Fora)',
    didatica: 'Nota de força que cada time ganha e perde a cada jogo — separando desempenho em casa e fora e considerando o saldo de gols sem deixar uma goleada isolada distorcer tudo.',
    motivo: 'Nos benchmarks acadêmicos internacionais (Soccer Prediction Challenge), é o indicador de força mais consistente para futebol.',
    fraco: 'Reage gradualmente: se um time contratar 8 titulares novos de uma vez, leva algumas rodadas para refletir totalmente o novo patamar.'
  },
  {
    titulo: '2. Matriz Dixon-Coles (1997)',
    didatica: 'Converte a expectativa de gols (ex.: 1.5 x 1.0) em probabilidades para todos os placares possíveis (0x0, 1x0, 2x1...), corrigindo o viés que subestimava empates de poucos gols.',
    motivo: 'Padrão ouro mundial para gerar Fair Odds coerentes em 1X2, Over/Under e Ambas Marcam a partir do mesmo motor.',
    fraco: 'Não antecipa choques extremos dentro do jogo, como uma expulsão aos 10 minutos ou chuva torrencial alagando o campo.'
  },
  {
    titulo: '3. Processo em Campo (xG, Field Tilt & PPDA)',
    didatica: 'Olha quem criou as melhores chances de gol (xG), quem dominou o campo de ataque (Field Tilt) e quem pressionou mais alto (PPDA), não só o placar bruto.',
    motivo: 'No curto prazo, sorte ou um goleiro inspirado mascaram o placar; o processo prevê melhor os jogos seguintes.',
    fraco: 'Em poucas rodadas, não captura sozinho finalizadores muito acima da média nem a fase individual do goleiro.'
  },
  {
    titulo: '4. Desfalques via RAPM & WAR (NBA / Beisebol)',
    didatica: 'O RAPM usa Regressão Ridge para medir quantos gols de saldo um titular agrega ao time (descontando companheiros e adversários). O WAR traduz isso em pontos na tabela.',
    motivo: 'Permite simular em 1 clique o impacto real de um craque suspenso ou lesionado.',
    fraco: 'Quando dois titulares jogam quase sempre juntos, há colinearidade para separar o mérito exato de cada um; mede apenas titulares.'
  },
  {
    titulo: '5. Fadiga de Calendário — Rest Advantage (NBA)',
    didatica: 'Compara quantos dias cada clube descansou desde o último jogo (ex.: quem jogou Libertadores na quarta contra quem teve a semana livre).',
    motivo: 'Variável contextual comprovada em esportes de calendário intenso como o Brasileirão.',
    fraco: 'Não detecta automaticamente se o técnico poupou titulares escalando reservas na partida anterior.'
  },
  {
    titulo: '6. Incerteza (Glicko-2 + Conformal Prediction)',
    didatica: 'Sinaliza o grau de previsibilidade do confronto (Alta Confiança, Moderada ou Jogo Imprevisível) conforme a regularidade recente dos times.',
    motivo: 'Transparência científica: evita vender falsa certeza em jogos altamente caóticos.',
    fraco: 'A cobertura estatística vale para o conjunto de muitos jogos, nunca como garantia em uma partida isolada.'
  },
  {
    titulo: '7. Prior Estrutural Econômico (Orçamento, SAF & IBGE)',
    didatica: 'Usa porte financeiro do clube, modelo SAF e mercado da cidade-sede (PIB/população IBGE) como ponto de partida estrutural para simular a temporada.',
    motivo: 'Na Economia do Esporte, folha salarial e receita explicam 60%–80% da tabela no longo prazo.',
    fraco: 'Não impede crises internas em elencos caros nem campanhas surpreendentes de clubes de orçamento enxuto.'
  },
  {
    titulo: '8. Simulação Monte Carlo + Backtest em RPS',
    didatica: 'Simula o restante do Brasileirão 1.200 vezes para projetar Título, G-4 e Z-4, e testa o motor no passado (2024–2025) usando RPS (Ranked Probability Score).',
    motivo: 'Prova objetivamente fora da amostra se o modelo híbrido supera o modelo simples.',
    fraco: 'A projeção depende da qualidade dos parâmetros atuais — mudanças bruscas no meio do ano exigem novas rodadas para recalibrar.'
  }
];

export default function OraculoPreditivoView() {
  const [subTab, setSubTab] = useState('partida'); // 'partida' | 'campeonato' | 'metodologia'
  const [modoQuant, setModoQuant] = useState(false); // false = Modo Simples (Leigos), true = Modo Quant

  const [clubes, setClubes] = useState([]);
  const [elencosRapm, setElencosRapm] = useState({});
  const [jogosSugeridos, setJogosSugeridos] = useState([]);
  const [mandante, setMandante] = useState('Flamengo');
  const [visitante, setVisitante] = useState('Palmeiras');
  const [desfalquesM, setDesfalquesM] = useState([]);
  const [desfalquesV, setDesfalquesV] = useState([]);
  const [descansoM, setDescansoM] = useState(4);
  const [descansoV, setDescansoV] = useState(4);

  const [simulacao, setSimulacao] = useState(null);
  const [loadingSim, setLoadingSim] = useState(false);

  const [projecaoCamp, setProjecaoCamp] = useState([]);
  const [backtest, setBacktest] = useState([]);
  const [loadingCamp, setLoadingCamp] = useState(false);

  useEffect(() => {
    fetch('/api/oraculo-preditivo/clubes')
      .then((r) => r.json())
      .then((d) => {
        if (d.sucesso) {
          setClubes(d.clubes || []);
          setElencosRapm(d.elencos_rapm || {});
          setJogosSugeridos(d.jogos_sugeridos || []);
        }
      })
      .catch(() => {});

    fetch('/api/oraculo-preditivo/backtest')
      .then((r) => r.json())
      .then((d) => {
        if (d.sucesso) setBacktest(d.backtest || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!mandante || !visitante || mandante === visitante) return;
    setLoadingSim(true);
    fetch('/api/oraculo-preditivo/simular-partida', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mandante,
        visitante,
        desfalques_mandante: desfalquesM,
        desfalques_visitante: desfalquesV,
        dias_descanso_mandante: descansoM,
        dias_descanso_visitante: descansoV
      })
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.sucesso) setSimulacao(d);
        setLoadingSim(false);
      })
      .catch(() => setLoadingSim(false));
  }, [mandante, visitante, desfalquesM, desfalquesV, descansoM, descansoV]);

  useEffect(() => {
    if (subTab !== 'campeonato' || projecaoCamp.length > 0) return;
    setLoadingCamp(true);
    fetch('/api/oraculo-preditivo/simular-campeonato')
      .then((r) => r.json())
      .then((d) => {
        if (d.sucesso) setProjecaoCamp(d.projecao || []);
        setLoadingCamp(false);
      })
      .catch(() => setLoadingCamp(false));
  }, [subTab, projecaoCamp.length]);

  const toggleDesfalque = (lado, idJogador) => {
    if (lado === 'M') {
      setDesfalquesM((prev) => (prev.includes(idJogador) ? prev.filter((x) => x !== idJogador) : [...prev, idJogador]));
    } else {
      setDesfalquesV((prev) => (prev.includes(idJogador) ? prev.filter((x) => x !== idJogador) : [...prev, idJogador]));
    }
  };

  const elencoM = elencosRapm[mandante] || [];
  const elencoV = elencosRapm[visitante] || [];
  const probs = simulacao?.probabilidades;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
      {/* CABEÇALHO DO ORÁCULO PREDITIVO */}
      <div className="soft-card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              ● Motor Preditivo Multi-Fator • Pi-Ratings + Dixon-Coles + xG + RAPM + Economia
            </div>
            <h1 className="font-editorial" style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
              Oráculo Preditivo Interativo
            </h1>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '720px' }}>
              Simule qualquer confronto, teste o impacto de desfalques ou cansaço em 1 clique e entenda em linguagem simples o porquê de cada probabilidade.
            </p>
          </div>

          {/* Seletor Modo Simples vs Modo Quant */}
          <div style={{ display: 'inline-flex', padding: '4px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setModoQuant(false)}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-control)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: !modoQuant ? 'var(--accent)' : 'transparent',
                color: !modoQuant ? 'var(--accent-foreground)' : 'var(--text-secondary)'
              }}
            >
              Modo Simples (Para Todos)
            </button>
            <button
              onClick={() => setModoQuant(true)}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-control)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: modoQuant ? 'var(--accent)' : 'transparent',
                color: modoQuant ? 'var(--accent-foreground)' : 'var(--text-secondary)'
              }}
            >
              Modo Quant (Avançado)
            </button>
          </div>
        </div>

        {/* Sub-abas */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', flexWrap: 'wrap' }}>
          {[
            { id: 'partida', label: 'Simulador de Partida ("E se...?")', icon: Sliders },
            { id: 'campeonato', label: 'Projeção do Campeonato (Monte Carlo)', icon: Trophy },
            { id: 'metodologia', label: 'Como Funciona & Pontos Fracos', icon: BookOpen }
          ].map((t) => {
            const Icon = t.icon;
            const active = subTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSubTab(t.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-control)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  backgroundColor: active ? 'var(--accent-soft)' : 'var(--surface-raised)',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: active ? 700 : 600,
                  cursor: 'pointer'
                }}
              >
                <Icon size={15} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= SUB-ABA 1: SIMULADOR DE PARTIDA ================= */}
      {subTab === 'partida' && (
        <>
          {/* Passo 1: Seleção do Confronto + Chips da Rodada */}
          <div className="soft-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <span className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                1. Escolha o Confronto ou Clique em um Jogo da Rodada
              </span>
              {(desfalquesM.length > 0 || desfalquesV.length > 0 || descansoM !== 4 || descansoV !== 4) && (
                <button
                  onClick={() => { setDesfalquesM([]); setDesfalquesV([]); setDescansoM(4); setDescansoV(4); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'none', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '4px 10px', color: 'var(--text-secondary)', fontSize: '0.74rem', cursor: 'pointer' }}
                >
                  <RotateCcw size={13} /> Resetar Cenário
                </button>
              )}
            </div>

            {jogosSugeridos.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {jogosSugeridos.map((j) => (
                  <button
                    key={j.id_partida}
                    onClick={() => { setMandante(j.mandante); setVisitante(j.visitante); setDesfalquesM([]); setDesfalquesV([]); }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: (mandante === j.mandante && visitante === j.visitante) ? 'var(--accent-soft)' : 'var(--surface-raised)',
                      color: (mandante === j.mandante && visitante === j.visitante) ? 'var(--accent)' : 'var(--text-secondary)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {j.mandante} × {j.visitante}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'center' }}>
              <div>
                <label className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>MANDANTE (EM CASA)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClubBadge nome={mandante} size={26} />
                  <select
                    value={mandante}
                    onChange={(e) => { setMandante(e.target.value); setDesfalquesM([]); }}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontWeight: 700 }}
                  >
                    {clubes.map((c) => <option key={c.clube} value={c.clube}>{c.clube}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>VISITANTE (FORA)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClubBadge nome={visitante} size={26} />
                  <select
                    value={visitante}
                    onChange={(e) => { setVisitante(e.target.value); setDesfalquesV([]); }}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontWeight: 700 }}
                  >
                    {clubes.map((c) => <option key={c.clube} value={c.clube}>{c.clube}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Passo 2: Veredito em Linguagem Humana + Barra Visual */}
          {simulacao && probs && (
            <div className="soft-card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {simulacao.veredito.manchete}
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    {simulacao.veredito.resumo_leigo}
                  </p>
                </div>
                <span
                  className="font-mono"
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    backgroundColor: simulacao.incerteza.nivel_confianca === 'Alta Confiança' ? 'var(--positive-bg)' : 'var(--negative-bg)',
                    color: simulacao.incerteza.nivel_confianca === 'Alta Confiança' ? 'var(--positive)' : 'var(--negative)'
                  }}
                >
                  {simulacao.incerteza.nivel_confianca} (±{simulacao.incerteza.margem_conformal_pct}%)
                </span>
              </div>

              {/* Barra Tricolor de Probabilidades */}
              <div style={{ display: 'flex', height: '32px', borderRadius: 'var(--radius-control)', overflow: 'hidden', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
                <div className="font-mono" style={{ width: `${probs.prob_mandante}%`, backgroundColor: '#22C55E', color: '#052E16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                  {mandante.slice(0, 3).toUpperCase()} {probs.prob_mandante}%
                </div>
                <div className="font-mono" style={{ width: `${probs.prob_empate}%`, backgroundColor: '#334155', color: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem' }}>
                  EMP {probs.prob_empate}%
                </div>
                <div className="font-mono" style={{ width: `${probs.prob_visitante}%`, backgroundColor: '#F59E0B', color: '#1F1300', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                  {visitante.slice(0, 3).toUpperCase()} {probs.prob_visitante}%
                </div>
              </div>

              {/* Resumo Rápido de Gols & Placares */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
                  <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PLACAR ESPERADO (xG)</div>
                  <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {simulacao.lambda_mandante} × {simulacao.lambda_visitante}
                  </div>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
                  <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>MAIS DE 2.5 GOLS</div>
                  <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>{probs.prob_over_2_5}%</div>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
                  <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>AMBAS MARCAM (BTTS)</div>
                  <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{probs.prob_btts_sim}%</div>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
                  <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PLACAR MAIS PROVÁVEL</div>
                  <div className="font-mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {probs.top_placares?.[0]?.placar} ({probs.top_placares?.[0]?.prob_pct}%)
                  </div>
                </div>
                {modoQuant && (
                  <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
                    <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>FAIR ODDS (1 / X / 2)</div>
                    <div className="font-mono" style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
                      {probs.fair_odd_mandante} / {probs.fair_odd_empate} / {probs.fair_odd_visitante}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Passo 3: Simulador Interativo "E se...?" (Desfalques via RAPM/WAR & Descanso) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <div className="soft-card" style={{ padding: '18px 20px' }}>
              <div className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '6px' }}>
                2. Simulador "E se...?" — Desfalques &amp; Cansaço
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                Clique em qualquer titular abaixo para simular sua ausência (impacto calculado via RAPM/WAR):
              </p>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Desfalques no {mandante}:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {elencoM.length > 0 ? elencoM.map((p) => {
                    const out = desfalquesM.includes(p.id_jogador);
                    return (
                      <button
                        key={p.id_jogador}
                        onClick={() => toggleDesfalque('M', p.id_jogador)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '4px',
                          border: `1px solid ${out ? 'var(--negative)' : 'var(--border-subtle)'}`,
                          backgroundColor: out ? 'var(--negative-bg)' : 'var(--surface-raised)',
                          color: out ? 'var(--negative)' : 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: out ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {out ? '✕ FORA: ' : ''}{p.nome} {modoQuant ? `(+${p.war_pts} WAR)` : ''}
                      </button>
                    );
                  }) : <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Sem titulares RAPM mapeados para este clube.</span>}
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Desfalques no {visitante}:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {elencoV.length > 0 ? elencoV.map((p) => {
                    const out = desfalquesV.includes(p.id_jogador);
                    return (
                      <button
                        key={p.id_jogador}
                        onClick={() => toggleDesfalque('V', p.id_jogador)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '4px',
                          border: `1px solid ${out ? 'var(--negative)' : 'var(--border-subtle)'}`,
                          backgroundColor: out ? 'var(--negative-bg)' : 'var(--surface-raised)',
                          color: out ? 'var(--negative)' : 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: out ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {out ? '✕ FORA: ' : ''}{p.nome} {modoQuant ? `(+${p.war_pts} WAR)` : ''}
                      </button>
                    );
                  }) : <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Sem titulares RAPM mapeados para este clube.</span>}
                </div>
              </div>

              {/* Controle simples de Descanso */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div>
                  <label className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    DESCANSO {mandante.toUpperCase()}
                  </label>
                  <select value={descansoM} onChange={(e) => setDescansoM(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.78rem' }}>
                    <option value={2}>Maratona (2 dias)</option>
                    <option value={4}>Normal (4 dias)</option>
                    <option value={7}>Semana Livre (7 dias)</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    DESCANSO {visitante.toUpperCase()}
                  </label>
                  <select value={descansoV} onChange={(e) => setDescansoV(Number(e.target.value))} style={{ width: '100%', padding: '6px', borderRadius: '4px', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.78rem' }}>
                    <option value={2}>Maratona (2 dias)</option>
                    <option value={4}>Normal (4 dias)</option>
                    <option value={7}>Semana Livre (7 dias)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Passo 4: Por que o Oráculo pensa assim? */}
            {simulacao && (
              <div className="soft-card" style={{ padding: '18px 20px' }}>
                <div className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  3. Por que o Oráculo pensa assim? (Decomposição)
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                  Verde favorece o <strong>{mandante}</strong>; âmbar favorece o <strong>{visitante}</strong>:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {simulacao.decomposicao.map((d) => {
                    const val = Number(d.impacto_saldo) || 0;
                    const pct = Math.min(100, Math.abs(val) * 140);
                    const isM = val >= 0;
                    return (
                      <div key={d.fator}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{d.fator}</span>
                          <span className="font-mono" style={{ fontWeight: 700, color: isM ? 'var(--positive)' : 'var(--negative)' }}>
                            {val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2)} gols
                          </span>
                        </div>
                        <div style={{ height: '6px', borderRadius: '999px', backgroundColor: 'var(--surface-raised)', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.max(4, pct)}%`, height: '100%', backgroundColor: isM ? '#22C55E' : '#F59E0B' }} />
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{d.explicacao}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ================= SUB-ABA 2: PROJEÇÃO DO CAMPEONATO (MONTE CARLO + ECONOMIA) ================= */}
      {subTab === 'campeonato' && (
        <div className="soft-card" style={{ padding: '18px 20px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Projeção Monte Carlo — Brasileirão Série A 2026 (1.200 Simulações)
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
            Combina o <strong>Prior Estrutural Econômico</strong> (orçamento, SAF e mercado IBGE) com o desempenho em campo (Pi-Ratings + xPTS) para estimar chances finais.
          </p>
          {loadingCamp ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Executando 1.200 simulações Monte Carlo...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="editorial-table" style={{ width: '100%', fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Clube</th>
                    <th>Perfil Econômico</th>
                    <th style={{ textAlign: 'right' }}>Pts Atuais</th>
                    <th style={{ textAlign: 'right' }}>
                      <MetricTooltip align="right" label="Pts Proj." what="Pontuação final média nas 1.200 simulações." how="Combina pontos já conquistados + força esperada nas rodadas restantes." />
                    </th>
                    <th style={{ textAlign: 'right' }}>
                      <MetricTooltip align="right" label="Prior Econ." what="Pontuação esperada apenas por orçamento, SAF e mercado IBGE." how="Serve como régua para medir quem está superando ou decepcionando o orçamento." />
                    </th>
                    <th style={{ textAlign: 'right' }}>Título %</th>
                    <th style={{ textAlign: 'right' }}>G-4 %</th>
                    <th style={{ textAlign: 'right' }}>Z-4 %</th>
                  </tr>
                </thead>
                <tbody>
                  {projecaoCamp.map((c) => (
                    <tr key={c.clube}>
                      <td className="font-mono" style={{ fontWeight: 700 }}>{c.rank_projetado}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                          <ClubBadge nome={c.clube} size={18} />
                          <span>{c.clube}</span>
                        </span>
                      </td>
                      <td style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{c.tier_economico} {c.eh_saf ? '• SAF' : ''}</td>
                      <td className="font-mono" style={{ textAlign: 'right' }}>{c.pontos_atuais}</td>
                      <td className="font-mono" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent)' }}>{c.pontos_projetados.toFixed(1)}</td>
                      <td className="font-mono" style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{c.prior_economico_pts.toFixed(1)}</td>
                      <td className="font-mono" style={{ textAlign: 'right', fontWeight: 700, color: c.prob_titulo_pct >= 10 ? 'var(--positive)' : 'var(--text-muted)' }}>{c.prob_titulo_pct.toFixed(1)}%</td>
                      <td className="font-mono" style={{ textAlign: 'right' }}>{c.prob_g4_pct.toFixed(1)}%</td>
                      <td className="font-mono" style={{ textAlign: 'right', color: c.prob_z4_pct >= 25 ? 'var(--negative)' : 'var(--text-muted)' }}>{c.prob_z4_pct.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= SUB-ABA 3: METODOLOGIA DIDÁTICA, BACKTEST & PONTOS FRACOS ================= */}
      {subTab === 'metodologia' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {backtest.length > 0 && (
            <div className="soft-card" style={{ padding: '18px 20px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                Validação Científica Fora da Amostra (Walk-Forward Série A 2024–2025)
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                Quanto <strong>menor</strong> o RPS (Ranked Probability Score) e o Log-Loss, mais calibrado e preciso é o modelo.
              </p>
              <table className="editorial-table" style={{ width: '100%', fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>Modelo Avaliado</th>
                    <th>Janela</th>
                    <th style={{ textAlign: 'right' }}>Jogos</th>
                    <th style={{ textAlign: 'right' }}>RPS (menor = melhor)</th>
                    <th style={{ textAlign: 'right' }}>Log-Loss</th>
                    <th style={{ textAlign: 'right' }}>Brier Score</th>
                  </tr>
                </thead>
                <tbody>
                  {backtest.map((b) => (
                    <tr key={b.modelo}>
                      <td style={{ fontWeight: 700, color: b.modelo.includes('Híbrido') ? 'var(--accent)' : 'var(--text-primary)' }}>{b.modelo}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{b.janela}</td>
                      <td className="font-mono" style={{ textAlign: 'right' }}>{b.partidas_avaliadas}</td>
                      <td className="font-mono" style={{ textAlign: 'right', fontWeight: 800, color: b.modelo.includes('Híbrido') ? 'var(--positive)' : 'var(--text-primary)' }}>{Number(b.rps).toFixed(4)}</td>
                      <td className="font-mono" style={{ textAlign: 'right' }}>{Number(b.log_loss).toFixed(4)}</td>
                      <td className="font-mono" style={{ textAlign: 'right' }}>{Number(b.brier_score).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {METODOLOGIAS_GUIA.map((m) => (
              <div key={m.titulo} className="soft-card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{m.titulo}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Explicação simples:</strong> {m.didatica}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--positive)' }}>Por que usamos:</strong> {m.motivo}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--negative)', backgroundColor: 'var(--negative-bg)', padding: '8px 10px', borderRadius: '4px', lineHeight: 1.45 }}>
                  <strong>Ponto fraco / Limitação honesta:</strong> {m.fraco}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
