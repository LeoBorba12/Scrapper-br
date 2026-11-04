import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Award, Sparkles, ChevronRight, Info, X } from 'lucide-react';
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
    <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
      darkMode ? 'bg-[#22201C] border-[#38332B] text-[#F1E8DE]' : 'bg-[#FAF6F0] border-[#E2D7C7] text-[#1B1A17]'
    }`}>
      {/* Header da Galeria */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-[#E2D7C7] dark:border-[#38332B]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#85573B]/10 text-[#85573B]">
            <Trophy className="w-3.5 h-3.5" />
            Galeria de Glórias • {clube}
          </div>
          <h2 className="text-2xl font-bold font-editorial tracking-tight flex items-center gap-3">
            Sala de Troféus & Réplicas 3D
            <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-[#85573B] text-white">
              {totalTitulos} Conquistas
            </span>
          </h2>
          <p className={`text-xs ${darkMode ? 'text-[#C9BAA9]' : 'text-[#5C5549]'}`}>
            Réplicas tridimensionais interativas renderizadas em tempo real. Arraste para girar a taça sob a luz da vitrine.
          </p>
        </div>

        {/* Filtros por Tipo de Conquista */}
        <div className={`flex flex-wrap gap-1 p-1 rounded-xl border ${
          darkMode ? 'bg-[#1B1A17] border-[#38332B]' : 'bg-[#EAE1D5] border-[#D4C6B3]'
        }`}>
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
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filtroTipo === f.id
                  ? 'bg-[#85573B] text-white shadow-sm'
                  : (darkMode ? 'text-[#8A8175] hover:text-white' : 'text-[#7D7365] hover:text-[#1B1A17]')
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo da Galeria */}
      {loading ? (
        <div className="w-full h-64 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-[#85573B] border-t-transparent rounded-full animate-spin" />
          <span className={`text-xs ${darkMode ? 'text-[#C9BAA9]' : 'text-[#5C5549]'}`}>Renderizando vitrine 3D...</span>
        </div>
      ) : trofeusFiltrados.length === 0 ? (
        <div className="py-12 text-center text-sm opacity-60">
          Nenhuma conquista cadastrada para esta categoria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-6">
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setTrofeuSelecionado(null)}
        >
          <div 
            className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl relative ${
              darkMode ? 'bg-[#1B1A17] border-[#38332B] text-[#F1E8DE]' : 'bg-[#FAF6F0] border-[#E2D7C7] text-[#1B1A17]'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setTrofeuSelecionado(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[#85573B]/10 text-[#85573B]">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold font-editorial text-lg leading-tight">
                  {trofeuSelecionado.torneio}
                </h3>
                <span className="text-xs font-semibold text-[#85573B]">
                  {trofeuSelecionado.quantidade} {trofeuSelecionado.quantidade === 1 ? 'Conquista Oficial' : 'Conquistas Oficiais'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className={`text-xs ${darkMode ? 'text-[#C9BAA9]' : 'text-[#5C5549]'}`}>
                Temporadas das conquistas históricas deste clube:
              </p>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                {trofeuSelecionado.anos_conquistados.split(',').map((ano, i) => (
                  <span 
                    key={i} 
                    className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-[#85573B] text-white shadow-sm"
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

    const width = container.clientWidth || 220;
    const height = 200;

    // Cena, Câmera e Renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 4.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Iluminação de Vitrine de Museu
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.5);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd4af37, 1.8);
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

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
      color: 0xe6e8ea,
      metalness: 0.92,
      roughness: 0.18,
    });

    const woodBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d2314,
      metalness: 0.1,
      roughness: 0.6,
    });

    const bronzeMaterial = new THREE.MeshStandardMaterial({
      color: 0xcd7f32,
      metalness: 0.75,
      roughness: 0.35,
    });

    // Construção Geométrica Conforme o Tipo da Taça
    const tipo = trofeu.modelo_3d_tipo || 'generic';

    if (tipo === 'libertadores') {
      // Pedestal de Madeira com Placas
      const baseGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.7, 24);
      const baseMesh = new THREE.Mesh(baseGeo, woodBaseMaterial);
      baseMesh.position.y = -0.55;
      group.add(baseMesh);

      // Taça de Prata
      const cupGeo = new THREE.CylinderGeometry(0.55, 0.2, 0.9, 24);
      const cupMesh = new THREE.Mesh(cupGeo, silverMaterial);
      cupMesh.position.y = 0.2;
      group.add(cupMesh);

      // Pequeno Jogador no Topo
      const figurineGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const figurineMesh = new THREE.Mesh(figurineGeo, bronzeMaterial);
      figurineMesh.position.y = 0.8;
      group.add(figurineMesh);

    } else if (tipo === 'mundial') {
      // Base Esférica e Colunas Douradas
      const baseGeo = new THREE.CylinderGeometry(0.65, 0.75, 0.3, 32);
      const baseMesh = new THREE.Mesh(baseGeo, silverMaterial);
      baseMesh.position.y = -0.7;
      group.add(baseMesh);

      // Globo Terrestre Dourado
      const globeGeo = new THREE.SphereGeometry(0.52, 32, 32);
      const globeMesh = new THREE.Mesh(globeGeo, goldMaterial);
      globeMesh.position.y = 0.35;
      group.add(globeMesh);

      // Colunas helicoidais
      const pillarGeo = new THREE.TorusGeometry(0.48, 0.08, 16, 48);
      const pillarMesh = new THREE.Mesh(pillarGeo, goldMaterial);
      pillarMesh.rotation.x = Math.PI / 2.3;
      pillarMesh.position.y = -0.2;
      group.add(pillarMesh);

    } else if (tipo === 'brasileirao') {
      // Taça Esgia e Dourada
      const baseGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.4, 24);
      const baseMesh = new THREE.Mesh(baseGeo, woodBaseMaterial);
      baseMesh.position.y = -0.7;
      group.add(baseMesh);

      // Corpo da Taça
      const cupGeo = new THREE.ConeGeometry(0.6, 1.3, 24, 1, true);
      const cupMesh = new THREE.Mesh(cupGeo, goldMaterial);
      cupMesh.rotation.x = Math.PI;
      cupMesh.position.y = 0.15;
      group.add(cupMesh);

      // Alças laterais
      const handleGeo = new THREE.TorusGeometry(0.4, 0.05, 12, 24, Math.PI);
      const handleMeshL = new THREE.Mesh(handleGeo, goldMaterial);
      handleMeshL.position.set(-0.55, 0.2, 0);
      handleMeshL.rotation.z = -Math.PI / 2;
      group.add(handleMeshL);

      const handleMeshR = new THREE.Mesh(handleGeo, goldMaterial);
      handleMeshR.position.set(0.55, 0.2, 0);
      handleMeshR.rotation.z = Math.PI / 2;
      group.add(handleMeshR);

    } else if (tipo === 'copa_brasil') {
      // Taça Prateada com Alças Largas
      const baseGeo = new THREE.CylinderGeometry(0.6, 0.7, 0.35, 24);
      const baseMesh = new THREE.Mesh(baseGeo, silverMaterial);
      baseMesh.position.y = -0.7;
      group.add(baseMesh);

      const cupGeo = new THREE.SphereGeometry(0.58, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.75);
      const cupMesh = new THREE.Mesh(cupGeo, silverMaterial);
      cupMesh.position.y = 0.05;
      group.add(cupMesh);

    } else {
      // Troféu Estadual / Genérico Dourado
      const baseGeo = new THREE.BoxGeometry(0.8, 0.3, 0.8);
      const baseMesh = new THREE.Mesh(baseGeo, woodBaseMaterial);
      baseMesh.position.y = -0.7;
      group.add(baseMesh);

      const cupGeo = new THREE.OctahedronGeometry(0.55);
      const cupMesh = new THREE.Mesh(cupGeo, goldMaterial);
      cupMesh.position.y = 0.1;
      group.add(cupMesh);
    }

    scene.add(group);

    // Animação de rotação contínua e interativa
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (!isDraggingRef.current) {
        group.rotation.y += 0.008; // Rotação sutil automática
      }
      renderer.render(scene, camera);
    };
    animate();

    // Eventos de Touch e Mouse para Rotação Manual 360°
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
      className={`relative group p-4 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] shadow-sm ${
        darkMode ? 'bg-[#1B1A17] border-[#38332B] hover:border-[#85573B]' : 'bg-white border-[#E2D7C7] hover:border-[#85573B]'
      }`}
    >
      {/* Badge da Quantidade Conquistada */}
      <div className="absolute top-3 right-3 z-10">
        <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-full bg-[#85573B] text-white shadow-md">
          {trofeu.quantidade}x
        </span>
      </div>

      {/* Canvas 3D */}
      <div 
        ref={mountRef} 
        className="w-full h-48 flex items-center justify-center overflow-hidden touch-none"
        title="Arraste para girar em 3D"
      />

      {/* Metadados do Troféu */}
      <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm font-editorial text-primary truncate">
            {trofeu.torneio}
          </h4>
          <ChevronRight className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
        </div>
        <p className="text-[11px] font-mono text-secondary truncate">
          {trofeu.anos_conquistados}
        </p>
      </div>
    </div>
  );
}
