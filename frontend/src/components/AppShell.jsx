import React from 'react';
import { 
  Trophy, CloudRain, Swords, BarChart3, Bot, Search,
  Calendar, Award, Key, LogOut, UserPlus, Check, Sun, Moon,
  ShieldCheck, ArrowRight
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
  const navItems = [
    { id: 'overview', label: 'Panorama', icon: Trophy },
    { id: 'times', label: 'Clubes', icon: BarChart3, badge: 'Editorial' },
    { id: 'jogadores', label: 'Atletas', icon: Award, badge: 'Protagonista' },
    { id: 'h2h', label: 'Confrontos', icon: Swords },
    { id: 'playground', label: 'Partidas', icon: Calendar },
    { id: 'clima', label: 'Clima', icon: CloudRain },
    { id: 'arbitros', label: 'Arbitragem', icon: ShieldCheck },
    { id: 'oraculo', label: 'Oráculo IA', icon: Bot },
    { id: 'tweets', label: 'Publicar', icon: ArrowRight },
    { id: 'aovivo', label: 'Ao Vivo', icon: Trophy }
  ];

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
          {/* Marca Editorial */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              onClick={() => onNavigateTab('overview')}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: '8px' }}
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
            </div>
            
            <div style={{ height: '18px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Inteligência Histórica do Futebol Brasileiro
            </div>
          </div>

          {/* Controles de Conta e Tema */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Seletor de Tema Areia / Carvão */}
            <button
              onClick={onToggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title={darkMode ? 'Mudar para Tema Areia' : 'Mudar para Tema Carvão'}
            >
              {darkMode ? <Sun size={13} color="var(--accent)" /> : <Moon size={13} color="var(--accent)" />}
              <span>{darkMode ? 'Carvão' : 'Areia'}</span>
            </button>

            {/* Botão de Convite (Apenas Admin) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={onCopiarConvite}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Copiar código ou link de convite"
              >
                {conviteCopiado ? <Check size={13} color="var(--positive)" /> : <UserPlus size={13} />}
                <span>{conviteCopiado ? 'Copiado!' : 'Convidar'}</span>
              </button>
            )}

            {/* Menu de Usuário */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px 4px 5px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                {(currentUser?.username || 'LB').slice(0, 2).toUpperCase()}
              </div>

              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentUser?.username || 'LB'}
              </span>

              <span 
                style={{ 
                  fontSize: '0.66rem', 
                  fontWeight: 600, 
                  color: 'var(--accent)', 
                  backgroundColor: 'var(--accent-soft)', 
                  padding: '1px 6px', 
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Trocar minha senha"
            >
              <Key size={13} />
              <span>Senha</span>
            </button>

            {/* Botão Sair */}
            <button
              onClick={onLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--negative)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Encerrar sessão"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>

        {/* ================= NAVEGAÇÃO PRINCIPAL UNIFICADA (UMA IDENTIDADE) ================= */}
        <nav
          style={{
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-panel)',
            overflowX: 'auto'
          }}
        >
          <div
            style={{
              maxWidth: 'var(--content-max)',
              margin: '0 auto',
              padding: '0 24px',
              display: 'flex',
              gap: '4px'
            }}
          >
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '10px 14px',
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
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span 
                      style={{ 
                        fontSize: '0.64rem', 
                        padding: '1px 5px', 
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
      </header>

      {/* ================= CONTEÚDO DA PÁGINA ================= */}
      <main
        style={{
          maxWidth: 'var(--content-max)',
          margin: '0 auto',
          padding: '28px 24px 64px 24px'
        }}
      >
        {children}
      </main>

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
            Base oficial com 90.819 partidas catalogadas • Cobertura 1902–2026
          </div>
        </div>
      </footer>
    </div>
  );
}
