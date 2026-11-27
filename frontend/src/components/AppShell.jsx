import React, { useState, useEffect } from 'react';
import { 
  Trophy, CloudRain, Swords, BarChart3, Bot, Search,
  Calendar, Award, Key, LogOut, UserPlus, Check, Sun, Moon,
  ShieldCheck, ArrowRight, TrendingUp, Users, Sparkles, Camera, X
} from 'lucide-react';

export default function AppShell({
  activeTab,
  onNavigateTab,
  darkMode,
  onToggleTheme,
  currentUser,
  onOpenTrocarSenha,
  onLogout,
  onCopiarConvite,
  conviteCopiado,
  children
}) {
  const [printMode, setPrintMode] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');

  const navGroups = [
    {
      titulo: 'Núcleo Analítico',
      items: [
        { id: 'overview', label: 'Início', icon: Trophy, badge: 'Cockpit' },
        { id: 'probabilidades', label: 'Probabilidades', icon: TrendingUp, badge: '+EV' },
        { id: 'metricas-avancadas', label: 'Métricas Avançadas', icon: Sparkles, badge: 'BED' },
        { id: 'campeonato', label: 'Campeonato', icon: Award, badge: 'Scouts' }
      ]
    },
    {
      titulo: 'Acervo Canônico',
      items: [
        { id: 'times', label: 'Clubes', icon: BarChart3 },
        { id: 'jogadores', label: 'Atletas', icon: Award },
        { id: 'h2h', label: 'Confrontos', icon: Swords },
        { id: 'tecnicos', label: 'Técnicos', icon: Users },
        { id: 'playground', label: 'Partidas', icon: Calendar },
        { id: 'arbitros', label: 'Arbitragem', icon: ShieldCheck }
      ]
    },
    {
      titulo: 'Publicação & IA',
      items: [
        { id: 'tweets', label: 'Publicar', icon: ArrowRight },
        { id: 'oraculo', label: 'Oráculo IA', icon: Bot },
        { id: 'clima', label: 'Clima', icon: CloudRain },
        { id: 'aovivo', label: 'Ao Vivo', icon: Trophy }
      ]
    }
  ];

  const navItems = navGroups.flatMap((g) => g.items);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
        setCmdQuery('');
      } else if (e.key === 'Escape') {
        setCmdOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filteredCmdItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(cmdQuery.trim().toLowerCase()) ||
    item.id.toLowerCase().includes(cmdQuery.trim().toLowerCase())
  );

  return (
    <div 
      className={darkMode ? 'theme-carvao dark' : 'theme-areia'}
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--surface-page)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-ui)',
        transition: 'background-color 150ms ease, color 150ms ease'
      }}
    >
      {/* ================= HEADER EDITORIAL UNIFICADO ================= */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--surface-panel)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(8px)'
        }}
      >
        <div
          className="app-header-container"
          style={{
            maxWidth: 'var(--content-max)',
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          {/* Marca Editorial com Semântica Acessível de Botão (A11Y-001) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => onNavigateTab('overview')}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                background: 'none',
                border: 'none',
                padding: '6px 8px',
                margin: '-6px -8px',
                borderRadius: 'var(--radius-control)',
                textAlign: 'left'
              }}
              aria-label="FutStats Home - Voltar ao Panorama Geral"
            >
              <span 
                className="font-editorial" 
                style={{ 
                  fontSize: '1.45rem', 
                  fontWeight: 700, 
                  letterSpacing: '-0.02em',
                  color: 'var(--text-primary)'
                }}
              >
                FUTSTATS
              </span>
              <span 
                style={{ 
                  fontSize: '0.68rem', 
                  fontWeight: 600, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.08em',
                  color: 'var(--accent)'
                }}
              >
                Edição 2026
              </span>
            </button>
            
            <div className="app-header-divider" style={{ height: '18px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

            <div className="app-header-subtitle" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Inteligência Histórica do Futebol Brasileiro
            </div>
          </div>

          {/* Controles de Conta e Tema (Alvos de Toque Confortáveis - UX-001) */}
          <div className="app-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Atalho Ctrl+K */}
            <button
              onClick={() => { setCmdOpen(true); setCmdQuery(''); }}
              className="app-header-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                minHeight: '38px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Ir rápido para qualquer aba (Ctrl+K)"
            >
              <Search size={14} color="var(--accent)" />
              <span className="app-header-btn-text font-mono">Ctrl+K</span>
            </button>

            {/* Modo Print X/Twitter */}
            <button
              onClick={() => setPrintMode((v) => !v)}
              className="app-header-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                minHeight: '38px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: printMode ? 'var(--accent)' : 'var(--surface-raised)',
                border: `1px solid ${printMode ? 'var(--accent)' : 'var(--border-subtle)'}`,
                color: printMode ? 'var(--accent-foreground)' : 'var(--text-primary)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              title="Enquadrar tela limpa para captura no X/Twitter"
            >
              <Camera size={14} />
              <span className="app-header-btn-text">{printMode ? 'Sair Print' : 'Modo Print'}</span>
            </button>

            {/* Seletor de Tema Areia / Carvão */}
            <button
              onClick={onToggleTheme}
              className="app-header-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                minHeight: '38px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              aria-label={darkMode ? 'Mudar para Tema Areia' : 'Mudar para Tema Quant Dark'}
              title={darkMode ? 'Mudar para Tema Areia' : 'Mudar para Tema Quant Dark'}
            >
              {darkMode ? <Sun size={15} color="var(--accent)" /> : <Moon size={15} color="var(--accent)" />}
              <span className="app-header-btn-text">{darkMode ? 'Quant Dark' : 'Areia'}</span>
            </button>

            {/* Botão de Convite (Apenas Admin) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={onCopiarConvite}
                className="app-header-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  minHeight: '38px',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                aria-label="Copiar link ou código de convite para equipe"
                title="Copiar código ou link de convite"
              >
                {conviteCopiado ? <Check size={15} color="var(--positive)" /> : <UserPlus size={15} />}
                <span className="app-header-btn-text">{conviteCopiado ? 'Copiado!' : 'Convidar'}</span>
              </button>
            )}

            {/* Menu de Usuário */}
            <div
              className="app-header-user-badge"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px 5px 6px',
                minHeight: '38px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)'
              }}
              title={`Usuário: ${currentUser?.username || 'LB'} (${currentUser?.role || 'moderador'})`}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                {(currentUser?.username || 'LB').slice(0, 2).toUpperCase()}
              </div>

              <span className="app-header-user-text" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentUser?.username || 'LB'}
              </span>

              <span 
                className="app-header-user-text"
                style={{ 
                  fontSize: '0.66rem', 
                  fontWeight: 600, 
                  color: 'var(--accent)', 
                  backgroundColor: 'var(--accent-soft)', 
                  padding: '2px 6px', 
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}
              >
                {currentUser?.role || 'moderador'}
              </span>
            </div>

            {/* Botão Trocar Senha */}
            <button
              onClick={onOpenTrocarSenha}
              className="app-header-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                minHeight: '38px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              aria-label="Abrir modal para trocar senha"
              title="Trocar minha senha"
            >
              <Key size={15} />
              <span className="app-header-btn-text">Senha</span>
            </button>

            {/* Botão Sair */}
            <button
              onClick={onLogout}
              className="app-header-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                minHeight: '38px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--negative)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              aria-label="Encerrar sessão"
              title="Encerrar sessão"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* ================= NAVEGAÇÃO MOBILE / MODO CLARO ================= */}
        {!printMode && (
          <nav
            className={`nav-scroll-touch ${darkMode ? 'quant-mobile-nav' : ''}`}
            style={{
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--surface-panel)',
              overflowX: 'auto'
            }}
            aria-label="Navegação Principal do FutStats"
          >
            <div
              className="app-nav-container"
              style={{
                maxWidth: 'var(--content-max)',
                margin: '0 auto',
                padding: '0 24px',
                display: 'flex',
                gap: '4px'
              }}
            >
              {navItems.map((item) => {
                const active = activeTab === item.id || 
                  (item.id === 'probabilidades' && activeTab === 'apostas') ||
                  (item.id === 'times' && activeTab === 'clube');
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigateTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '12px 14px',
                      minHeight: '44px',
                      border: 'none',
                      borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                      backgroundColor: 'transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'color 150ms ease, border-color 150ms ease'
                    }}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span>{item.label}</span>
                    {item.badge && (
                      <span 
                        style={{ 
                          fontSize: '0.64rem', 
                          padding: '2px 6px', 
                          borderRadius: '3px',
                          backgroundColor: active ? 'var(--accent-soft)' : 'var(--surface-raised)',
                          color: active ? 'var(--accent)' : 'var(--text-muted)',
                          fontWeight: 700
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      {/* ================= TICKER QUANT (TEMA 2: TERMINAL QUANT DARK) ================= */}
      {darkMode && !printMode && (
        <div
          className="font-mono"
          style={{
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-sidebar)',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          <div
            style={{
              maxWidth: 'var(--content-max)',
              margin: '0 auto',
              padding: '7px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>● TERMINAL QUANT LIVE</span>
            <span>BASE: <strong style={{ color: 'var(--text-primary)' }}>115.257</strong> JOGOS</span>
            <span>GOLS: <strong style={{ color: 'var(--text-primary)' }}>117.529</strong></span>
            <span>INTEGRIDADE: <strong style={{ color: 'var(--accent)' }}>12/12 OK</strong></span>
            <span>MODELO: <strong style={{ color: 'var(--text-primary)' }}>DIXON-COLES &amp; FAIR ODDS</strong></span>
          </div>
        </div>
      )}

      {/* ================= CONTEÚDO DA PÁGINA (COM SIDEBAR QUANT NO DESKTOP) ================= */}
      <div
        className={darkMode && !printMode ? 'quant-layout-shell' : ''}
        style={{
          maxWidth: 'var(--content-max)',
          margin: '0 auto',
          padding: printMode ? '24px' : '20px 24px 64px 24px'
        }}
      >
        {darkMode && !printMode && (
          <aside className="quant-sidebar-desktop" aria-label="Menu Lateral Terminal Quant">
            {navGroups.map((group) => (
              <div key={group.titulo} style={{ marginBottom: '14px' }}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)',
                    padding: '4px 10px 6px 10px'
                  }}
                >
                  {group.titulo}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = activeTab === item.id ||
                      (item.id === 'probabilidades' && activeTab === 'apostas') ||
                      (item.id === 'times' && activeTab === 'clube');
                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigateTab(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-control)',
                          border: active ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid transparent',
                          backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
                          color: active ? 'var(--accent)' : 'var(--text-secondary)',
                          fontSize: '0.82rem',
                          fontWeight: active ? 700 : 500,
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <Icon size={15} />
                          <span>{item.label}</span>
                        </span>
                        {item.badge && (
                          <span
                            className="font-mono"
                            style={{
                              fontSize: '0.62rem',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              backgroundColor: active ? 'rgba(34, 197, 94, 0.2)' : 'var(--surface-raised)',
                              color: active ? 'var(--accent)' : 'var(--text-muted)',
                              fontWeight: 700
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </aside>
        )}

        <main
          className="app-main-content"
          style={{
            minWidth: 0,
            width: '100%',
            ...(printMode ? {
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-panel)',
              padding: '24px',
              backgroundColor: 'var(--surface-panel)'
            } : {})
          }}
        >
          {children}
          {printMode && (
            <div
              className="font-mono"
              style={{
                marginTop: '20px',
                paddingTop: '12px',
                borderTop: '1px dashed var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                flexWrap: 'wrap',
                gap: '8px'
              }}
            >
              <span>Fonte: FutStats • Acervo Canônico Brasileiro (115.257 partidas auditadas)</span>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>scrapper-br.vercel.app • #FutStats</span>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL BUSCA RÁPIDA (CTRL+K) ================= */}
      {cmdOpen && (
        <div
          onClick={() => setCmdOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '12vh'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--surface-panel)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-panel)',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <Search size={16} color="var(--accent)" />
              <input
                autoFocus
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredCmdItems.length > 0) {
                    onNavigateTab(filteredCmdItems[0].id);
                    setCmdOpen(false);
                  }
                }}
                placeholder="Ir para aba (ex: Probabilidades, Clubes, Atletas, H2H)..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem'
                }}
              />
              <button onClick={() => setCmdOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '6px' }}>
              {filteredCmdItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigateTab(item.id);
                      setCmdOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-control)',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <Icon size={15} color="var(--accent)" />
                      <span>{item.label}</span>
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>↵ abrir</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= FOOTER EDITORIAL ================= */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--surface-panel)',
          padding: '24px',
          marginTop: '40px',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)'
        }}
      >
        <div
          style={{
            maxWidth: 'var(--content-max)',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <strong className="font-editorial" style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>FutStats</strong> • Arquitetura Editorial & Protagonista 2026
          </div>
          <div className="tabular-nums">
            Base histórica oficial • Cobertura 1902–2026
          </div>
        </div>
      </footer>
    </div>
  );
}
