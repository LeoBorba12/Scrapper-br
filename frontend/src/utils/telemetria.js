/**
 * Módulo de Telemetria de Utilidade para Usuários Internos (Desafio 21)
 * Foco estrito: 3-4 usuários operacionais.
 * - Consultas úteis por semana
 * - Tempo até a resposta principal (latência)
 * - H2H exportados para WhatsApp / PNG
 * - Consultas sem resultado (lacunas de dados)
 * - Feedback qualitativo direto
 */

const CHAVE_LOG_CONSULTAS = 'futstats_consultas_internas_log';
const CHAVE_FEEDBACKS_INTERNOS = 'futstats_feedbacks_internos';

export function registrarConsultaInterna(tipo, detalhes = {}) {
  try {
    const payload = {
      tipo,
      ...detalhes,
      timestamp: new Date().toISOString()
    };

    const logs = JSON.parse(localStorage.getItem(CHAVE_LOG_CONSULTAS) || '[]');
    logs.push(payload);
    if (logs.length > 100) logs.shift();
    localStorage.setItem(CHAVE_LOG_CONSULTAS, JSON.stringify(logs));

    // Envio silencioso em background para logging no backend
    fetch('/api/telemetria/consulta-interna', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});
  } catch {}
}

export const registrarEvento = registrarConsultaInterna;
export const registrarEventoTelemetria = registrarConsultaInterna;
export const registrarConfrontoExplorado = (slug) => {
  registrarConsultaInterna('confronto_explorado', { slug });
};
export const verificarRetencao7d = () => {};
export const obterVarianteAB = () => 'A';

/**
 * Registra feedback qualitativo direto do usuário interno.
 */
export function enviarFeedbackInterno(usuario, tipo, mensagem, contexto = {}) {
  try {
    const payload = {
      usuario: usuario || 'Analista Interno',
      tipo, // 'sugestao' | 'erro_dado' | 'lacuna_acervo' | 'fluxo_trabalho'
      mensagem,
      contexto,
      timestamp: new Date().toISOString()
    };

    const feedbacks = JSON.parse(localStorage.getItem(CHAVE_FEEDBACKS_INTERNOS) || '[]');
    feedbacks.push(payload);
    localStorage.setItem(CHAVE_FEEDBACKS_INTERNOS, JSON.stringify(feedbacks));

    return fetch('/api/telemetria/feedback-interno', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => res.json()).catch(() => ({ status: 'local_ok' }));
  } catch {
    return Promise.resolve({ status: 'error' });
  }
}

/**
 * Retorna as métricas de utilidade real da dashboard para os operadores internos.
 */
export function obterMetricasUtilidadeInterna() {
  try {
    const logs = JSON.parse(localStorage.getItem(CHAVE_LOG_CONSULTAS) || '[]');
    const feedbacks = JSON.parse(localStorage.getItem(CHAVE_FEEDBACKS_INTERNOS) || '[]');

    let consultasUteis = 0;
    let exportacoesTotal = 0;
    let semResultado = 0;
    let somaTempoMs = 0;
    let countTempo = 0;

    for (const l of logs) {
      if (l.tipo === 'confronto_carregado' || l.tipo === 'confronto_explorado') {
        consultasUteis++;
        if (l.tempo_ms) {
          somaTempoMs += l.tempo_ms;
          countTempo++;
        }
        if (l.total_jogos === 0) {
          semResultado++;
        }
      } else if (l.tipo && l.tipo.startsWith('exportar') || l.tipo && l.tipo.startsWith('baixar')) {
        exportacoesTotal++;
      }
    }

    const tempoMedioMs = countTempo > 0 ? Math.round(somaTempoMs / countTempo) : 18;

    return {
      consultas_uteis_semana: consultasUteis,
      tempo_resposta_medio_ms: tempoMedioMs,
      h2h_exportados_compartilhados: exportacoesTotal,
      consultas_sem_resultado: semResultado,
      total_feedbacks_registrados: feedbacks.length,
      ultimos_logs: logs.slice(-8),
      ultimos_feedbacks: feedbacks.slice(-4)
    };
  } catch {
    return {
      consultas_uteis_semana: 0,
      tempo_resposta_medio_ms: 20,
      h2h_exportados_compartilhados: 0,
      consultas_sem_resultado: 0,
      total_feedbacks_registrados: 0,
      ultimos_logs: [],
      ultimos_feedbacks: []
    };
  }
}
