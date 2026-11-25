import React, { useState, useEffect } from 'react';
import { Target, Clock, Info, UserCheck } from 'lucide-react';

const boxStyle = {
  padding: '12px',
  borderRadius: 'var(--radius-control)',
  backgroundColor: 'var(--surface-raised)',
  border: '1px solid var(--border-subtle)'
};

export default function ProducaoOfensivaGoldenCard({ atletaId }) {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!atletaId) return;
    setLoading(true);
    fetch(`/api/atletas/metricas-golden?atleta_id=${atletaId}&amostra_minima=0`)
      .then(res => res.json())
      .then(data => {
        if (data.dados && data.dados.length > 0) {
          setMetricas(data.dados[0]);
        } else {
          setMetricas(null);
        }
      })
      .catch(() => setMetricas(null))
      .finally(() => setLoading(false));
  }, [atletaId]);

  if (loading) {
    return (
      <div style={{ ...boxStyle, padding: '16px', fontSize: '0.84rem', color: '#5A673E' }}>
        Carregando métricas avançadas por 90 minutos...
      </div>
    );
  }

  if (!metricas) {
    return (
      <div style={{ ...boxStyle, borderStyle: 'dashed', fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Info size={16} color="#85573B" />
        <span>Métricas decompostas por 90 minutos indisponíveis para este atleta no ciclo atual.</span>
      </div>
    );
  }

  const getBadgeStyle = (classe) => {
    if (classe === 'Robusto') {
      return { backgroundColor: 'rgba(90, 103, 62, 0.18)', color: '#3A4526', borderColor: 'rgba(90, 103, 62, 0.4)', fontWeight: 700 };
    }
    if (classe === 'Sinal razoável') {
      return { backgroundColor: 'rgba(90, 103, 62, 0.1)', color: '#5A673E', borderColor: 'rgba(90, 103, 62, 0.25)' };
    }
    if (classe === 'Sinal fraco') {
      return { backgroundColor: 'rgba(194, 125, 56, 0.18)', color: '#85573B', borderColor: 'rgba(194, 125, 56, 0.4)' };
    }
    return { backgroundColor: 'rgba(133, 87, 59, 0.18)', color: '#6B2F1A', borderColor: 'rgba(133, 87, 59, 0.4)' };
  };

  return (
    <div style={{ padding: '20px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-card)', boxShadow: 'var(--shadow-sm)', marginBottom: '20px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: '#85573B', display: 'block' }}>
            Fase 2 • Golden Dataset Analítico
          </span>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="#5A673E" />
            Produção Ofensiva Decomposta
          </h4>
        </div>

        <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '0.74rem', border: '1px solid', ...getBadgeStyle(metricas.classificacao_amostra) }}>
          Amostra: {metricas.classificacao_amostra} ({metricas.minutos} min)
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '14px' }}>
        <div style={boxStyle}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Gols por 90 (Geral)</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#5A673E', fontFamily: 'var(--font-mono)' }}>{metricas.gols_por_90.toFixed(2)}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{metricas.gols} gols em {metricas.minutos}m</span>
        </div>

        <div style={boxStyle}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Gols em Bola Rolando</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{metricas.gols_abertos}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>+ {metricas.gols_penalti} de pênalti</span>
        </div>

        <div style={boxStyle}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Dependência Ofensiva</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#85573B', fontFamily: 'var(--font-mono)' }}>{(metricas.dependencia_ofensiva * 100).toFixed(1)}%</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{(metricas.dependencia_ofensiva_em_campo * 100).toFixed(1)}% em campo</span>
        </div>

        <div style={boxStyle}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Titularidade</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{metricas.titularidade_pct.toFixed(1)}%</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>Gols/90 Titular: {metricas.gols_por_90_titular.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '14px', fontSize: '0.76rem' }}>
        <div style={boxStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={14} color="#5A673E" /> Como Titular
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#5A673E', fontWeight: 800 }}>
              {metricas.gols_por_90_titular.toFixed(2)} / 90min
            </span>
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>{metricas.titularidades} partidas ({metricas.minutos_titular} minutos jogados)</div>
        </div>

        <div style={boxStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#85573B" /> Como Reserva Acionado
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#85573B', fontWeight: 800 }}>
              {metricas.gols_por_90_reserva > 0 ? `${metricas.gols_por_90_reserva.toFixed(2)} / 90min` : '0.00'}
            </span>
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>{metricas.jogos - metricas.titularidades} partidas como substituto ({metricas.minutos_reserva} minutos)</div>
        </div>
      </div>

      <div style={{ ...boxStyle, fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <Info size={16} color="#85573B" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>Contrato de Qualidade &amp; Critério Editorial:</span>
          <p style={{ margin: '4px 0 0 0', lineHeight: 1.45 }}>
            Métricas calculadas para <strong>{metricas.competicao} ({metricas.periodo})</strong>.
            Dependência ofensiva exibida sob duas óticas: <strong>Geral ({(metricas.dependencia_ofensiva * 100).toFixed(1)}%)</strong> sobre todos os gols do clube e <strong>Em Campo ({(metricas.dependencia_ofensiva_em_campo * 100).toFixed(1)}%)</strong> restrita às partidas em que o atleta participou.
          </p>
        </div>
      </div>
    </div>
  );
}
