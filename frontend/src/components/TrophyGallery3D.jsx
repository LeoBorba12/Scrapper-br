import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  Trophy,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Sun,
  Layers,
  Play,
  Pause,
  X,
  Maximize2
} from 'lucide-react';
import {
  createStudioEnvironment,
  createSoccerBumpTexture,
  createContinentsReliefTexture,
  createMaterials,
  buildTrophyById
} from './trophies/trophyBuilders';

// Componente isolado para renderização do canvas 3D em WebGL
function TrophyCanvas3D({
  trophyId,
  variant = 'intercontinental',
  lightingPreset = 'warm',
  autoRotate = true,
  wireframe = false,
  height = 200,
  cameraDistance = 6.2
}) {
  const mountRef = useRef(null);
  const groupRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevPointerRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0.006 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 280;
    const h = height;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(36, width / h, 0.1, 100);
    camera.position.set(0, 0.35, cameraDistance);
    camera.lookAt(0, 0.1, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Ambiente HDRI procedural de estúdio
    const envMap = createStudioEnvironment(renderer, lightingPreset);
    scene.environment = envMap;

    // Luzes de realce
    const keyLight = new THREE.DirectionalLight(0xfff4d6, 2.2);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xdbeafe, 1.5);
    rimLight.position.set(-6, 5, -5);
    scene.add(rimLight);

    const bottomFill = new THREE.DirectionalLight(0xffd280, 0.7);
    bottomFill.position.set(0, -6, 3);
    scene.add(bottomFill);

    // Sombra de contato suave
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(64, 64, 8, 64, 64, 60);
    grad.addColorStop(0, 'rgba(35, 25, 15, 0.42)');
    grad.addColorStop(0.6, 'rgba(35, 25, 15, 0.14)');
    grad.addColorStop(1, 'rgba(35, 25, 15, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 3.2),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.38;
    scene.add(shadowPlane);

    // Texturas e materiais
    const soccerBump = createSoccerBumpTexture();
    const globeBump = createContinentsReliefTexture();
    const mats = createMaterials(wireframe, soccerBump, globeBump);

    // Construção do troféu
    const trophyMesh = buildTrophyById(trophyId, mats, variant);
    trophyMesh.rotation.y = -0.35;
    trophyMesh.rotation.x = 0.06;
    groupRef.current = trophyMesh;
    scene.add(trophyMesh);

    // Controles de Arraste 360° (Mouse + Touch)
    const onPointerDown = (e) => {
      isDraggingRef.current = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      prevPointerRef.current = { x: clientX, y: clientY };
    };

    const onPointerMove = (e) => {
      if (!isDraggingRef.current || !groupRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - prevPointerRef.current.x;
      const deltaY = clientY - prevPointerRef.current.y;

      groupRef.current.rotation.y += deltaX * 0.013;
      groupRef.current.rotation.x = Math.max(
        -0.45,
        Math.min(0.55, groupRef.current.rotation.x + deltaY * 0.009)
      );

      rotationVelocityRef.current = {
        x: deltaY * 0.0005,
        y: deltaX * 0.002
      };

      prevPointerRef.current = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domElem.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Resize responsivo
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      if (w === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Loop de animação
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (groupRef.current && !isDraggingRef.current) {
        if (autoRotate) {
          groupRef.current.rotation.y += 0.0065;
        } else {
          groupRef.current.rotation.y += rotationVelocityRef.current.y;
          rotationVelocityRef.current.y *= 0.94;
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      domElem.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElem.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('resize', handleResize);

      if (container.contains(domElem)) {
        container.removeChild(domElem);
      }
      renderer.dispose();
      envMap.dispose();
      soccerBump.dispose();
      globeBump.dispose();
      shadowTex.dispose();
    };
  }, [trophyId, variant, lightingPreset, autoRotate, wireframe, height, cameraDistance]);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'grab'
      }}
      title="Arraste para girar em 360°"
    />
  );
}

// Descrições técnicas e históricas para o modo Museu
const TROPHY_DESCRIPTIONS = {
  mundial_intercontinental: {
    nome: 'Copa Intercontinental / Mundial FIFA',
    detalhe: 'Base cônica em ouro 24k com 6 hastes torcidas helicoidais que sustentam o globo cerâmico com relevo dos continentes em ouro maciço.',
    conquistadoPor: 'Mundiais FIFA e Taça Intercontinental Toyota.'
  },
  mundial_copario51: {
    nome: 'Copa Rio Internacional 1951',
    detalhe: 'Urna clássica em prata de lei lavrada, corpo adornado com 14 folhas de acanto, alças em curvas clássicas e tampa com pinha floral.',
    conquistadoPor: 'Pioneiro torneio intercontinental de campeões mundiais.'
  },
  libertadores: {
    nome: 'Copa Libertadores da América',
    detalhe: 'Glória Eterna da CONMEBOL: base de mogno escuro com 96 plaquinhas gravadas, coluna prateada canelada, globo com cinta equatorial e o clássico jogador chutando no topo.',
    conquistadoPor: 'Campeões da América do Sul.'
  },
  brasileirao: {
    nome: 'Campeonato Brasileiro Série A (CBF)',
    detalhe: 'Taça Oficial CBF: base cônica espelhada gravada com BRASILEIRÃO, anel esmeralda, cálice em V chanfrado e losango dourado central abraçando a bola de ouro.',
    conquistadoPor: 'Campeões nacionais de pontos corridos.'
  },
  copa_brasil: {
    nome: 'Copa do Brasil',
    detalhe: 'Taça Oficial CBF com anel flutuante gravado COPA DO BRASIL em ouro, escudo em cruz da CBF no peito e tradicionais fitas comemorativas suspensas.',
    conquistadoPor: 'Campeões do torneio nacional eliminatório mata-mata.'
  },
  estadual_paulista: {
    nome: 'Campeonato Paulista (FPF)',
    detalhe: 'Taça Asa do Paulistão: base cônica espelhada com anel esmeralda inferior, cilindro alto espelhado e a grande asa dourada esculpida em 9 penas ascendentes.',
    conquistadoPor: 'Campeões da FPF (Federação Paulista de Futebol).'
  },
  estadual_carioca: {
    nome: 'Campeonato Carioca (FERJ)',
    detalhe: 'Taça Clássica FERJ: base octogonal em mogno com 3 placas esmaltadas da FERJ, pé torneado em ouro polido, cálice largo com friso floral e alças altas curvas.',
    conquistadoPor: 'Campeões da FERJ (Federação do Estado do Rio de Janeiro).'
  }
};

export default function TrophyGallery3D({ clube }) {
  const [trofeus, setTrofeus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [trofeuModal, setTrofeuModal] = useState(null);

  // Estados dos Controles de Renderização 3D
  const [lightingPreset, setLightingPreset] = useState('warm'); // 'warm' | 'stadium' | 'dramatic'
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);

  // Variantes selecionadas por troféu (mundial e estadual)
  const [variants, setVariants] = useState({});

  useEffect(() => {
    if (!clube) return;
    let isMounted = true;
    setLoading(true);

    fetch(`/api/clubes/trofeus?clube=${encodeURIComponent(clube)}`)
      .then(res => res.json())
      .then(json => {
        if (isMounted) {
          const lista = json.trofeus || [];
          setTrofeus(lista);

          // Inicializar variantes padrão com base no clube
          const initialVariants = {};
          const isPalmeiras = (clube || '').toLowerCase().includes('palmeiras');
          const isPaulista = ['palmeiras', 'corinthians', 'santos', 'são paulo', 'bragantino', 'ponte preta'].some(c =>
            (clube || '').toLowerCase().includes(c)
          );

          lista.forEach(t => {
            const tipo = (t.modelo_3d_tipo || t.tipo_trofeu || '').toLowerCase();
            if (tipo.includes('mundial')) {
              initialVariants[t.id || 'mundial'] = isPalmeiras ? 'copario51' : 'intercontinental';
            } else if (tipo.includes('estadual')) {
              initialVariants[t.id || 'estadual'] = isPaulista ? 'paulista' : 'carioca';
            }
          });

          setVariants(initialVariants);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Erro ao carregar troféus:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [clube]);

  const handleToggleVariant = (trophyKey, variantVal) => {
    setVariants(prev => ({ ...prev, [trophyKey]: variantVal }));
  };

  const trofeusFiltrados = trofeus.filter(t => {
    if (filtroTipo === 'todos') return true;
    const tipo = (t.tipo_trofeu || '').toLowerCase();
    return tipo === filtroTipo.toLowerCase();
  });

  const totalTitulos = trofeus.reduce((acc, t) => acc + (t.quantidade || 0), 0);

  return (
    <div
      className="editorial-panel"
      style={{
        padding: '24px',
        backgroundColor: 'var(--surface-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-panel)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Header Principal */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '18px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--surface-raised)',
                color: 'var(--accent)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '6px'
              }}
            >
              <Trophy size={13} />
              <span>Sala de Troféus & Museu 3D • {clube}</span>
            </div>

            <h2
              className="font-editorial"
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap'
              }}
            >
              <span>Réplicas 3D Oficiais de Conquistas</span>
              <span
                className="font-mono"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--surface-raised)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {totalTitulos} títulos registrados
              </span>
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Modelos procedurais com acabamento PBR, reflexos de estúdio em tempo real e controle orbital 360°. Arraste com o mouse ou toque para inspecionar.
            </p>
          </div>

          {/* Barra de Ferramentas do Estúdio 3D */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--surface-card)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--border-subtle)',
              flexWrap: 'wrap'
            }}
          >
            {/* Seletor de Iluminação */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sun size={13} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '2px' }}>
                Luz:
              </span>
              {[
                { id: 'warm', label: 'Estúdio Ouro' },
                { id: 'stadium', label: 'Estádio' },
                { id: 'dramatic', label: 'Dramático' }
              ].map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setLightingPreset(preset.id)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.68rem',
                    fontWeight: lightingPreset === preset.id ? 700 : 500,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: lightingPreset === preset.id ? 'var(--accent)' : 'transparent',
                    color: lightingPreset === preset.id ? '#FFFFFF' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-subtle)' }} />

            {/* Toggle de Rotação Automática */}
            <button
              onClick={() => setAutoRotate(r => !r)}
              title={autoRotate ? 'Pausar rotação contínua' : 'Ativar rotação contínua'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '0.68rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: autoRotate ? 'var(--surface-raised)' : 'transparent',
                color: autoRotate ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {autoRotate ? <Pause size={12} /> : <Play size={12} />}
              <span>{autoRotate ? 'Giro Ativo' : 'Giro Pausado'}</span>
            </button>

            {/* Toggle de Malha Wireframe */}
            <button
              onClick={() => setWireframe(w => !w)}
              title="Visualizar geometria e malha 3D"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '0.68rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: wireframe ? 'var(--accent)' : 'transparent',
                color: wireframe ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <Layers size={12} />
              <span>Wireframe</span>
            </button>
          </div>
        </div>

        {/* Filtros por Categoria */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '4px' }}>
          {[
            { id: 'todos', label: 'Todos os Troféus' },
            { id: 'mundial', label: 'Mundiais' },
            { id: 'libertadores', label: 'Libertadores' },
            { id: 'brasileirao', label: 'Brasileirão' },
            { id: 'copa_brasil', label: 'Copa do Brasil' },
            { id: 'estadual', label: 'Estaduais' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFiltroTipo(f.id)}
              style={{
                padding: '5px 12px',
                fontSize: '0.74rem',
                fontWeight: filtroTipo === f.id ? 700 : 500,
                borderRadius: 'var(--radius-control)',
                border: '1px solid',
                borderColor: filtroTipo === f.id ? 'var(--accent)' : 'var(--border-subtle)',
                backgroundColor: filtroTipo === f.id ? 'var(--accent)' : 'var(--surface-card)',
                color: filtroTipo === f.id ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Cards dos Troféus */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Sparkles size={24} style={{ animation: 'spin 2s linear infinite', marginBottom: '8px' }} />
          <p style={{ margin: 0, fontSize: '0.88rem' }}>Renderizando vitrine e calibrando texturas 3D...</p>
        </div>
      ) : trofeusFiltrados.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>Nenhum troféu encontrado para o filtro selecionado.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '18px',
            alignItems: 'stretch'
          }}
        >
          {trofeusFiltrados.map((trofeu, idx) => {
            const trophyKey = trofeu.id || `${trofeu.modelo_3d_tipo}_${idx}`;
            const tipo = (trofeu.modelo_3d_tipo || trofeu.tipo_trofeu || '').toLowerCase();
            const currentVariant = variants[trophyKey] || (tipo.includes('mundial') ? 'intercontinental' : 'paulista');

            const hasVariantMundial = tipo.includes('mundial') || tipo.includes('copario');
            const hasVariantEstadual = tipo.includes('estadual');

            return (
              <div
                key={trophyKey}
                style={{
                  position: 'relative',
                  backgroundColor: 'var(--surface-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-panel)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-editorial)',
                  overflow: 'hidden',
                  transition: 'transform 0.18s ease, border-color 0.18s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                {/* Header do Card com Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span
                    className="font-editorial"
                    style={{
                      fontSize: '0.96rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '190px'
                    }}
                    title={trofeu.torneio}
                  >
                    {trofeu.torneio}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      backgroundColor: 'var(--accent)',
                      color: '#FFFFFF',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.18)'
                    }}
                  >
                    {trofeu.quantidade}x
                  </span>
                </div>

                {/* Alternância de Variantes (se aplicável) */}
                {hasVariantMundial && (
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleVariant(trophyKey, 'intercontinental'); }}
                      style={{
                        padding: '2px 6px',
                        fontSize: '0.62rem',
                        fontWeight: currentVariant === 'intercontinental' ? 700 : 500,
                        borderRadius: '3px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: currentVariant === 'intercontinental' ? 'var(--surface-raised)' : 'transparent',
                        color: currentVariant === 'intercontinental' ? 'var(--accent)' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      FIFA Intercontinental
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleVariant(trophyKey, 'copario51'); }}
                      style={{
                        padding: '2px 6px',
                        fontSize: '0.62rem',
                        fontWeight: currentVariant === 'copario51' ? 700 : 500,
                        borderRadius: '3px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: currentVariant === 'copario51' ? 'var(--surface-raised)' : 'transparent',
                        color: currentVariant === 'copario51' ? 'var(--accent)' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      Copa Rio 1951
                    </button>
                  </div>
                )}

                {hasVariantEstadual && (
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleVariant(trophyKey, 'paulista'); }}
                      style={{
                        padding: '2px 6px',
                        fontSize: '0.62rem',
                        fontWeight: currentVariant === 'paulista' ? 700 : 500,
                        borderRadius: '3px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: currentVariant === 'paulista' ? 'var(--surface-raised)' : 'transparent',
                        color: currentVariant === 'paulista' ? 'var(--accent)' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      Paulistão FPF
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleVariant(trophyKey, 'carioca'); }}
                      style={{
                        padding: '2px 6px',
                        fontSize: '0.62rem',
                        fontWeight: currentVariant === 'carioca' ? 700 : 500,
                        borderRadius: '3px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: currentVariant === 'carioca' ? 'var(--surface-raised)' : 'transparent',
                        color: currentVariant === 'carioca' ? 'var(--accent)' : 'var(--text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      Carioca FERJ
                    </button>
                  </div>
                )}

                {/* Canvas 3D */}
                <TrophyCanvas3D
                  trophyId={trofeu.modelo_3d_tipo || trofeu.tipo_trofeu}
                  variant={currentVariant}
                  lightingPreset={lightingPreset}
                  autoRotate={autoRotate}
                  wireframe={wireframe}
                  height={190}
                  cameraDistance={6.2}
                />

                {/* Metadados e Botão de Inspeção */}
                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(trofeu.anos_conquistados || '').split(',').slice(0, 5).map((ano, aIdx) => (
                      <span
                        key={aIdx}
                        className="font-mono"
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--surface-raised)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {ano.trim()}
                      </span>
                    ))}
                    {(trofeu.anos_conquistados || '').split(',').length > 5 && (
                      <span
                        className="font-mono"
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--surface-raised)',
                          color: 'var(--accent)',
                          fontWeight: 600
                        }}
                      >
                        +{(trofeu.anos_conquistados || '').split(',').length - 5}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setTrofeuModal({ ...trofeu, variant: currentVariant })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '7px 12px',
                      borderRadius: 'var(--radius-control)',
                      backgroundColor: 'var(--surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--border-subtle)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--surface-raised)'; }}
                  >
                    <Maximize2 size={13} style={{ color: 'var(--accent)' }} />
                    <span>Inspecionar Réplica (Museu)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Inspeção em Tela Cheia (Museu 3D) */}
      {trofeuModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(10, 9, 8, 0.78)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setTrofeuModal(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '720px',
              backgroundColor: 'var(--surface-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-panel)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              boxSizing: 'border-box'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Museu Histórico de Troféus • {clube}
                </span>
                <h3
                  className="font-editorial"
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)'
                  }}
                >
                  {trofeuModal.torneio}
                </h3>
              </div>
              <button
                onClick={() => setTrofeuModal(null)}
                style={{
                  padding: '6px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'var(--surface-raised)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Visualizador 3D Ampliado */}
            <div
              style={{
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <TrophyCanvas3D
                trophyId={trofeuModal.modelo_3d_tipo || trofeuModal.tipo_trofeu}
                variant={trofeuModal.variant || 'intercontinental'}
                lightingPreset={lightingPreset}
                autoRotate={autoRotate}
                wireframe={wireframe}
                height={380}
                cameraDistance={5.8}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '12px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: '#FFFFFF',
                  fontSize: '0.68rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <RotateCcw size={11} />
                <span>Arraste para girar em 360° • Zoom com roda do mouse</span>
              </div>
            </div>

            {/* Detalhes Históricos e Anos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="font-mono" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)' }}>
                  Total: {trofeuModal.quantidade}x títulos conquistados
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {(trofeuModal.anos_conquistados || '').split(',').map((ano, idx) => (
                  <span
                    key={idx}
                    className="font-mono"
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      borderRadius: '4px',
                      backgroundColor: 'var(--surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {ano.trim()}
                  </span>
                ))}
              </div>

              {/* Informação Técnica da Taça */}
              <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Réplica digital tridimensional renderizada proceduramente em WebGL com sombreamento físico ACES Filmic Tone Mapping, reflexos em softboxes de estúdio e simulação de metais polidos e escovados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
