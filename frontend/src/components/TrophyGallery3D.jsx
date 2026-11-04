import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Award, Sparkles, ChevronRight, X } from 'lucide-react';
import * as THREE from 'three';

export default function TrophyGallery3D({ clube, darkMode }) {
  const [trofeus, setTrofeus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [trofeuSelecionado, setTrofeuSelecionado] = useState(null);

  useEffect(() => {
    if (!clube) return;
    let isMounted = true;
    setLoading(true);

    fetch(`/api/clubes/trofeus?clube=${encodeURIComponent(clube)}`)
      .then(res => res.json())
      .then(json => {
        if (isMounted) {
          setTrofeus(json.trofeus || []);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Erro ao buscar troféus:', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [clube]);

  const trofeusFiltrados = trofeus.filter(t => {
    if (filtroTipo === 'todos') return true;
    return t.tipo_trofeu === filtroTipo;
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
      {/* Header da Galeria */}
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
              <span>Galeria de Glórias • {clube}</span>
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
              <span>Sala de Troféus & Réplicas 3D</span>
              <span 
                className="font-mono"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--accent)',
                  color: '#FFFFFF',
                  padding: '3px 10px',
                  borderRadius: '12px'
                }}
              >
                {totalTitulos} Conquistas Oficiais
              </span>
            </h2>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Réplicas tridimensionais interativas com física de materiais metálicos. Clique e arraste para girar a taça em 360°.
            </p>
          </div>

          {/* Filtros por Tipo de Conquista */}
          <div 
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px',
              padding: '4px',
              backgroundColor: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-control)'
            }}
          >
            {[
              { id: 'todos', label: 'Todos' },
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
                  borderRadius: 'var(--radius-control)',
                  fontSize: '0.78rem',
                  fontWeight: filtroTipo === f.id ? 700 : 500,
                  backgroundColor: filtroTipo === f.id ? 'var(--accent)' : 'transparent',
                  color: filtroTipo === f.id ? 'var(--accent-foreground)' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo da Galeria */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Renderizando vitrine 3D...
        </div>
      ) : trofeusFiltrados.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Nenhuma conquista cadastrada para esta categoria.
        </div>
      ) : (
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
            gap: '16px',
            width: '100%'
          }}
        >
          {trofeusFiltrados.map((t) => (
            <Trofeu3DCard
              key={t.id_trofeu}
              trofeu={t}
              darkMode={darkMode}
              onSelect={() => setTrofeuSelecionado(t)}
            />
          ))}
        </div>
      )}

      {/* Modal de Detalhe dos Anos Conquistados */}
      {trofeuSelecionado && (
        <div 
          onClick={() => setTrofeuSelecionado(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-panel)',
              padding: '24px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <button
              onClick={() => setTrofeuSelecionado(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                padding: '4px'
              }}
              aria-label="Fechar"
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--surface-raised)',
                  color: 'var(--accent)'
                }}
              >
                <Trophy size={24} />
              </div>
              <div>
                <h3 className="font-editorial" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {trofeuSelecionado.torneio}
                </h3>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 700 }}>
                  {trofeuSelecionado.quantidade} {trofeuSelecionado.quantidade === 1 ? 'Título Oficial' : 'Títulos Oficiais'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Temporadas das conquistas históricas do {clube}:
              </span>
              <div 
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  padding: '12px',
                  backgroundColor: 'var(--surface-raised)',
                  borderRadius: 'var(--radius-control)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {trofeuSelecionado.anos_conquistados.split(',').map((ano, i) => (
                  <span 
                    key={i}
                    className="font-mono"
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      borderRadius: 'var(--radius-control)',
                      backgroundColor: 'var(--accent)',
                      color: '#FFFFFF'
                    }}
                  >
                    {ano.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponente com Canvas 3D de Cada Troféu
function Trofeu3DCard({ trofeu, darkMode, onSelect }) {
  const mountRef = useRef(null);
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const meshGroupRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 210;
    const height = 180;

    // Cena, Câmera e Renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.9, 3.8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // Iluminação de Museu & Estúdio
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ea, 2.6);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd4af37, 2.0);
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    const spotLight = new THREE.PointLight(0xffeedd, 1.8, 10);
    spotLight.position.set(0, 2.5, 2);
    scene.add(spotLight);

    // Grupo do Troféu
    const group = new THREE.Group();
    meshGroupRef.current = group;

    // Materiais PBR Metálicos
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.88,
      roughness: 0.22,
    });

    const silverMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8ecf0,
      metalness: 0.92,
      roughness: 0.16,
    });

    const woodBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d2314,
      metalness: 0.08,
      roughness: 0.65,
    });

    const bronzeMaterial = new THREE.MeshStandardMaterial({
      color: 0xcd7f32,
      metalness: 0.78,
      roughness: 0.32,
    });

    const pedestalMaterial = new THREE.MeshStandardMaterial({
      color: 0x22201d,
      metalness: 0.3,
      roughness: 0.7,
    });

    // Pedestal de Veludo Escuro comum a todas as taças
    const pedestalGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.15, 32);
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMaterial);
    pedestalMesh.position.y = -0.92;
    group.add(pedestalMesh);

    // Construção Geométrica Conforme o Tipo da Taça
    const tipo = trofeu.modelo_3d_tipo || 'generic';

    if (tipo === 'libertadores') {
      // 1. Pedestal Cilíndrico de Cedro Escuro
      const baseGeo = new THREE.CylinderGeometry(0.48, 0.58, 0.65, 24);
      const baseMesh = new THREE.Mesh(baseGeo, woodBaseMaterial);
      baseMesh.position.y = -0.52;
      group.add(baseMesh);

      // Plaquinhas de prata na base
      const plaqueGeo = new THREE.BoxGeometry(0.12, 0.08, 0.02);
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const plaque = new THREE.Mesh(plaqueGeo, silverMaterial);
        plaque.position.set(Math.cos(ang) * 0.52, -0.52, Math.sin(ang) * 0.52);
        plaque.rotation.y = -ang + Math.PI / 2;
        group.add(plaque);
      }

      // 2. Taça de Prata Clássica da Libertadores
      const cupGeo = new THREE.CylinderGeometry(0.55, 0.18, 0.85, 24);
      const cupMesh = new THREE.Mesh(cupGeo, silverMaterial);
      cupMesh.position.y = 0.2;
      group.add(cupMesh);

      // 3. Figurinha do Jogador Chutando no Topo
      const figurineGeo = new THREE.SphereGeometry(0.16, 16, 16);
      const figurineMesh = new THREE.Mesh(figurineGeo, bronzeMaterial);
      figurineMesh.position.y = 0.75;
      group.add(figurineMesh);

    } else if (tipo === 'mundial') {
      // 1. Base Prateada Escovada
      const baseGeo = new THREE.CylinderGeometry(0.62, 0.72, 0.3, 32);
      const baseMesh = new THREE.Mesh(baseGeo, silverMaterial);
      baseMesh.position.y = -0.68;
      group.add(baseMesh);

      // 2. Colunas Douradas em Espiral
      const torusGeo = new THREE.TorusGeometry(0.46, 0.08, 16, 32);
      const torusMesh = new THREE.Mesh(torusGeo, goldMaterial);
      torusMesh.rotation.x = Math.PI / 2.2;
      torusMesh.position.y = -0.22;
      group.add(torusMesh);

      // 3. Globo Terrestre Dourado
      const globeGeo = new THREE.SphereGeometry(0.52, 32, 32);
      const globeMesh = new THREE.Mesh(globeGeo, goldMaterial);
      globeMesh.position.y = 0.38;
      group.add(globeMesh);

    } else if (tipo === 'brasileirao') {
      // 1. Base Cilíndrica
      const baseGeo = new THREE.CylinderGeometry(0.48, 0.58, 0.38, 24);
      const baseMesh = new THREE.Mesh(baseGeo, woodBaseMaterial);
      baseMesh.position.y = -0.66;
      group.add(baseMesh);

      // 2. Corpo Cônico Dourado Majestoso
      const cupGeo = new THREE.ConeGeometry(0.58, 1.25, 24, 1, true);
      const cupMesh = new THREE.Mesh(cupGeo, goldMaterial);
      cupMesh.rotation.x = Math.PI;
      cupMesh.position.y = 0.16;
      group.add(cupMesh);

      // 3. Alças Arqueadas
      const handleGeo = new THREE.TorusGeometry(0.38, 0.05, 12, 24, Math.PI);
      const handleL = new THREE.Mesh(handleGeo, goldMaterial);
      handleL.position.set(-0.52, 0.22, 0);
      handleL.rotation.z = -Math.PI / 2;
      group.add(handleL);

      const handleR = new THREE.Mesh(handleGeo, goldMaterial);
      handleR.position.set(0.52, 0.22, 0);
      handleR.rotation.z = Math.PI / 2;
      group.add(handleR);

    } else if (tipo === 'copa_brasil') {
      // 1. Base Dupla Prateada
      const baseGeo = new THREE.CylinderGeometry(0.58, 0.68, 0.32, 24);
      const baseMesh = new THREE.Mesh(baseGeo, silverMaterial);
      baseMesh.position.y = -0.68;
      group.add(baseMesh);

      // 2. Vaso Prateado Bojudo
      const cupGeo = new THREE.SphereGeometry(0.55, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.72);
      const cupMesh = new THREE.Mesh(cupGeo, silverMaterial);
      cupMesh.position.y = 0.08;
      group.add(cupMesh);

      // 3. Alças Laterais Prateadas
      const handleGeo = new THREE.TorusGeometry(0.34, 0.045, 12, 24, Math.PI);
      const handleL = new THREE.Mesh(handleGeo, silverMaterial);
      handleL.position.set(-0.48, 0.2, 0);
      handleL.rotation.z = -Math.PI / 2;
      group.add(handleL);

      const handleR = new THREE.Mesh(handleGeo, silverMaterial);
      handleR.position.set(0.48, 0.2, 0);
      handleR.rotation.z = Math.PI / 2;
      group.add(handleR);

    } else {
      // Troféu Estadual / Taça Ouro Facetada
      const baseGeo = new THREE.BoxGeometry(0.72, 0.32, 0.72);
      const baseMesh = new THREE.Mesh(baseGeo, woodBaseMaterial);
      baseMesh.position.y = -0.68;
      group.add(baseMesh);

      const cupGeo = new THREE.OctahedronGeometry(0.54);
      const cupMesh = new THREE.Mesh(cupGeo, goldMaterial);
      cupMesh.position.y = 0.12;
      group.add(cupMesh);
    }

    scene.add(group);

    // Animação de Rotação Automática
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (!isDraggingRef.current) {
        group.rotation.y += 0.007;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Eventos de Drag Mouse / Touch
    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;
      group.rotation.y += deltaX * 0.015;
      group.rotation.x += deltaY * 0.008;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      cancelAnimationFrame(reqId);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
      renderer.dispose();
    };
  }, [trofeu]);

  return (
    <div 
      onClick={onSelect}
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
        cursor: 'pointer',
        transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
        overflow: 'hidden'
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
      {/* Badge da Quantidade Conquistada */}
      <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
        <span 
          className="font-mono"
          style={{
            padding: '3px 8px',
            fontSize: '0.72rem',
            fontWeight: 700,
            borderRadius: '10px',
            backgroundColor: 'var(--accent)',
            color: '#FFFFFF',
            boxShadow: '0 2px 6px rgba(0,0,0,0.18)'
          }}
        >
          {trofeu.quantidade}x
        </span>
      </div>

      {/* Canvas 3D */}
      <div 
        ref={mountRef} 
        style={{
          width: '100%',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
        title="Arraste para girar em 360°"
      />

      {/* Metadados do Troféu */}
      <div 
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 
            className="font-editorial"
            style={{
              margin: 0,
              fontSize: '0.92rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {trofeu.torneio}
          </h4>
          <ChevronRight size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
        </div>
        <p 
          className="font-mono"
          style={{
            margin: 0,
            fontSize: '0.74rem',
            color: 'var(--text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {trofeu.anos_conquistados}
        </p>
      </div>
    </div>
  );
}
