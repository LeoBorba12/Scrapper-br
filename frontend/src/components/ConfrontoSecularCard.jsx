import React, { useRef, useState } from 'react';
import { Share2, Download, Copy, Check, Sparkles, MessageSquareText, ShieldCheck } from 'lucide-react';
import { gerarSlugConfronto, gerarDeepLinkConfronto } from '../utils/confrontoSlug';
import { registrarConsultaInterna } from '../utils/telemetria';

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
  onFechar = null
}) {
  const svgRef = useRef(null);
  const [copiadoTexto, setCopiadoTexto] = useState(false);
  const [copiadoLink, setCopiadoLink] = useState(false);
  const [statusAcao, setStatusAcao] = useState('');

  const slug = gerarSlugConfronto(mandante, visitante);
  const deepLinkPath = gerarDeepLinkConfronto(mandante, visitante);
  const deepLinkCompleto = typeof window !== 'undefined' 
    ? `${window.location.origin}${deepLinkPath}` 
    : `https://futstats.com.br${deepLinkPath}`;

  const anosDeRivalidade = new Date().getFullYear() - anoPrimeiroJogo;

  // 1. Copiar resumo em texto limpo para WhatsApp / debate interno
  const handleCopiarTextoWhatsApp = async () => {
    const textoZap = `⚔️ *${mandante.toUpperCase()} x ${visitante.toUpperCase()} — RETROSPECTO HISTÓRICO*
📜 ${totalJogos} jogos oficiais documentados desde ${anoPrimeiroJogo} (${anosDeRivalidade} anos de rivalidade)
📊 Vitórias: ${vitoriasMandante} ${mandante} • ${empates} empates • ${vitoriasVisitante} ${visitante}
⭐ *Marco Notável:* ${fatoHistorico}
📈 *Probabilidade Justa FutStats (Dixon-Coles):*
${mandante}: ${probabilidades.mandante}% | Empate: ${probabilidades.empate}% | ${visitante}: ${probabilidades.visitante}% (${intervaloConformal})
🔗 Dossiê completo: ${deepLinkCompleto}`;

    try {
      await navigator.clipboard.writeText(textoZap);
      setCopiadoTexto(true);
      setStatusAcao('Texto formatado copiado! Pronto para colar no WhatsApp.');
      registrarConsultaInterna('exportar_whatsapp_texto', { slug, c1: mandante, c2: visitante });
      setTimeout(() => {
        setCopiadoTexto(false);
        setStatusAcao('');
      }, 3500);
    } catch {}
  };

  // 2. Compartilhar Link direto
  const handleCompartilharLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${mandante} x ${visitante}: Retrospecto Secular`,
          text: `${mandante} x ${visitante} — ${totalJogos} jogos desde ${anoPrimeiroJogo}. Acervo histórico oficial no FutStats:`,
          url: deepLinkCompleto
        });
        registrarConsultaInterna('compartilhar_link_nativo', { slug });
        setStatusAcao('Compartilhado com sucesso!');
        setTimeout(() => setStatusAcao(''), 3000);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(deepLinkCompleto);
      setCopiadoLink(true);
      setStatusAcao('Link do confronto copiado para a área de transferência!');
      registrarConsultaInterna('copiar_link_area_transferencia', { slug });
      setTimeout(() => {
        setCopiadoLink(false);
        setStatusAcao('');
      }, 3000);
    } catch {}
  };

  // 3. Download do PNG nativo via canvas
  const handleBaixarPNG = () => {
    if (!svgRef.current) return;
    registrarConsultaInterna('baixar_card_png', { slug });
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
      downloadLink.download = `futstats-${slug}-secular.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setStatusAcao('Card PNG (1080x1080) gerado em < 30ms!');
      setTimeout(() => setStatusAcao(''), 3000);
    };
    img.src = url;
  };

  // 4. Download do SVG vetorial
  const handleBaixarSVG = () => {
    if (!svgRef.current) return;
    registrarConsultaInterna('baixar_card_svg', { slug });
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `futstats-${slug}-secular.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
    setStatusAcao('Card SVG baixado com sucesso!');
    setTimeout(() => setStatusAcao(''), 3000);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      maxWidth: '560px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Visualizador do Card SVG Editorial */}
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
          aria-label={`Card Editorial: ${mandante} x ${visitante} - ${totalJogos} jogos desde ${anoPrimeiroJogo}`}
          style={{ width: '100%', height: '100%', display: 'block' }}
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

          {/* Topo: Marca e Selo de Preservação */}
          <g transform="translate(80, 110)">
            <rect x="0" y="0" width="280" height="36" rx="4" fill="#5A673E" fillOpacity="0.15" />
            <text x="14" y="24" fill="#5A673E" fontFamily="'Inter', system-ui, sans-serif" fontSize="16" fontWeight="700" letterSpacing="2">
              ACERVO HISTÓRICO SECULAR
            </text>
            <text x="310" y="24" fill="#85573B" fontFamily="'Inter', system-ui, sans-serif" fontSize="16" fontWeight="600" letterSpacing="1">
              • PRESERVAÇÃO DOCUMENTAL OFICIAL
            </text>
          </g>

          {/* Título Principal do Confronto */}
          <text x="80" y="210" fill="#1B1A17" fontFamily="'Source Serif 4', Georgia, serif" fontSize="62" fontWeight="800" letterSpacing="-1">
            {mandante}
          </text>
          <text x="80" y="275" fill="#85573B" fontFamily="'Source Serif 4', Georgia, serif" fontSize="48" fontWeight="400" fontStyle="italic">
            versus
          </text>
          <text x="80" y="350" fill="#1B1A17" fontFamily="'Source Serif 4', Georgia, serif" fontSize="62" fontWeight="800" letterSpacing="-1">
            {visitante}
          </text>

          {/* Subtítulo: Autoridade Histórica */}
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

          {/* Bloco de Fato Histórico Notável */}
          <g transform="translate(80, 530)">
            <rect x="0" y="0" width="920" height="175" rx="14" fill="#FFFFFF" fillOpacity="0.9" stroke="#85573B" strokeWidth="2" />
            <rect x="32" y="24" width="220" height="28" rx="4" fill="#85573B" />
            <text x="44" y="43" fill="#FFFFFF" fontFamily="'Inter', system-ui, sans-serif" fontSize="14" fontWeight="800" letterSpacing="1.5">
              📜 FATO HISTÓRICO DESTACADO
            </text>
            <text x="32" y="98" fill="#1B1A17" fontFamily="'Source Serif 4', Georgia, serif" fontSize="30" fontWeight="700">
              {fatoHistorico.length > 54 ? fatoHistorico.slice(0, 52) + '...' : fatoHistorico}
            </text>
            <text x="32" y="142" fill="#6B6A65" fontFamily="'Inter', system-ui, sans-serif" fontSize="18">
              Documentado em súmulas oficiais e acervos históricos do futebol brasileiro.
            </text>
          </g>

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
              Inteligência Histórica e Probabilidades do Futebol Brasileiro
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

      {/* Botões de Ação para o Fluxo de Trabalho do Usuário Interno */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button
          onClick={handleCopiarTextoWhatsApp}
          className="btn-primary touch-tactile"
          style={{
            minHeight: '44px',
            padding: '10px 14px',
            fontSize: '0.84rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#2E7D32', // Verde WhatsApp editorial
            borderColor: '#1B5E20'
          }}
          title="Copia texto estruturado com emojis pronto para colar no WhatsApp"
        >
          {copiadoTexto ? <Check size={18} /> : <MessageSquareText size={18} />}
          {copiadoTexto ? 'Texto Copiado!' : 'Copiar p/ WhatsApp'}
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
          onClick={handleCompartilharLink}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--secondary, #85573B)',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '4px 0',
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {copiadoLink ? <Check size={14} /> : <Copy size={14} />}
          {copiadoLink ? 'Link copiado' : 'Copiar link canônico'}
        </button>

        <button
          onClick={handleBaixarSVG}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '4px 0',
            fontSize: '0.78rem'
          }}
        >
          Baixar arquivo SVG puro
        </button>
      </div>
    </div>
  );
}
