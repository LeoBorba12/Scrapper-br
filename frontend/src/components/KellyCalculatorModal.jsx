import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  Percent,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Info,
  X,
  Sliders,
  Scale
} from 'lucide-react';

/**
 * KellyCalculatorModal - Calculadora Interativa de Critério de Kelly & Gestão de Banca
 * Segue a Identidade Editorial 2026 (Areia, Carvão, Oliva, Terracota) e WCAG 2.2 AA.
 */
export default function KellyCalculatorModal({
  isOpen,
  onClose,
  initialOdd = 2.00,
  initialProb = 55.0,
  initialMarket = 'Aposta de Valor (+EV)',
  initialMatch = ''
}) {
  const [banca, setBanca] = useState(1000);
  const [odd, setOdd] = useState(initialOdd || 2.00);
  const [probabilidade, setProbabilidade] = useState(initialProb || 55.0);
  const [perfilKelly, setPerfilKelly] = useState('moderado'); // 'conservador', 'moderado', 'agressivo'

  // Atualiza valores quando o modal abre com nova aposta selecionada
  useEffect(() => {
    if (initialOdd) setOdd(Number(initialOdd));
    if (initialProb) setProbabilidade(Number(initialProb));
  }, [initialOdd, initialProb, isOpen]);

  // Tecla ESC para fechar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloqueio de scroll de fundo
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ==========================================================================
  // CÁLCULOS MATEMÁTICOS DE KELLY & EV
  // ==========================================================================
  const calculos = useMemo(() => {
    const b = Math.max(0.01, odd - 1.0); // Payout líquido
    const p = Math.max(0.01, Math.min(0.99, probabilidade / 100.0));
    const q = 1.0 - p;

    // Fórmula de Kelly padrão: f* = (b*p - q) / b
    const rawKelly = (b * p - q) / b;
    const temValor = rawKelly > 0;

    // Frações de Kelly
    let fracao = 0.50; // Moderado (Half Kelly)
    let maxTetoPct = 5.0; // teto seguro
    if (perfilKelly === 'conservador') {
      fracao = 0.25;
      maxTetoPct = 3.0;
    } else if (perfilKelly === 'agressivo') {
      fracao = 1.0;
      maxTetoPct = 10.0;
    }

    const kellyAjustado = temValor ? rawKelly * fracao : 0;
    const stakePct = Math.min(maxTetoPct, Math.max(0, kellyAjustado * 100));
    const stakeValor = (banca * stakePct) / 100.0;

    // Lucro Líquido
    const lucroPotencial = stakeValor * b;
    const retornoBruto = stakeValor * odd;

    // Valor Esperado em R$ ($EV)
    // EV = Stake * (p * odd - 1)
    const evPercentual = ((p * odd) - 1.0) * 100.0;
    const evValor = (stakeValor * evPercentual) / 100.0;

    return {
      temValor,
      rawKellyPct: (rawKelly * 100).toFixed(2),
      stakePct: stakePct.toFixed(2),
      stakeValor: Math.round(stakeValor * 100) / 100,
      lucroPotencial: Math.round(lucroPotencial * 100) / 100,
      retornoBruto: Math.round(retornoBruto * 100) / 100,
      evPercentual: evPercentual.toFixed(1),
      evValor: Math.round(evValor * 100) / 100
    };
  }, [banca, odd, probabilidade, perfilKelly]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kelly-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(27, 26, 23, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--surface-page)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-panel, 12px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          animation: 'fadeInModal 180ms ease'
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-raised)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Scale size={18} />
            </div>
            <div>
              <h2
                id="kelly-title"
                className="font-editorial"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em'
                }}
              >
                Calculadora de Kelly & Stake
              </h2>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Dimensionamento ótimo de banca via critério matemático
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar calculadora"
            className="touch-tactile"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTEÚDO SCROLLÁVEL */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* APOSAT CONTEXT */}
          {initialMatch && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--surface-panel)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>Confronto / Mercado:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{initialMatch} &bull; {initialMarket}</strong>
            </div>
          )}

          {/* 1. SELETOR DE BANCA TOTAL */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Sua Banca Total (R$)
              </label>
              <span className="font-mono" style={{ fontSize: '0.84rem', color: 'var(--accent)', fontWeight: 700 }}>
                R$ {Number(banca).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ position: 'relative', marginBottom: '8px' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                R$
              </span>
              <input
                type="number"
                min="10"
                step="50"
                value={banca}
                onChange={(e) => setBanca(Math.max(1, Number(e.target.value)))}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  backgroundColor: 'var(--surface-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-control)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              />
            </div>

            {/* BOTÕES RÁPIDOS DE BANCA */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[200, 500, 1000, 2500, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBanca(val)}
                  className="touch-tactile"
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.72rem',
                    borderRadius: 'var(--radius-control)',
                    border: banca === val ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
                    backgroundColor: banca === val ? 'var(--accent-soft)' : 'var(--surface-panel)',
                    color: banca === val ? 'var(--accent)' : 'var(--text-secondary)',
                    fontWeight: banca === val ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  R$ {val}
                </button>
              ))}
            </div>
          </div>

          {/* 2. ENTRADAS DE ODD E PROBABILIDADE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Odd da Casa (Decimal)
              </label>
              <input
                type="number"
                min="1.01"
                step="0.05"
                value={odd}
                onChange={(e) => setOdd(Math.max(1.01, Number(e.target.value)))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: 'var(--surface-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-control)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Probabilidade Modelo (%)
              </label>
              <input
                type="number"
                min="1"
                max="99"
                step="1"
                value={probabilidade}
                onChange={(e) => setProbabilidade(Math.max(1, Math.min(99, Number(e.target.value))))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: 'var(--surface-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-control)',
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              />
            </div>
          </div>

          {/* 3. SELETOR DE PERFIL DE RISCO (FRAÇÃO DE KELLY) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Perfil de Gestão de Risco (Fração de Kelly)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: 'conservador', label: 'Conservador', fracao: '1/4 Kelly', desc: 'Máx 3% da banca' },
                { id: 'moderado', label: 'Moderado', fracao: '1/2 Kelly', desc: 'Máx 5% (Padrão)' },
                { id: 'agressivo', label: 'Agressivo', fracao: 'Full Kelly', desc: 'Máx 10%' }
              ].map((p) => {
                const ativo = perfilKelly === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPerfilKelly(p.id)}
                    className="touch-tactile"
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-control)',
                      border: ativo ? '1.5px solid var(--accent)' : '1px solid var(--border-subtle)',
                      backgroundColor: ativo ? 'var(--surface-panel)' : 'var(--surface-page)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 120ms ease'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: ativo ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {p.label}
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.70rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {p.fracao}
                    </div>
                    <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. RESULTADO & RECOMENDAÇÃO MATEMÁTICA */}
          {calculos.temValor ? (
            <div
              style={{
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--positive)',
                borderRadius: 'var(--radius-control)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: 'var(--positive)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  <ShieldCheck size={14} /> Valor Esperado Positivo (+EV {calculos.evPercentual}%)
                </span>
                <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Kelly Bruto: {calculos.rawKellyPct}%
                </span>
              </div>

              {/* GRID PRINCIPAL DE RESULTADOS */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div
                  style={{
                    backgroundColor: 'var(--surface-page)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ fontSize: '0.70rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Entrada Recomendada
                  </span>
                  <div className="font-mono tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
                    R$ {calculos.stakeValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {calculos.stakePct}% da banca total
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--surface-page)',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ fontSize: '0.70rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Lucro Potencial (Green)
                  </span>
                  <div className="font-mono tabular-nums" style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--positive)', marginTop: '4px' }}>
                    +R$ {calculos.lucroPotencial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Retorno Bruto: R$ {calculos.retornoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* $EV GANHO MATEMÁTICO ESPERADO POR ENTRADA */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  backgroundColor: 'var(--surface-page)',
                  borderRadius: '6px',
                  fontSize: '0.78rem'
                }}
              >
                <span style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={14} color="var(--positive)" /> Valor Matemático Esperado (+EV):
                </span>
                <strong className="font-mono" style={{ color: 'var(--positive)' }}>
                  +R$ {calculos.evValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por aposta
                </strong>
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: 'var(--surface-panel)',
                border: '1px solid var(--negative, #C62828)',
                borderRadius: 'var(--radius-control)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <ShieldAlert size={24} style={{ color: 'var(--negative, #C62828)', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                  Sem Valor Esperado Positivo (-EV)
                </strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  A probabilidade de {probabilidade}% com a odd de {odd.toFixed(2)} resulta em expectativa negativa para o apostador.
                  O Critério de Kelly recomenda <strong>Stake de R$ 0,00 (Não Apostar)</strong>.
                </p>
              </div>
            </div>
          )}

          {/* DICA DE GESTÃO DE RISCO */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'var(--surface-panel)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
              display: 'flex',
              gap: '8px'
            }}
          >
            <Info size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
            <span>
              O Critério de Kelly maximiza matematicamente o crescimento geométrico da banca no longo prazo.
              Recomendamos usar sempre <strong>1/4 Kelly</strong> ou <strong>1/2 Kelly</strong> para amortecer sequências negativas de variância.
            </span>
          </div>
        </div>

        {/* FOOTER */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-raised)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          <button
            onClick={onClose}
            className="btn-secondary touch-tactile"
            style={{
              padding: '8px 18px',
              fontSize: '0.84rem',
              borderRadius: 'var(--radius-control)',
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
