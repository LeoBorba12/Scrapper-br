import React, { useState, useEffect, useRef } from 'react';
import { RadarDualPES } from './charts';

const DUELOS_CLASSICOS = [
  { label: 'Pedro x Gabigol', id1: 10, id2: 7, pos: 'Atacantes' },
  { label: 'Pelé x Zico', id1: null, id2: null, nome1: 'Pelé', nome2: 'Zico', pos: 'Históricos' },
  { label: 'Romário x Neymar', id1: null, id2: null, nome1: 'Romário', nome2: 'Neymar', pos: 'Atacantes' },
  { label: 'Arrascaeta x Paulo Baier', id1: null, id2: null, nome1: 'Arrascaeta', nome2: 'Paulo Baier', pos: 'Meias' },
  { label: 'Rogério Ceni x Marcos', id1: null, id2: null, nome1: 'Rogério Ceni', nome2: 'Marcos', pos: 'Goleiros' }
];

const FILTROS_POSICAO = [
  { id: 'todos', label: 'Todas as Posições' },
  { id: 'atacante', label: 'Atacantes' },
  { id: 'meia', label: 'Meio-Campo' },
  { id: 'defensor', label: 'Defensores' },
  { id: 'goleiro', label: 'Goleiros' }
];

export default function AthleteCompareView({
  initialId1 = 10,
  initialId2 = 7,
  initialNome1 = '',
  initialNome2 = '',
  onBack,
  onSelectPlayer,
  apiFetch
}) {
  const [id1, setId1] = useState(initialId1);
  const [id2, setId2] = useState(initialId2);
  const [nome1, setNome1] = useState(initialNome1);
  const [nome2, setNome2] = useState(initialNome2);

  const [posFiltro, setPosFiltro] = useState('todos');

  // Estado da comparação
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [compareData, setCompareData] = useState(null);

  // Estados dos seletores/autocomplete
  const [searchQuery1, setSearchQuery1] = useState('');
  const [searchQuery2, setSearchQuery2] = useState('');
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [searching1, setSearching1] = useState(false);
  const [searching2, setSearching2] = useState(false);
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);

  const dropdownRef1 = useRef(null);
  const dropdownRef2 = useRef(null);

  const getAuthToken = () => {
    return localStorage.getItem('futstats_auth_token') || localStorage.getItem('token') || '';
  };

  // Carregar dados comparativos
  const fetchComparison = async (paramId1, paramId2, paramNome1, paramNome2) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const params = new URLSearchParams();
      if (paramId1) params.append('id1', paramId1);
      else if (paramNome1) params.append('nome1', paramNome1);

      if (paramId2) params.append('id2', paramId2);
      else if (paramNome2) params.append('nome2', paramNome2);

      const endpoint = `/api/jogadores/comparar?${params.toString()}`;
      const res = apiFetch
        ? await apiFetch(endpoint)
        : await fetch(endpoint, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Erro ao comparar atletas (${res.status})`);
      }

      const data = await res.json();
      setCompareData(data);
      if (data.atleta1) {
        setId1(data.atleta1.id_jogador);
        setNome1(data.atleta1.nome);
        setSearchQuery1(data.atleta1.nome);
      }
      if (data.atleta2) {
        setId2(data.atleta2.id_jogador);
        setNome2(data.atleta2.nome);
        setSearchQuery2(data.atleta2.nome);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(id1, id2, nome1, nome2);
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef1.current && !dropdownRef1.current.contains(e.target)) {
        setShowDropdown1(false);
      }
      if (dropdownRef2.current && !dropdownRef2.current.contains(e.target)) {
        setShowDropdown2(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca de sugestões para Atleta 1
  useEffect(() => {
    if (!showDropdown1) return;
    const timer = setTimeout(async () => {
      setSearching1(true);
      try {
        const token = getAuthToken();
        const params = new URLSearchParams();
        if (searchQuery1.trim()) params.append('q', searchQuery1.trim());
        if (posFiltro !== 'todos') params.append('posicao', posFiltro);
        params.append('limit', '12');

        const endpoint = `/api/jogadores/busca?${params.toString()}`;
        const res = apiFetch
          ? await apiFetch(endpoint)
          : await fetch(endpoint, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
        if (res.ok) {
          const list = await res.json();
          setSuggestions1(list);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSearching1(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery1, posFiltro, showDropdown1]);

  // Busca de sugestões para Atleta 2
  useEffect(() => {
    if (!showDropdown2) return;
    const timer = setTimeout(async () => {
      setSearching2(true);
      try {
        const token = getAuthToken();
        const params = new URLSearchParams();
        if (searchQuery2.trim()) params.append('q', searchQuery2.trim());
        if (posFiltro !== 'todos') params.append('posicao', posFiltro);
        params.append('limit', '12');

        const endpoint = `/api/jogadores/busca?${params.toString()}`;
        const res = apiFetch
          ? await apiFetch(endpoint)
          : await fetch(endpoint, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
        if (res.ok) {
          const list = await res.json();
          setSuggestions2(list);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSearching2(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery2, posFiltro, showDropdown2]);

  // Ação de Inverter / Swap
  const handleSwap = () => {
    const tempId = id1;
    const tempNome = nome1;
    setId1(id2);
    setNome1(nome2);
    setId2(tempId);
    setNome2(tempNome);
    fetchComparison(id2, tempId, nome2, tempNome);
  };

  // Selecionar sugestão
  const handleSelectAthlete1 = (item) => {
    setId1(item.id_jogador);
    setNome1(item.nome || item.atleta);
    setSearchQuery1(item.nome || item.atleta);
    setShowDropdown1(false);
    fetchComparison(item.id_jogador, id2, item.nome || item.atleta, nome2);
  };

  const handleSelectAthlete2 = (item) => {
    setId2(item.id_jogador);
    setNome2(item.nome || item.atleta);
    setSearchQuery2(item.nome || item.atleta);
    setShowDropdown2(false);
    fetchComparison(id1, item.id_jogador, nome1, item.nome || item.atleta);
  };

  const handleDueloRapido = (duelo) => {
    setId1(duelo.id1);
    setId2(duelo.id2);
    setNome1(duelo.nome1 || '');
    setNome2(duelo.nome2 || '');
    fetchComparison(duelo.id1, duelo.id2, duelo.nome1, duelo.nome2);
  };

  const atleta1 = compareData?.atleta1 || {};
  const atleta2 = compareData?.atleta2 || {};
  const placar = compareData?.placar_geral || {};
  const matrizScouts = compareData?.matriz_scouts || [];
  const h2hJogos = compareData?.h2h_jogos || [];
  const totaisH2H = compareData?.totais_h2h || {};
  const evolucaoTemporadas = compareData?.evolucao_temporadas || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1280px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* Barra de Navegação Superior e Voltar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onBack && (
            <button
              onClick={onBack}
              className="touch-tactile"
              style={{
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-control)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ← Voltar ao Perfil
            </button>
          )}
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              ⚔️ Comparador de Atletas Lado a Lado
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Confronto estatístico direto, Radar Dual PES sobreposto e histórico de jogos em comum.
            </p>
          </div>
        </div>

        {/* Filtro Rápido por Posição */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Filtro:</span>
          {FILTROS_POSICAO.map((f) => (
            <button
              key={f.id}
              onClick={() => setPosFiltro(f.id)}
              className="touch-tactile"
              style={{
                backgroundColor: posFiltro === f.id ? 'var(--accent)' : 'var(--surface-raised)',
                color: posFiltro === f.id ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duelos Clássicos em Destaque (Shortcuts) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'thin'
        }}
      >
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
          Duelos Históricos:
        </span>
        {DUELOS_CLASSICOS.map((d, idx) => (
          <button
            key={idx}
            onClick={() => handleDueloRapido(d)}
            className="touch-tactile"
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-control)',
              padding: '4px 10px',
              fontSize: '0.76rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{d.label}</span>
            <span style={{ fontSize: '0.66rem', color: 'var(--accent)', opacity: 0.85 }}>({d.pos})</span>
          </button>
        ))}
      </div>

      {/* Barra de Seleção e Busca dos Dois Atletas com Botão Swap */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          padding: '16px',
          boxShadow: 'var(--shadow-editorial)'
        }}
      >
        {/* Seletor Atleta 1 (Oliva) */}
        <div style={{ position: 'relative' }} ref={dropdownRef1}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#7C8F52', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              🟢 Atleta 1 (Oliva)
            </span>
            {atleta1.posicao && (
              <span className="pill-neutral" style={{ fontSize: '0.68rem' }}>{atleta1.posicao}</span>
            )}
          </div>
          <input
            type="text"
            value={searchQuery1}
            onChange={(e) => {
              setSearchQuery1(e.target.value);
              setShowDropdown1(true);
            }}
            onFocus={() => setShowDropdown1(true)}
            placeholder="Digite o nome do primeiro atleta..."
            style={{
              width: '100%',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-control)',
              padding: '10px 14px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: 600,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          {/* Dropdown 1 */}
          {showDropdown1 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 50,
                marginTop: '4px',
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-control)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                maxHeight: '280px',
                overflowY: 'auto'
              }}
            >
              {searching1 ? (
                <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Buscando atletas...
                </div>
              ) : suggestions1.length > 0 ? (
                suggestions1.map((item) => (
                  <div
                    key={item.id_jogador}
                    onClick={() => handleSelectAthlete1(item)}
                    className="touch-tactile"
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                        {item.nome || item.atleta}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {item.posicao || 'Atleta'} • {item.clubes_recentes || 'Acervo'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="font-mono" style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--accent)' }}>
                        {item.gols || 0}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '3px' }}>gols</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Nenhum atleta encontrado para "{searchQuery1}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botão de Inverter (Swap) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={handleSwap}
            title="Inverter lados da comparação"
            className="touch-tactile"
            style={{
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.1rem',
              transition: 'transform 0.2s ease',
              marginTop: '16px'
            }}
          >
            ⇄
          </button>
        </div>

        {/* Seletor Atleta 2 (Terracota) */}
        <div style={{ position: 'relative' }} ref={dropdownRef2}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#B87550', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              🟤 Atleta 2 (Terracota)
            </span>
            {atleta2.posicao && (
              <span className="pill-neutral" style={{ fontSize: '0.68rem' }}>{atleta2.posicao}</span>
            )}
          </div>
          <input
            type="text"
            value={searchQuery2}
            onChange={(e) => {
              setSearchQuery2(e.target.value);
              setShowDropdown2(true);
            }}
            onFocus={() => setShowDropdown2(true)}
            placeholder="Digite o nome do segundo atleta..."
            style={{
              width: '100%',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-control)',
              padding: '10px 14px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: 600,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          {/* Dropdown 2 */}
          {showDropdown2 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 50,
                marginTop: '4px',
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-control)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                maxHeight: '280px',
                overflowY: 'auto'
              }}
            >
              {searching2 ? (
                <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Buscando atletas...
                </div>
              ) : suggestions2.length > 0 ? (
                suggestions2.map((item) => (
                  <div
                    key={item.id_jogador}
                    onClick={() => handleSelectAthlete2(item)}
                    className="touch-tactile"
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                        {item.nome || item.atleta}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {item.posicao || 'Atleta'} • {item.clubes_recentes || 'Acervo'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="font-mono" style={{ fontWeight: 800, fontSize: '0.86rem', color: 'var(--accent)' }}>
                        {item.gols || 0}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '3px' }}>gols</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Nenhum atleta encontrado para "{searchQuery2}".
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Estados de Loading e Erro */}
      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>⏳ Computando matriz estatística e sobreposição PES...</div>
          <span style={{ fontSize: '0.82rem' }}>Cruzando acervos de partidas, gols e scouts atômicos.</span>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-control)',
            color: '#EF4444',
            fontSize: '0.85rem'
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {!loading && compareData && (
        <>
          {/* Banner do Placar Geral de Confronto */}
          <div
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-card)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: 'var(--shadow-editorial)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Resumo Geral do Confronto Estatístico
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                {placar.lider === 1 ? (
                  <span>
                    🏆 Vantagem de <strong style={{ color: '#7C8F52' }}>{atleta1.nome}</strong> ({placar.vitorias_atleta1} a {placar.vitorias_atleta2} quesitos)
                  </span>
                ) : placar.lider === 2 ? (
                  <span>
                    🏆 Vantagem de <strong style={{ color: '#B87550' }}>{atleta2.nome}</strong> ({placar.vitorias_atleta2} a {placar.vitorias_atleta1} quesitos)
                  </span>
                ) : (
                  <span>⚖️ Empate Técnico Rigoroso ({placar.vitorias_atleta1} a {placar.vitorias_atleta2})</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 900, color: '#7C8F52', lineHeight: 1 }}>
                  {placar.vitorias_atleta1}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{atleta1.nome}</div>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>x</div>
              <div style={{ textAlign: 'center' }}>
                <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 900, color: '#B87550', lineHeight: 1 }}>
                  {placar.vitorias_atleta2}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{atleta2.nome}</div>
              </div>
              {placar.empates > 0 && (
                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
                  <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-secondary)', lineHeight: 1 }}>
                    {placar.empates}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Empates</div>
                </div>
              )}
            </div>
          </div>

          {/* Bento Grid Principal: Perfil 1 | Radar Dual PES Central | Perfil 2 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(260px, 1fr) minmax(340px, 1.3fr) minmax(260px, 1fr)',
              gap: '16px',
              alignItems: 'stretch'
            }}
          >
            {/* Card Atleta 1 (Oliva) */}
            <div
              style={{
                backgroundColor: 'var(--surface-card)',
                border: '1px solid rgba(90, 103, 62, 0.4)',
                borderRadius: 'var(--radius-card)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: 'var(--shadow-editorial)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(90, 103, 62, 0.2)',
                    border: '2px solid #7C8F52',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    color: '#7C8F52',
                    overflow: 'hidden'
                  }}
                >
                  {atleta1.foto_url ? (
                    <img src={atleta1.foto_url} alt={atleta1.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    atleta1.nome?.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {atleta1.nome}
                  </h2>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {atleta1.nome_completo || atleta1.nome}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <span className="pill-neutral" style={{ fontSize: '0.68rem', backgroundColor: 'rgba(90, 103, 62, 0.15)', color: '#7C8F52' }}>
                      {atleta1.posicao || 'Atleta'}
                    </span>
                    <span className="pill-neutral" style={{ fontSize: '0.68rem' }}>
                      {atleta1.situacao || 'Ativo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ficha Rápida Atleta 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.76rem' }}>
                <div style={{ backgroundColor: 'var(--surface-raised)', padding: '8px', borderRadius: 'var(--radius-control)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Idade</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{atleta1.idade ? `${atleta1.idade} anos` : '—'}</div>
                </div>
                <div style={{ backgroundColor: 'var(--surface-raised)', padding: '8px', borderRadius: 'var(--radius-control)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Altura / Pé</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {atleta1.altura ? `${atleta1.altura} cm` : '—'} • {atleta1.pe_preferencial || 'Destro'}
                  </div>
                </div>
              </div>

              {/* Clubes Atleta 1 */}
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Clubes Registrados
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {atleta1.clubes && atleta1.clubes.length > 0 ? (
                    atleta1.clubes.map((c, i) => (
                      <span key={i} className="pill-neutral" style={{ fontSize: '0.7rem' }}>{c}</span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sem histórico de clubes</span>
                  )}
                </div>
              </div>

              {onSelectPlayer && (
                <button
                  onClick={() => onSelectPlayer(atleta1.id_jogador, atleta1.nome)}
                  className="touch-tactile"
                  style={{
                    marginTop: 'auto',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(90, 103, 62, 0.4)',
                    color: '#7C8F52',
                    padding: '8px',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Abrir Ficha Completa de {atleta1.nome} →
                </button>
              )}
            </div>

            {/* Radar Central PES Sobreposto */}
            <div
              style={{
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-card)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-editorial)'
              }}
            >
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--accent)' }}>
                  ⭐ Radar Dual Sobreposto
                </span>
                <span className="pill-neutral" style={{ fontSize: '0.66rem' }}>Estilo Winning Eleven</span>
              </div>

              <RadarDualPES
                atleta1={atleta1}
                atleta2={atleta2}
                eixos1={atleta1.radar_pes?.eixos || []}
                eixos2={atleta2.radar_pes?.eixos || []}
                ovr1={atleta1.radar_pes?.ovr || 75}
                ovr2={atleta2.radar_pes?.ovr || 75}
                size={340}
              />
            </div>

            {/* Card Atleta 2 (Terracota) */}
            <div
              style={{
                backgroundColor: 'var(--surface-card)',
                border: '1px solid rgba(133, 87, 59, 0.4)',
                borderRadius: 'var(--radius-card)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: 'var(--shadow-editorial)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(133, 87, 59, 0.2)',
                    border: '2px solid #B87550',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    color: '#B87550',
                    overflow: 'hidden'
                  }}
                >
                  {atleta2.foto_url ? (
                    <img src={atleta2.foto_url} alt={atleta2.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    atleta2.nome?.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {atleta2.nome}
                  </h2>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {atleta2.nome_completo || atleta2.nome}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                    <span className="pill-neutral" style={{ fontSize: '0.68rem', backgroundColor: 'rgba(133, 87, 59, 0.15)', color: '#B87550' }}>
                      {atleta2.posicao || 'Atleta'}
                    </span>
                    <span className="pill-neutral" style={{ fontSize: '0.68rem' }}>
                      {atleta2.situacao || 'Ativo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ficha Rápida Atleta 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.76rem' }}>
                <div style={{ backgroundColor: 'var(--surface-raised)', padding: '8px', borderRadius: 'var(--radius-control)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Idade</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{atleta2.idade ? `${atleta2.idade} anos` : '—'}</div>
                </div>
                <div style={{ backgroundColor: 'var(--surface-raised)', padding: '8px', borderRadius: 'var(--radius-control)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Altura / Pé</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {atleta2.altura ? `${atleta2.altura} cm` : '—'} • {atleta2.pe_preferencial || 'Destro'}
                  </div>
                </div>
              </div>

              {/* Clubes Atleta 2 */}
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Clubes Registrados
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {atleta2.clubes && atleta2.clubes.length > 0 ? (
                    atleta2.clubes.map((c, i) => (
                      <span key={i} className="pill-neutral" style={{ fontSize: '0.7rem' }}>{c}</span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sem histórico de clubes</span>
                  )}
                </div>
              </div>

              {onSelectPlayer && (
                <button
                  onClick={() => onSelectPlayer(atleta2.id_jogador, atleta2.nome)}
                  className="touch-tactile"
                  style={{
                    marginTop: 'auto',
                    backgroundColor: 'transparent',
                    border: '1px solid rgba(133, 87, 59, 0.4)',
                    color: '#B87550',
                    padding: '8px',
                    borderRadius: 'var(--radius-control)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Abrir Ficha Completa de {atleta2.nome} →
                </button>
              )}
            </div>
          </div>

          {/* Matriz de Confronto Estatístico Direto */}
          <div
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-card)',
              padding: '20px',
              boxShadow: 'var(--shadow-editorial)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  📊 Matriz de Confronto Estatístico Direto
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                  Comparativo de métricas oficiais de carreira, dados auditados do acervo nacional e índices de disciplina.
                </p>
              </div>
              <span className="pill-neutral" style={{ fontSize: '0.7rem' }}>
                Verde/Negrito = Vencedor do Quesito
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 14px', width: '38%', textAlign: 'right', color: '#7C8F52' }}>
                      {atleta1.nome}
                    </th>
                    <th style={{ padding: '10px 14px', width: '24%', textAlign: 'center' }}>
                      Métrica Analítica
                    </th>
                    <th style={{ padding: '10px 14px', width: '38%', textAlign: 'left', color: '#B87550' }}>
                      {atleta2.nome}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {matrizScouts.map((item, idx) => {
                    const isWin1 = item.vencedor === 1;
                    const isWin2 = item.vencedor === 2;

                    const formatVal = (v) => {
                      if (v == null) return '—';
                      if (item.formato === 'decimal') return Number(v).toFixed(2);
                      if (item.formato === 'porcentagem') return `${Number(v).toFixed(1)}%`;
                      return Number(v).toLocaleString('pt-BR');
                    };

                    return (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface-raised)'
                        }}
                      >
                        {/* Valor Atleta 1 */}
                        <td
                          style={{
                            padding: '10px 14px',
                            textAlign: 'right',
                            fontWeight: isWin1 ? 900 : 500,
                            color: isWin1 ? 'var(--text-primary)' : 'var(--text-secondary)'
                          }}
                        >
                          {isWin1 && (
                            <span
                              style={{
                                display: 'inline-block',
                                marginRight: '8px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                backgroundColor: 'rgba(90, 103, 62, 0.2)',
                                color: '#7C8F52'
                              }}
                            >
                              +{item.diff}
                            </span>
                          )}
                          <span className="font-mono" style={{ fontSize: isWin1 ? '1.05rem' : '0.9rem' }}>
                            {formatVal(item.val1)}
                          </span>
                        </td>

                        {/* Label da Métrica */}
                        <td style={{ padding: '10px 14px', textAlign: 'center', color: 'var(--text-primary)' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{item.label}</div>
                          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{item.categoria}</div>
                        </td>

                        {/* Valor Atleta 2 */}
                        <td
                          style={{
                            padding: '10px 14px',
                            textAlign: 'left',
                            fontWeight: isWin2 ? 900 : 500,
                            color: isWin2 ? 'var(--text-primary)' : 'var(--text-secondary)'
                          }}
                        >
                          <span className="font-mono" style={{ fontSize: isWin2 ? '1.05rem' : '0.9rem' }}>
                            {formatVal(item.val2)}
                          </span>
                          {isWin2 && (
                            <span
                              style={{
                                display: 'inline-block',
                                marginLeft: '8px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                backgroundColor: 'rgba(133, 87, 59, 0.2)',
                                color: '#B87550'
                              }}
                            >
                              +{item.diff}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Jogos em Comum no Acervo (Confrontos Diretos ou Companheiros) */}
          <div
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-card)',
              padding: '20px',
              boxShadow: 'var(--shadow-editorial)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  🤝 Partidas Compartilhadas no Acervo Nacional ({totaisH2H.partidas || 0})
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                  Partidas catalogadas em que ambos estiveram presentes em campo (como companheiros ou adversários).
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="pill-neutral" style={{ fontSize: '0.7rem' }}>
                  {totaisH2H.como_companheiros || 0} como companheiros
                </span>
                <span className="pill-neutral" style={{ fontSize: '0.7rem' }}>
                  {totaisH2H.como_rivais || 0} como rivais
                </span>
              </div>
            </div>

            {h2hJogos.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
                {h2hJogos.map((j) => (
                  <div
                    key={j.id_partida}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-control)',
                      padding: '10px 14px',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: j.tipo === 'companheiros' ? 'rgba(90, 103, 62, 0.2)' : 'rgba(133, 87, 59, 0.2)',
                            color: j.tipo === 'companheiros' ? '#7C8F52' : '#B87550',
                            textTransform: 'uppercase'
                          }}
                        >
                          {j.tipo === 'companheiros' ? 'Companheiros' : 'Confronto Direto'}
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {j.mandante} {j.placar} {j.visitante}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {j.campeonato} • {j.data || 'Data desconhecida'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ textAlign: 'right', fontSize: '0.72rem' }}>
                        <span style={{ color: '#7C8F52', fontWeight: 700 }}>{atleta1.nome}:</span>{' '}
                        <strong>{j.gols1} {j.gols1 === 1 ? 'gol' : 'gols'}</strong>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.72rem' }}>
                        <span style={{ color: '#B87550', fontWeight: 700 }}>{atleta2.nome}:</span>{' '}
                        <strong>{j.gols2} {j.gols2 === 1 ? 'gol' : 'gols'}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                Nenhuma partida registrada onde ambos atuaram juntos ou como rivais no acervo nacional.
              </div>
            )}
          </div>

          {/* Comparativo de Evolução Temporada a Temporada */}
          <div
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-card)',
              padding: '20px',
              boxShadow: 'var(--shadow-editorial)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  📈 Linha do Tempo Comparativa (Gols Ano a Ano)
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                  Volume de gols registrados no acervo temporada a temporada.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: '#7C8F52', fontWeight: 700 }}>■ {atleta1.nome}</span>
                <span style={{ fontSize: '0.72rem', color: '#B87550', fontWeight: 700 }}>■ {atleta2.nome}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {evolucaoTemporadas.slice(0, 15).map((temp) => {
                const maxGolsAno = Math.max(
                  ...evolucaoTemporadas.map((t) => Math.max(t.gols1 || 0, t.gols2 || 0)),
                  1
                );
                const pct1 = Math.round(((temp.gols1 || 0) / maxGolsAno) * 100);
                const pct2 = Math.round(((temp.gols2 || 0) / maxGolsAno) * 100);

                return (
                  <div key={temp.ano} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem' }}>
                    <span className="font-mono" style={{ width: '42px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      {temp.ano}
                    </span>

                    {/* Barra Atleta 1 (Esquerda) */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <span className="font-mono" style={{ fontWeight: 700, color: '#7C8F52' }}>
                        {temp.gols1 || 0}
                      </span>
                      <div style={{ width: '100%', maxWidth: '140px', height: '10px', backgroundColor: 'var(--surface-raised)', borderRadius: '4px', overflow: 'hidden', display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: `${pct1}%`, height: '100%', backgroundColor: '#7C8F52', borderRadius: '4px' }} />
                      </div>
                    </div>

                    <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>vs</span>

                    {/* Barra Atleta 2 (Direita) */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px' }}>
                      <div style={{ width: '100%', maxWidth: '140px', height: '10px', backgroundColor: 'var(--surface-raised)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct2}%`, height: '100%', backgroundColor: '#B87550', borderRadius: '4px' }} />
                      </div>
                      <span className="font-mono" style={{ fontWeight: 700, color: '#B87550' }}>
                        {temp.gols2 || 0}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
