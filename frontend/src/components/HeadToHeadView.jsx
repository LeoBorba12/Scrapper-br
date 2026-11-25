import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight, Trophy, Shield, Calendar, TrendingUp,
  AlertCircle, History, Sparkles, Filter, Users, Flame
} from 'lucide-react';

const CLASSICOS_PRESETS = [
  { label: 'Derby Paulista', a: 'Palmeiras', b: 'Corinthians' },
  { label: 'Fla-Flu', a: 'Flamengo', b: 'Fluminense' },
  { label: 'Gre-Nal', a: 'Grêmio', b: 'Internacional' },
  { label: 'Majestoso', a: 'Corinthians', b: 'São Paulo' },
  { label: 'Clássico Mineiro', a: 'Atlético-MG', b: 'Cruzeiro' },
  { label: 'San-São', a: 'Santos', b: 'São Paulo' },
  { label: 'Clássico da Saudade', a: 'Palmeiras', b: 'Santos' },
  { label: 'Clássico dos Milhões', a: 'Flamengo', b: 'Vasco' }
];

const cardStyle = {
  backgroundColor: 'var(--surface-card)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-card)',
  padding: '20px',
  boxShadow: 'var(--shadow-sm)'
};

const subCardStyle = {
  backgroundColor: 'var(--surface-raised)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-control)',
  padding: '14px'
};

const selectStyle = {
  width: '100%',
  backgroundColor: 'var(--surface-raised)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-control)',
  padding: '10px 12px',
  color: 'var(--text-primary)',
  fontSize: '0.92rem',
  fontWeight: 600,
  outline: 'none'
};

export default function HeadToHeadView() {
  const [clubesLista, setClubesLista] = useState([]);
  const [clubeAId, setClubeAId] = useState(2459); // Palmeiras
  const [clubeBId, setClubeBId] = useState(2902); // Santos
  const [campeonato, setCampeonato] = useState('todos');
  const [decada, setDecada] = useState('todas');
  const [mandoFiltro, setMandoFiltro] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [dadosH2H, setDadosH2H] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    fetch('/api/clubes/lista-geral')
      .then(res => res.json())
      .then(data => {
        if (data && data.clubes) {
          setClubesLista(data.clubes);
        }
      })
      .catch(() => {
        setClubesLista([
          { clube_id: 2459, nome: 'Palmeiras' },
          { clube_id: 2902, nome: 'Santos' },
          { clube_id: 981, nome: 'Corinthians' },
          { clube_id: 3077, nome: 'São Paulo' },
          { clube_id: 1389, nome: 'Flamengo' }
        ]);
      });
  }, []);

  useEffect(() => {
    if (!clubeAId || !clubeBId || clubeAId === clubeBId) return;

    setLoading(true);
    setErro(null);

    const params = new URLSearchParams({
      clube_a: String(clubeAId),
      clube_b: String(clubeBId),
      campeonato,
      decada,
      mando: mandoFiltro
    });

    fetch(`/api/confrontos/h2h?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar dados do confronto');
        return res.json();
      })
      .then(data => {
        setDadosH2H(data);
        setLoading(false);
      })
      .catch(err => {
        setErro(err.message);
        setLoading(false);
      });
  }, [clubeAId, clubeBId, campeonato, decada, mandoFiltro]);

  const handleInverterPerspectiva = () => {
    const temp = clubeAId;
    setClubeAId(clubeBId);
    setClubeBId(temp);
  };

  const selecionarClassico = (nomeA, nomeB) => {
    const findId = (n) => clubesLista.find(c => c.nome.toLowerCase() === n.toLowerCase())?.clube_id;
    const idA = findId(nomeA);
    const idB = findId(nomeB);
    if (idA && idB) {
      setClubeAId(idA);
      setClubeBId(idB);
    }
  };

  const infoA = dadosH2H?.clubes?.clube_a;
  const infoB = dadosH2H?.clubes?.clube_b;
  const retro = dadosH2H?.retrospecto_geral;
  const mando = dadosH2H?.retrospecto_mando;
  const dc = dadosH2H?.projecao_dixon_coles;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-primary)' }}>
      {/* Topo Editorial e Seletores */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '14px' }}>
          <div style={{ flex: '1 1 220px' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#85573B', marginBottom: '6px' }}>
              Clube Principal (A)
            </label>
            <select
              value={clubeAId}
              onChange={(e) => setClubeAId(Number(e.target.value))}
              style={{ ...selectStyle, fontFamily: 'var(--font-serif)', fontSize: '1.05rem' }}
            >
              {clubesLista.map(c => (
                <option key={`a-${c.clube_id}`} value={c.clube_id} disabled={c.clube_id === clubeBId}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleInverterPerspectiva}
            className="touch-tactile"
            title="Inverter perspectiva dos clubes"
            style={{
              padding: '10px 12px',
              borderRadius: '999px',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              color: '#85573B',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeftRight size={18} />
          </button>

          <div style={{ flex: '1 1 220px' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#85573B', marginBottom: '6px' }}>
              Clube Oponente (B)
            </label>
            <select
              value={clubeBId}
              onChange={(e) => setClubeBId(Number(e.target.value))}
              style={{ ...selectStyle, fontFamily: 'var(--font-serif)', fontSize: '1.05rem' }}
            >
              {clubesLista.map(c => (
                <option key={`b-${c.clube_id}`} value={c.clube_id} disabled={c.clube_id === clubeAId}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clássicos Históricos & Filtros Táticos */}
        <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#85573B', display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
              <Flame size={14} /> Clássicos:
            </span>
            {CLASSICOS_PRESETS.map((cl) => (
              <button
                key={cl.label}
                type="button"
                onClick={() => selecionarClassico(cl.a, cl.b)}
                className="touch-tactile"
                style={{
                  padding: '5px 12px',
                  borderRadius: '999px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                {cl.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Competição
              </label>
              <select value={campeonato} onChange={(e) => setCampeonato(e.target.value)} style={selectStyle}>
                <option value="todos">Todas as Competições</option>
                <option value="brasileirao">Brasileirão</option>
                <option value="libertadores">Libertadores</option>
                <option value="copa_do_brasil">Copa do Brasil</option>
                <option value="estaduais">Estaduais / Regionais</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Década
              </label>
              <select value={decada} onChange={(e) => setDecada(e.target.value)} style={selectStyle}>
                <option value="todas">Todo o Acervo</option>
                <option value="2020s">2020s</option>
                <option value="2010s">2010s</option>
                <option value="2000s">2000s</option>
                <option value="1990s">1990s</option>
                <option value="1980s">1980s</option>
                <option value="pre1980">Pré-1980</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Mando de Campo
              </label>
              <select value={mandoFiltro} onChange={(e) => setMandoFiltro(e.target.value)} style={selectStyle}>
                <option value="todos">Todos os Mandos</option>
                <option value="a_mandante">{infoA?.nome || 'Clube A'} Mandante</option>
                <option value="b_mandante">{infoB?.nome || 'Clube B'} Mandante</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {erro && (
        <div style={{ ...cardStyle, backgroundColor: '#FDF2F0', borderColor: '#EAC4BE', color: '#85573B', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{erro}</span>
        </div>
      )}

      {loading && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px', color: '#5A673E' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', margin: 0 }}>
            Consultando histórico de confrontos no acervo canônico...
          </p>
        </div>
      )}

      {!loading && dadosH2H && infoA && infoB && retro && (
        <>
          {/* Projeção Preditiva Dixon-Coles */}
          {dc && (
            <div style={cardStyle}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} color="#5A673E" />
                    Projeção Preditiva (Modelo Dixon-Coles Bivariado)
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Probabilidades científicas e Fair Odds calibradas no recorte selecionado
                  </p>
                </div>
                <span style={{ ...subCardStyle, padding: '6px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 800 }}>
                  Placar Provável: {dc.placar_mais_provavel}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div style={{ ...subCardStyle, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#5A673E' }}>Vitória {infoA.nome}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 900, color: '#5A673E', margin: '4px 0' }}>
                    {dc.probabilidades_1x2.vitoria_clube_a_pct}%
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Odd Justa: {dc.fair_odds.odd_clube_a} · xG: {dc.expectativa_gols.clube_a_xg}
                  </div>
                </div>

                <div style={{ ...subCardStyle, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Empate</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0' }}>
                    {dc.probabilidades_1x2.empate_pct}%
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Odd Justa: {dc.fair_odds.odd_empate}
                  </div>
                </div>

                <div style={{ ...subCardStyle, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#85573B' }}>Vitória {infoB.nome}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 900, color: '#85573B', margin: '4px 0' }}>
                    {dc.probabilidades_1x2.vitoria_clube_b_pct}%
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Odd Justa: {dc.fair_odds.odd_clube_b} · xG: {dc.expectativa_gols.clube_b_xg}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Retrospecto Geral no Recorte */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} color="#85573B" />
                Retrospecto Geral no Acervo
              </h3>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {retro.total_jogos} Confrontos Catalogados
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ ...subCardStyle, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#5A673E' }}>Vitórias {infoA.nome}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.1rem', fontWeight: 900, color: '#5A673E' }}>{retro.vitorias_clube_a}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{retro.aproveitamento_clube_a_pct}% aproveitamento</div>
              </div>

              <div style={{ ...subCardStyle, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Empates</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.1rem', fontWeight: 900, color: 'var(--text-primary)' }}>{retro.empates}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Saldo {infoA.sigla || infoA.nome}: {retro.saldo_gols_clube_a > 0 ? `+${retro.saldo_gols_clube_a}` : retro.saldo_gols_clube_a}
                </div>
              </div>

              <div style={{ ...subCardStyle, textAlign: 'center' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#85573B' }}>Vitórias {infoB.nome}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.1rem', fontWeight: 900, color: '#85573B' }}>{retro.vitorias_clube_b}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{retro.aproveitamento_clube_b_pct}% aproveitamento</div>
              </div>
            </div>

            {retro.total_jogos > 0 && (
              <div>
                <div style={{ height: '12px', borderRadius: '999px', overflow: 'hidden', display: 'flex', backgroundColor: 'var(--surface-raised)' }}>
                  <div style={{ width: `${(retro.vitorias_clube_a / retro.total_jogos) * 100}%`, backgroundColor: '#5A673E' }} title={`Vitórias ${infoA.nome}`} />
                  <div style={{ width: `${(retro.empates / retro.total_jogos) * 100}%`, backgroundColor: '#D8C7B5' }} title="Empates" />
                  <div style={{ width: `${(retro.vitorias_clube_b / retro.total_jogos) * 100}%`, backgroundColor: '#85573B' }} title={`Vitórias ${infoB.nome}`} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                  <span>{infoA.nome}: {retro.gols_clube_a} gols</span>
                  <span>{infoB.nome}: {retro.gols_clube_b} gols</span>
                </div>
              </div>
            )}
          </div>

          {/* Retrospecto por Mando */}
          {mando && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { titulo: `${infoA.nome} como Mandante`, cor: '#5A673E', d: mando.clube_a_mandante },
                { titulo: `${infoB.nome} como Mandante`, cor: '#85573B', d: mando.clube_b_mandante }
              ].map((bloco, idx) => (
                <div key={idx} style={cardStyle}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 800, color: bloco.cor, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={16} />
                    {bloco.titulo}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                    <div style={subCardStyle}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Vitórias</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#5A673E' }}>{bloco.d.vitorias}</div>
                    </div>
                    <div style={subCardStyle}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Empates</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800 }}>{bloco.d.empates}</div>
                    </div>
                    <div style={subCardStyle}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Derrotas</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#85573B' }}>{bloco.d.derrotas}</div>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', margin: '10px 0 0 0' }}>
                    Gols: {bloco.d.gols_pro} pró, {bloco.d.gols_contra} contra
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Cruzamento Histórico por Competição & Década */}
          {(dadosH2H.cruzamento_por_competicao?.length > 0 || dadosH2H.cruzamento_por_decada?.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {dadosH2H.cruzamento_por_competicao?.length > 0 && (
                <div style={cardStyle}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={16} color="#5A673E" />
                    Cruzamento por Competição (Acervo Completo)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {dadosH2H.cruzamento_por_competicao.map((item) => (
                      <div key={item.chave} style={subCardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700 }}>{item.label}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                            {item.total_jogos} jogos · <strong style={{ color: '#5A673E' }}>{item.vitorias_a}V</strong> / {item.empates}E / <strong style={{ color: '#85573B' }}>{item.vitorias_b}V</strong>
                          </span>
                        </div>
                        <div style={{ height: '8px', borderRadius: '999px', overflow: 'hidden', display: 'flex', backgroundColor: 'var(--surface-card)' }}>
                          <div style={{ width: `${(item.vitorias_a / item.total_jogos) * 100}%`, backgroundColor: '#5A673E' }} />
                          <div style={{ width: `${(item.empates / item.total_jogos) * 100}%`, backgroundColor: '#D8C7B5' }} />
                          <div style={{ width: `${(item.vitorias_b / item.total_jogos) * 100}%`, backgroundColor: '#85573B' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dadosH2H.cruzamento_por_decada?.length > 0 && (
                <div style={cardStyle}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="#85573B" />
                    Hegemonia por Década
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {dadosH2H.cruzamento_por_decada.map((item) => (
                      <div key={item.chave} style={subCardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', marginBottom: '6px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{item.label}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                            {item.total_jogos} jogos · <strong style={{ color: '#5A673E' }}>{item.vitorias_a}</strong>–{item.empates}–<strong style={{ color: '#85573B' }}>{item.vitorias_b}</strong> ({item.gols_a}x{item.gols_b} gols)
                          </span>
                        </div>
                        <div style={{ height: '8px', borderRadius: '999px', overflow: 'hidden', display: 'flex', backgroundColor: 'var(--surface-card)' }}>
                          <div style={{ width: `${(item.vitorias_a / item.total_jogos) * 100}%`, backgroundColor: '#5A673E' }} />
                          <div style={{ width: `${(item.empates / item.total_jogos) * 100}%`, backgroundColor: '#D8C7B5' }} />
                          <div style={{ width: `${(item.vitorias_b / item.total_jogos) * 100}%`, backgroundColor: '#85573B' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Artilheiros do Clássico & Lei do Ex */}
          {(dadosH2H.artilheiros_confronto?.length > 0 || dadosH2H.lei_do_ex?.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {dadosH2H.artilheiros_confronto?.length > 0 && (
                <div style={cardStyle}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={16} color="#5A673E" />
                    Maiores Artilheiros no Recorte
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {dadosH2H.artilheiros_confronto.map((art, i) => (
                      <div key={`art-${art.id_jogador}-${i}`} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem' }}>
                        <div>
                          <span style={{ fontWeight: 700 }}>{art.nome}</span>
                          <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{art.clube}</span>
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#5A673E' }}>{art.gols} gols</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dadosH2H.lei_do_ex?.length > 0 && (
                <div style={cardStyle}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} color="#85573B" />
                    Lei do Ex (Marcaram pelos Dois Lados)
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {dadosH2H.lei_do_ex.map((ex) => (
                      <div key={`ex-${ex.id_jogador}`} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.86rem' }}>
                        <span style={{ fontWeight: 700 }}>{ex.nome}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <strong style={{ color: '#5A673E' }}>{ex.gols_a}</strong> ({infoA.sigla || 'A'}) · <strong style={{ color: '#85573B' }}>{ex.gols_b}</strong> ({infoB.sigla || 'B'})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Maiores Goleadas */}
          {dadosH2H.maiores_goleadas?.length > 0 && (
            <div style={cardStyle}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="#85573B" />
                Maiores Goleadas Históricas (Diferença ≥ 3 Gols)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                {dadosH2H.maiores_goleadas.map((gol, idx) => (
                  <div key={`goleada-${idx}`} style={subCardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      <span>{gol.data}</span>
                      <span style={{ color: '#85573B', fontWeight: 700 }}>{gol.competicao}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.45rem', fontWeight: 900, textAlign: 'center', margin: '6px 0' }}>
                      {gol.placar}
                    </div>
                    <p style={{ fontSize: '0.76rem', textAlign: 'center', color: 'var(--text-secondary)', margin: 0 }}>
                      {gol.mandante} x {gol.visitante}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Histórico Recente de Confrontos */}
          <div style={cardStyle}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} color="#5A673E" />
              Confrontos Recentes no Acervo
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 8px' }}>Data</th>
                    <th style={{ padding: '10px 8px' }}>Competição</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Mandante</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Placar</th>
                    <th style={{ padding: '10px 8px' }}>Visitante</th>
                    <th style={{ padding: '10px 8px' }}>Estádio</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosH2H.historico_recente?.map(partida => (
                    <tr key={partida.id_partida} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{partida.data}</td>
                      <td style={{ padding: '10px 8px', fontSize: '0.78rem' }}>{partida.campeonato}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: partida.mandante === infoA.nome ? 700 : 400, color: partida.mandante === infoA.nome ? '#5A673E' : 'var(--text-primary)' }}>
                        {partida.mandante}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
                        {partida.placar || `${partida.gols_mandante} x ${partida.gols_visitante}`}
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: partida.visitante === infoA.nome ? 700 : 400, color: partida.visitante === infoA.nome ? '#5A673E' : 'var(--text-primary)' }}>
                        {partida.visitante}
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{partida.estadio || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
