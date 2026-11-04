/**
 * Telemetria Ética, Funil de Descoberta e Experimento A/B (FutStats - Desafio 19)
 * - Nenhum dado pessoal coletado.
 * - Nenhum fingerprinting do dispositivo.
 * - Armazenamento de métricas agregadas anônimas.
 */

const CHAVE_STORAGE_EVENTOS = 'futstats_telemetria_eventos';
const CHAVE_PRIMEIRA_VISITA = 'futstats_primeira_visita_ts';
const CHAVE_ULTIMO_ACESSO = 'futstats_ultimo_acesso_ts';
const CHAVE_CONFRONTOS_7D = 'futstats_confrontos_explorados_7d';
const CHAVE_VARIANTE_AB = 'futstats_experimento_ab_variante';

/**
 * Retorna ou define a variante do teste A/B para este visitante.
 * Variante A: Foco em Fato Histórico
 * Variante B: Foco em Autoridade Secular
 * Variante C: Foco em Probabilidade Justa
 */
export function obterVarianteAB() {
  try {
    let variante = localStorage.getItem(CHAVE_VARIANTE_AB);
    if (!variante || !['A', 'B', 'C'].includes(variante)) {
      const opcoes = ['A', 'B', 'C'];
      variante = opcoes[Math.floor(Math.random() * opcoes.length)];
      localStorage.setItem(CHAVE_VARIANTE_AB, variante);
    }
    return variante;
  } catch {
    return 'A';
  }
}

/**
 * Registra eventos no funil de telemetria do FutStats.
 * Eventos principais:
 * - card_impresso
 * - card_compartilhado
 * - deep_link_clicado
 * - h2h_interagiu
 * - retorno_7d
 * - proximo_jogo_visto / clube_seguido
 */
export function registrarEvento(nome, propriedades = {}) {
  try {
    const agora = new Date();
    const variante = obterVarianteAB();
    const payload = {
      evento: nome,
      variante,
      ...propriedades,
      ocorrido_em: agora.toISOString()
    };

    // 1. Armazenamento local leve para telemetria offline e contadores
    const historico = JSON.parse(localStorage.getItem(CHAVE_STORAGE_EVENTOS) || '[]');
    historico.push(payload);
    if (historico.length > 60) historico.shift();
    localStorage.setItem(CHAVE_STORAGE_EVENTOS, JSON.stringify(historico));

    // 2. Disparo para os endpoints de ingestão (/api/telemetria e /api/telemetria/evento)
    const bodyStr = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([bodyStr], { type: 'application/json' });
      navigator.sendBeacon('/api/telemetria', blob);
    } else {
      fetch('/api/telemetria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
        keepalive: true
      }).catch(() => {});
    }
  } catch {}
}

// Alias de retrocompatibilidade
export const registrarEventoTelemetria = registrarEvento;

/**
 * Registra a exploração de um confronto secular para a North Star Metric:
 * "Confrontos seculares explorados por visitante único por semana".
 */
export function registrarConfrontoExplorado(slug) {
  if (!slug) return 1;
  try {
    const agora = Date.now();
    const seteDiasAtras = agora - 7 * 24 * 60 * 60 * 1000;
    let lista = JSON.parse(localStorage.getItem(CHAVE_CONFRONTOS_7D) || '[]');
    
    // Limpa entradas mais antigas que 7 dias
    lista = lista.filter(item => item.ts >= seteDiasAtras);
    
    // Adiciona o confronto se ainda não estiver na lista dos 7 dias
    if (!lista.some(item => item.slug === slug)) {
      lista.push({ slug, ts: agora });
      localStorage.setItem(CHAVE_CONFRONTOS_7D, JSON.stringify(lista));
    }
    return lista.length;
  } catch {
    return 1;
  }
}

/**
 * Verifica a retenção de 7 dias do usuário de forma ética e anônima.
 */
export function verificarRetencao7d() {
  try {
    const agora = Date.now();
    const primeiraVisitaStr = localStorage.getItem(CHAVE_PRIMEIRA_VISITA);
    
    if (!primeiraVisitaStr) {
      localStorage.setItem(CHAVE_PRIMEIRA_VISITA, agora.toString());
      localStorage.setItem(CHAVE_ULTIMO_ACESSO, agora.toString());
      return;
    }

    const primeiraVisita = parseInt(primeiraVisitaStr, 10);
    const ultimoAcesso = parseInt(localStorage.getItem(CHAVE_ULTIMO_ACESSO) || '0', 10);
    const diasDesdePrimeira = (agora - primeiraVisita) / (1000 * 60 * 60 * 24);
    const horasDesdeUltimo = (agora - ultimoAcesso) / (1000 * 60 * 60);

    localStorage.setItem(CHAVE_ULTIMO_ACESSO, agora.toString());

    // Se passou de 7 dias e o último acesso foi há mais de 12 horas (nova sessão)
    if (diasDesdePrimeira >= 7 && horasDesdeUltimo >= 12) {
      registrarEvento('retorno_7d', {
        dias_desde_inicio: Math.floor(diasDesdePrimeira)
      });
    }
  } catch {}
}

/**
 * Retorna as métricas consolidadas do funil local para exibição no Dashboard.
 */
export function obterMetricasFunilLocal() {
  try {
    const eventos = JSON.parse(localStorage.getItem(CHAVE_STORAGE_EVENTOS) || '[]');
    const confrontos7d = JSON.parse(localStorage.getItem(CHAVE_CONFRONTOS_7D) || '[]');
    const variante = obterVarianteAB();

    const contadores = {
      card_impresso: 0,
      card_compartilhado: 0,
      deep_link_clicado: 0,
      h2h_interagiu: 0,
      retorno_7d: 0,
      proximo_jogo_visto: 0,
      clube_seguido: 0
    };

    const abVariantes = { A: 0, B: 0, C: 0 };

    for (const ev of eventos) {
      if (contadores[ev.evento] !== undefined) {
        contadores[ev.evento]++;
      }
      if (ev.variante && abVariantes[ev.variante] !== undefined) {
        abVariantes[ev.variante]++;
      }
    }

    return {
      north_star_metric: {
        nome: "Confrontos seculares explorados por visitante (7 dias)",
        valor: Math.max(confrontos7d.length, 1),
        unidade: "confrontos/semana"
      },
      variante_atual: variante,
      contadores_funil: contadores,
      distribuicao_ab: abVariantes,
      total_eventos_sessao: eventos.length,
      ultimos_eventos: eventos.slice(-8)
    };
  } catch {
    return {
      north_star_metric: { nome: "Confrontos explorados", valor: 1, unidade: "confrontos/semana" },
      variante_atual: 'A',
      contadores_funil: {},
      distribuicao_ab: { A: 0, B: 0, C: 0 },
      total_eventos_sessao: 0,
      ultimos_eventos: []
    };
  }
}
