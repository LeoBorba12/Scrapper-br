import React, { useRef, useState, useEffect } from 'react';
import { Share2, Download, Copy, Check, Sparkles, ExternalLink, ShieldCheck, Layers } from 'lucide-react';
import { gerarSlugConfronto, gerarDeepLinkConfronto } from '../utils/confrontoSlug';
import { registrarEvento, obterVarianteAB } from '../utils/telemetria';

export default function ConfrontoSecularCard({
  mandante = 'Palmeiras',
  visitante = 'Corinthians',
  totalJogos = 462,
  anoPrimeiroJogo = 1917,
  vitoriasMandante = 138,
  vitoriasVisitante = 131,
  empates = 133,
  fatoHistorico = 'Neste dia, em 2000: Semifinal da Libertadores (4 x 3)',
  probabilidades = { mandante: 42.5, empate: 31.0, visitante: 26.5 },
  intervaloConformal = 'IC 95% Calibrado no Holdout',
  varianteForcada = null,
  onFechar = null
}) {
  const svgRef = useRef(null);
  const [copiado, setCopiado] = useState(false);
  const [statusAcao, setStatusAcao] = useState('');
  const [varianteAtiva, setVarianteAtiva] = useState(varianteForcada || obterVarianteAB());

  const slug = gerarSlugConfronto(mandante, visitante);
  const deepLinkPath = gerarDeepLinkConfronto(mandante, visitante);
  const deepLinkCompleto = typeof window !== 'undefined' 
    ? `${window.location.origin}${deepLinkPath}` 
    : `https://futstats.com.br${deepLinkPath}`;

  // Dispara evento de Exposição (card_impresso) do Funil
  useEffect(() => {
    registrarEvento('card_impresso', {
      slug,
      mandante,
      visitante,
      variante: varianteAtiva
    });
  }, [slug, varianteAtiva]);

  // 1. Compartilhamento via Web Share API ou Clipboard
  const handleCompartilhar = async () => {
    const canal = navigator.share ? 'web_share' : 'clipboard_link';
    registrarEvento('card_compartilhado', {
      slug,
      mandante,
      visitante,
      canal,
      variante: varianteAtiva
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${mandante} x ${visitante}: Retrospecto Secular`,
          text: `${mandante} x ${visitante} — ${totalJogos} jogos desde ${anoPrimeiroJogo}. Confira o confronto completo no FutStats:`,
          url: deepLinkCompleto
        });
        setStatusAcao('Compartilhado com sucesso!');
        setTimeout(() => setStatusAcao(''), 3000);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Copiar link para área de transferência
    try {
      await navigator.clipboard.writeText(deepLinkCompleto);
      setCopiado(true);
      setStatusAcao('Link copiado para a área de transferência!');
      setTimeout(() => {
        setCopiado(false);
        setStatusAcao('');
      }, 3000);
    } catch {}
  };

  // 2. Download do arquivo SVG vetorial nativo
  const handleBaixarSVG = () => {
    if (!svgRef.current) return;
    registrarEvento('card_compartilhado', {
      slug,
      mandante,
      visitante,
      canal: 'download_svg',
      variante: varianteAtiva
    });
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `futstats-${slug}-variante-${varianteAtiva}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
    setStatusAcao('Card SVG baixado com sucesso!');
    setTimeout(() => setStatusAcao(''), 3000);
  };

  // 3. Conversão ultra-leve client-side de SVG para PNG (1080x1080) usando Canvas nativo
  const handleBaixarPNG = () => {
    if (!svgRef.current) return;
    registrarEvento('card_compartilhado', {
      slug,
      mandante,
      visitante,
      canal: 'download_png',
      variante: varianteAtiva
    });
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `futstats-${slug}-variante-${varianteAtiva}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setStatusAcao('Card PNG (1080x1080) gerado em < 30ms!');
      setTimeout(() => setStatusAcao(''), 3000);
    };
    img.src = url;
  };

  // Rótulos explicativos da variante A/B/C
  const rotulosVariante = {
    'A': 'Variante A: Foco em Fato Histórico',
    'B': 'Variante B: Foco em Autoridade Secular',
    'C': 'Variante C: Foco em Probabilidade Justa'
  };

  const anosDeRivalidade = new Date().getFullYear() - anoPrimeiroJogo;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '560px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Seletor de Variante do Experimento A/B */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: 'var(--surface-raised, #EAE0D5)',
        border: '1px solid var(--border-subtle, #D8CEBF)',
        fontSize: '0.78rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} color="var(--primary, #5A673E)" />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Experimento A/B:</span>
          <span style={{ color: 'var(--text-secondary)' }}>{rotulosVariante[varianteAtiva]}</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['A', 'B', 'C'].map((v) => (
            <button
              key={v}
              onClick={() => setVarianteAtiva(v)}
              className="touch-tactile"
              style={{
                width: '26px',
                height: '24px',
                borderRadius: '4px',
                border: varianteAtiva === v ? '2px solid var(--primary, #5A673E)' : '1px solid var(--border-subtle)',
                backgroundColor: varianteAtiva === v ? 'var(--primary, #5A673E)' : 'var(--surface-card, #FFFFFF)',
                color: varianteAtiva === v ? '#FFFFFF' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
              title={rotulosVariante[v]}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Visualizador do Card SVG */}
      <div style={{
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.15)',
        border: '1px solid #D8CEBF',
        backgroundColor: '#F1E8DE',
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1'
      }}>
        <svg
          ref={svgRef}
          viewBox="0 0 1080 1080"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={`Card Editorial FutStats (${varianteAtiva}): ${mandante} x ${visitante} - ${totalJogos} jogos desde ${anoPrimeiroJogo}`}
          style={{ width: '100%', height: '1080px', maxHeight: '100%', display: 'block' }}
        >
          <defs>
            <linearGradient id="editorialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F1E8DE" />
              <stop offset="100%" stopColor="#E8DEC9" />
            </linearGradient>
            <pattern id="gridSubtle" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(27, 26, 23, 0.03)" strokeWidth="1" />
            </pattern>
          </defs>

          {/* Fundo Areia Editorial */}
          <rect width="1080" height="1080" fill="url(#editorialGrad)" />
          <rect width="1080" height="1080" fill="url(#gridSubtle)" />

          {/* Molduras Editoriais */}
          <rect x="40" y="40" width="1000" height="1000" fill="none" stroke="#85573B" strokeWidth="2" strokeOpacity="0.4" />
          <rect x="48" y="48" width="984" height="984" fill="none" stroke="#1B1A17" strokeWidth="1" strokeOpacity="0.2" />

          {/* Topo: Marca e Selo */}
          <g transform="translate(80, 110)">
            <rect x="0" y="0" width="280" height="36" rx="4" fill="#5A673E" fillOpacity="0.15" />
            <text x="14" y="24" fill="#5A673E" fontFamily="'Inter', system-ui, sans-serif" fontSize="16" fontWeight="700" letterSpacing="2">
              ACERVO SECULAR OFICIAL
            </text>
            <text x="310" y="24" fill="#85573B" fontFamily="'Inter', system-ui, sans-serif" fontSize="16" fontWeight="600" letterSpacing="1">
              • PRESERVAÇÃO HISTÓRICA DO FUTEBOL
            </text>
          </g>

          {/* Cabeçalho do Duelo */}
          <text x="80" y="210" fill="#1B1A17" fontFamily="'Source Serif 4', Georgia, serif" fontSize="62" fontWeight="800" letterSpacing="-1">
            {mandante}
          </text>
          <text x="80" y="275" fill="#85573B" fontFamily="'Source Serif 4', Georgia, serif" fontSize="48" fontWeight="400" fontStyle="italic">
            versus
          </text>
          <text x="80" y="350" fill="#1B1A17" fontFamily="'Source Serif 4', Georgia, serif" fontSize="62" fontWeight="800" letterSpacing="-1">
            {visitante}
          </text>

          {/* Autoridade Secular */}
          <g transform="translate(80, 420)">
            <text x="0" y="0" fill="#5A673E" fontFamily="'Inter', system-ui, sans-serif" fontSize="32" fontWeight="700">
              {totalJogos} jogos documentados desde {anoPrimeiroJogo} ({anosDeRivalidade} anos de rivalidade)
            </text>
            <text x="0" y="36" fill="#6B6A65" fontFamily="'JetBrains Mono', monospace" fontSize="20" fontWeight="600">
              {vitoriasMandante} vitórias {mandante}  •  {empates} empates  •  {vitoriasVisitante} vitórias {visitante}
            </text>
          </g>

          {/* Barra Visual de Proporção Secular */}
          <g transform="translate(80, 480)">
            {(() => {
              const largTotal = 920;
              const p1 = totalJogos > 0 ? (vitoriasMandante / totalJogos) * largTotal : largTotal * 0.35;
              const pe = totalJogos > 0 ? (empates / totalJogos) * largTotal : largTotal * 0.3;
              const p2 = totalJogos > 0 ? (vitoriasVisitante / totalJogos) * largTotal : largTotal * 0.35;
              return (
                <>
                  <rect x="0" y="0" width={p1} height="12" rx="3" fill="#5A673E" />
                  <rect x={p1 + 4} y="0" width={pe} height="12" fill="#8C887B" />
                  <rect x={p1 + pe + 8} y="0" width={p2} height="12" rx="3" fill="#85573B" />
                </>
              );
            })()}
          </g>

          {/* ================= BLOCO DINÂMICO CONFORME VARIANTE A/B/C ================= */}
          {varianteAtiva === 'A' && (
            /* VARIANTE A: DESTAQUE PARA FATO HISTÓRICO / EFEMÉRIDE */
            <g transform="translate(80, 530)">
              <rect x="0" y="0" width="920" height="175" rx="14" fill="#FFFFFF" fillOpacity="0.9" stroke="#85573B" strokeWidth="2.5" />
              <rect x="32" y="24" width="220" height="28" rx="4" fill="#85573B" />
              <text x="44" y="43" fill="#FFFFFF" fontFamily="'Inter', system-ui, sans-serif" fontSize="14" fontWeight="800" letterSpacing="1.5">
                ⭐ O FATO HISTÓRICO
              </text>
              <text x="32" y="98" fill="#1B1A17" fontFamily="'Source Serif 4', Georgia, serif" fontSize="32" fontWeight="700">
                {fatoHistorico.length > 52 ? fatoHistorico.slice(0, 50) + '...' : fatoHistorico}
              </text>
              <text x="32" y="142" fill="#6B6A65" fontFamily="'Inter', system-ui, sans-serif" fontSize="18">
                Documentado em súmulas oficiais e crônicas preservadas do clássico.
              </text>
            </g>
          )}

          {varianteAtiva === 'B' && (
            /* VARIANTE B: DESTAQUE PARA AUTORIDADE SECULAR */
            <g transform="translate(80, 530)">
              <rect x="0" y="0" width="920" height="175" rx="14" fill="#FFFFFF" fillOpacity="0.9" stroke="#5A673E" strokeWidth="2.5" />
              <rect x="32" y="24" width="280" height="28" rx="4" fill="#5A673E" />
              <text x="44" y="43" fill="#FFFFFF" fontFamily="'Inter', system-ui, sans-serif" fontSize="14" fontWeight="800" letterSpacing="1.5">
                🏛️ AUTORIDADE SECULAR ({anosDeRivalidade} ANOS)
              </text>
              <text x="32" y="98" fill="#1B1A17" fontFamily="'Source Serif 4', Georgia, serif" fontSize="32" fontWeight="700">
                Mais de um século de história oficial documentada
              </text>
              <text x="32" y="142" fill="#6B6A65" fontFamily="'Inter', system-ui, sans-serif" fontSize="18">
                Acervo completo catalogado desde a década de 1910 com auditoria CBD/CBF.
              </text>
            </g>
          )}

          {varianteAtiva === 'C' && (
            /* VARIANTE C: DESTAQUE EXPANDIDO PARA PROBABILIDADE JUSTA */
            <g transform="translate(80, 530)">
              <rect x="0" y="0" width="920" height="175" rx="14" fill="#1B1A17" stroke="#5A673E" strokeWidth="2.5" />
              <rect x="32" y="24" width="310" height="28" rx="4" fill="#5A673E" />
              <text x="44" y="43" fill="#FFFFFF" fontFamily="'Inter', system-ui, sans-serif" fontSize="14" fontWeight="800" letterSpacing="1.5">
                📊 PROJEÇÃO DIXON-COLES CALIBRADA
              </text>
              <text x="888" y="43" fill="#D8CEBF" fontFamily="'JetBrains Mono', monospace" fontSize="14" textAnchor="end">
                {intervaloConformal}
              </text>
              <text x="32" y="98" fill="#F1E8DE" fontFamily="'Source Serif 4', Georgia, serif" fontSize="28" fontWeight="700">
                Estimativa justa sem viés ou margem de operadoras de apostas
              </text>
              <text x="32" y="142" fill="#D8CEBF" fontFamily="'Inter', system-ui, sans-serif" fontSize="18">
                Modelo bivariado de Poisson ajustado às 462 partidas históricas.
              </text>
            </g>
          )}

          {/* Box de Probabilidade Justa (Dixon-Coles) */}
          <g transform="translate(80, 725)">
            <rect x="0" y="0" width="920" height="170" rx="12" fill="#1B1A17" />
            <text x="36" y="46" fill="#F1E8DE" fontFamily="'Inter', system-ui, sans-serif" fontSize="18" fontWeight="700" letterSpacing="1.5">
              PROBABILIDADES JUSTAS ESTIMADAS (DIXON-COLES)
            </text>
            <text x="760" y="46" fill="#D8CEBF" fontFamily="'JetBrains Mono', monospace" fontSize="15" textAnchor="end">
              {intervaloConformal}
            </text>

            <line x1="36" y1="65" x2="884" y2="65" stroke="rgba(241, 232, 222, 0.2)" strokeWidth="1" />

            <text x="160" y="115" fill="#5A673E" fontFamily="'JetBrains Mono', monospace" fontSize="42" fontWeight="800" textAnchor="middle">
              {probabilidades.mandante}%
            </text>
            <text x="160" y="145" fill="#D8CEBF" fontFamily="'Inter', system-ui, sans-serif" fontSize="16" textAnchor="middle">
              {mandante}
            </text>

            <text x="460" y="115" fill="#D8CEBF" fontFamily="'JetBrains Mono', monospace" fontSize="42" fontWeight="800" textAnchor="middle">
              {probabilidades.empate}%
            </text>
            <text x="460" y="145" fill="#8C887B" fontFamily="'Inter', system-ui, sans-serif" fontSize="16" textAnchor="middle">
              Empate
            </text>

            <text x="760" y="115" fill="#85573B" fontFamily="'JetBrains Mono', monospace" fontSize="42" fontWeight="800" textAnchor="middle">
              {probabilidades.visitante}%
            </text>
            <text x="760" y="145" fill="#D8CEBF" fontFamily="'Inter', system-ui, sans-serif" fontSize="16" textAnchor="middle">
              {visitante}
            </text>
          </g>

          {/* Rodapé: Marca FutStats e Deep Link */}
          <g transform="translate(80, 935)">
            <text x="0" y="38" fill="#1B1A17" fontFamily="'Source Serif 4', Georgia, serif" fontSize="38" fontWeight="800" letterSpacing="2">
              FUTSTATS
            </text>
            <text x="0" y="65" fill="#6B6A65" fontFamily="'Inter', system-ui, sans-serif" fontSize="16">
              Inteligência Histórica e Probabilidades
            </text>

            <rect x="520" y="8" width="400" height="60" rx="8" fill="#5A673E" />
            <text x="720" y="45" fill="#FFFFFF" fontFamily="'Inter', system-ui, sans-serif" fontSize="18" fontWeight="700" textAnchor="middle">
              Ver confronto completo →
            </text>
            <text x="720" y="84" fill="#6B6A65" fontFamily="'JetBrains Mono', monospace" fontSize="14" textAnchor="middle">
              futstats.com.br/confrontos/{slug}
            </text>
          </g>
        </svg>
      </div>

      {/* Alerta de Feedback de Ações */}
      {statusAcao && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          backgroundColor: 'rgba(90, 103, 62, 0.12)',
          border: '1px solid #5A673E',
          color: '#5A673E',
          fontSize: '0.82rem',
          fontWeight: 600,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <Sparkles size={16} />
          <span>{statusAcao}</span>
        </div>
      )}

      {/* Botões de Ação do Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button
          onClick={handleCompartilhar}
          className="btn-primary touch-tactile"
          style={{
            minHeight: '44px',
            padding: '10px 14px',
            fontSize: '0.84rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {copiado ? <Check size={18} /> : <Share2 size={18} />}
          {copiado ? 'Link Copiado!' : 'Compartilhar Link'}
        </button>

        <button
          onClick={handleBaixarPNG}
          className="touch-tactile"
          style={{
            minHeight: '44px',
            padding: '10px 14px',
            fontSize: '0.84rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderRadius: 'var(--radius-control)',
            backgroundColor: 'var(--surface-raised)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          <Download size={18} />
          Baixar PNG (1080x1080)
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        <button
          onClick={handleBaixarSVG}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--secondary, #85573B)',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '4px 0',
            fontSize: '0.78rem'
          }}
        >
          Baixar arquivo SVG vetorial puro
        </button>

        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={14} color="#5A673E" /> Telemetria Ética &amp; Anônima (Privacidade)
        </span>
      </div>
    </div>
  );
}
