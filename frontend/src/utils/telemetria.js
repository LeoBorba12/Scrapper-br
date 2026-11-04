/**
 * Telemetria Leve e Ética para Distribuição de Cards e Deep Links (FutStats)
 * Não usa bibliotecas de terceiros nem cookies de rastreamento.
 */

export function registrarEventoTelemetria(nomeEvento, propriedades = {}) {
  try {
    const payload = {
      evento: nomeEvento,
      propriedades,
      timestamp: new Date().toISOString()
    };

    // 1. Armazenamento local leve para métricas de sessão
    const chaveStorage = 'futstats_telemetria_eventos';
    const historico = JSON.parse(localStorage.getItem(chaveStorage) || '[]');
    historico.push(payload);
    // Limita aos últimos 50 eventos para economia estrita de storage
    if (historico.length > 50) historico.shift();
    localStorage.setItem(chaveStorage, JSON.stringify(historico));

    // 2. Disparo silencioso em background via sendBeacon ou fetch keepalive
    const url = '/api/telemetria/evento';
    const bodyStr = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      const blob = new Blob([bodyStr], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
        keepalive: true
      }).catch(() => {});
    }
  } catch {
    // Falha silenciosa para nunca interromper a experiência do usuário
  }
}

export function obterMetricasTelemetriaLocal() {
  try {
    const eventos = JSON.parse(localStorage.getItem('futstats_telemetria_eventos') || '[]');
    const contadores = {};
    for (const ev of eventos) {
      contadores[ev.evento] = (contadores[ev.evento] || 0) + 1;
    }
    return {
      total_eventos: eventos.length,
      contadores,
      ultimos_eventos: eventos.slice(-5)
    };
  } catch {
    return { total_eventos: 0, contadores: {}, ultimos_eventos: [] };
  }
}
