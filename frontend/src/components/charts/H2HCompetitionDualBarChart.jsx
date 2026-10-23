import React, { useState, useMemo } from 'react';

/**
 * Gráfico Comparativo H2H entre dois clubes por competição
 * (vitórias lado a lado em barras duplas)
 */
export default function H2HCompetitionDualBarChart({
  clube1,
  clube2,
  partidas = [],
  cor1 = '#0369A1',
  cor2 = '#BE185D'
}) {
  const [hoveredComp, setHoveredComp] = useState(null);

  // Agrupa e calcula as vitórias e métricas por competição
  const dadosCompeticao = useMemo(() => {
    if (!partidas || partidas.length === 0) return [];

    const compMap = {};

    partidas.forEach((p) => {
      // Normaliza nome do campeonato
      let cName = p.campeonato || 'Outros Torneios';
      if (cName.toLowerCase().includes('brasileiro') || cName.toLowerCase().includes('série a')) {
        cName = 'Brasileirão Série A';
      } else if (cName.toLowerCase().includes('copa do brasil')) {
        cName = 'Copa do Brasil';
      } else if (cName.toLowerCase().includes('libertadores')) {
        cName = 'Copa Libertadores';
      } else if (cName.toLowerCase().includes('sul-americana')) {
        cName = 'Copa Sul-Americana';
      } else if (cName.toLowerCase().includes('paulista')) {
        cName = 'Camp. Paulista';
      } else if (cName.toLowerCase().includes('carioca')) {
        cName = 'Camp. Carioca';
      } else if (cName.toLowerCase().includes('gaúcho')) {
        cName = 'Camp. Gaúcho';
      } else if (cName.toLowerCase().includes('mineiro')) {
        cName = 'Camp. Mineiro';
      } else if (cName.toLowerCase().includes('torneio rio-são paulo') || cName.toLowerCase().includes('rio-sp')) {
        cName = 'Torneio Rio-SP';
      }

      if (!compMap[cName]) {
        compMap[cName] = {
          nome: cName,
          total: 0,
          vit1: 0,
          vit2: 0,
          empates: 0,
          gols1: 0,
          gols2: 0
        };
      }

      const item = compMap[cName];
      item.total += 1;

      const m = p.mandante || '';
      const isC1Mandante = (clube1 || '').toLowerCase() && m.toLowerCase().includes((clube1 || '').toLowerCase());
      const gm = Number(p.gols_mandante) || 0;
      const gv = Number(p.gols_visitante) || 0;

      const gc1 = isC1Mandante ? gm : gv;
      const gc2 = isC1Mandante ? gv : gm;

      item.gols1 += gc1;
      item.gols2 += gc2;

      if (gc1 > gc2) item.vit1 += 1;
      else if (gc2 > gc1) item.vit2 += 1;
      else item.empates += 1;
    });

    // Filtra e ordena por volume total de jogos (decrescente), limitando às principais
    return Object.values(compMap)
      .filter(c => c.total >= 1)
      .sort((a, b) => b.total - a.total)
      .slice(0, 7);
  }, [partidas, clube1, clube2]);

  if (dadosCompeticao.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        Sem dados de competições suficientes para comparação detalhada.
      </div>
    );
  }

  const maxVitorias = Math.max(
    ...dadosCompeticao.map(d => Math.max(d.vit1, d.vit2)),
    3
  );

  const rowHeight = 44;
  const chartHeight = dadosCompeticao.length * rowHeight + 30;

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-panel)',
        padding: '20px',
        boxShadow: 'var(--shadow-editorial)'
      }}
    >
      {/* Cabeçalho do Gráfico */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Comparativo de Vitórias por Competição
          </h4>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            Barras duplas indicando vitórias de cada clube por torneio oficial.
          </span>
        </div>

        {/* Legenda das cores dos dois clubes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: cor1 }} />
            <strong style={{ color: 'var(--text-primary)' }}>{clube1}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: cor2 }} />
            <strong style={{ color: 'var(--text-primary)' }}>{clube2}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Empates</span>
          </div>
        </div>
      </div>

      {/* Lista com Barras Horizontais Duplas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {dadosCompeticao.map((comp) => {
          const pct1 = Math.round((comp.vit1 / maxVitorias) * 100);
          const pct2 = Math.round((comp.vit2 / maxVitorias) * 100);
          const isHov = hoveredComp === comp.nome;

          return (
            <div
              key={comp.nome}
              style={{
                backgroundColor: isHov ? 'var(--surface-raised)' : 'transparent',
                borderRadius: '8px',
                padding: '8px 10px',
                transition: 'background-color 150ms ease',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoveredComp(comp.nome)}
              onMouseLeave={() => setHoveredComp(null)}
            >
              {/* Linha de Título da Competição com Totais */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {comp.nome}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  <strong className="font-mono">{comp.total}</strong> jogos • {comp.empates} empates • {comp.gols1}x{comp.gols2} gols
                </span>
              </div>

              {/* Grid das duas barras lado a lado */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {/* Barra Clube 1 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '80px', fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {clube1}
                  </span>
                  <div style={{ flex: 1, height: '14px', backgroundColor: 'var(--surface-raised)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                    <div
                      style={{
                        width: `${Math.max(pct1, comp.vit1 > 0 ? 4 : 0)}%`,
                        height: '100%',
                        backgroundColor: cor1,
                        borderRadius: '4px',
                        transition: 'width 250ms ease'
                      }}
                    />
                  </div>
                  <span className="font-mono" style={{ width: '32px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'right' }}>
                    {comp.vit1}V
                  </span>
                </div>

                {/* Barra Clube 2 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '80px', fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {clube2}
                  </span>
                  <div style={{ flex: 1, height: '14px', backgroundColor: 'var(--surface-raised)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                    <div
                      style={{
                        width: `${Math.max(pct2, comp.vit2 > 0 ? 4 : 0)}%`,
                        height: '100%',
                        backgroundColor: cor2,
                        borderRadius: '4px',
                        transition: 'width 250ms ease'
                      }}
                    />
                  </div>
                  <span className="font-mono" style={{ width: '32px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'right' }}>
                    {comp.vit2}V
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
