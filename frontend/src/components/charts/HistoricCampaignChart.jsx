import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Trophy, TrendingUp, Calendar, ChevronRight, ChevronLeft, 
  Flame, ShieldCheck, Activity, Info, Sparkles, Award
} from 'lucide-react';
import ClubBadge from '../ClubBadge';

const PRESETS_PADRAO = [
  { clube: 'Flamengo', ano: 2019, label: 'Flamengo 2019', recorde: '90 pts • Jorge Jesus' },
  { clube: 'Cruzeiro', ano: 2003, label: 'Cruzeiro 2003', recorde: '100 pts • Tríplice Coroa' },
  { clube: 'Corinthians', ano: 2015, label: 'Corinthians 2015', recorde: '81 pts • Tite' },
  { clube: 'Palmeiras', ano: 2022, label: 'Palmeiras 2022', recorde: '81 pts • Abel Ferreira' },
  { clube: 'Atlético-MG', ano: 2021, label: 'Atlético-MG 2021', recorde: '84 pts • Hulk' },
  { clube: 'São Paulo', ano: 2006, label: 'São Paulo 2006', recorde: '78 pts • Muricy Ramalho' },
  { clube: 'Fluminense', ano: 2012, label: 'Fluminense 2012', recorde: '77 pts • Fred' },
  { clube: 'Santos', ano: 2002, label: 'Santos 2002', recorde: 'Meninos da Vila' },
  { clube: 'Vasco', ano: 1997, label: 'Vasco 1997', recorde: 'Edmundo • 29 gols' },
  { clube: 'Grêmio', ano: 1996, label: 'Grêmio 1996', recorde: 'Felipão' },
  { clube: 'Botafogo', ano: 1995, label: 'Botafogo 1995', recorde: 'Túlio Maravilha' }
];

export default function HistoricCampaignChart({
  clubeInicial = 'Flamengo',
  anoInicial = 2019
}) {
  const [clube, setClube] = useState(clubeInicial);
  const [ano, setAno] = useState(anoInicial);
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [rodadaHover, setRodadaHover] = useState(null);
  const timelineScrollRef = useRef(null);

  // Busca dados da campanha
  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setErro(null);

    fetch(`/api/clubes/campanha-historica?clube=${encodeURIComponent(clube)}&ano=${ano}`)
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!cancel) {
          if (json.error) {
            setErro(json.error);
            setDados(null);
          } else {
            setDados(json);
            // Default da rodada hover para a última
            if (json.evolucao_rodadas && json.evolucao_rodadas.length > 0) {
              setRodadaHover(json.evolucao_rodadas[json.evolucao_rodadas.length - 1]);
            }
          }
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancel) {
          setErro('Não foi possível carregar a trajetória desta campanha.');
          setLoading(false);
        }
      });

    return () => { cancel = true; };
  }, [clube, ano]);

  const evolucao = dados?.evolucao_rodadas || [];
  const totalRodadas = evolucao.length;

  // Dimensões do Gráfico SVG
  const width = 840;
  const height = 260;
  const padding = { top: 28, right: 30, bottom: 35, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Cálculos de Escala para SVG
  const maxPontos = useMemo(() => {
    if (!evolucao.length) return 100;
    const finalPts = evolucao[evolucao.length - 1].pontos_acumulados;
    return Math.max(finalPts + 5, 80);
  }, [evolucao]);

  const pontosParaSvg = useMemo(() => {
    if (!evolucao.length) return [];
    return evolucao.map((r, i) => {
      const x = padding.left + (i / Math.max(1, totalRodadas - 1)) * graphWidth;
      const y = padding.top + graphHeight - (r.pontos_acumulados / maxPontos) * graphHeight;
      return { ...r, x, y };
    });
  }, [evolucao, totalRodadas, graphWidth, graphHeight, maxPontos, padding]);

  // Caminho SVG para a Linha e Área preenchida
  const { pathLine, pathArea } = useMemo(() => {
    if (pontosParaSvg.length < 2) return { pathLine: '', pathArea: '' };
    const line = pontosParaSvg.reduce((acc, p, i) => (
      i === 0 ? `M ${p.x.toFixed(1)},${p.y.toFixed(1)}` : `${acc} L ${p.x.toFixed(1)},${p.y.toFixed(1)}`
    ), '');
    const firstX = pontosParaSvg[0].x.toFixed(1);
    const lastX = pontosParaSvg[pontosParaSvg.length - 1].x.toFixed(1);
    const bottomY = (padding.top + graphHeight).toFixed(1);
    const area = `${line} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`;
    return { pathLine: line, pathArea: area };
  }, [pontosParaSvg, padding, graphHeight]);

  const rolarTimeline = (dir) => {
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' });
    }
  };

  return (
    <div className="editorial-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Editorial */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.06em', 
              color: 'var(--accent)',
              backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              <Trophy size={12} /> Grandes Campanhas do Futebol Brasileiro
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Evolução Rodada a Rodada
            </span>
          </div>
          <h2 className="font-editorial" style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Trajetória Histórica: {clube} ({ano})
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Acompanhe a curva de pontuação cumulativa, aproveitamento e resultados de ponta a ponta na competição.
          </p>
        </div>

        {/* Presets Rápidos */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Campanhas Históricas em Destaque:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxWidth: '520px', justifyContent: 'flex-end' }}>
            {PRESETS_PADRAO.slice(0, 6).map((preset) => {
              const ativo = preset.clube === clube && preset.ano === ano;
              return (
                <button
                  key={`${preset.clube}-${preset.ano}`}
                  onClick={() => {
                    setClube(preset.clube);
                    setAno(preset.ano);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '0.75rem',
                    fontWeight: ativo ? 700 : 500,
                    backgroundColor: ativo ? 'var(--accent)' : 'var(--surface-raised)',
                    color: ativo ? 'var(--accent-foreground)' : 'var(--text-secondary)',
                    border: `1px solid ${ativo ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <ClubBadge nome={preset.clube} size={14} />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero da Campanha: Bento Grid Estatístico */}
      {dados && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pontuação Final
            </div>
            <div className="tabular-nums font-editorial" style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--accent)', marginTop: '2px' }}>
              {dados.pontos_finais} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>pts</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Em {dados.total_jogos} partidas
            </div>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Aproveitamento
            </div>
            <div className="tabular-nums font-editorial" style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              {dados.aproveitamento_final}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Eficiência geral
            </div>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Campanha (V-E-D)
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              <span style={{ color: 'var(--positive)' }}>{dados.vitorias}V</span> • <span>{dados.empates}E</span> • <span style={{ color: 'var(--negative)' }}>{dados.derrotas}D</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {(dados.vitorias / Math.max(1, dados.total_jogos) * 100).toFixed(0)}% de vitórias
            </div>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Gols & Saldo
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              {dados.gols_pro} GP • <span style={{ color: dados.saldo_gols >= 0 ? 'var(--positive)' : 'var(--negative)' }}>{dados.saldo_gols > 0 ? `+${dados.saldo_gols}` : dados.saldo_gols} SG</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {dados.media_gols_jogo} gols / jogo
            </div>
          </div>
        </div>
      )}

      {/* Loading ou Erro */}
      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Activity size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', display: 'block', color: 'var(--accent)' }} />
          <span>Carregando dados da campanha histórica...</span>
        </div>
      )}

      {erro && !loading && (
        <div style={{ padding: '20px', borderRadius: 'var(--radius-control)', backgroundColor: 'color-mix(in srgb, var(--negative) 10%, transparent)', color: 'var(--negative)', fontSize: '0.85rem' }}>
          {erro}
        </div>
      )}

      {/* Gráfico SVG de Trajetória Rodada a Rodada */}
      {!loading && dados && pontosParaSvg.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
            <svg
              viewBox={`0 0 ${width} ${height}`}
              style={{ width: '100%', height: 'auto', maxHeight: '300px', display: 'block' }}
            >
              <defs>
                <linearGradient id="gradientCampanha" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines Horizontais */}
              {[0, 25, 50, 75, 100].filter(val => val <= maxPontos).map(val => {
                const y = padding.top + graphHeight - (val / maxPontos) * graphHeight;
                return (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="var(--border-subtle)"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      fill="var(--text-muted)"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="inherit"
                    >
                      {val} pts
                    </text>
                  </g>
                );
              })}

              {/* Área preenchida sob a curva */}
              {pathArea && (
                <path d={pathArea} fill="url(#gradientCampanha)" />
              )}

              {/* Linha da trajetória */}
              {pathLine && (
                <path
                  d={pathLine}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Pontos de cada rodada com feedback hover */}
              {pontosParaSvg.map((p, idx) => {
                const isHovered = rodadaHover?.indice === p.indice;
                const dotColor = p.resultado === 'V' ? 'var(--positive)' : p.resultado === 'D' ? 'var(--negative)' : 'var(--text-secondary)';
                return (
                  <g key={idx} style={{ cursor: 'pointer' }} onMouseEnter={() => setRodadaHover(p)}>
                    {isHovered && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="8"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2"
                        opacity="0.8"
                      />
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 5.5 : 3.5}
                      fill={dotColor}
                      stroke="var(--surface-card)"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}

              {/* Eixo X - Marcadores de Rodada */}
              {pontosParaSvg.filter((_, i) => i === 0 || (i + 1) % 5 === 0 || i === pontosParaSvg.length - 1).map((p, i) => (
                <text
                  key={i}
                  x={p.x}
                  y={height - 10}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="inherit"
                >
                  R{p.rodada}
                </text>
              ))}
            </svg>
          </div>

          {/* Card Detalhado da Rodada Selecionada/Hoverada */}
          {rodadaHover && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    backgroundColor: rodadaHover.resultado === 'V' ? 'var(--positive)' : rodadaHover.resultado === 'D' ? 'var(--negative)' : 'var(--surface-card)',
                    color: rodadaHover.resultado === 'V' || rodadaHover.resultado === 'D' ? '#fff' : 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {rodadaHover.resultado}
                </span>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Rodada {rodadaHover.rodada} • {rodadaHover.mando === 'Casa' ? 'Em Casa' : 'Fora'} • {rodadaHover.data}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    <span>vs {rodadaHover.adversario}</span>
                    <span className="tabular-nums" style={{ color: 'var(--accent)' }}>({rodadaHover.placar})</span>
                    {rodadaHover.estadio && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                        • {rodadaHover.estadio}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Pontos Acumulados
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {rodadaHover.pontos_acumulados} pts
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Aproveitamento
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--positive)' }}>
                    {rodadaHover.aproveitamento_acumulado}%
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Saldo de Gols
                  </div>
                  <div className="tabular-nums" style={{ fontSize: '1.15rem', fontWeight: 700, color: rodadaHover.saldo_gols_acumulado >= 0 ? 'var(--text-primary)' : 'var(--negative)' }}>
                    {rodadaHover.saldo_gols_acumulado > 0 ? `+${rodadaHover.saldo_gols_acumulado}` : rodadaHover.saldo_gols_acumulado}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trilha Horizontal de Jogos (Scroll Suave) */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Sequência das {totalRodadas} Partidas da Campanha:
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => rolarTimeline(-1)}
                  style={{
                    padding: '4px 6px',
                    backgroundColor: 'var(--surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                  aria-label="Rolar para esquerda"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => rolarTimeline(1)}
                  style={{
                    padding: '4px 6px',
                    backgroundColor: 'var(--surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '4px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                  aria-label="Rolar para direita"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div
              ref={timelineScrollRef}
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '8px',
                scrollbarWidth: 'thin'
              }}
            >
              {evolucao.map((jogo, i) => {
                const ativo = rodadaHover?.indice === jogo.indice;
                const bgBadge = jogo.resultado === 'V' ? 'var(--positive)' : jogo.resultado === 'D' ? 'var(--negative)' : 'var(--text-secondary)';
                return (
                  <div
                    key={i}
                    onClick={() => setRodadaHover(jogo)}
                    style={{
                      flex: '0 0 115px',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-control)',
                      backgroundColor: ativo ? 'var(--surface-card)' : 'var(--surface-raised)',
                      border: `1px solid ${ativo ? 'var(--accent)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        R{jogo.rodada}
                      </span>
                      <span 
                        style={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 700, 
                          color: '#fff', 
                          backgroundColor: bgBadge,
                          padding: '1px 5px',
                          borderRadius: '3px'
                        }}
                      >
                        {jogo.resultado}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                      <ClubBadge nome={jogo.adversario} size={14} />
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {jogo.adversario}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
                      <span className="tabular-nums" style={{ fontWeight: 700, color: 'var(--accent)' }}>
                        {jogo.placar}
                      </span>
                      <span className="tabular-nums" style={{ color: 'var(--text-muted)' }}>
                        {jogo.pontos_acumulados}p
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
