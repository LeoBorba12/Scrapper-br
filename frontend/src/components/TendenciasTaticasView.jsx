import React, { useState, useEffect, useMemo } from 'react';
import { Compass, Layers, Target, Activity, RefreshCw, AlertCircle, Shield } from 'lucide-react';
import ClubBadge from './ClubBadge';

function TacticalScatter({
  title,
  subtitle,
  clubes,
  xAccessor,
  yAccessor,
  xLabel,
  yLabel,
  invertX = false,
  diagonalLine = false,
  quadrantLabels,
  selectedId,
  onSelectClub,
  darkMode,
}) {
  const [hovered, setHovered] = useState(null);

  const pts = clubes.filter((c) => xAccessor(c) != null && yAccessor(c) != null);
  if (pts.length === 0) return null;

  const xs = pts.map(xAccessor);
  const ys = pts.map(yAccessor);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const padX = Math.max((maxX - minX) * 0.14, 0.8);
  const padY = Math.max((maxY - minY) * 0.14, 0.8);
  const domX0 = minX - padX;
  const domX1 = maxX + padX;
  const domY0 = minY - padY;
  const domY1 = maxY + padY;

  const medX = xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  const medY = ys.slice().sort((a, b) => a - b)[Math.floor(ys.length / 2)];

  const width = 540;
  const height = 320;
  const pad = { top: 28, right: 24, bottom: 38, left: 48 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const sx = (v) => {
    const ratio = (v - domX0) / Math.max(domX1 - domX0, 0.001);
    return pad.left + (invertX ? 1 - ratio : ratio) * plotW;
  };
  const sy = (v) => pad.top + (1 - (v - domY0) / Math.max(domY1 - domY0, 0.001)) * plotH;

  const midPxX = sx(medX);
  const midPxY = sy(medY);

  return (
    <div
      className="soft-card"
      style={{
        padding: '18px',
        backgroundColor: darkMode ? '#1F1D19' : '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div>
        <h3 className="font-editorial" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
          {subtitle}
        </p>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: '340px', display: 'block' }}>
          {/* Fundo dos 4 quadrantes */}
          <rect x={pad.left} y={pad.top} width={Math.max(0, midPxX - pad.left)} height={Math.max(0, midPxY - pad.top)} fill="rgba(148, 163, 184, 0.04)" />
          <rect x={midPxX} y={pad.top} width={Math.max(0, width - pad.right - midPxX)} height={Math.max(0, midPxY - pad.top)} fill="rgba(34, 197, 94, 0.06)" />
          <rect x={pad.left} y={midPxY} width={Math.max(0, midPxX - pad.left)} height={Math.max(0, height - pad.bottom - midPxY)} fill="rgba(245, 158, 11, 0.05)" />
          <rect x={midPxX} y={midPxY} width={Math.max(0, width - pad.right - midPxX)} height={Math.max(0, height - pad.bottom - midPxY)} fill="rgba(56, 189, 248, 0.04)" />

          {/* Bordas da área */}
          <rect x={pad.left} y={pad.top} width={plotW} height={plotH} fill="none" stroke="var(--border-subtle)" strokeWidth="1" />

          {/* Linhas medianas */}
          <line x1={midPxX} y1={pad.top} x2={midPxX} y2={height - pad.bottom} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
          <line x1={pad.left} y1={midPxY} x2={width - pad.right} y2={midPxY} stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />

          {/* Diagonal y = x opcional (Posse = Field Tilt) */}
          {diagonalLine && (
            <line
              x1={sx(Math.max(domX0, domY0))}
              y1={sy(Math.max(domX0, domY0))}
              x2={sx(Math.min(domX1, domY1))}
              y2={sy(Math.min(domX1, domY1))}
              stroke="var(--accent)"
              strokeWidth="1.2"
              strokeDasharray="6 4"
              opacity="0.65"
            />
          )}

          {/* Rótulos dos 4 quadrantes */}
          {quadrantLabels && (
            <>
              <text x={pad.left + 8} y={pad.top + 14} fill="var(--text-muted)" fontSize="9.5" fontWeight="700" fontFamily="JetBrains Mono, monospace">
                {quadrantLabels.topLeft}
              </text>
              <text x={width - pad.right - 8} y={pad.top + 14} textAnchor="end" fill="#22C55E" fontSize="9.5" fontWeight="700" fontFamily="JetBrains Mono, monospace">
                {quadrantLabels.topRight}
              </text>
              <text x={pad.left + 8} y={height - pad.bottom - 8} fill="#F59E0B" fontSize="9.5" fontWeight="700" fontFamily="JetBrains Mono, monospace">
                {quadrantLabels.bottomLeft}
              </text>
              <text x={width - pad.right - 8} y={height - pad.bottom - 8} textAnchor="end" fill="var(--text-muted)" fontSize="9.5" fontWeight="700" fontFamily="JetBrains Mono, monospace">
                {quadrantLabels.bottomRight}
              </text>
            </>
          )}

          {/* Eixos */}
          <text x={pad.left + plotW / 2} y={height - 6} textAnchor="middle" fill="var(--text-secondary)" fontSize="10.5" fontWeight="700">
            {xLabel}
          </text>
          <text x={14} y={pad.top + plotH / 2} textAnchor="middle" fill="var(--text-secondary)" fontSize="10.5" fontWeight="700" transform={`rotate(-90 14 ${pad.top + plotH / 2})`}>
            {yLabel}
          </text>

          {/* Ticks numéricos */}
          <text x={pad.left - 6} y={midPxY + 3} textAnchor="end" fill="var(--text-muted)" fontSize="9" fontFamily="JetBrains Mono, monospace">
            {medY.toFixed(1)}
          </text>
          <text x={midPxX} y={height - pad.bottom + 13} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="JetBrains Mono, monospace">
            {medX.toFixed(1)}
          </text>

          {/* Pontos dos 20 clubes */}
          {pts.map((c) => {
            const cx = sx(xAccessor(c));
            const cy = sy(yAccessor(c));
            const isSel = Number(selectedId) === Number(c.clube_id_canonico);
            const isHov = hovered?.clube_id_canonico === c.clube_id_canonico;
            const label = c.clube_sigla || (c.clube_nome || '').slice(0, 3).toUpperCase();
            return (
              <g
                key={c.clube_id_canonico}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(c)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelectClub(c.clube_id_canonico)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSel ? 8 : isHov ? 7 : 5.5}
                  fill={isSel ? '#22C55E' : isHov ? 'var(--accent)' : '#85573B'}
                  stroke={darkMode ? '#141310' : '#FFFFFF'}
                  strokeWidth="1.6"
                />
                <text
                  x={cx + 8}
                  y={cy + 3}
                  fill={isSel || isHov ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  fontSize={isSel || isHov ? '10' : '8.8'}
                  fontWeight={isSel || isHov ? '800' : '600'}
                  fontFamily="JetBrains Mono, monospace"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {hovered ? (
        <div className="font-mono" style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', fontSize: '0.74rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{hovered.clube_nome}</strong>
          <span>
            {xLabel.split(' ')[0]}: <strong>{xAccessor(hovered)?.toFixed(1)}</strong> • {yLabel.split(' ')[0]}: <strong>{yAccessor(hovered)?.toFixed(1)}</strong> • Esquema: <strong>{hovered.esquema_principal}</strong>
          </span>
        </div>
      ) : (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Clique ou passe o mouse em qualquer sigla para inspecionar o estilo tático do clube.
        </div>
      )}
    </div>
  );
}

function PranchetaXI({ clube, darkMode }) {
  const xi = Array.isArray(clube?.xi_medio) ? clube.xi_medio : [];
  if (xi.length === 0) {
    return (
      <div style={{ padding: '24px', borderRadius: '8px', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Posições médias dos 11 titulares ainda não sincronizadas para este clube.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg viewBox="0 0 112 74" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px', backgroundColor: darkMode ? '#142619' : '#25442e', border: '1px solid var(--border-subtle)' }}>
        {/* Gramado FIFA simplificado (ataque -> direita) */}
        <g stroke="rgba(255,255,255,0.28)" strokeWidth="0.45" fill="none">
          <rect x="4" y="4" width="104" height="66" />
          <line x1="56" y1="4" x2="56" y2="70" />
          <circle cx="56" cy="37" r="9" />
          <rect x="4" y="18" width="16" height="38" />
          <rect x="92" y="18" width="16" height="38" />
          <rect x="4" y="27" width="6" height="20" />
          <rect x="102" y="27" width="6" height="20" />
        </g>

        <text x="56" y="72.7" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="2.2" fontFamily="JetBrains Mono, monospace">
          SENTIDO OFENSIVO →
        </text>

        {xi.map((p, i) => {
          const cx = 4 + (Math.max(4, Math.min(96, Number(p.x) || 50)) / 100) * 104;
          const cy = 4 + (Math.max(6, Math.min(94, Number(p.y) || 50)) / 100) * 66;
          const shortName = (p.nome || '').split(' ').slice(-1)[0].slice(0, 11);
          const isGK = Number(p.posId) === 11 || i === 0;
          return (
            <g key={p.id || i}>
              <circle
                cx={cx}
                cy={cy}
                r="2.9"
                fill={isGK ? '#F59E0B' : '#22C55E'}
                stroke="#0F172A"
                strokeWidth="0.55"
              />
              <text x={cx} y={cy + 0.95} textAnchor="middle" fill="#0B0E11" fontSize="2.2" fontWeight="800" fontFamily="JetBrains Mono, monospace">
                {p.camisa || ''}
              </text>
              <rect x={cx - 8.5} y={cy + 3.4} width="17" height="3.2" rx="0.8" fill="rgba(11, 14, 17, 0.78)" />
              <text x={cx} y={cy + 5.7} textAnchor="middle" fill="#F8FAFC" fontSize="2.1" fontWeight="700">
                {shortName}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function TendenciasTaticasView({ darkMode }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedClubId, setSelectedClubId] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/spatial/tendencias-taticas')
      .then((r) => r.json())
      .then((d) => {
        if (!d?.sucesso) throw new Error(d?.error || 'Erro ao carregar tendências táticas.');
        setData(d);
        if (d.clubes?.length > 0) {
          setSelectedClubId(d.clubes[0].clube_id_canonico);
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const clubes = data?.clubes || [];
  const clubeAtivo = useMemo(
    () => clubes.find((c) => Number(c.clube_id_canonico) === Number(selectedClubId)) || clubes[0] || null,
    [clubes, selectedClubId]
  );

  if (loading) {
    return (
      <div className="soft-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={22} className="animate-spin" style={{ marginBottom: '8px' }} />
        <div>Carregando mapa tático e formações dos 20 clubes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="soft-card" style={{ padding: '24px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertCircle size={18} />
        <span>{error}</span>
      </div>
    );
  }

  const azTotal = clubeAtivo?.attacking_zones?.total;
  const az1T = clubeAtivo?.attacking_zones?.firstHalf;
  const az2T = clubeAtivo?.attacking_zones?.secondHalf;
  const sp = clubeAtivo?.shot_profile || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ================= QUADRANTES TÁTICOS DOS 20 CLUBES ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '16px' }}>
        <TacticalScatter
          title="Pressão sem Bola vs Altura da Linha Defensiva"
          subtitle="Eixo horizontal invertido: quanto mais à direita, menor o PPDA (mais intensa a pressão)."
          clubes={clubes}
          xAccessor={(c) => c.ppda}
          yAccessor={(c) => c.altura_defensiva}
          xLabel="← Menos Pressão | PPDA | Mais Pressão →"
          yLabel="Altura Defensiva (m)"
          invertX={true}
          quadrantLabels={{
            topLeft: 'LINHA ALTA + CONTENÇÃO',
            topRight: 'PRESSÃO ALTA (GEGENPRESS)',
            bottomLeft: 'BLOCO BAIXO REATIVO',
            bottomRight: 'MORDIDA NO MEIO-CAMPO',
          }}
          selectedId={selectedClubId}
          onSelectClub={setSelectedClubId}
          darkMode={darkMode}
        />

        <TacticalScatter
          title="Posse de Bola vs Domínio Territorial (Field Tilt)"
          subtitle="Clubes acima da linha tracejada convertem posse em presença agressiva no último terço."
          clubes={clubes}
          xAccessor={(c) => c.posse_pct}
          yAccessor={(c) => c.field_tilt_pct}
          xLabel="Posse de Bola Média (%)"
          yLabel="Field Tilt (%)"
          diagonalLine={true}
          quadrantLabels={{
            topLeft: 'ATAQUE VERTICAL DIRETO',
            topRight: 'DOMÍNIO PROPOSITIVO',
            bottomLeft: 'REATIVO / TRANSIÇÃO',
            bottomRight: 'POSSE DE RETENÇÃO',
          }}
          selectedId={selectedClubId}
          onSelectClub={setSelectedClubId}
          darkMode={darkMode}
        />
      </div>

      {/* ================= RAIO-X TÁTICO DO CLUBE SELECIONADO ================= */}
      {clubeAtivo && (
        <div
          className="soft-card"
          style={{
            padding: '20px',
            backgroundColor: darkMode ? '#1F1D19' : '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* Seletor do clube */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ClubBadge nome={clubeAtivo.clube_nome} size={36} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 className="font-editorial" style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Tendência Tática: {clubeAtivo.clube_nome}
                  </h3>
                  {clubeAtivo.esquema_principal && clubeAtivo.esquema_principal !== '—' && (
                    <span className="font-mono" style={{ fontSize: '0.74rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
                      Base: {clubeAtivo.esquema_principal}
                    </span>
                  )}
                  {clubeAtivo.esquema_recente_5 &&
                    clubeAtivo.esquema_principal &&
                    clubeAtivo.esquema_recente_5 !== clubeAtivo.esquema_principal && (
                      <span className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.14)', color: '#f59e0b' }}>
                        Recente (5j): {clubeAtivo.esquema_recente_5}
                      </span>
                    )}
                </div>
                <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  Posse: {clubeAtivo.posse_pct}% • Field Tilt: {clubeAtivo.field_tilt_pct}% • PPDA: {clubeAtivo.ppda} • Linha: {clubeAtivo.altura_defensiva}m
                  {clubeAtivo.jogos_taticos > 0 ? ` • ${clubeAtivo.jogos_taticos} jogos analisados` : ''}
                </div>
              </div>
            </div>

            <select
              className="soft-input"
              style={{ width: 'auto', minWidth: '210px', fontSize: '0.84rem' }}
              value={selectedClubId || ''}
              onChange={(e) => setSelectedClubId(Number(e.target.value))}
            >
              {clubes.map((c) => (
                <option key={c.clube_id_canonico} value={c.clube_id_canonico}>
                  {c.clube_nome} ({c.esquema_principal !== '—' ? c.esquema_principal : `${c.pontos} pts`})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '18px' }}>
            {/* Coluna 1: Prancheta XI Médio em Campo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
                <Compass size={15} />
                <span>Estrutura em Campo ({clubeAtivo.esquema_principal || 'XI Titular'})</span>
              </div>
              <PranchetaXI clube={clubeAtivo} darkMode={darkMode} />
            </div>

            {/* Coluna 2: Formações, Zonas de Ataque e Origem dos Chutes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Distribuição de Formações */}
              <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  <Layers size={14} color="var(--accent)" />
                  <span>Esquemas Táticos na Temporada 2026</span>
                </div>
                {clubeAtivo.esquemas?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {clubeAtivo.esquemas.slice(0, 5).map((esq) => (
                      <div key={esq.esquema}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '3px' }}>
                          <strong className="font-mono">{esq.esquema}</strong>
                          <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                            {esq.jogos} jogos ({esq.pct}%)
                          </span>
                        </div>
                        <div style={{ height: '7px', borderRadius: '999px', backgroundColor: 'var(--surface-panel)', overflow: 'hidden' }}>
                          <div style={{ width: `${esq.pct}%`, height: '100%', backgroundColor: 'var(--accent)', borderRadius: '999px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Formações detalhadas indisponíveis offline.</div>
                )}
              </div>

              {/* Zonas de Ataque (Flancos vs Centro) */}
              {azTotal && (
                <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                    <Shield size={14} color="var(--accent)" />
                    <span>Canais de Ataque (Esquerda / Centro / Direita)</span>
                  </div>
                  {[
                    { label: 'Temporada Completa', z: azTotal },
                    az1T ? { label: '1º Tempo', z: az1T } : null,
                    az2T ? { label: '2º Tempo', z: az2T } : null,
                  ]
                    .filter(Boolean)
                    .map((row) => (
                      <div key={row.label} style={{ marginBottom: '9px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                          <span>{row.label}</span>
                          <span className="font-mono">
                            Esq {row.z.left}% • Cen {row.z.center}% • Dir {row.z.right}%
                          </span>
                        </div>
                        <div style={{ display: 'flex', height: '9px', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${row.z.left}%`, backgroundColor: '#3B82F6' }} title={`Esquerda: ${row.z.left}%`} />
                          <div style={{ width: `${row.z.center}%`, backgroundColor: '#22C55E' }} title={`Centro: ${row.z.center}%`} />
                          <div style={{ width: `${row.z.right}%`, backgroundColor: '#F59E0B' }} title={`Direita: ${row.z.right}%`} />
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Origem e Perfil Real das Finalizações */}
              {sp.total > 0 && (
                <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                    <Target size={14} color="var(--accent)" />
                    <span>Perfil Coletivo de Finalizações ({sp.total} chutes mapeados)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'var(--surface-panel)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Dentro da Área</div>
                      <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#22C55E' }}>{sp.dentro_area_pct}%</div>
                    </div>
                    <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'var(--surface-panel)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Bola Parada</div>
                      <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F59E0B' }}>{sp.bola_parada_pct}%</div>
                    </div>
                    <div style={{ padding: '8px', borderRadius: '6px', backgroundColor: 'var(--surface-panel)', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Contra-Ataque</div>
                      <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38BDF8' }}>{sp.contra_ataque_pct}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Linha do tempo tática recente (últimos jogos) */}
          {clubeAtivo.tendencia_esquemas?.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <Activity size={14} color="var(--accent)" />
                <span>Histórico Recente de Esquemas por Partida</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {clubeAtivo.tendencia_esquemas.slice().reverse().map((g, idx) => (
                  <div
                    key={idx}
                    style={{
                      minWidth: '140px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.72rem',
                      flexShrink: 0,
                    }}
                  >
                    <div className="font-mono" style={{ fontWeight: 800, color: 'var(--accent)' }}>{g.esquema}</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {g.casa ? 'vs ' : '@ '}
                      {g.adversario}
                    </div>
                    <div className="font-mono" style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                      {g.placar} • {g.data}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legenda discreta no rodapé */}
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>
        Fontes: {data?.fontes}
      </div>
    </div>
  );
}
