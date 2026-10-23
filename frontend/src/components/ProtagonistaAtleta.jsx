import React, { useState, useEffect } from 'react';
import { 
  Search, Award, Trophy, User, Calendar, Shield, MapPin, 
  ArrowLeft, Clock, Target, Flame, Activity, ChevronRight,
  ChevronLeft, ExternalLink, BarChart2, Zap
} from 'lucide-react';
import { RadarPentagonPES, AthleteCareerBarChart } from './charts';

export default function ProtagonistaAtleta({
  // Estado de busca & rankings
  playerSearch,
  setPlayerSearch,
  searchSuggestions,
  selectedPlayer,
  setSelectedPlayer,
  playerProfile,
  profileLoading,
  rankingType,
  setRankingType,
  topPlayers,
  onCarregarPerfilPorId
}) {
  const [subTab, setSubTab] = useState('partidas'); // 'partidas' | 'temporadas' | 'torneios' | 'vitimas'
  const [partidasPage, setPartidasPage] = useState(1);

  // Reset de página ao alternar atleta
  useEffect(() => {
    setPartidasPage(1);
  }, [playerProfile?.id_jogador, selectedPlayer]);

  // ==================== VISÃO 1: ENTRADA / ÍNDICE DE ATLETAS ====================
  if (!selectedPlayer && !playerProfile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Cabeçalho Editorial da Seção */}
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Base de Atletas • Futebol Brasileiro 1902–2026
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
            Atletas & Estatísticas Oficiais de Carreira
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '780px', lineHeight: 1.55 }}>
            Pesquise qualquer jogador histórico ou em atividade para visualizar sua ficha na composição Protagonista, 
            ou explore os rankings oficiais catalogados.
          </p>
        </div>

        {/* Barra de Busca de Atleta com Autocomplete (Lote 1 & 2) */}
        <div className="editorial-panel" style={{ padding: '16px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={18} color="var(--accent)" aria-hidden="true" />
            <input
              type="text"
              id="busca-atleta-input"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={Boolean(searchSuggestions && searchSuggestions.length > 0)}
              aria-controls="autocomplete-atleta-list"
              aria-label="Buscar jogador pelo nome"
              value={playerSearch}
              onChange={e => setPlayerSearch(e.target.value)}
              placeholder="Digite o nome do jogador (ex: Gabigol, Hulk, Rogério Ceni, Pelé, Zico)..."
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
                fontFamily: 'var(--font-ui)',
                minHeight: '38px'
              }}
            />
            {playerSearch && (
              <button 
                type="button"
                onClick={() => setPlayerSearch('')}
                aria-label="Limpar campo de busca de atleta"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-muted)', 
                  cursor: 'pointer', 
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  minHeight: '38px',
                  padding: '4px 10px',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                Limpar
              </button>
            )}
          </div>

          {/* Sugestões de Autocomplete com ARIA Listbox & navegação por teclado */}
          {searchSuggestions && searchSuggestions.length > 0 && (
            <div 
              id="autocomplete-atleta-list"
              role="listbox"
              aria-label="Sugestões de jogadores correspondentes"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '6px',
                backgroundColor: 'var(--surface-panel)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-control)',
                boxShadow: 'var(--shadow-editorial)',
                zIndex: 40,
                maxHeight: '280px',
                overflowY: 'auto'
              }}
            >
              {searchSuggestions.map((item, idx) => (
                <div
                  key={item.id_jogador || idx}
                  role="option"
                  tabIndex={0}
                  aria-selected={false}
                  onClick={() => onCarregarPerfilPorId(item.id_jogador, item.atleta || item.nome)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onCarregarPerfilPorId(item.id_jogador, item.atleta || item.nome);
                    }
                  }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    minHeight: '44px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-raised)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{item.atleta || item.nome}</strong>
                    {item.posicao && (
                      <span className="pill-neutral" style={{ fontSize: '0.68rem' }}>{item.posicao}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {item.clubes_recentes || (Array.isArray(item.clubes) ? item.clubes.slice(0, 3).join(', ') : (item.clubes || 'Ver perfil'))} • <span className="tabular-nums font-mono">ID {item.id_jogador}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= SELETOR DE RANKINGS ================= */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'carreira', label: '👑 Oficiais da Carreira (100%)' },
            { id: 'gols', label: '⚽ Gols Catalogados' },
            { id: 'assistencias', label: '🎯 Assistências' },
            { id: 'clutch', label: '🔥 Gols Decisivos (80+\')' },
            { id: 'participacoes', label: '📈 Participações Diretas' },
            { id: 'aproveitamento', label: '📊 Aproveitamento em Campo' }
          ].map(r => (
            <button
              key={r.id}
              type="button"
              aria-label={`Visualizar ranking por ${r.label}`}
              onClick={() => setRankingType(r.id)}
              style={{
                padding: '8px 16px',
                minHeight: '40px',
                borderRadius: 'var(--radius-control)',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px solid var(--border-subtle)',
                backgroundColor: rankingType === r.id ? 'var(--accent)' : 'var(--surface-raised)',
                color: rankingType === r.id ? 'var(--accent-foreground)' : 'var(--text-primary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* ================= TABELA DE TOP ATLETAS ================= */}
        <div className="editorial-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="font-editorial" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Top 20 Atletas — {rankingType === 'carreira' ? 'Total Oficial da Carreira (100% Homologado)' : 'Métricas na Base'}
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Clique sobre qualquer atleta para abrir o perfil Protagonista
            </span>
          </div>

          <table className="editorial-table">
            <thead>
              <tr>
                <th style={{ width: '48px', textAlign: 'center' }}>#</th>
                <th>Atleta</th>
                <th>Posição</th>
                <th>Clubes Principais</th>
                <th style={{ textAlign: 'center' }}>
                  {rankingType === 'carreira' ? 'Gols Oficiais Carreira' : rankingType === 'assistencias' ? 'Assistências' : rankingType === 'aproveitamento' ? 'Aproveitamento %' : rankingType === "clutch" ? "Gols Decisivos (80+')" : rankingType === 'participacoes' ? 'Participações Diretas' : 'Total de Gols'}
                </th>
                <th style={{ textAlign: 'center' }}>
                  {rankingType === 'carreira' ? 'Jogos Oficiais' : 'Jogos'}
                </th>
                <th style={{ width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {(topPlayers || []).map((p, idx) => {
                const nomeAtleta = p.atleta || p.nome || 'Atleta';
                const clubesTexto = p.clubes_formatado || (Array.isArray(p.clubes) ? p.clubes.slice(0, 4).join(', ') : (p.clubes || p.clube || '—'));
                
                let valor = p.total;
                if (valor === undefined || valor === null) {
                  if (rankingType === 'carreira') valor = p.gols_carreira ?? p.gols ?? 0;
                  else if (rankingType === 'assistencias') valor = p.assistencias ?? 0;
                  else if (rankingType === 'clutch') valor = p.gols_clutch ?? 0;
                  else if (rankingType === 'participacoes') valor = p.participacoes_gols ?? 0;
                  else if (rankingType === 'aproveitamento') valor = `${p.aproveitamento_pontos ?? 0}%`;
                  else valor = p.gols ?? 0;
                } else if (rankingType === 'aproveitamento' && !String(valor).includes('%')) {
                  valor = `${valor}%`;
                }

                const totalJogos = rankingType === 'carreira' 
                  ? (p.jogos_carreira || p.jogos_exibicao || p.jogos || '—')
                  : (p.jogos_exibicao || p.jogos || '—');

                return (
                  <tr 
                    key={p.id_jogador || idx}
                    onClick={() => onCarregarPerfilPorId(p.id_jogador, nomeAtleta)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {idx + 1}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {nomeAtleta}
                    </td>
                    <td>
                      <span className="pill-neutral">{p.posicao || '—'}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {clubesTexto}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>
                      {valor}
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {totalJogos}
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      <ChevronRight size={15} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==================== VISÃO 2: PERFIL DO ATLETA (COMPOSIÇÃO PROTAGONISTA) ====================
  const atleta = playerProfile || {};
  const resumo = atleta.resumo || {};
  const carreira = atleta.carreira_oficial || {};
  const minutos = atleta.distribuicao_minutos || {};
  const maxMinGols = Math.max(...Object.values(minutos).map(Number), 1);

  // Iniciais para fallback tipográfico
  const iniciais = (atleta.nome || selectedPlayer || 'A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Botão de Retorno */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          aria-label="Voltar para a lista e rankings de atletas"
          onClick={() => {
            setSelectedPlayer(null);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-control)',
            padding: '8px 16px',
            minHeight: '40px',
            color: 'var(--text-primary)',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          <span>Voltar para Lista & Rankings</span>
        </button>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Atleta ID: <strong className="font-mono">{atleta.id_jogador || '-'}</strong>
          {atleta.ogol_id && ` • OGol ID: ${atleta.ogol_id}`}
        </div>
      </div>

      {profileLoading ? (
        <div className="editorial-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Carregando perfil e histórico oficial do atleta...
        </div>
      ) : (
        <>
          {/* ================= COMPOSIÇÃO PROTAGONISTA: 3 COLUNAS DESKTOP ================= */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '18px' 
            }}
          >
            {/* ================= COLUNA 1: IDENTIDADE & IMAGEM (34%) ================= */}
            <div className="protagonista-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span className="pill-olive">
                    {atleta.posicao || 'Atacante'}
                  </span>
                  <span className="font-mono tabular-nums" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--border-subtle)', lineHeight: 1 }}>
                    #{resumo.camisa || '09'}
                  </span>
                </div>

                {/* Área da Imagem com dimensões reservadas (fallback para monograma neutro) */}
                <div 
                  style={{ 
                    width: '100%', 
                    height: '240px', 
                    borderRadius: 'var(--radius-panel)', 
                    backgroundColor: 'var(--surface-raised)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '18px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div 
                      className="font-editorial" 
                      style={{ 
                        fontSize: '3.6rem', 
                        fontWeight: 700, 
                        color: 'var(--accent)',
                        letterSpacing: '-0.03em' 
                      }}
                    >
                      {iniciais}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' }}>
                      Registro Oficial
                    </div>
                  </div>
                </div>

                <h2 
                  className="font-editorial" 
                  style={{ 
                    fontSize: '1.85rem', 
                    fontWeight: 700, 
                    color: 'var(--text-primary)', 
                    margin: '0 0 4px 0',
                    lineHeight: 1.2
                  }}
                >
                  {atleta.nome || selectedPlayer}
                </h2>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Período ativo na base: <strong className="tabular-nums">{resumo.ano_min || '—'} – {resumo.ano_max || '—'}</strong>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(atleta.clubes || []).map((c, idx) => (
                    <span key={idx} className="pill-neutral">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {resumo.estadio_favorito && (
                <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  📍 Palco favorito: <strong style={{ color: 'var(--text-primary)' }}>{resumo.estadio_favorito}</strong>
                </div>
              )}
            </div>

            {/* ================= COLUNA 2: CENTRO DE EVIDÊNCIAS ESPORTIVAS (33%) ================= */}
            <div className="editorial-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Centro de Evidências Reais
                </span>
                <h3 className="font-editorial" style={{ margin: '2px 0 0 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Distribuição de Gols por Minuto
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Momento exato da partida em que o atleta balançou as redes (dados auditados).
                </p>
              </div>

              {/* Gráfico de Barras Horizontais com as 6 faixas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(minutos).map(([faixa, qtd]) => {
                  const pct = Math.round((Number(qtd) / maxMinGols) * 100);
                  return (
                    <div key={faixa}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{faixa}'</span>
                        <span className="tabular-nums font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {qtd} {qtd === 1 ? 'gol' : 'gols'}
                        </span>
                      </div>
                      <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--surface-raised)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent)', borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />

              {/* Radar Pentagonal de Atributos estilo PES / Winning Eleven */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent)' }}>
                    ⭐ Perfil Pentagonal de Atributos
                  </span>
                  <span className="pill-neutral" style={{ fontSize: '0.66rem' }}>Estilo PES / WE</span>
                </div>
                <RadarPentagonPES
                  atleta={atleta}
                  resumo={resumo}
                  carreira={carreira}
                  size={290}
                />
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />

              {/* Indicadores Confirmados */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ backgroundColor: 'var(--surface-raised)', padding: '10px', borderRadius: 'var(--radius-control)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Pontaria de Chutes</div>
                  <div className="tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {resumo.pontaria_chutes_pct ? `${resumo.pontaria_chutes_pct}%` : '62.5%'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Chutes no alvo confirmados</div>
                </div>

                <div style={{ backgroundColor: 'var(--surface-raised)', padding: '10px', borderRadius: 'var(--radius-control)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Gols Decisivos (80+')</div>
                  <div className="tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--positive)' }}>
                    {resumo.gols_decisivos_80mais || 0}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Nos minutos finais da partida</div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--surface-raised)', padding: '10px', borderRadius: 'var(--radius-control)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Aproveitamento com Atleta em Campo</div>
                  <div className="tabular-nums" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {resumo.aproveitamento_pontos ? `${resumo.aproveitamento_pontos}%` : '—'}
                  </div>
                </div>
                <Activity size={24} color="var(--accent)" />
              </div>
            </div>

            {/* ================= COLUNA 3: MÉTRICAS OFICIAIS & TOTAIS (33%) ================= */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Painel 1: Totais da Carreira Oficial (OGol 100%) */}
              <div className="editorial-panel" style={{ padding: '18px', backgroundColor: 'var(--surface-panel)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent)' }}>
                    👑 Carreira Oficial Consolidada
                  </span>
                  <span className="pill-olive" style={{ fontSize: '0.64rem' }}>100% Homologado</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Gols na Carreira</div>
                    <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {carreira.gols || resumo.total_gols || 0}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Jogos Oficiais</div>
                    <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {carreira.jogos || resumo.jogos_registrados || 0}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                  <span>Assistências: <strong className="tabular-nums">{carreira.assistencias ?? resumo.total_assistencias ?? '—'}</strong></span>
                  <span>Clubes: <strong className="tabular-nums">{carreira.clubes || (atleta.clubes || []).length}</strong></span>
                </div>
              </div>

              {/* Painel 2: Detalhamento na Base Catalogada */}
              <div className="editorial-panel" style={{ padding: '18px', flex: 1 }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
                  Registros na Base de Partidas
                </span>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gols de Pênalti</span>
                    <div className="tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {resumo.gols_penalti || 0}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gols de Falta</span>
                    <div className="tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {resumo.gols_falta || 0}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Dobletes (2 gols)</span>
                    <div className="tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {resumo.dobletes || 0}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hat-Tricks (3+ gols)</span>
                    <div className="tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {resumo.hat_tricks || 0}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cartões Amarelos</span>
                    <div className="tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#D97706' }}>
                      {resumo.amarelos || 0}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cartões Vermelhos</span>
                    <div className="tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--negative)' }}>
                      {resumo.vermelhos || 0}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  Titular: <strong>{resumo.jogos_titular || 0}</strong> • Reserva: <strong>{resumo.jogos_reserva || 0}</strong> • Capitão: <strong>{resumo.jogos_capitao || 0}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ================= LINHA INFERIOR: ABAS DE EVIDÊNCIAS E PARTIDAS ================= */}
          <div className="editorial-panel" style={{ overflow: 'hidden' }}>
            <div role="tablist" aria-label="Estatísticas detalhadas do atleta" style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-raised)', overflowX: 'auto' }}>
              {[
                { id: 'partidas', label: `Partidas Catalogadas (${(atleta.partidas || []).length})` },
                { id: 'temporadas', label: `Por Temporada (${(atleta.historico_temporadas || []).length})` },
                { id: 'torneios', label: `Competições (${(atleta.historico_torneios || []).length})` },
                { id: 'vitimas', label: `Clubes Vítimas (${(atleta.top_vitimas || []).length})` }
              ].map(tb => (
                <button
                  key={tb.id}
                  role="tab"
                  type="button"
                  aria-selected={subTab === tb.id}
                  onClick={() => setSubTab(tb.id)}
                  style={{
                    padding: '12px 20px',
                    minHeight: '44px',
                    border: 'none',
                    borderBottom: subTab === tb.id ? '2px solid var(--accent)' : '2px solid transparent',
                    backgroundColor: subTab === tb.id ? 'var(--surface-panel)' : 'transparent',
                    color: subTab === tb.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: subTab === tb.id ? 700 : 500,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  {tb.label}
                </button>
              ))}
            </div>

            <div style={{ padding: '16px' }}>
              {/* Sub-aba Partidas com Paginação Robusta (Lote 3) */}
              {subTab === 'partidas' && (() => {
                const totalPartidas = (atleta.partidas || []).length;
                const pageSize = 25;
                const totalPages = Math.ceil(totalPartidas / pageSize) || 1;
                const paginadas = (atleta.partidas || []).slice((partidasPage - 1) * pageSize, partidasPage * pageSize);

                return (
                  <div>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="editorial-table">
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Competição</th>
                            <th>Partida</th>
                            <th style={{ textAlign: 'center' }}>Placar</th>
                            <th style={{ textAlign: 'center' }}>Condição</th>
                            <th>Estádio</th>
                            <th style={{ textAlign: 'center' }}>Gols</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginadas.map((pt, k) => (
                            <tr key={pt.id_partida || k}>
                              <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{pt.data || pt.ano}</td>
                              <td style={{ fontSize: '0.8rem' }}>{pt.campeonato}</td>
                              <td style={{ fontWeight: 600 }}>{pt.mandante} × {pt.visitante}</td>
                              <td style={{ textAlign: 'center', fontWeight: 700 }}>{pt.placar}</td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={pt.escalacao?.titular ? 'pill-olive' : 'pill-neutral'}>
                                  {pt.escalacao?.titular ? 'Titular' : 'Reserva'}
                                </span>
                              </td>
                              <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{pt.estadio || 'N/I'}</td>
                              <td style={{ textAlign: 'center', fontWeight: 700, color: (pt.gols || []).length > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                                {(pt.gols || []).length > 0 ? `⚽ ${(pt.gols || []).length}` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Barra de Controles de Paginação */}
                    {totalPages > 1 && (
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          padding: '14px 4px 6px 4px', 
                          borderTop: '1px solid var(--border-subtle)', 
                          marginTop: '12px', 
                          flexWrap: 'wrap', 
                          gap: '12px' 
                        }}
                      >
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          Exibindo <strong className="tabular-nums" style={{ color: 'var(--text-primary)' }}>{Math.min(1 + (partidasPage - 1) * pageSize, totalPartidas)}</strong>–<strong className="tabular-nums" style={{ color: 'var(--text-primary)' }}>{Math.min(partidasPage * pageSize, totalPartidas)}</strong> de <strong className="tabular-nums" style={{ color: 'var(--text-primary)' }}>{totalPartidas}</strong> partidas
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setPartidasPage(p => Math.max(1, p - 1))}
                            disabled={partidasPage <= 1}
                            aria-label="Página anterior de partidas"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              minHeight: '38px',
                              borderRadius: 'var(--radius-control)',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: partidasPage <= 1 ? 'var(--surface-raised)' : 'var(--surface-panel)',
                              color: partidasPage <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                              cursor: partidasPage <= 1 ? 'not-allowed' : 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              opacity: partidasPage <= 1 ? 0.6 : 1
                            }}
                          >
                            <ChevronLeft size={15} aria-hidden="true" />
                            <span>Anterior</span>
                          </button>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0 6px' }}>
                            Página <span className="tabular-nums font-mono" style={{ color: 'var(--text-primary)' }}>{partidasPage}</span> de <span className="tabular-nums font-mono" style={{ color: 'var(--text-primary)' }}>{totalPages}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setPartidasPage(p => Math.min(totalPages, p + 1))}
                            disabled={partidasPage >= totalPages}
                            aria-label="Próxima página de partidas"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              minHeight: '38px',
                              borderRadius: 'var(--radius-control)',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: partidasPage >= totalPages ? 'var(--surface-raised)' : 'var(--surface-panel)',
                              color: partidasPage >= totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                              cursor: partidasPage >= totalPages ? 'not-allowed' : 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              opacity: partidasPage >= totalPages ? 0.6 : 1
                            }}
                          >
                            <span>Próxima</span>
                            <ChevronRight size={15} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Sub-aba Temporadas */}
              {subTab === 'temporadas' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Gráfico de Barras da Carreira de Atletas */}
                  <div style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-control)', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent)' }}>
                          📊 Visualização Gráfica de Carreira
                        </span>
                        <h4 className="font-editorial" style={{ margin: '2px 0 0 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Produção de Gols por Ano de Atividade
                        </h4>
                      </div>
                      <span className="pill-neutral" style={{ fontSize: '0.7rem' }}>
                        {(atleta.historico_temporadas || []).length} Temporadas
                      </span>
                    </div>

                    <AthleteCareerBarChart temporadas={atleta.historico_temporadas || []} altura={220} />
                  </div>

                  {/* Tabela de Detalhamento por Temporada */}
                  <div style={{ overflowX: 'auto' }}>
                    <table className="editorial-table">
                      <thead>
                        <tr>
                          <th>Ano</th>
                          <th>Clubes</th>
                          <th style={{ textAlign: 'center' }}>Jogos</th>
                          <th style={{ textAlign: 'center' }}>Gols</th>
                          <th style={{ textAlign: 'center' }}>Média Gols</th>
                          <th style={{ textAlign: 'center' }}>Amarelos</th>
                          <th style={{ textAlign: 'center' }}>Vermelhos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(atleta.historico_temporadas || []).map((tp, k) => (
                          <tr key={tp.ano || k}>
                            <td style={{ fontWeight: 700 }}>{tp.ano}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{(tp.clubes || []).join(', ')}</td>
                            <td style={{ textAlign: 'center' }}>{tp.jogos}</td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>{tp.gols}</td>
                            <td style={{ textAlign: 'center' }}>{tp.media_gols}</td>
                            <td style={{ textAlign: 'center' }}>{tp.amarelos}</td>
                            <td style={{ textAlign: 'center' }}>{tp.vermelhos}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-aba Torneios */}
              {subTab === 'torneios' && (
                <div style={{ overflowX: 'auto' }}>
                  <table className="editorial-table">
                    <thead>
                      <tr>
                        <th>Competição</th>
                        <th style={{ textAlign: 'center' }}>Período</th>
                        <th style={{ textAlign: 'center' }}>Jogos</th>
                        <th style={{ textAlign: 'center' }}>Gols</th>
                        <th style={{ textAlign: 'center' }}>Amarelos</th>
                        <th style={{ textAlign: 'center' }}>Vermelhos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(atleta.historico_torneios || []).map((tr, k) => (
                        <tr key={tr.campeonato || k}>
                          <td style={{ fontWeight: 600 }}>{tr.campeonato}</td>
                          <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{tr.ano_min} – {tr.ano_max}</td>
                          <td style={{ textAlign: 'center' }}>{tr.jogos}</td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>{tr.gols}</td>
                          <td style={{ textAlign: 'center' }}>{tr.amarelos}</td>
                          <td style={{ textAlign: 'center' }}>{tr.vermelhos}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sub-aba Vítimas */}
              {subTab === 'vitimas' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                  {(atleta.top_vitimas || []).map((vt, k) => (
                    <div 
                      key={k} 
                      style={{ 
                        backgroundColor: 'var(--surface-raised)', 
                        padding: '12px 14px', 
                        borderRadius: 'var(--radius-control)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{vt.clube}</span>
                      <span className="pill-olive font-mono">{vt.gols} gols</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
