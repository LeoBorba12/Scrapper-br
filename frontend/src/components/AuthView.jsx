import React, { useState } from 'react';
import { 
  Trophy, KeyRound, User, Lock, UserPlus, 
  LogIn, AlertCircle, RefreshCw, Sun, Moon, ShieldCheck 
} from 'lucide-react';

/**
 * AuthView - Tela de Autenticação com Identidade Editorial FutStats 2026
 * 
 * Substitui o template antigo Sooma, unificando a experiência estética:
 * - Paletas oficiais Areia (Light) e Carvão Quente (Dark)
 * - Tipografia jornalística Source Serif 4 + Inter
 * - 100% em Português do Brasil
 * - Seletor de Tema disponível desde a tela inicial
 */
export default function AuthView({
  authMode,
  setAuthMode,
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  regCodigoConvite,
  setRegCodigoConvite,
  regNome,
  setRegNome,
  regUsername,
  setRegUsername,
  regPassword,
  setRegPassword,
  authLoading,
  authError,
  setAuthError,
  handleLogin,
  handleRegistro,
  darkMode,
  onToggleTheme
}) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        backgroundColor: 'var(--surface-page)',
        color: 'var(--text-primary)',
        transition: 'background-color var(--transition-fast)'
      }}
    >
      {/* Barra Superior Discreta com Seletor de Tema */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="font-editorial"
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)'
            }}
          >
            FUTSTATS
          </span>
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--accent)',
              backgroundColor: 'var(--accent-soft)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}
          >
            Edição 2026
          </span>
        </div>

        <button
          onClick={onToggleTheme}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-control)',
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          aria-label={darkMode ? 'Mudar para Tema Areia' : 'Mudar para Tema Carvão'}
          title={darkMode ? 'Mudar para Tema Areia' : 'Mudar para Tema Carvão'}
        >
          {darkMode ? <Sun size={13} color="var(--accent)" /> : <Moon size={13} color="var(--accent)" />}
          <span>{darkMode ? 'Carvão' : 'Areia'}</span>
        </button>
      </div>

      {/* Card Editorial de Autenticação */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--surface-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-panel)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-editorial)',
          boxSizing: 'border-box'
        }}
      >
        {/* Cabeçalho do Card */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: 'var(--shadow-editorial)'
            }}
          >
            <Trophy size={20} />
          </div>

          <h1
            className="font-editorial"
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: '0 0 6px 0'
            }}
          >
            {authMode === 'login' ? 'Entrar na Plataforma' : 'Criar Conta de Acesso'}
          </h1>
          <p
            style={{
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
              margin: 0
            }}
          >
            {authMode === 'login'
              ? 'Acesse a inteligência histórica e estatística do futebol brasileiro.'
              : 'Informe seu código de convite para ingressar na equipe editorial.'}
          </p>
        </div>

        {/* Abas Alternadoras (Entrar / Novo Cadastro) */}
        <div
          role="tablist"
          aria-label="Opções de acesso"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px',
            backgroundColor: 'var(--surface-raised)',
            padding: '4px',
            borderRadius: 'var(--radius-control)',
            marginBottom: '24px'
          }}
        >
          <button
            role="tab"
            aria-selected={authMode === 'login'}
            onClick={() => {
              setAuthMode('login');
              setAuthError(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 12px',
              borderRadius: 'calc(var(--radius-control) - 2px)',
              border: 'none',
              backgroundColor: authMode === 'login' ? 'var(--surface-panel)' : 'transparent',
              color: authMode === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: authMode === 'login' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: authMode === 'login' ? 'var(--shadow-editorial)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            <LogIn size={14} />
            <span>Entrar</span>
          </button>

          <button
            role="tab"
            aria-selected={authMode === 'registro'}
            onClick={() => {
              setAuthMode('registro');
              setAuthError(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px 12px',
              borderRadius: 'calc(var(--radius-control) - 2px)',
              border: 'none',
              backgroundColor: authMode === 'registro' ? 'var(--surface-panel)' : 'transparent',
              color: authMode === 'registro' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: authMode === 'registro' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: authMode === 'registro' ? 'var(--shadow-editorial)' : 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            <UserPlus size={14} />
            <span>Com Convite</span>
          </button>
        </div>

        {/* Banner de Erro Acessível */}
        {authError && (
          <div
            role="alert"
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--negative-bg)',
              border: '1px solid var(--negative)',
              borderRadius: 'var(--radius-control)',
              color: 'var(--negative)',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              lineHeight: 1.4
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{authError}</span>
          </div>
        )}

        {/* ================= FORMULÁRIO DE LOGIN ================= */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                htmlFor="auth-login-username"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px'
                }}
              >
                Usuário ou Identificador
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={15}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '13px' }}
                  aria-hidden="true"
                />
                <input
                  id="auth-login-username"
                  type="text"
                  autoComplete="username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Seu usuário cadastrado"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    minHeight: '42px',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--surface-raised)',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    fontFamily: 'var(--font-mono)',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-login-password"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px'
                }}
              >
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={15}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '13px' }}
                  aria-hidden="true"
                />
                <input
                  id="auth-login-password"
                  type="password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    minHeight: '42px',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--surface-raised)',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    fontFamily: 'var(--font-mono)',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: '100%',
                minHeight: '46px',
                marginTop: '8px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: authLoading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-editorial)',
                transition: 'opacity var(--transition-fast)'
              }}
            >
              {authLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Validando Credenciais...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Entrar no FutStats</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ================= FORMULÁRIO DE CADASTRO COM CONVITE ================= */}
        {authMode === 'registro' && (
          <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label
                htmlFor="auth-reg-convite"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '5px'
                }}
              >
                Código de Convite da Equipe
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound
                  size={15}
                  color="var(--accent)"
                  style={{ position: 'absolute', left: '12px', top: '13px' }}
                  aria-hidden="true"
                />
                <input
                  id="auth-reg-convite"
                  type="text"
                  value={regCodigoConvite}
                  onChange={(e) => setRegCodigoConvite(e.target.value)}
                  placeholder="EX: FUTSTATS-2026"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    minHeight: '42px',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--surface-raised)',
                    color: 'var(--text-primary)',
                    fontSize: '0.86rem',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-reg-nome"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '5px'
                }}
              >
                Nome Completo / Apelido Editorial
              </label>
              <input
                id="auth-reg-nome"
                type="text"
                value={regNome}
                onChange={(e) => setRegNome(e.target.value)}
                placeholder="Ex: Leonardo Borba"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  minHeight: '42px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface-raised)',
                  color: 'var(--text-primary)',
                  fontSize: '0.86rem',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label
                htmlFor="auth-reg-username"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '5px'
                }}
              >
                Nome de Usuário (Login)
              </label>
              <input
                id="auth-reg-username"
                type="text"
                autoComplete="username"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="Ex: leoborba"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  minHeight: '42px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface-raised)',
                  color: 'var(--text-primary)',
                  fontSize: '0.86rem',
                  fontFamily: 'var(--font-mono)',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label
                htmlFor="auth-reg-password"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '5px'
                }}
              >
                Defina sua Senha
              </label>
              <input
                id="auth-reg-password"
                type="password"
                autoComplete="new-password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  minHeight: '42px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface-raised)',
                  color: 'var(--text-primary)',
                  fontSize: '0.86rem',
                  fontFamily: 'var(--font-mono)',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: '100%',
                minHeight: '46px',
                marginTop: '8px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: authLoading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-editorial)',
                transition: 'opacity var(--transition-fast)'
              }}
            >
              {authLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Cadastrando Usuário...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Cadastrar e Iniciar Sessão</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Rodapé do Card */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '0.76rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <ShieldCheck size={14} color="var(--accent)" />
          <span>Acesso restrito à equipe editorial &bull; FutStats 2026</span>
        </div>
      </div>

      {/* Assinatura Histórica */}
      <div
        style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '0.76rem',
          color: 'var(--text-secondary)'
        }}
      >
        <span className="font-editorial" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>FutStats</span> &bull; 90.819 partidas catalogadas &bull; Cobertura 1902–2026
      </div>
    </div>
  );
}
