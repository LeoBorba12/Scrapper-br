import React, { useState, useEffect } from 'react';
import { 
  Search, Award, Trophy, User, Calendar, Shield, MapPin, 
  ArrowLeft, Clock, Target, Flame, Activity, ChevronRight,
  ChevronLeft, ExternalLink, BarChart2, Zap
} from 'lucide-react';
import { RadarPentagonPES, AthleteCareerBarChart } from './charts';
import ClubBadge from './ClubBadge';
import SpatialPitchMap from './SpatialPitchMap';
import GoalMouthMap from './GoalMouthMap';

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
  onCarregarPerfilPorId,
  onVoltarParaLista
}) {
  const [subTab, setSubTab] = useState('partidas'); // 'partidas' | 'temporadas' | 'torneios' | 'vitimas'
  const [partidasPage, setPartidasPage] = useState(1);

  // Reset de página ao alternar atleta
  useEffect(() => {
    setPartidasPage(1);
  }, [playerProfile?.id_jogador, selectedPlayer]);

  // ==================== VISÃO 1: ENTRADA / ÍNDICE DE ATLETAS ====================
  if (!selectedPlayer) {
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

          {/* Atalhos Rápidos de Atletas Históricos */}
          <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Atalhos:</span>
            {['Pelé', 'Zico', 'Gabigol', 'Hulk', 'Rogério Ceni', 'Romário', 'Roberto Dinamite', 'Arrascaeta'].map(nome => (
              <button
                key={nome}
                type="button"
                onClick={() => {
                  setPlayerSearch(nome);
                }}
                style={{
                  padding: '3px 9px',
                  fontSize: '0.74rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface-raised)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {nome}
              </button>
            ))}
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
                  {rankingType === 'carreira' ? 'Jogos Oficiais' : 'Jogos (Catálogo)'}
                </th>
                <th style={{ width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {(topPlayers || []).map((p, idx) => {
                const nomeAtleta = p.atleta || p.nome || 'Atleta';
                const clubesTexto = p.clubes_formatado || (Array.isArray(p.clubes) ? p.clubes.slice(0, 4).join(', ') : (p.clubes || p.clube || '—'));
                
                // Determinação de valor e escopo estrito
                let valor = p.total;
                let isCarreiraOficial = false;

                if (valor === undefined || valor === null) {
                  if (rankingType === 'carreira') {
                    if (p.gols_carreira != null && Number(p.gols_carreira) > 0) {
                      valor = p.gols_carreira;
                      isCarreiraOficial = true;
                    } else {
                      valor = p.gols ?? 0;
                      isCarreiraOficial = false;
                    }
                  } else if (rankingType === 'assistencias') valor = p.assistencias ?? 0;
                  else if (rankingType === 'clutch') valor = p.gols_clutch ?? 0;
                  else if (rankingType === 'participacoes') valor = p.participacoes_gols ?? 0;
                  else if (rankingType === 'aproveitamento') valor = `${p.aproveitamento_pontos ?? 0}%`;
                  else valor = p.gols ?? 0;
                } else if (rankingType === 'carreira') {
                  isCarreiraOficial = Boolean(p.gols_carreira && Number(p.gols_carreira) > 0);
                } else if (rankingType === 'aproveitamento' && !String(valor).includes('%')) {
                  valor = `${valor}%`;
                }

                // Paridade estrita de escopo para jogos:
                // Se os gols forem de Carreira Oficial (gols_carreira), os jogos DEVEM ser de Carreira Oficial (jogos_carreira).
                // NUNCA fazer fallback silencioso de jogos de carreira para o número de jogos parciais da base local catalogada.
                let jogosDisplay = null;
                const numGols = Number(typeof valor === 'string' ? valor.replace('%', '') : valor) || 0;
                let numJogosParaCheck = 0;
                let flagEscopoMisto = false;

                if (rankingType === 'carreira') {
                  const jgCarreira = p.jogos_carreira != null && Number(p.jogos_carreira) > 0 ? Number(p.jogos_carreira) : null;
                  const jgLocal = p.jogos != null && Number(p.jogos) > 0 ? Number(p.jogos) : (p.jogos_exibicao != null && Number(p.jogos_exibicao) > 0 ? Number(p.jogos_exibicao) : null);

                  if (jgCarreira) {
                    numJogosParaCheck = jgCarreira;
                    jogosDisplay = <span className="font-mono">{jgCarreira}</span>;
                  } else if (jgLocal) {
                    // Jogos de carreira não disponíveis: exibir dado local com legenda EXPLÍCITA
                    numJogosParaCheck = jgLocal;
                    flagEscopoMisto = true;
                    jogosDisplay = (
                      <div style={{ lineHeight: 1.2 }}>
                        <span className="font-mono">{jgLocal}</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
                          no catálogo BR
                        </span>
                      </div>
                    );
                  } else {
                    jogosDisplay = <span style={{ color: 'var(--text-muted)' }}>—</span>;
                  }
                } else {
                  const jg = p.jogos ?? p.jogos_exibicao;
                  numJogosParaCheck = Number(jg) || 0;
                  jogosDisplay = jg != null ? <span className="font-mono">{jg}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>;
                }

                // Guarda de sanidade: se gols > 0 e jogos > 0 e (gols / jogos) > 2.0 em amostragem > 10 jogos
                const mediaSuspeita = numGols > 0 && numJogosParaCheck > 10 && (numGols / numJogosParaCheck) > 2.0;

                return (
                  <tr 
                    key={p.id_jogador || idx}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver perfil de ${nomeAtleta}`}
                    onClick={() => onCarregarPerfilPorId(p.id_jogador, nomeAtleta)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onCarregarPerfilPorId(p.id_jogador, nomeAtleta);
                      }
                    }}
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
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span>{valor}</span>
                        {rankingType === 'carreira' && !isCarreiraOficial && (
                          <span className="pill-neutral" style={{ fontSize: '0.62rem', padding: '1px 5px' }}>catálogo BR</span>
                        )}
                        {(mediaSuspeita || flagEscopoMisto) && (
                          <span 
                            title="Atenção de Escopo: Gols oficiais de toda a carreira exibidos com jogos do catálogo brasileiro."
                            style={{ 
                              fontSize: '0.64rem', 
                              color: 'var(--negative)', 
                              backgroundColor: 'var(--negative-bg)',
                              borderRadius: '4px',
                              padding: '1px 5px',
                              fontWeight: 600
                            }}
                          >
                            ⚠️ escopos mistos
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      {jogosDisplay}
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
  const maxMinGols = Math.max(
    ...Object.values(minutos).map(v => Number(v) || 0),
    1
  );

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
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          width: '100%'
        }}
      >
        <button
          type="button"
          aria-label="Voltar para a lista e rankings de atletas"
          onClick={() => {
            if (onVoltarParaLista) {
              onVoltarParaLista();
            } else {
              if (setSelectedPlayer) setSelectedPlayer(null);
            }
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
          Atleta ID: <strong className="font-mono">{atleta.id_jogador || '—'}</strong>
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
            className="protagonista-grid"
            style={{ 
              display: 'grid', 
              gap: '18px',
              width: '100%'
            }}
          >
            {/* ================= COLUNA 1: IDENTIDADE & IMAGEM (34%) ================= */}
            <div className="protagonista-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <span className="pill-olive">
                    {atleta.posicao || 'Atacante'}
                  </span>
                  {resumo.camisa ? (
                    <span className="font-mono tabular-nums" style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--border-subtle)', lineHeight: 1 }}>
                      #{resumo.camisa}
                    </span>
                  ) : null}
                </div>

                {/* Área da Imagem com dimensões reservadas (com suporte à foto oficial do OGol) */}
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
                    border: '1px solid var(--border-subtle)',
                    position: 'relative'
                  }}
                >
                  {atleta.foto_url ? (
                    <img 
                      src={atleta.foto_url} 
                      alt={atleta.nome || selectedPlayer} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : null}
                  <div style={{ textAlign: 'center', display: atleta.foto_url ? 'none' : 'block' }}>
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
                    margin: '0 0 2px 0',
                    lineHeight: 1.2
                  }}
                >
                  {atleta.nome || selectedPlayer}
                </h2>

                {atleta.nome_completo && atleta.nome_completo !== atleta.nome && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px', fontStyle: 'italic' }}>
                    {atleta.nome_completo}
                  </div>
                )}

                {/* Metadados Biométricos Oficiais (OGol) */}
                {(atleta.altura || atleta.peso || atleta.data_nascimento || atleta.situacao) && (
                  <div 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(2, 1fr)', 
                      gap: '8px', 
                      margin: '12px 0',
                      padding: '10px 12px',
                      backgroundColor: 'var(--surface-raised)',
                      borderRadius: 'var(--radius-control)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.76rem'
                    }}
                  >
                    {atleta.altura && (
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Altura:</span>{' '}
                        <strong className="font-mono">{atleta.altura} cm</strong>
                      </div>
                    )}
                    {atleta.peso && (
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Peso:</span>{' '}
                        <strong className="font-mono">{atleta.peso} kg</strong>
                      </div>
                    )}
                    {atleta.data_nascimento && (
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Nasc:</span>{' '}
                        <strong className="font-mono">{atleta.data_nascimento}</strong>
                        {atleta.idade && <span style={{ color: 'var(--text-secondary)' }}> ({atleta.idade}a)</span>}
                      </div>
                    )}
                    {atleta.situacao && (
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Status:</span>{' '}
                        <span className={atleta.situacao.toLowerCase().includes('ativo') ? 'pill-olive' : 'pill-neutral'} style={{ padding: '2px 6px', fontSize: '0.68rem' }}>
                          {atleta.situacao}
                        </span>
                      </div>
                    )}
                    {atleta.pe_preferencial && (
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Pé:</span>{' '}
                        <strong>{atleta.pe_preferencial}</strong>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Período ativo na base: <strong className="tabular-nums">{resumo.ano_min || '—'} – {resumo.ano_max || '—'}</strong>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(atleta.clubes || []).map((c, idx) => (
                    <span 
                      key={idx} 
                      className="pill-neutral"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px' }}
                    >
                      <ClubBadge nome={c} size={15} />
                      <span>{c}</span>
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
                  const numQtd = Number(qtd) || 0;
                  const pct = maxMinGols > 0 ? Math.min(100, Math.round((numQtd / maxMinGols) * 100)) : 0;
                  return (
                    <div key={faixa}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{faixa}'</span>
                        <span className="tabular-nums font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {numQtd} {numQtd === 1 ? 'gol' : 'gols'}
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
                    {resumo.pontaria_chutes_pct != null ? `${resumo.pontaria_chutes_pct}%` : '—'}
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
                    {resumo.aproveitamento_pontos != null ? `${resumo.aproveitamento_pontos}%` : '—'}
                  </div>
                </div>
                <Activity size={24} color="var(--accent)" />
              </div>
            </div>

            {/* ================= COLUNA 3: MÉTRICAS OFICIAIS & TOTAIS (33%) ================= */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Painel 1: Totais da Carreira Oficial (com Paridade Estrita de Escopo) */}
              {(() => {
                const golsCarreira = (carreira.gols !== undefined && carreira.gols !== null && Number(carreira.gols) > 0) ? Number(carreira.gols) : null;
                const jogosCarreira = (carreira.jogos !== undefined && carreira.jogos !== null && Number(carreira.jogos) > 0) ? Number(carreira.jogos) : null;
                const assistCarreira = carreira.assistencias !== undefined && carreira.assistencias !== null ? Number(carreira.assistencias) : null;

                const golsCatalogo = resumo.total_gols !== undefined && resumo.total_gols !== null ? Number(resumo.total_gols) : 0;
                const jogosCatalogo = resumo.jogos_registrados !== undefined && resumo.jogos_registrados !== null ? Number(resumo.jogos_registrados) : 0;
                const assistCatalogo = resumo.total_assistencias !== undefined && resumo.total_assistencias !== null ? Number(resumo.total_assistencias) : 0;

                const temCarreira = golsCarreira !== null;
                const escopoMisto = temCarreira && !jogosCarreira && jogosCatalogo > 0;
                const ratioCarreiraLocal = (escopoMisto && jogosCatalogo > 10) ? (golsCarreira / jogosCatalogo) : 0;
                const alertaSanidade = ratioCarreiraLocal > 2.0;

                return (
                  <div className="editorial-panel" style={{ padding: '18px', backgroundColor: 'var(--surface-panel)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent)' }}>
                        👑 {temCarreira ? 'Carreira Oficial Consolidada' : 'Estatísticas do Atleta'}
                      </span>
                      <span className={temCarreira && jogosCarreira ? 'pill-olive' : 'pill-neutral'} style={{ fontSize: '0.64rem' }}>
                        {temCarreira && jogosCarreira ? '100% Homologado' : temCarreira ? 'Gols Homologados' : 'Base Catalogada'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {temCarreira ? 'Gols na Carreira' : 'Gols Registrados'}
                        </div>
                        <div className="tabular-nums font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {temCarreira ? golsCarreira : golsCatalogo}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          {temCarreira ? 'Jogos Oficiais' : 'Jogos Registrados'}
                        </div>
                        <div className="tabular-nums font-mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {temCarreira 
                            ? (jogosCarreira ?? (
                                jogosCatalogo > 0 ? (
                                  <div style={{ lineHeight: 1.2 }}>
                                    <span>{jogosCatalogo}</span>
                                    <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-muted)', display: 'block' }}>
                                      no catálogo BR
                                    </span>
                                  </div>
                                ) : '—'
                              ))
                            : jogosCatalogo
                          }
                        </div>
                      </div>
                    </div>

                    {/* Média de Gols com Paridade Estrita */}
                    <div style={{ marginTop: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      {temCarreira && jogosCarreira ? (
                        <span>Média Oficial: <strong className="tabular-nums font-mono" style={{ color: 'var(--accent)' }}>{(golsCarreira / jogosCarreira).toFixed(2)}</strong> gols/jogo</span>
                      ) : !temCarreira && jogosCatalogo > 0 ? (
                        <span>Média no Catálogo: <strong className="tabular-nums font-mono" style={{ color: 'var(--accent)' }}>{(golsCatalogo / jogosCatalogo).toFixed(2)}</strong> gols/jogo</span>
                      ) : null}
                    </div>

                    {/* Guarda de Sanidade: Alerta Explícito quando Escopos forem Misturados */}
                    {(alertaSanidade || escopoMisto) && (
                      <div 
                        style={{ 
                          marginTop: '10px', 
                          padding: '8px 10px', 
                          backgroundColor: 'var(--surface-raised)', 
                          borderRadius: 'var(--radius-control)', 
                          borderLeft: '3px solid var(--accent)', 
                          fontSize: '0.72rem', 
                          color: 'var(--text-secondary)', 
                          lineHeight: 1.45 
                        }}
                      >
                        <strong style={{ color: 'var(--text-primary)' }}>Nota de Paridade de Escopo:</strong> O total de <strong>{golsCarreira} gols</strong> reflete toda a carreira oficial do atleta. Como o total de jogos da carreira não está disponível na súmula oficial, exibe-se a amostragem de <strong>{jogosCatalogo} partidas</strong> registradas no catálogo brasileiro.
                      </div>
                    )}

                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                      <span>
                        Assistências: <strong className="tabular-nums">{assistCarreira ?? (assistCatalogo > 0 ? `${assistCatalogo} (catálogo)` : '—')}</strong>
                      </span>
                      <span>
                        Clubes: <strong className="tabular-nums">{carreira.clubes?.length || (atleta.clubes || []).length}</strong>
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Painel 2: Detalhamento na Base Catalogada (com total_gols e jogos_registrados em destaque) */}
              <div className="editorial-panel" style={{ padding: '18px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)' }}>
                    Registros na Base de Partidas
                  </span>
                  <span className="pill-neutral" style={{ fontSize: '0.64rem' }}>Catálogo BR</span>
                </div>
                
                {/* Destaque Obrigatório de Escopo da Base Local */}
                <div 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 80px), 1fr))', 
                    gap: '8px', 
                    marginTop: '12px', 
                    marginBottom: '12px',
                    paddingBottom: '12px', 
                    borderBottom: '1px solid var(--border-subtle)' 
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Gols no Catálogo</span>
                    <div className="tabular-nums font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>
                      {resumo.total_gols ?? 0}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Jogos no Catálogo</span>
                    <div className="tabular-nums font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {resumo.jogos_registrados ?? 0}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Média Local</span>
                    <div className="tabular-nums font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                      {resumo.jogos_registrados && Number(resumo.jogos_registrados) > 0
                        ? (Number(resumo.total_gols || 0) / Number(resumo.jogos_registrados)).toFixed(2)
                        : (resumo.media_gols != null && !isNaN(Number(resumo.media_gols)) ? Number(resumo.media_gols).toFixed(2) : '—')}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
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
                    <div className="tabular-nums" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent)' }}>
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

          {/* ================= SEÇÃO DE MAPEAMENTO ESPACIAL (PITCH & GOAL MOUTH) ================= */}
          {((atleta.shotmap && atleta.shotmap.length > 0) || (atleta.heatmap && atleta.heatmap.length > 0)) ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '18px' }}>
              <div className="editorial-panel" style={{ padding: '18px' }}>
                <SpatialPitchMap
                  shotmap={atleta.shotmap || []}
                  heatmap={atleta.heatmap || []}
                  posicao={atleta.posicao}
                  resumo={resumo}
                />
              </div>
              <div className="editorial-panel" style={{ padding: '18px' }}>
                <GoalMouthMap
                  shotmap={atleta.shotmap || []}
                  posicao={atleta.posicao}
                />
              </div>
            </div>
          ) : (
            <div className="editorial-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--surface-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '1px solid var(--border-subtle)' }}>
                  📡
                </div>
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Telemetria Ótica & Coordenadas Espaciais (GPS)
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Mapas de calor e baliza ótica requerem dados de sensores em tempo real. Para este atleta, consulte as evidências de minutagem cronológica e histórico por clube abaixo.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ fontSize: '0.68rem', backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  {resumo.total_gols || 0} Gols em Súmulas Oficiais
                </span>
                <span className="badge" style={{ fontSize: '0.68rem', backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                  {resumo.jogos_registrados || 0} Partidas Catalogadas
                </span>
              </div>
            </div>
          )}

          {/* ================= LINHA INFERIOR: ABAS DE EVIDÊNCIAS E PARTIDAS ================= */}
          <div className="editorial-panel" style={{ overflow: 'hidden' }}>
            <div role="tablist" aria-label="Estatísticas detalhadas do atleta" style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-raised)', overflowX: 'auto' }}>
              {[
                { id: 'partidas', label: `Partidas Catalogadas (${(atleta.partidas || []).length})` },
                { id: 'carreira_ogol', label: `Carreira Oficial OGol (${(carreira.clubes || []).length})` },
                { id: 'titulos', label: `Títulos & Prêmios (${(atleta.titulos || []).length + (atleta.premios || []).length})` },
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
                          {paginadas.length === 0 ? (
                            <tr>
                              <td colSpan="7" style={{ textAlign: 'center', padding: '28px', color: 'var(--text-secondary)' }}>
                                Nenhuma partida catalogada registrada para este atleta.
                              </td>
                            </tr>
                          ) : (
                            paginadas.map((pt, k) => (
                              <tr key={pt.id_partida || k}>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{pt.data || pt.ano}</td>
                                <td style={{ fontSize: '0.8rem' }}>{pt.campeonato}</td>
                                <td style={{ fontWeight: 600 }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                    <ClubBadge nome={pt.mandante} size={15} />
                                    <span>{pt.mandante}</span>
                                    <span style={{ color: 'var(--text-muted)', margin: '0 2px' }}>×</span>
                                    <ClubBadge nome={pt.visitante} size={15} />
                                    <span>{pt.visitante}</span>
                                  </div>
                                </td>
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
                            ))
                          )}
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
                        {(atleta.historico_temporadas || []).length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                              Nenhuma temporada registrada no catálogo.
                            </td>
                          </tr>
                        ) : (
                          (atleta.historico_temporadas || []).map((tp, k) => (
                            <tr key={tp.ano || k}>
                              <td style={{ fontWeight: 700 }}>{tp.ano}</td>
                              <td style={{ color: 'var(--text-secondary)' }}>{(tp.clubes || []).join(', ')}</td>
                              <td style={{ textAlign: 'center' }}>{tp.jogos ?? '—'}</td>
                              <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>{tp.gols ?? '—'}</td>
                              <td style={{ textAlign: 'center' }}>{tp.media_gols != null ? tp.media_gols : '—'}</td>
                              <td style={{ textAlign: 'center' }}>{tp.amarelos ?? 0}</td>
                              <td style={{ textAlign: 'center' }}>{tp.vermelhos ?? 0}</td>
                            </tr>
                          ))
                        )}
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
                      {(atleta.historico_torneios || []).length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                            Nenhuma competição registrada no catálogo.
                          </td>
                        </tr>
                      ) : (
                        (atleta.historico_torneios || []).map((tr, k) => (
                          <tr key={tr.campeonato || k}>
                            <td style={{ fontWeight: 600 }}>{tr.campeonato}</td>
                            <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{tr.ano_min} – {tr.ano_max}</td>
                            <td style={{ textAlign: 'center' }}>{tr.jogos ?? '—'}</td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>{tr.gols ?? '—'}</td>
                            <td style={{ textAlign: 'center' }}>{tr.amarelos ?? 0}</td>
                            <td style={{ textAlign: 'center' }}>{tr.vermelhos ?? 0}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Sub-aba Carreira Oficial OGol */}
              {subTab === 'carreira_ogol' && (
                <div style={{ overflowX: 'auto' }}>
                  {(carreira.clubes || []).length === 0 ? (
                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Nenhum histórico consolidado de clubes disponível no momento.
                    </div>
                  ) : (
                    <table className="editorial-table">
                      <thead>
                        <tr>
                          <th>Clube / Seleção</th>
                          <th style={{ textAlign: 'center' }}>Período Oficial</th>
                          <th style={{ textAlign: 'center' }}>Jogos Oficiais (J)</th>
                          <th style={{ textAlign: 'center' }}>Gols Oficiais (GM)</th>
                          <th style={{ textAlign: 'center' }}>Assistências (ASS)</th>
                          <th style={{ textAlign: 'center' }}>Média de Gols</th>
                        </tr>
                      </thead>
                      <tbody>
                        {carreira.clubes.map((c_item, idx) => {
                          const media = c_item.jogos > 0 ? (c_item.gols / c_item.jogos).toFixed(2) : '0.00';
                          return (
                            <tr key={idx}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <ClubBadge nome={c_item.clube} size={18} />
                                  <strong style={{ color: 'var(--text-primary)' }}>{c_item.clube}</strong>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }} className="font-mono">
                                {c_item.periodo || '—'}
                              </td>
                              <td style={{ textAlign: 'center' }} className="font-mono tabular-nums">
                                {c_item.jogos}
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }} className="font-mono tabular-nums">
                                {c_item.gols}
                              </td>
                              <td style={{ textAlign: 'center' }} className="font-mono tabular-nums">
                                {c_item.assistencias}
                              </td>
                              <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }} className="font-mono tabular-nums">
                                {media}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Sub-aba Títulos & Palmarés */}
              {subTab === 'titulos' && (
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <h4 className="font-editorial" style={{ margin: '0 0 10px 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      🏆 Galeria de Títulos Conquistados
                    </h4>
                    {(atleta.titulos || []).length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Nenhum título oficial cadastrado no registro do atleta.</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                        {atleta.titulos.map((t, idx) => (
                          <div 
                            key={idx}
                            style={{ 
                              padding: '12px 14px',
                              backgroundColor: 'var(--surface-raised)',
                              borderRadius: 'var(--radius-control)',
                              border: '1px solid var(--border-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px'
                            }}
                          >
                            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {t.titulo}
                            </span>
                            <span className="pill-olive font-mono" style={{ fontSize: '0.74rem' }}>
                              x{t.quantidade}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {(atleta.premios || []).length > 0 && (
                    <div>
                      <h4 className="font-editorial" style={{ margin: '0 0 10px 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        🎖️ Distinções e Prêmios Individuais
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {atleta.premios.map((p, idx) => (
                          <span 
                            key={idx}
                            className="pill-neutral"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600 }}
                          >
                            ⭐ {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-aba Vítimas */}
              {subTab === 'vitimas' && (
                <div>
                  {(atleta.top_vitimas || []).length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      Nenhuma vítima catalogada registrada para este atleta.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                      {atleta.top_vitimas.map((vt, k) => (
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ClubBadge nome={vt.clube} size={18} />
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{vt.clube}</span>
                          </div>
                          <span className="pill-olive font-mono">{vt.gols} {vt.gols === 1 ? 'gol' : 'gols'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
