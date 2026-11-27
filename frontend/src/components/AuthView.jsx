import React from 'react';
import {
  Sun, Moon, Lock, User, UserPlus, Key, AlertCircle, CheckCircle2, Clock, ShieldCheck, RefreshCw
} from 'lucide-react';

function formatarContagem(seg) {
  if (!seg || seg <= 0) return 'Expirado';
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

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
  authSuccess,
  setAuthSuccess,
  inviteStatus,
  handleLogin,
  handleRegistro,
  darkMode,
  onToggleTheme,
}) {
  const switchMode = (mode) => {
    setAuthMode(mode);
    setAuthError(null);
    if (setAuthSuccess) setAuthSuccess(null);
  };

  return (
    <div
      className={darkMode ? 'theme-carvao dark' : 'theme-areia'}
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'var(--surface-page)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-ui)',
        padding: '24px',
      }}
    >
      {/* Topo editorial */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1040px', width: '100%', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span className="font-editorial" style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            FUTSTATS
          </span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)' }}>
            Edição 2026
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleTheme}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: 'var(--radius-control)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-panel)',
            color: 'var(--text-primary)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {darkMode ? <Sun size={14} color="var(--accent)" /> : <Moon size={14} color="var(--accent)" />}
          <span>{darkMode ? 'Quant Dark' : 'Areia'}</span>
        </button>
      </div>

      {/* Cartão central */}
      <div style={{ width: '100%', maxWidth: '430px', margin: '32px auto' }}>
        <div
          className="soft-card"
          style={{
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            border: '1px solid var(--border-strong)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <ShieldCheck size={15} color="var(--accent)" />
              <span className="font-mono" style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)' }}>
                Acesso Seguro
              </span>
            </div>
            <h1 className="font-editorial" style={{ fontSize: '1.55rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {authMode === 'login' ? 'Entrar na Plataforma' : 'Criar Conta FutStats'}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {authMode === 'login'
                ? 'Inteligência histórica, scouting e modelos preditivos do futebol brasileiro.'
                : 'Cadastre-se via link exclusivo de 24h ou envie sua solicitação ao administrador.'}
            </p>
          </div>

          {/* Seletor Entrar / Cadastrar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', padding: '4px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => switchMode('login')}
              style={{
                padding: '9px 10px',
                borderRadius: 'var(--radius-control)',
                border: 'none',
                backgroundColor: authMode === 'login' ? 'var(--surface-panel)' : 'transparent',
                color: authMode === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: authMode === 'login' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Lock size={14} /> Entrar
            </button>
            <button
              type="button"
              onClick={() => switchMode('registro')}
              style={{
                padding: '9px 10px',
                borderRadius: 'var(--radius-control)',
                border: 'none',
                backgroundColor: authMode === 'registro' ? 'var(--surface-panel)' : 'transparent',
                color: authMode === 'registro' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: authMode === 'registro' ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <UserPlus size={14} /> Cadastrar-se
            </button>
          </div>

          {authError && (
            <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-control)', backgroundColor: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.35)', color: '#22c55e', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>{authSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => switchMode('login')}
                style={{ alignSelf: 'flex-start', padding: '5px 10px', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.4)', backgroundColor: 'transparent', color: '#22c55e', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Ir para Entrar
              </button>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Usuário
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="soft-input"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Seu usuário"
                    required
                    autoComplete="username"
                    disabled={authLoading}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Senha
                </label>
                <input
                  type="password"
                  className="soft-input font-mono"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={authLoading}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={authLoading}
                style={{ height: '44px', marginTop: '4px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {authLoading ? <RefreshCw size={16} className="animate-spin" /> : <User size={16} />}
                <span>{authLoading ? 'Autenticando...' : 'Entrar no FutStats'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
              {/* Banner inteligente sobre link temporário 24h */}
              {regCodigoConvite && inviteStatus && !inviteStatus.checking && (
                inviteStatus.valido ? (
                  <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.35)', color: '#22c55e', fontSize: '0.78rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Clock size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      <strong>Link exclusivo ativo!</strong> Expira em {formatarContagem(inviteStatus.restante_segundos)}. Seu cadastro será liberado imediatamente.
                    </span>
                  </div>
                ) : (
                  <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#f59e0b', fontSize: '0.78rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Clock size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      <strong>Link temporário expirado ou encerrado.</strong> Ao enviar seus dados, sua conta ficará pendente para autorização do administrador.
                    </span>
                  </div>
                )
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Nome completo
                </label>
                <input
                  type="text"
                  className="soft-input"
                  value={regNome}
                  onChange={(e) => setRegNome(e.target.value)}
                  placeholder="Ex: João Silva"
                  required
                  disabled={authLoading}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Nome de usuário
                </label>
                <input
                  type="text"
                  className="soft-input font-mono"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Ex: joao.silva"
                  required
                  autoComplete="username"
                  disabled={authLoading}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Senha (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  className="soft-input font-mono"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  autoComplete="new-password"
                  disabled={authLoading}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Token do Convite (opcional)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="soft-input font-mono"
                    value={regCodigoConvite}
                    onChange={(e) => setRegCodigoConvite(e.target.value)}
                    placeholder="Deixe vazio para solicitar autorização manual"
                    disabled={authLoading}
                  />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Com link ativo de 24h o acesso é imediato; sem link, o administrador aprova seu acesso.
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={authLoading}
                style={{ height: '44px', marginTop: '4px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {authLoading ? <RefreshCw size={16} className="animate-spin" /> : <Key size={16} />}
                <span>
                  {authLoading
                    ? 'Enviando...'
                    : regCodigoConvite && inviteStatus?.valido
                    ? 'Criar Conta e Entrar'
                    : 'Solicitar Cadastro'}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Rodapé discreto */}
      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        FutStats Editorial • Acesso restrito a usuários autorizados
      </div>
    </div>
  );
}
