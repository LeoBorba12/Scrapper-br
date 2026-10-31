import React, { useState, useEffect } from 'react';
import { X, RefreshCw, AlertCircle, Clock, Shield, Flag, Award, Activity } from 'lucide-react';

export default function ModalLanceALance({ jogo, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'gols' | 'cartoes' | 'importantes'

  const carregarLances = async () => {
    if (!jogo?.url_tempo_real) {
      setError('URL de tempo real não disponível para esta partida.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/brasileirao/tempo-real?url=${encodeURIComponent(jogo.url_tempo_real)}`);
      if (!res.ok) throw new Error('Não foi possível obter os lances do jogo.');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || 'Erro ao carregar lances.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLances();
    // Atualização automática a cada 25 segundos enquanto o modal estiver aberto
    const interval = setInterval(() => {
      if (jogo?.url_tempo_real && !document.hidden) {
        fetch(`/api/brasileirao/tempo-real?url=${encodeURIComponent(jogo.url_tempo_real)}`)
          .then(r => r.json())
          .then(d => { if (d?.lances) setData(d); })
          .catch(() => {});
      }
    }, 25000);
    return () => clearInterval(interval);
  }, [jogo]);

  if (!jogo) return null;

  const lancesFiltrados = (data?.lances || []).filter(l => {
    if (filtroTipo === 'gols') return l.tipo_id === 'GOAL' || l.tipo_label?.toLowerCase().includes('gol');
    if (filtroTipo === 'cartoes') return l.tipo_id === 'CARD' || l.tipo_label?.toLowerCase().includes('cartão');
    if (filtroTipo === 'importantes') return l.tipo_id === 'GOAL' || l.tipo_id === 'CARD' || l.tipo_id === 'IMPORTANT';
    return true;
  });

  const getBadgeIcon = (tipoId, tipoLabel) => {
    const t = (tipoLabel || tipoId || '').toLowerCase();
    if (t.includes('gol')) return <span title="Gol">⚽</span>;
    if (t.includes('vermelho')) return <span title="Cartão Vermelho">🟥</span>;
    if (t.includes('cartão') || t.includes('amarelo')) return <span title="Cartão Amarelo">🟨</span>;
    if (t.includes('substituição')) return <span title="Substituição">🔄</span>;
    if (t.includes('var') || t.includes('pênalti')) return <span title="VAR / Pênalti">🔍</span>;
    return <Clock size={14} color="var(--text-muted)" />;
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        className="soft-card"
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'var(--surface-card, #1B1A17)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* CABEÇALHO DO JOGO */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface, #141311)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <span className="badge badge-green" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {jogo.status_label || (jogo.comecou ? 'AO VIVO / RECENTE' : 'AGENDADO')}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                {jogo.data} {jogo.hora ? `• ${jogo.hora}` : ''} {jogo.estadio ? `• ${jogo.estadio}` : ''}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={carregarLances}
                className="btn-secondary touch-tactile"
                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                title="Atualizar lances agora"
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
              <button 
                onClick={onClose}
                className="btn-secondary touch-tactile"
                style={{ padding: '6px 10px' }}
                title="Fechar"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* PLACAR EDITORIAL */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '16px' }}>
            {/* MANDANTE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-start' }}>
              {jogo.mandante?.escudo && (
                <img src={jogo.mandante.escudo} alt={jogo.mandante.nome} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
              )}
              <div>
                <strong style={{ fontSize: '1.15rem', color: 'var(--text-main, #FFFFFF)' }}>{jogo.mandante?.nome}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mandante</div>
              </div>
            </div>

            {/* PLACAR CENTRAL */}
            <div style={{ textAlign: 'center' }}>
              <div className="font-mono" style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '2px', color: 'var(--accent, #10B981)' }}>
                {jogo.comecou ? `${jogo.mandante?.placar ?? 0} × ${jogo.visitante?.placar ?? 0}` : 'vs'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Tempo Real Oficial
              </div>
            </div>

            {/* VISITANTE */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end', textAlign: 'right' }}>
              <div>
                <strong style={{ fontSize: '1.15rem', color: 'var(--text-main, #FFFFFF)' }}>{jogo.visitante?.nome}</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visitante</div>
              </div>
              {jogo.visitante?.escudo && (
                <img src={jogo.visitante.escudo} alt={jogo.visitante.nome} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
              )}
            </div>
          </div>
        </div>

        {/* FILTROS DE LANCE */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px 20px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-hover, #201E1A)', overflowX: 'auto' }}>
          {[
            { id: 'todos', label: 'Todos os Lances' },
            { id: 'gols', label: '⚽ Gols' },
            { id: 'cartoes', label: '🟨 Cartões' },
            { id: 'importantes', label: '⚡ Lances Chave' },
          ].map(f => (
            <button
              key={f.id}
              className={filtroTipo === f.id ? 'btn-primary touch-tactile' : 'btn-secondary touch-tactile'}
              onClick={() => setFiltroTipo(f.id)}
              style={{ padding: '4px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              {f.label}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={14} color="#10B981" />
            <span>Atualização contínua</span>
          </div>
        </div>

        {/* CONTEÚDO SCROLLÁVEL: TIMELINE DE LANCES */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {loading && !data && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <RefreshCw size={28} className="animate-spin" color="#10B981" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Conectando ao tempo real do jogo...</p>
            </div>
          )}

          {error && (
            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} />
              <span style={{ fontSize: '0.88rem' }}>{error}</span>
            </div>
          )}

          {!loading && lancesFiltrados.length === 0 && !error && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <Shield size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontSize: '0.95rem' }}>Nenhum lance encontrado para o filtro selecionado.</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Os lances ao vivo são publicados conforme a bola rola no gramado.</p>
            </div>
          )}

          {/* TIMELINE DE INCIDENTES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lancesFiltrados.map((lance, idx) => (
              <div 
                key={lance.id || idx}
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: lance.tipo_id === 'GOAL' 
                    ? 'rgba(16, 185, 129, 0.08)' 
                    : (lance.tipo_id === 'CARD' ? 'rgba(245, 158, 11, 0.06)' : 'var(--surface, #191816)'),
                  borderLeft: lance.tipo_id === 'GOAL' 
                    ? '4px solid #10B981' 
                    : (lance.tipo_id === 'CARD' ? '4px solid #F59E0B' : '1px solid var(--border)'),
                  borderTop: '1px solid var(--border)',
                  borderRight: '1px solid var(--border)',
                  borderBottom: '1px solid var(--border)'
                }}
              >
                {/* ÍCONE / MINUTO */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '55px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>
                    {getBadgeIcon(lance.tipo_id, lance.tipo_label)}
                  </div>
                  <strong className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--accent, #10B981)' }}>
                    {lance.momento || '—'}
                  </strong>
                  {lance.periodo && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {lance.periodo}
                    </span>
                  )}
                </div>

                {/* TEXTO DO LANCE */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    {lance.tipo_label && (
                      <span className="badge badge-blue" style={{ fontSize: '0.72rem', padding: '1px 6px' }}>
                        {lance.tipo_label}
                      </span>
                    )}
                    {lance.titulo && (
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-main, #FFFFFF)' }}>
                        {lance.titulo}
                      </strong>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.45', color: 'var(--text-muted, #A8A29E)' }}>
                    {lance.texto}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RODAPÉ DO MODAL */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface, #141311)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Dados em tempo real fornecidos via GE Esporte & Globo</span>
          <button onClick={onClose} className="btn-secondary touch-tactile" style={{ padding: '4px 14px', fontSize: '0.8rem' }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
