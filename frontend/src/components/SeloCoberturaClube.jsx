import React from 'react';
import { ShieldCheck, AlertTriangle, FileText, Ban } from 'lucide-react';

export default function SeloCoberturaClube({ coberturaPct = 100 }) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 600
  };

  if (coberturaPct >= 100) {
    return (
      <div style={{ ...baseStyle, backgroundColor: 'rgba(90, 103, 62, 0.14)', color: '#3A4526', border: '1px solid rgba(90, 103, 62, 0.35)' }}>
        <ShieldCheck size={14} color="#5A673E" />
        <span>Dossiê Completo (100% Cobertura)</span>
      </div>
    );
  }

  if (coberturaPct >= 80) {
    return (
      <div style={{ ...baseStyle, backgroundColor: 'rgba(194, 125, 56, 0.14)', color: '#85573B', border: '1px solid rgba(194, 125, 56, 0.35)' }}>
        <AlertTriangle size={14} color="#C27D38" />
        <span>Dossiê com Aviso ({coberturaPct.toFixed(0)}% Cobertura)</span>
      </div>
    );
  }

  if (coberturaPct >= 50) {
    return (
      <div style={{ ...baseStyle, backgroundColor: 'var(--surface-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
        <FileText size={14} color="var(--text-secondary)" />
        <span>Retrospecto Básico ({coberturaPct.toFixed(0)}% Cobertura)</span>
      </div>
    );
  }

  return (
    <div style={{ ...baseStyle, backgroundColor: 'rgba(133, 87, 59, 0.14)', color: '#6B2F1A', border: '1px solid rgba(133, 87, 59, 0.35)' }}>
      <Ban size={14} color="#85573B" />
      <span>Página Restrita (&lt; 50% Cobertura)</span>
    </div>
  );
}
