import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Copy, Trash2, HelpCircle, HardDrive, Filter, Activity } from 'lucide-react';

export default function PainelQualidadeGolsCard() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gols/qualidade')
      .then(res => res.json())
      .then(data => setDados(data))
      .catch(() => setDados(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-5 rounded-2xl border border-[#D9CEBF] bg-[#FDFBF7] animate-pulse text-sm text-[#5A673E]">
        Carregando telemetria de governança e qualidade de gols...
      </div>
    );
  }

  if (!dados) {
    return null;
  }

  const { governanca, resumo_auditoria, regras_violadas, caso_reinaldo_mirassol } = dados;
  const status = resumo_auditoria?.status || {};

  return (
    <div className="p-6 rounded-2xl border border-[#D9CEBF] bg-[#FDFBF7] shadow-sm mb-8">
      {/* Header Editorial */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#E8DEC8]">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[#85573B] block">
            Auditoria de Integridade & Quarentena
          </span>
          <h3 className="text-xl font-serif font-bold text-[#1B1A17] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#5A673E]" />
            Painel de Qualidade e Governança de Gols (Desafio 29)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-[#F1E8DE] px-3 py-1.5 rounded-lg border border-[#D9CEBF] text-[#1B1A17]">
          <HardDrive className="w-4 h-4 text-[#5A673E]" />
          <span>Teto Vercel: <strong>{governanca.teto_vercel_mb.toFixed(2)} MB</strong> | Soft: <strong>{governanca.soft_limit_mb.toFixed(2)} MB</strong></span>
        </div>
      </div>

      {/* Grid de Métricas de Quarentena */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="p-3.5 rounded-xl border border-[#5A673E]/30 bg-[#5A673E]/10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5A673E] mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Aprovados</span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#1B1A17]">
            {status.aprovado?.toLocaleString('pt-BR') || 0}
          </div>
          <div className="text-[10px] text-[#7A6B58] mt-1">Auditados e limpos</div>
        </div>

        <div className="p-3.5 rounded-xl border border-[#C27D38]/30 bg-[#C27D38]/10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#85573B] mb-1">
            <Filter className="w-4 h-4" />
            <span>Corrigidos</span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#1B1A17]">
            {status.corrigido || 0}
          </div>
          <div className="text-[10px] text-[#7A6B58] mt-1">Minutos/acréscimos</div>
        </div>

        <div className="p-3.5 rounded-xl border border-[#D9CEBF] bg-[#F1E8DE]/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7A6B58] mb-1">
            <Copy className="w-4 h-4" />
            <span>Duplicados</span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#1B1A17]">
            {status.duplicado?.toLocaleString('pt-BR') || 0}
          </div>
          <div className="text-[10px] text-[#7A6B58] mt-1">Quarentena dedup</div>
        </div>

        <div className="p-3.5 rounded-xl border border-[#85573B]/30 bg-[#85573B]/10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#85573B] mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Suspeitos</span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#85573B]">
            {status.suspeito || 0}
          </div>
          <div className="text-[10px] text-[#7A6B58] mt-1">Feed anômalo / &gt;60%</div>
        </div>

        <div className="p-3.5 rounded-xl border border-red-300 bg-red-50/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-800 mb-1">
            <Trash2 className="w-4 h-4" />
            <span>Descartados</span>
          </div>
          <div className="text-2xl font-mono font-bold text-red-900">
            {status.descartado || 0}
          </div>
          <div className="text-[10px] text-red-700/80 mt-1">Excesso de placar</div>
        </div>
      </div>

      {/* Destaque Investigativo: Caso Reinaldo / Mirassol */}
      {caso_reinaldo_mirassol && (
        <div className="p-4 rounded-xl border border-[#85573B]/30 bg-[#F1E8DE]/50 mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#85573B] flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Caso Investigado: Reinaldo (Mirassol)
              </span>
              <h4 className="text-base font-serif font-bold text-[#1B1A17] mt-1">
                {caso_reinaldo_mirassol.confronto} — Placar Oficial {caso_reinaldo_mirassol.placar_oficial}
              </h4>
              <p className="text-xs text-[#524636] mt-1.5 leading-relaxed">
                <strong>Causa-Raiz:</strong> {caso_reinaldo_mirassol.causa_raiz}
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#5A673E]/20 text-[#3A4526] border border-[#5A673E]/30 shrink-0">
              {caso_reinaldo_mirassol.status_investigacao}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#D9CEBF]/60 text-xs">
            <div>
              <span className="text-[#7A6B58] block">Inserções Brutas:</span>
              <strong className="font-mono text-[#1B1A17]">{caso_reinaldo_mirassol.total_insercoes_brutas}</strong>
            </div>
            <div>
              <span className="text-red-700 block">Descartados:</span>
              <strong className="font-mono text-red-800">{caso_reinaldo_mirassol.descartados_quarentena} cópias</strong>
            </div>
            <div>
              <span className="text-[#85573B] block">Quarentena Suspeito:</span>
              <strong className="font-mono text-[#85573B]">{caso_reinaldo_mirassol.suspeitos_quarentena}</strong>
            </div>
            <div>
              <span className="text-[#5A673E] block">Gols Reais em 2026:</span>
              <strong className="font-mono text-[#5A673E]">{caso_reinaldo_mirassol.gols_reais_computados_2026} gols</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Regras Violadas */}
      <div className="border border-[#E8DEC8] rounded-xl overflow-hidden bg-white/70">
        <div className="px-4 py-2.5 bg-[#F1E8DE]/70 border-b border-[#E8DEC8] text-xs font-semibold text-[#1B1A17] flex justify-between">
          <span>Regras de Auditoria de Integridade de Gols</span>
          <span className="text-[#7A6B58] font-normal">Política: Apenas Aprovados e Corrigidos alimentam métricas</span>
        </div>
        <div className="divide-y divide-[#E8DEC8]/60 text-xs">
          {regras_violadas.map((r, idx) => (
            <div key={idx} className="px-4 py-2 flex items-center justify-between">
              <span className="font-mono text-[#524636]">{r.regra}</span>
              <span className="font-mono font-bold text-[#1B1A17] bg-[#F1E8DE] px-2 py-0.5 rounded border border-[#D9CEBF]">
                {r.qtd.toLocaleString('pt-BR')} ocorrências
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
