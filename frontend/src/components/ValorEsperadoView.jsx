import React, { useState, useEffect } from 'react';
import {
  TrendingUp, CheckCircle2, XCircle, Filter, Sparkles, Scale, Info, ArrowUpRight
} from 'lucide-react';

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
  padding: '14px',
  textAlign: 'center'
};

export default function ValorEsperadoView() {
  const [minEv, setMinEv] = useState(5.0);
  const [limite] = useState(30);
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    setLoading(true);
    setErro(null);

    fetch(`/api/mercados/valor-esperado?min_ev=${minEv}&limite=${limite}`)
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar oportunidades de Valor Esperado');
        return res.json();
      })
      .then(data => {
        setDados(data);
        setLoading(false);
      })
      .catch(err => {
        setErro(err.message);
        setLoading(false);
      });
  }, [minEv, limite]);

  const resumo = dados?.resumo_performance;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: 'var(--text-primary)' }}>
      {/* Topo Editorial */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: '1 1 320px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#85573B' }}>
              Inteligência Preditiva &amp; Anomalias de Mercado
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 800, margin: '4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={22} color="#5A673E" />
              Radar de Valor Esperado (+EV)
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', maxWidth: '680px', lineHeight: 1.45 }}>
              Cruzamento matemático entre as probabilidades reais calculadas pelo modelo Dixon-Coles calibrado e as Odds de fechamento, detectando desvios estatísticos relevantes.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', padding: '6px 10px', backgroundColor: 'var(--surface-raised)', borderRadius: 'var(--radius-control)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#85573B', display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
              <Filter size={14} /> Corte:
            </span>
            {[2.0, 5.0, 8.0, 12.0].map(corte => (
              <button
                key={`corte-${corte}`}
                type="button"
                onClick={() => setMinEv(corte)}
                className="touch-tactile"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.76rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-control)',
                  cursor: 'pointer',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: minEv === corte ? '#5A673E' : 'var(--surface-card)',
                  color: minEv === corte ? '#FFFFFF' : 'var(--text-primary)'
                }}
              >
                +{corte}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {erro && (
        <div style={{ ...cardStyle, backgroundColor: '#FDF2F0', borderColor: '#EAC4BE', color: '#85573B', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={18} />
          <span>{erro}</span>
        </div>
      )}

      {resumo && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div style={subCardStyle}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Oportunidades no Acervo</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.85rem', fontWeight: 900, margin: '4px 0' }}>{resumo.total_oportunidades_encontradas}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Corte ≥ +{minEv}%</div>
          </div>
          <div style={subCardStyle}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#5A673E' }}>+EV Médio Detectado</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.85rem', fontWeight: 900, color: '#5A673E', margin: '4px 0' }}>+{resumo.ev_medio_pct}%</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Vantagem Teórica</div>
          </div>
          <div style={subCardStyle}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#85573B' }}>Taxa de Acerto Real</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.85rem', fontWeight: 900, color: '#85573B', margin: '4px 0' }}>{resumo.taxa_acerto_historico_pct}%</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Win Rate Auditada</div>
          </div>
          <div style={subCardStyle}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Amostragem Exibida</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.85rem', fontWeight: 900, margin: '4px 0' }}>{resumo.total_retornadas}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Top Desvios Ordenados</div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px', color: '#5A673E' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', margin: 0 }}>
            Auditando partidas com odds e calculando matrizes de valor esperado...
          </p>
        </div>
      )}

      {!loading && dados?.oportunidades && (
        <>
          <div style={cardStyle}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#85573B" />
                Oportunidades de Maior Valor Esperado Catalogadas
              </h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', fontWeight: 700, backgroundColor: 'var(--surface-raised)', padding: '5px 12px', borderRadius: '999px', color: '#85573B', border: '1px solid var(--border-subtle)' }}>
                Ordenado por +EV%
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 8px' }}>Data</th>
                    <th style={{ padding: '10px 8px' }}>Partida</th>
                    <th style={{ padding: '10px 8px' }}>Mercado Analisado</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Odd Mercado</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Odd Justa</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Prob. Modelo</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>+EV %</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Resultado Factual</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.oportunidades.map((op, idx) => (
                    <tr key={`ev-${op.id_partida}-${idx}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{op.data}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <div style={{ fontWeight: 700 }}>{op.mandante} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>vs</span> {op.visitante}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{op.campeonato}</div>
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'var(--surface-raised)', color: '#85573B', fontSize: '0.74rem', fontWeight: 700, border: '1px solid var(--border-subtle)' }}>
                          {op.mercado}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{op.odd_mercado.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#5A673E' }}>{op.odd_justa_modelo.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{op.probabilidade_modelo_pct}%</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(90, 103, 62, 0.14)', color: '#5A673E', fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '0.76rem' }}>
                          <ArrowUpRight size={13} />
                          +{op.ev_percentual}%
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', fontSize: '0.76rem', fontWeight: 700 }}>
                        {op.acerto_historico === true ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#5A673E' }}>
                            <CheckCircle2 size={14} /> Green ({op.placar})
                          </span>
                        ) : op.acerto_historico === false ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#85573B' }}>
                            <XCircle size={14} /> Red ({op.placar})
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>Pendente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ ...cardStyle, fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.92rem', fontWeight: 800, color: '#85573B', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scale size={16} color="#85573B" />
              Fundamentação Matemática do Valor Esperado (+EV)
            </h3>
            <p style={{ margin: 0 }}>
              O Valor Esperado mede a expectativa matemática de retorno no longo prazo:
              <code style={{ backgroundColor: 'var(--surface-raised)', padding: '2px 8px', borderRadius: '4px', margin: '0 6px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 700 }}>
                EV = (Probabilidade_do_Modelo × Odd_do_Mercado) - 1.0
              </code>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
