import React, { useState } from 'react';
import { Trophy, Calendar, Target, Flame, ChevronRight, Award } from 'lucide-react';
import ClubBadge from '../ClubBadge';

/**
 * AthleteCareerTimeline - Linha do Tempo Horizontal Interativa da Carreira do Atleta
 * Estética Editorial 2026 (Areia, Carvão, Oliva, Terracota) em conformidade com WCAG 2.2 AA.
 */
export default function AthleteCareerTimeline({
  temporadas = [],
  titulos = [],
  anoSelecionado = null,
  onSelectAno = null
}) {
  const [hoveredAno, setHoveredAno] = useState(null);

  if (!temporadas || temporadas.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
        Sem histórico cronológico de temporadas registrado para este atleta.
      </div>
    );
  }

  // Ordena cronologicamente crescente
  const dados = [...temporadas]
    .filter(t => t.ano)
    .sort((a, b) => Number(a.ano) - Number(b.ano));

  // Mapa de títulos por ano para enriquecer a timeline
  const titulosPorAno = {};
  (titulos || []).forEach(t => {
    const anoMatch = String(t.ano || t.temporada || '').match(/\d{4}/);
    if (anoMatch) {
      const a = Number(anoMatch[0]);
      if (!titulosPorAno[a]) titulosPorAno[a] = [];
      titulosPorAno[a].push(t.nome || t.campeonato || t.titulo || 'Título Oficial');
    }
  });

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-panel, 12px)',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}
    >
      {/* HEADER DA TIMELINE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              backgroundColor: 'var(--surface-page)',
              color: 'var(--accent)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-control)'
            }}
          >
            <Calendar size={13} /> Linha do Tempo &bull; Trajetória de Carreira
          </span>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Evolução cronológica ano a ano ({dados[0]?.ano} &ndash; {dados[dados.length - 1]?.ano})
          </span>
        </div>

        <span style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>
          Arraste lateralmente &bull; Clique para inspecionar o ano
        </span>
      </div>

      {/* CONTAINER HORIZONTAL COM ROLAGEM SUAVE */}
      <div
        className="touch-horizontal-scroll"
        style={{
          display: 'flex',
          overflowX: 'auto',
          paddingBottom: '12px',
          paddingTop: '6px',
          position: 'relative',
          gap: '24px'
        }}
      >
        {dados.map((temp, index) => {
          const anoNum = Number(temp.ano);
          const isAtivo = anoSelecionado === anoNum;
          const isHovered = hoveredAno === anoNum;
          const titulosDoAno = titulosPorAno[anoNum] || [];
          const clubePrincipal = temp.clubes?.[0] || 'Clube';

          return (
            <div
              key={anoNum}
              role="button"
              tabIndex={0}
              onClick={() => onSelectAno && onSelectAno(anoNum)}
              onMouseEnter={() => setHoveredAno(anoNum)}
              onMouseLeave={() => setHoveredAno(null)}
              className="touch-tactile"
              style={{
                flex: '0 0 170px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              {/* LINHA CONECTORA HORIZONTAL ENTRE OS NÓS */}
              {index < dados.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '28px',
                    left: '50%',
                    width: '100%',
                    height: '2px',
                    backgroundColor: 'var(--border-subtle)',
                    zIndex: 0
                  }}
                />
              )}

              {/* MARCADOR / NÓ DO ANO */}
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: isAtivo ? 'var(--accent)' : 'var(--surface-page)',
                  border: isAtivo
                    ? '2px solid var(--accent)'
                    : isHovered
                    ? '2px solid var(--accent)'
                    : '2px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isAtivo ? 'var(--accent-foreground)' : 'var(--text-primary)',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  zIndex: 2,
                  boxShadow: isAtivo ? '0 0 12px var(--accent-soft)' : 'none',
                  transition: 'all 140ms ease'
                }}
              >
                {String(anoNum).slice(2)}
              </div>

              {/* ANO COMPLETO */}
              <div
                className="font-editorial"
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: isAtivo ? 'var(--accent)' : 'var(--text-primary)',
                  marginTop: '8px'
                }}
              >
                {anoNum}
              </div>

              {/* ESCUDO DO CLUBE */}
              <div style={{ margin: '6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ClubBadge nome={clubePrincipal} size={28} />
              </div>

              <div
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '140px'
                }}
                title={clubePrincipal}
              >
                {clubePrincipal}
              </div>

              {/* CARD DE ESTATÍSTICAS DA TEMPORADA */}
              <div
                style={{
                  marginTop: '8px',
                  width: '100%',
                  backgroundColor: isAtivo ? 'var(--accent-soft)' : 'var(--surface-page)',
                  border: isAtivo ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-control)',
                  padding: '8px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gols:</span>
                  <strong
                    className="font-mono tabular-nums"
                    style={{
                      fontSize: '0.96rem',
                      fontWeight: 800,
                      color: Number(temp.gols) > 10 ? 'var(--positive)' : 'var(--text-primary)'
                    }}
                  >
                    {temp.gols || 0}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {temp.jogos_rotulo ? `${temp.jogos_rotulo}:` : (temp.acervo_parcial ? 'Jogos c/ Gol:' : 'Jogos:')}
                  </span>
                  <span className="font-mono tabular-nums" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {temp.jogos || 0} j{temp.acervo_parcial ? '*' : ''}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Média:</span>
                  <span className="font-mono tabular-nums" style={{ fontSize: '0.76rem', color: 'var(--accent)', fontWeight: 700 }}>
                    {temp.media_gols != null
                      ? (typeof temp.media_gols === 'number' ? temp.media_gols.toFixed(2) : temp.media_gols)
                      : (temp.acervo_parcial ? '—' : (temp.jogos > 0 ? (temp.gols / temp.jogos).toFixed(2) : '0.00'))}
                  </span>
                </div>
              </div>

              {/* BADGE DE TÍTULO CONQUISTADO NO ANO */}
              {titulosDoAno.length > 0 && (
                <div
                  style={{
                    marginTop: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: '#F59E0B',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    fontSize: '0.64rem',
                    fontWeight: 700,
                    maxWidth: '150px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={titulosDoAno.join(' • ')}
                >
                  <Trophy size={11} />
                  <span>{titulosDoAno[0]}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
