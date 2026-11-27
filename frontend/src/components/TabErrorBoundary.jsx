import React from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';

export default class TabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Erro inesperado ao renderizar este módulo.'
    };
  }

  componentDidCatch(error, info) {
    if (typeof console !== 'undefined') {
      console.error('[FutStats TabErrorBoundary]', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="soft-card"
          style={{
            padding: '28px 24px',
            margin: '16px auto',
            maxWidth: '640px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            border: '1px solid var(--negative)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--negative)' }}>
            <ShieldAlert size={22} />
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              Falha isolada neste módulo
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            Esta aba encontrou um erro ao exibir os dados, mas o restante da dashboard continua funcionando normalmente.
          </p>
          <div
            className="font-mono"
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              overflowWrap: 'anywhere'
            }}
          >
            {this.state.errorMessage}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
            <button
              onClick={() => this.setState({ hasError: false, errorMessage: '' })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-control)',
                border: 'none',
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
              <span>Recarregar Aba</span>
            </button>
            {this.props.onResetHome && (
              <button
                onClick={() => {
                  this.setState({ hasError: false, errorMessage: '' });
                  this.props.onResetHome();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--surface-raised)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <Home size={14} />
                <span>Voltar ao Início</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
