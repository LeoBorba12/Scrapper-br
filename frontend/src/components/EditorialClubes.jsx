import React, { useState, useMemo } from 'react';
import { 
  BarChart3, RefreshCw, Search, ChevronDown, ChevronUp, 
  ArrowUpDown, Shield, TrendingUp, Filter, Info
} from 'lucide-react';

export default function EditorialClubes({
  timesAnalise,
  timesLoading,
  timesRecorte,
  setTimesRecorte,
  timesCampeonato,
  setTimesCampeonato,
  timesSearch,
  setTimesSearch,
  onRecarregar
}) {
  const [sortBy, setSortBy] = useState('aproveitamento');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedClube, setExpandedClube] = useState(null);

  // Ordenação e Filtragem
  const clubesFiltrados = useMemo(() => {
    let lista = (timesAnalise || []).filter(t => {
      if (!timesSearch) return true;
      return (t.nome || '').toLowerCase().includes(timesSearch.toLowerCase());
    });

    lista.sort((a, b) => {
      let valA = a[sortBy] ?? 0;
      let valB = b[sortBy] ?? 0;
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return lista;
  }, [timesAnalise, timesSearch, sortBy, sortAsc]);

  // MetricStrip: Médias calculadas sobre a amostra ativa
  const metrics = useMemo(() => {
    if (!timesAnalise || timesAnalise.length === 0) return null;
    const total = timesAnalise.length;
    const mediaAprov = timesAnalise.reduce((acc, t) => acc + (t.aproveitamento || 0), 0) / total;
    const totalGolsMarcados = timesAnalise.reduce((acc, t) => acc + (t.gols_marcados || 0), 0);
    const totalJogos = timesAnalise.reduce((acc, t) => acc + (t.jogos || 0), 0);
    const mediaGolsJogo = totalJogos > 0 ? (totalGolsMarcados / totalJogos) : 0;
    const mediaBtts = timesAnalise.reduce((acc, t) => acc + (t.btts_pct || 0), 0) / total;
    const mediaCleanSheets = timesAnalise.reduce((acc, t) => acc + (t.clean_sheets_pct || 0), 0) / total;

    return {
      totalClubes: total,
      mediaAprov: mediaAprov.toFixed(1),
      mediaGolsJogo: mediaGolsJogo.toFixed(2),
      mediaBtts: mediaBtts.toFixed(1),
      mediaCleanSheets: mediaCleanSheets.toFixed(1)
    };
  }, [timesAnalise]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ================= BREADCRUMB & TÍTULO EDITORIAL ================= */}
      <div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Futebol Brasileiro • Módulo Analítico de Clubes
        </div>
        <h1 
          className="font-editorial" 
          style={{ 
            fontSize: '2.2rem', 
            fontWeight: 700, 
            letterSpacing: '-0.02em', 
            color: 'var(--text-primary)',
            marginBottom: '6px'
          }}
        >
          Forma Recente, Produção e Defesa dos Clubes
        </h1>
        <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '780px', lineHeight: 1.55 }}>
          Recorte analítico oficial medindo aproveitamento de pontos, frequência de baliza inviolada (clean sheets) 
          e probabilidade de ambas marcam (BTTS) com separação de mando de campo.
        </p>
      </div>

      {/* ================= BARRA DE CONTROLES & FILTROS ================= */}
      <div 
        className="editorial-panel" 
        style={{ 
          padding: '14px 20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Seletor de Recorte */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Amostra:</span>
            {['5', '10', '20'].map(r => (
              <button
                key={r}
                onClick={() => setTimesRecorte(r)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-control)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: timesRecorte === r ? 'var(--accent)' : 'var(--surface-raised)',
                  color: timesRecorte === r ? 'var(--accent-foreground)' : 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                Últimos {r}
              </button>
            ))}
          </div>

          <div style={{ height: '18px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* Filtro de Torneio */}
          <select
            value={timesCampeonato}
            onChange={e => setTimesCampeonato(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--surface-raised)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <option value="">Geral Recente (Todas Competições)</option>
            <option value="Campeonato Brasileiro">Brasileirão Série A</option>
            <option value="Copa do Brasil">Copa do Brasil</option>
            <option value="Campeonato Paulista">Paulistão</option>
            <option value="Campeonato Carioca">Carioca</option>
            <option value="Campeonato Gaúcho">Gauchão</option>
            <option value="Campeonato Mineiro">Mineiro</option>
          </select>
        </div>

        {/* Busca e Atualizar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={timesSearch}
              onChange={e => setTimesSearch(e.target.value)}
              placeholder="Filtrar clube..."
              style={{
                padding: '6px 10px 6px 30px',
                borderRadius: 'var(--radius-control)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--surface-raised)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                width: '180px'
              }}
            />
          </div>

          <button
            onClick={() => onRecarregar(timesRecorte, timesCampeonato)}
            disabled={timesLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} className={timesLoading ? 'animate-spin' : ''} />
            <span>{timesLoading ? 'Carregando...' : 'Atualizar'}</span>
          </button>
        </div>
      </div>

      {/* ================= METRIC STRIP (RESUMO DA AMOSTRA) ================= */}
      {metrics && (
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', 
            gap: '12px' 
          }}
        >
          <div className="editorial-panel" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              Aproveitamento Médio
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {metrics.mediaAprov}%
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Base: {metrics.totalClubes} clubes na amostra
            </div>
          </div>

          <div className="editorial-panel" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              Média de Gols Marcados
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {metrics.mediaGolsJogo} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ jogo</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Produção ofensiva consolidada
            </div>
          </div>

          <div className="editorial-panel" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              Ambas Marcam (BTTS)
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {metrics.mediaBtts}%
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Partidas com gols mútuos
            </div>
          </div>

          <div className="editorial-panel" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              Baliza Inviolada (Clean Sheets)
            </div>
            <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {metrics.mediaCleanSheets}%
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Jogos sem sofrer gols
            </div>
          </div>
        </div>
      )}

      {/* ================= TABELA ANALÍTICA PRINCIPAL ================= */}
      <div className="editorial-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 className="font-editorial" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Classificação por Desempenho e Eficiência
            </h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Clique em qualquer coluna para reordenar a classificação.
            </span>
          </div>

          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Exibindo <strong>{clubesFiltrados.length}</strong> clubes
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="editorial-table">
            <thead>
              <tr>
                <th style={{ width: '48px', textAlign: 'center' }}>#</th>
                <th onClick={() => handleSort('nome')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Clube {sortBy === 'nome' && <ArrowUpDown size={12} color="var(--accent)" />}
                  </div>
                </th>
                <th onClick={() => handleSort('jogos')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                  J {sortBy === 'jogos' && <ArrowUpDown size={12} />}
                </th>
                <th style={{ textAlign: 'center' }}>V - E - D</th>
                <th style={{ textAlign: 'center' }}>Forma Recente</th>
                <th onClick={() => handleSort('gols_marcados')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                  GP {sortBy === 'gols_marcados' && <ArrowUpDown size={12} />}
                </th>
                <th onClick={() => handleSort('gols_sofridos')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                  GC {sortBy === 'gols_sofridos' && <ArrowUpDown size={12} />}
                </th>
                <th onClick={() => handleSort('saldo_gols')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                  SG {sortBy === 'saldo_gols' && <ArrowUpDown size={12} />}
                </th>
                <th onClick={() => handleSort('aproveitamento')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Aprov. % {sortBy === 'aproveitamento' && <ArrowUpDown size={12} color="var(--accent)" />}
                  </div>
                </th>
                <th onClick={() => handleSort('btts_pct')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                  BTTS % {sortBy === 'btts_pct' && <ArrowUpDown size={12} />}
                </th>
                <th onClick={() => handleSort('clean_sheets_pct')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                  CS % {sortBy === 'clean_sheets_pct' && <ArrowUpDown size={12} />}
                </th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {clubesFiltrados.map((clube, idx) => {
                const isExpanded = expandedClube === clube.nome;
                const aprov = (clube.aproveitamento || 0).toFixed(1);

                return (
                  <React.Fragment key={clube.nome || idx}>
                    <tr 
                      onClick={() => setExpandedClube(isExpanded ? null : clube.nome)}
                      style={{ cursor: 'pointer', backgroundColor: isExpanded ? 'var(--surface-raised)' : 'transparent' }}
                    >
                      <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {idx + 1}
                      </td>

                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{clube.nome}</span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>{clube.jogos}</td>

                      <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {clube.vitorias}-{clube.empates}-{clube.derrotas}
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '3px', justifyContent: 'center' }}>
                          {(clube.forma_recente || []).slice(-5).map((res, i) => {
                            let bg = 'var(--surface-raised)';
                            let fg = 'var(--text-secondary)';
                            if (res === 'V') { bg = 'var(--positive-bg)'; fg = 'var(--positive)'; }
                            else if (res === 'D') { bg = 'var(--negative-bg)'; fg = 'var(--negative)'; }
                            return (
                              <span
                                key={i}
                                style={{
                                  display: 'inline-block',
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '3px',
                                  backgroundColor: bg,
                                  color: fg,
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  lineHeight: '18px',
                                  textAlign: 'center'
                                }}
                              >
                                {res}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>{clube.gols_marcados}</td>
                      <td style={{ textAlign: 'center' }}>{clube.gols_sofridos}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: (clube.saldo_gols || 0) >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                        {clube.saldo_gols > 0 ? `+${clube.saldo_gols}` : clube.saldo_gols}
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, minWidth: '42px' }}>{aprov}%</span>
                          <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(clube.aproveitamento || 0, 100)}%`, height: '100%', backgroundColor: 'var(--accent)' }} />
                          </div>
                        </div>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {(clube.btts_pct || 0).toFixed(0)}%
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        {(clube.clean_sheets_pct || 0).toFixed(0)}%
                      </td>

                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </td>
                    </tr>

                    {/* Expansão das últimas partidas do clube */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={12} style={{ backgroundColor: 'var(--surface-panel)', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                Histórico recente dos jogos de {clube.nome} na amostra:
                              </span>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                                Casa: {clube.casa?.aproveitamento || 0}% ({clube.casa?.vitorias || 0}V em {clube.casa?.jogos || 0}J) • Fora: {clube.fora?.aproveitamento || 0}%
                              </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                              {(clube.ultimos_jogos || []).map((j, k) => (
                                <div
                                  key={k}
                                  style={{
                                    backgroundColor: 'var(--surface-raised)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: 'var(--radius-control)',
                                    padding: '8px 12px',
                                    fontSize: '0.78rem'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                                    <span>{j.data || 'Data N/I'}</span>
                                    <span>{j.mando === 'C' ? 'Em Casa' : 'Fora'}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontWeight: 600 }}>
                                    <span>{j.adversario}</span>
                                    <span 
                                      className="tabular-nums" 
                                      style={{ 
                                        color: j.resultado === 'V' ? 'var(--positive)' : j.resultado === 'D' ? 'var(--negative)' : 'var(--text-secondary)',
                                        fontWeight: 700
                                      }}
                                    >
                                      {j.placar} ({j.resultado})
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= NOTA DE FONTE & COBERTURA ================= */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <Info size={14} />
        <span>Fonte: Base de dados relacional oficial FutStats. Amostras ordenadas cronologicamente pelas partidas mais recentes com placares auditados.</span>
      </div>
    </div>
  );
}
