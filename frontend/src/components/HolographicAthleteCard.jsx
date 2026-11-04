import React, { useRef, useEffect, useState, useMemo } from 'react';
import { obterRenderAtleta } from '../utils/playerRenders';
import ClubBadge from './ClubBadge';

/* Configurações da mola física (lerp spring) */
const SPRING_INTERACT = { stiffness: 0.08, damping: 0.28 };
const SPRING_SNAP = { stiffness: 0.02, damping: 0.08 };
const SNAP_DELAY = 400;

function clamp(val, min = 0, max = 100) {
  return Math.min(Math.max(val, min), max);
}

function round(val, prec = 2) {
  return parseFloat(val.toFixed(prec));
}

function adjust(val, inMin, inMax, outMin, outMax) {
  return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
}

export default function HolographicAthleteCard({
  atleta,
  tema = 'oliva', // 'oliva' | 'terracota' | 'gold'
  size = 'normal', // 'normal' | 'compact'
  onClick = null
}) {
  const cardRef = useRef(null);
  const [interacting, setInteracting] = useState(false);

  const renderInfo = useMemo(() => {
    return obterRenderAtleta(atleta?.nome || atleta?.atleta, atleta?.foto_url);
  }, [atleta?.nome, atleta?.atleta, atleta?.foto_url]);

  // Cores do tema
  const temaConfig = useMemo(() => {
    if (tema === 'terracota') {
      return {
        accent: '#B87550',
        accentSoft: '#D48459',
        cardBg1: '#1F1713',
        cardBg2: '#2B1A13',
        glow: 'rgba(184, 117, 80, 0.35)',
        badgeBg: 'rgba(184, 117, 80, 0.2)'
      };
    }
    if (tema === 'gold') {
      return {
        accent: '#F5CE3B',
        accentSoft: '#FFDE6B',
        cardBg1: '#1A180E',
        cardBg2: '#2B250F',
        glow: 'rgba(245, 206, 59, 0.35)',
        badgeBg: 'rgba(245, 206, 59, 0.2)'
      };
    }
    // Padrão: Oliva
    return {
      accent: '#7C8F52',
      accentSoft: '#98AC67',
      cardBg1: '#141A12',
      cardBg2: '#1D2819',
      glow: 'rgba(124, 143, 82, 0.35)',
      badgeBg: 'rgba(124, 143, 82, 0.2)'
    };
  }, [tema]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let snapTimer = null;
    let animId = null;

    let target = { rx: 0, ry: 0, gx: 50, gy: 50, o: 0, bx: 50, by: 50 };
    let current = { rx: 0, ry: 0, gx: 50, gy: 50, o: 0, bx: 50, by: 50 };
    let velocity = { rx: 0, ry: 0, gx: 0, gy: 0, o: 0, bx: 0, by: 0 };
    let springConfig = SPRING_INTERACT;

    function step() {
      let isSettled = true;
      const keys = ['rx', 'ry', 'gx', 'gy', 'o', 'bx', 'by'];

      keys.forEach((k) => {
        const force = (target[k] - current[k]) * springConfig.stiffness;
        velocity[k] = (velocity[k] + force) * (1 - springConfig.damping);
        current[k] += velocity[k];

        if (Math.abs(velocity[k]) > 0.005 || Math.abs(target[k] - current[k]) > 0.01) {
          isSettled = false;
        }
      });

      const fromCenter = clamp(
        Math.sqrt((current.gy - 50) ** 2 + (current.gx - 50) ** 2) / 50,
        0,
        1
      );

      card.style.setProperty('--pointer-x', `${round(current.gx)}%`);
      card.style.setProperty('--pointer-y', `${round(current.gy)}%`);
      card.style.setProperty('--pointer-from-center', `${round(fromCenter)}`);
      card.style.setProperty('--card-opacity', `${clamp(round(current.o), 0, 1)}`);
      card.style.setProperty('--rotate-x', `${round(current.rx)}deg`);
      card.style.setProperty('--rotate-y', `${round(current.ry)}deg`);
      card.style.setProperty('--background-x', `${round(current.bx)}%`);
      card.style.setProperty('--background-y', `${round(current.by)}%`);

      if (!isSettled) {
        animId = requestAnimationFrame(step);
      } else {
        animId = null;
      }
    }

    function triggerSpring(newTarget, config) {
      target = { ...target, ...newTarget };
      springConfig = config;
      if (!animId) {
        animId = requestAnimationFrame(step);
      }
    }

    function handlePointerMove(e) {
      clearTimeout(snapTimer);
      setInteracting(true);

      const point = e.touches ? e.touches[0] : e;
      const rect = card.getBoundingClientRect();
      const px = clamp(round((100 / rect.width) * (point.clientX - rect.left)));
      const py = clamp(round((100 / rect.height) * (point.clientY - rect.top)));
      const cx = px - 50;
      const cy = py - 50;

      triggerSpring(
        {
          rx: round(-(cx / 3.8)),
          ry: round(cy / 3.8),
          gx: px,
          gy: py,
          o: 1,
          bx: adjust(px, 0, 100, 36, 64),
          by: adjust(py, 0, 100, 32, 68)
        },
        SPRING_INTERACT
      );
    }

    function handlePointerLeave() {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
        setInteracting(false);
        triggerSpring({ rx: 0, ry: 0, gx: 50, gy: 50, o: 0, bx: 50, by: 50 }, SPRING_SNAP);
      }, SNAP_DELAY);
    }

    card.addEventListener('pointermove', handlePointerMove);
    card.addEventListener('pointerleave', handlePointerLeave);
    card.addEventListener('touchmove', handlePointerMove, { passive: true });
    card.addEventListener('touchend', handlePointerLeave);
    card.addEventListener('touchcancel', handlePointerLeave);

    return () => {
      clearTimeout(snapTimer);
      if (animId) cancelAnimationFrame(animId);
      card.removeEventListener('pointermove', handlePointerMove);
      card.removeEventListener('pointerleave', handlePointerLeave);
      card.removeEventListener('touchmove', handlePointerMove);
      card.removeEventListener('touchend', handlePointerLeave);
      card.removeEventListener('touchcancel', handlePointerLeave);
    };
  }, []);

  const cardWidth = size === 'compact' ? '250px' : '280px';
  const cardHeight = size === 'compact' ? '370px' : '415px';
  const ovrNumber = atleta?.notaScouting || atleta?.nota || 85;
  const clubePrincipal = Array.isArray(atleta?.clubes) 
    ? atleta.clubes[0] 
    : (typeof atleta?.clubes === 'string' ? atleta.clubes.split(',')[0].trim() : 'Brasil');

  return (
    <div
      style={{
        perspective: '800px',
        width: cardWidth,
        margin: '0 auto',
        userSelect: 'none'
      }}
    >
      <div
        className={interacting ? 'card-float interacting' : 'card-float'}
        style={{
          display: 'grid',
          transformStyle: 'preserve-3d',
          animation: interacting ? 'none' : 'floatCard 5s ease-in-out infinite'
        }}
      >
        <div
          ref={cardRef}
          onClick={onClick}
          className="holo-card"
          style={{
            position: 'relative',
            width: cardWidth,
            height: cardHeight,
            borderRadius: '20px',
            clipPath: 'polygon(8% 0, 100% 0, 100% 93%, 92% 100%, 0 100%, 0 7%)',
            background: `linear-gradient(155deg, ${temaConfig.cardBg2} 0%, ${temaConfig.cardBg1} 60%, #080C09 100%)`,
            boxShadow: '0 24px 50px -18px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08) inset',
            transformStyle: 'preserve-3d',
            transform: 'rotateY(var(--rotate-x, 0deg)) rotateX(var(--rotate-y, 0deg))',
            willChange: 'transform',
            cursor: onClick ? 'pointer' : 'default',
            overflow: 'hidden'
          }}
        >
          {/* Borda chanfrada metálica die-cut */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '20px',
              clipPath: 'polygon(8% 0, 100% 0, 100% 93%, 92% 100%, 0 100%, 0 7%)',
              border: `1.5px solid ${temaConfig.accent}`,
              opacity: 0.85,
              pointerEvents: 'none',
              zIndex: 7
            }}
          />

          {/* Camada 1: Foil Holográfico (Paralaxe suave) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 3,
              pointerEvents: 'none',
              clipPath: 'polygon(8% 0, 100% 0, 100% 93%, 92% 100%, 0 100%, 0 7%)',
              backgroundImage: `repeating-linear-gradient(115deg, 
                transparent 0%, transparent 8%, 
                rgba(245, 206, 59, 0.14) 9%, rgba(245, 206, 59, 0.14) 11%, 
                rgba(124, 143, 82, 0.12) 12%, rgba(124, 143, 82, 0.12) 14%, 
                transparent 15%, transparent 24%)`,
              backgroundSize: '220% 220%',
              backgroundPosition: 'calc(((50% - var(--background-x, 50%)) * 2.4) + 50%) calc(((50% - var(--background-y, 50%)) * 3.2) + 50%)',
              opacity: 'calc(0.4 + var(--pointer-from-center, 0) * 0.6)',
              mixBlendMode: 'soft-light',
              transform: 'translateZ(1px)'
            }}
          />

          {/* Camada 2: Brilho Metálico Color-Dodge */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 4,
              pointerEvents: 'none',
              clipPath: 'polygon(8% 0, 100% 0, 100% 93%, 92% 100%, 0 100%, 0 7%)',
              backgroundImage: `repeating-linear-gradient(110deg,
                #3A2F0A, #1F3A2A, #46370C, #1A2834, #3A2F0A, #1F3A2A, #46370C)`,
              backgroundSize: '300% 300%',
              backgroundPosition: 'calc(((50% - var(--background-x, 50%)) * 3) + 50%) calc(((50% - var(--background-y, 50%)) * 3.8) + 50%)',
              filter: 'brightness(0.9) contrast(2.1) saturate(1.2)',
              mixBlendMode: 'color-dodge',
              opacity: 'calc(var(--card-opacity, 0) * 0.52)',
              transform: 'translateZ(1.2px)'
            }}
          />

          {/* Camada 3: Glare Radial (Luz de Vidro) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              pointerEvents: 'none',
              clipPath: 'polygon(8% 0, 100% 0, 100% 93%, 92% 100%, 0 100%, 0 7%)',
              backgroundImage: 'radial-gradient(circle at var(--pointer-x, 50%) var(--pointer-y, 50%), rgba(255,255,255,0.7) 8%, rgba(255,255,255,0.3) 22%, rgba(0,0,0,0.5) 85%)',
              opacity: 'var(--card-opacity, 0)',
              mixBlendMode: 'overlay',
              transform: 'translateZ(1.4px)'
            }}
          />

          {/* Conteúdo da Carta (translateZ para profundidade 3D) */}
          <div
            style={{
              position: 'relative',
              zIndex: 6,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transform: 'translateZ(26px)',
              padding: '14px 14px 12px',
              boxSizing: 'border-box'
            }}
          >
            {/* Topo: Nota Global, Posição e Escudo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                <span
                  className="font-mono tabular-nums"
                  style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: temaConfig.accentSoft,
                    textShadow: `0 2px 10px ${temaConfig.glow}`
                  }}
                >
                  {ovrNumber}
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.7)',
                    letterSpacing: '0.06em',
                    marginTop: '2px'
                  }}
                >
                  {atleta?.posicao?.substring(0, 3)?.toUpperCase() || 'CRA'}
                </span>
                <span style={{ fontSize: '0.68rem', marginTop: '3px' }}>🇧🇷</span>
              </div>

              {/* Escudo do Clube */}
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 14px rgba(0,0,0,0.4)'
                }}
              >
                <ClubBadge nome={clubePrincipal} size={24} />
              </div>
            </div>

            {/* Centro: Silhueta / Render do Jogador */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 0,
                margin: '4px 0'
              }}
            >
              {/* Brilho radial atrás do atleta */}
              <div
                style={{
                  position: 'absolute',
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${temaConfig.glow}, transparent 70%)`,
                  filter: 'blur(12px)',
                  zIndex: 1
                }}
              />

              {renderInfo.hasRender && renderInfo.cardUrl ? (
                <img
                  src={renderInfo.cardUrl}
                  alt={atleta?.nome}
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    maxHeight: '100%',
                    maxWidth: '92%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.7))',
                    transform: 'translateZ(30px) scale(1.08)'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : atleta?.foto_url ? (
                <img
                  src={atleta.foto_url}
                  alt={atleta?.nome}
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `2px solid ${temaConfig.accent}`,
                    boxShadow: '0 10px 24px rgba(0,0,0,0.6)'
                  }}
                />
              ) : (
                <div
                  className="font-editorial"
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    fontSize: '4rem',
                    fontWeight: 800,
                    color: temaConfig.accentSoft,
                    opacity: 0.75,
                    textShadow: `0 0 20px ${temaConfig.glow}`
                  }}
                >
                  {atleta?.nome?.substring(0, 2)?.toUpperCase() || 'CR'}
                </div>
              )}
            </div>

            {/* Faixa de Nome & Clube */}
            <div
              style={{
                textAlign: 'center',
                padding: '6px 8px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.06), transparent)',
                borderRadius: '8px',
                borderTop: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {atleta?.nome || 'Craque'}
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.68rem',
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: '1px',
                  letterSpacing: '0.04em'
                }}
              >
                {clubePrincipal}
              </span>
            </div>

            {/* Atributos Básicos de Rodapé (Scouts Essenciais) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4px',
                marginTop: '6px',
                textAlign: 'center',
                paddingTop: '6px',
                borderTop: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div>
                <span style={{ display: 'block', fontSize: '0.55rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>GOLS</span>
                <span className="font-mono tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 900, color: temaConfig.accentSoft }}>
                  {atleta?.total_gols ?? atleta?.gols ?? '—'}
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.55rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>JOGOS</span>
                <span className="font-mono tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 900, color: '#FFFFFF' }}>
                  {atleta?.total_jogos ?? atleta?.jogos ?? '—'}
                </span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '0.55rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>MÉDIA</span>
                <span className="font-mono tabular-nums" style={{ fontSize: '0.82rem', fontWeight: 900, color: temaConfig.accentSoft }}>
                  {atleta?.media_gols_por_jogo ? Number(atleta.media_gols_por_jogo).toFixed(2) : (atleta?.total_gols && atleta?.total_jogos ? (atleta.total_gols / atleta.total_jogos).toFixed(2) : '—')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
