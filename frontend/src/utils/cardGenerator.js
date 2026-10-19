// frontend/src/utils/cardGenerator.js

export function baixarCardSocialPNG({
  categoria = 'RAIO-X HISTÓRICO',
  titulo = 'Flamengo x Vasco',
  subtitulo = 'Acervo Oficial FutStats (1950–2024)',
  metricas = [
    { label: 'Vitórias Flamengo', valor: '75', cor: '#38BDF8' },
    { label: 'Empates', valor: '52', cor: '#94A3B8' },
    { label: 'Vitórias Vasco', valor: '52', cor: '#F472B6' },
  ],
  destaqueTexto = '',
  nomeArquivo = 'futstats-card.png'
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');

  // Helper para roundRect com fallback seguro
  const desenharRoundRect = (x, y, w, h, r) => {
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.rect(x, y, w, h);
    }
  };

  // 1. Fundo Gradiente Escuro Premium
  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
  bgGrad.addColorStop(0, '#0F172A');
  bgGrad.addColorStop(1, '#1E293B');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 630);

  // 2. Barra Superior de Destaque
  const topBarGrad = ctx.createLinearGradient(0, 0, 1200, 0);
  topBarGrad.addColorStop(0, '#38BDF8');
  topBarGrad.addColorStop(0.5, '#10B981');
  topBarGrad.addColorStop(1, '#F472B6');
  ctx.fillStyle = topBarGrad;
  ctx.fillRect(0, 0, 1200, 10);

  // 3. Badge de Categoria
  ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.beginPath();
  desenharRoundRect(60, 50, 280, 42, 21);
  ctx.fill();

  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 18px Inter, system-ui, sans-serif';
  ctx.fillText(`⚽ ${categoria.toUpperCase()}`, 82, 77);

  // 4. Título Principal e Subtítulo
  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 54px Inter, system-ui, sans-serif';
  ctx.fillText(titulo.slice(0, 38), 60, 155);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '24px Inter, system-ui, sans-serif';
  ctx.fillText(subtitulo.slice(0, 75), 60, 198);

  // 5. Caixas de Métricas (Grid Dinâmico)
  const cols = metricas.length;
  const gap = 24;
  const totalWidth = 1080;
  const boxWidth = (totalWidth - gap * (cols - 1)) / cols;
  const startY = 240;
  const boxHeight = 195;

  metricas.forEach((m, idx) => {
    const x = 60 + idx * (boxWidth + gap);

    // Card Background
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    desenharRoundRect(x, startY, boxWidth, boxHeight, 18);
    ctx.fill();
    ctx.stroke();

    // Valor numérico grande
    ctx.fillStyle = m.cor || '#38BDF8';
    ctx.font = 'bold 64px JetBrains Mono, monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(m.valor), x + boxWidth / 2, startY + 105);

    // Label da métrica
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '600 20px Inter, system-ui, sans-serif';
    ctx.fillText(m.label, x + boxWidth / 2, startY + 155);
  });

  ctx.textAlign = 'left';

  // 6. Faixa de Insight / Destaque Contextual
  if (destaqueTexto) {
    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
    ctx.beginPath();
    desenharRoundRect(60, 465, 1080, 68, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '500 21px Inter, system-ui, sans-serif';
    const textoLimpo = destaqueTexto.length > 105 ? destaqueTexto.slice(0, 102) + '...' : destaqueTexto;
    ctx.fillText(`💡 ${textoLimpo}`, 84, 507);
  }

  // 7. Rodapé / Marca d'Água Viral
  ctx.fillStyle = '#64748B';
  ctx.font = '600 20px JetBrains Mono, monospace, sans-serif';
  ctx.fillText('futstats.vercel.app • Base Histórica Oficial (55.395 Jogos & INMET)', 60, 590);

  ctx.fillStyle = '#38BDF8';
  ctx.textAlign = 'right';
  ctx.font = 'bold 22px Inter, system-ui, sans-serif';
  ctx.fillText('@FutStats', 1140, 590);

  // 8. Exportar para PNG e iniciar Download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = nomeArquivo;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
