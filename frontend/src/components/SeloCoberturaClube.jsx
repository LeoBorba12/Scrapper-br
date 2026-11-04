import React from 'react';
import { ShieldCheck, AlertTriangle, FileText, Ban } from 'lucide-react';

export default function SeloCoberturaClube({ coberturaPct = 100, className = "" }) {
  if (coberturaPct >= 100) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#5A673E]/15 text-[#3A4526] border border-[#5A673E]/30 ${className}`}>
        <ShieldCheck className="w-3.5 h-3.5 text-[#5A673E]" />
        <span>Dossiê Completo (100% Cobertura)</span>
      </div>
    );
  }

  if (coberturaPct >= 80) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C27D38]/15 text-[#85573B] border border-[#C27D38]/30 ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-[#C27D38]" />
        <span>Dossiê com Aviso ({coberturaPct.toFixed(0)}% Cobertura)</span>
      </div>
    );
  }

  if (coberturaPct >= 50) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F1E8DE] text-[#7A6B58] border border-[#D9CEBF] ${className}`}>
        <FileText className="w-3.5 h-3.5 text-[#7A6B58]" />
        <span>Retrospecto Básico ({coberturaPct.toFixed(0)}% Cobertura)</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#85573B]/15 text-[#6B2F1A] border border-[#85573B]/30 ${className}`}>
      <Ban className="w-3.5 h-3.5 text-[#85573B]" />
      <span>Página Restrita (&lt; 50% Cobertura)</span>
    </div>
  );
}
