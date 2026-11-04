import * as THREE from 'three';

// ============================================================================
// GERADOR DE TEXTURAS E ENVIRONMENT MAP PROCEDURAL (HDRI STUDIO)
// ============================================================================
export function createStudioEnvironment(renderer, preset = 'warm') {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const envScene = new THREE.Scene();

  const presets = {
    warm: {
      bg: 0x1a1714,
      topLight: 0xfff8e7,
      keyLight: 0xffdf9e,
      rimLight: 0xffffff,
      fillLight: 0x9ec5ff,
      groundBounce: 0x5c4938
    },
    stadium: {
      bg: 0x0b131e,
      topLight: 0xe6f2ff,
      keyLight: 0xffffff,
      rimLight: 0x70b5ff,
      fillLight: 0x38ef7d,
      groundBounce: 0x1e3c24
    },
    dramatic: {
      bg: 0x060608,
      topLight: 0xffd27d,
      keyLight: 0xffae34,
      rimLight: 0xffffff,
      fillLight: 0x444455,
      groundBounce: 0x2a1c0e
    }
  };

  const p = presets[preset] || presets.warm;
  envScene.background = new THREE.Color(p.bg);

  const softboxGeo = new THREE.PlaneGeometry(10, 10);

  // Softbox Superior (Teto de estúdio)
  const topBox = new THREE.Mesh(
    softboxGeo,
    new THREE.MeshBasicMaterial({ color: p.topLight, side: THREE.DoubleSide })
  );
  topBox.position.set(0, 9, 0);
  topBox.rotation.x = Math.PI / 2;
  envScene.add(topBox);

  // Key Light Frontal Direita
  const keyStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 14),
    new THREE.MeshBasicMaterial({ color: p.keyLight, side: THREE.DoubleSide })
  );
  keyStrip.position.set(7, 2, 7);
  keyStrip.lookAt(0, 0, 0);
  envScene.add(keyStrip);

  // Rim Light Esquerda
  const rimStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 14),
    new THREE.MeshBasicMaterial({ color: p.rimLight, side: THREE.DoubleSide })
  );
  rimStrip.position.set(-8, 3, 4);
  rimStrip.lookAt(0, 0, 0);
  envScene.add(rimStrip);

  // Back Light Traseira
  const backStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 10),
    new THREE.MeshBasicMaterial({ color: p.fillLight, side: THREE.DoubleSide })
  );
  backStrip.position.set(0, 4, -9);
  backStrip.lookAt(0, 0, 0);
  envScene.add(backStrip);

  // Piso refletivo quente
  const floorDisk = new THREE.Mesh(
    new THREE.CircleGeometry(14, 32),
    new THREE.MeshBasicMaterial({ color: p.groundBounce, side: THREE.DoubleSide })
  );
  floorDisk.position.set(0, -7, 0);
  floorDisk.rotation.x = -Math.PI / 2;
  envScene.add(floorDisk);

  const envMap = pmremGenerator.fromScene(envScene, 0.035).texture;
  pmremGenerator.dispose();
  return envMap;
}

// Textura procedural para gomos de bola de futebol + relevos
export function createSoccerBumpTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 4.5;

  const stepX = 64;
  const stepY = 48;
  for (let y = -stepY; y < 256 + stepY; y += stepY) {
    for (let x = -stepX; x < 512 + stepX; x += stepX) {
      const offsetX = (Math.floor(y / stepY) % 2) * (stepX / 2);
      const cx = x + offsetX;
      const cy = y;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px = cx + Math.cos(angle) * 26;
        const py = cy + Math.sin(angle) * 22;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Textura de Relevo dos Continentes
export function createContinentsReliefTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#555555';
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = '#ffffff';

  // América do Sul
  ctx.beginPath();
  ctx.moveTo(165, 115);
  ctx.bezierCurveTo(195, 115, 215, 145, 200, 175);
  ctx.bezierCurveTo(188, 205, 175, 230, 168, 242);
  ctx.bezierCurveTo(160, 220, 152, 185, 150, 150);
  ctx.closePath();
  ctx.fill();

  // América do Norte
  ctx.beginPath();
  ctx.moveTo(95, 35);
  ctx.bezierCurveTo(155, 35, 170, 75, 155, 108);
  ctx.bezierCurveTo(130, 100, 105, 75, 95, 35);
  ctx.fill();

  // Europa / África
  ctx.beginPath();
  ctx.arc(285, 75, 28, 0, Math.PI * 2);
  ctx.arc(290, 150, 38, 0, Math.PI * 2);
  ctx.fill();

  // Ásia / Oceania
  ctx.beginPath();
  ctx.arc(380, 85, 52, 0, Math.PI * 2);
  ctx.arc(430, 195, 22, 0, Math.PI * 2);
  ctx.fill();

  // Linhas sutis
  ctx.strokeStyle = '#777777';
  ctx.lineWidth = 1.5;
  for (let x = 32; x < 512; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 32; y < 256; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

// Textura do Cilindro de Plaquinhas da Libertadores
export function createPlaqueGridTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#240f08';
  ctx.fillRect(0, 0, 1024, 512);

  const cols = 12;
  const rows = 8;
  const padX = 6;
  const padY = 5;
  const w = 1024 / cols;
  const h = (512 * 0.84) / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * w + padX;
      const y = r * h + padY + 12;
      const pw = w - padX * 2;
      const ph = h - padY * 2;

      const grad = ctx.createLinearGradient(x, y, x + pw, y + ph);
      grad.addColorStop(0, '#e8ecf2');
      grad.addColorStop(0.5, '#b8bec7');
      grad.addColorStop(1, '#d8dde6');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, pw, ph);

      ctx.strokeStyle = '#5c4332';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, pw, ph);

      const colors = ['#c8102e', '#004b87', '#115e38', '#1a1a1a', '#d4af37'];
      ctx.fillStyle = colors[(r * 3 + c) % colors.length];
      ctx.beginPath();
      ctx.arc(x + pw * 0.22, y + ph * 0.5, ph * 0.28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#2b2b2b';
      ctx.fillRect(x + pw * 0.42, y + ph * 0.28, pw * 0.46, 3);
      ctx.fillRect(x + pw * 0.42, y + ph * 0.56, pw * 0.34, 2.5);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

// Faixa com texto gravado (Brasileirão e Copa do Brasil)
export function createTextBandTexture(text, bgColor = '#d8dee6', textColor = '#c59216', borderGreen = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 1024, 160);

  if (borderGreen) {
    ctx.fillStyle = '#009c3b';
    ctx.fillRect(0, 126, 1024, 18);
    ctx.fillStyle = '#ffdf00';
    ctx.fillRect(0, 144, 1024, 16);
  }

  ctx.font = '900 68px "Arial Black", Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#3a2b05';
  ctx.fillText(text, 515, 72);
  ctx.fillStyle = textColor;
  ctx.fillText(text, 512, 68);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

// Placas FERJ do Carioca
export function createFerjPlaqueTexture(isFront = true) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 256, 320);
  grad.addColorStop(0, '#fcfcfc');
  grad.addColorStop(0.5, '#eef0f3');
  grad.addColorStop(1, '#dcdfe4');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 320);

  ctx.strokeStyle = '#c5a03f';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 244, 308);

  ctx.fillStyle = '#181818';
  ctx.beginPath();
  ctx.arc(62, 66, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'italic 900 34px Arial, sans-serif';
  ctx.fillStyle = '#141414';
  ctx.fillText('FERJ', 88, 78);

  ctx.fillStyle = '#c8102e';
  ctx.fillRect(88, 84, 112, 5);

  if (isFront) {
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillStyle = '#555555';
    ctx.textAlign = 'center';
    ctx.fillText('CAMPEÃO ESTADUAL', 128, 138);
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillStyle = '#b08b2e';
    ctx.fillText('SÉRIE A', 128, 170);

    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.strokeRect(72, 200, 112, 66);
    ctx.font = '900 26px Arial, sans-serif';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillText('RIO', 128, 242);
  } else {
    ctx.font = '900 28px Arial, sans-serif';
    ctx.fillStyle = '#a6192e';
    ctx.textAlign = 'center';
    ctx.fillText('RIO', 128, 165);
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillStyle = '#1f2937';
    ctx.fillText('ESTADUAL', 128, 210);
  }

  return new THREE.CanvasTexture(canvas);
}

// ============================================================================
// MATERIAIS PBR
// ============================================================================
export function createMaterials(wireframe = false, soccerBump = null, globeBump = null) {
  return {
    goldPolished: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffc942),
      metalness: 0.96,
      roughness: 0.11,
      clearcoat: 0.65,
      clearcoatRoughness: 0.08,
      reflectivity: 1.0,
      wireframe
    }),
    goldBrushed: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xe2aa2b),
      metalness: 0.91,
      roughness: 0.26,
      clearcoat: 0.35,
      wireframe
    }),
    copperRose: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xd97f6c),
      metalness: 0.88,
      roughness: 0.22,
      clearcoat: 0.5,
      wireframe
    }),
    silverPolished: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xf6f8fb),
      metalness: 0.98,
      roughness: 0.08,
      clearcoat: 0.78,
      clearcoatRoughness: 0.06,
      wireframe
    }),
    silverBrushed: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xdce1e9),
      metalness: 0.93,
      roughness: 0.22,
      clearcoat: 0.38,
      wireframe
    }),
    silverAntique: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xcfd5df),
      metalness: 0.92,
      roughness: 0.28,
      bumpMap: soccerBump,
      bumpScale: 0.015,
      clearcoat: 0.3,
      wireframe
    }),
    silverBall: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xf2f5fa),
      metalness: 0.95,
      roughness: 0.15,
      bumpMap: soccerBump,
      bumpScale: 0.024,
      clearcoat: 0.55,
      wireframe
    }),
    goldBall: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffca45),
      metalness: 0.97,
      roughness: 0.12,
      bumpMap: soccerBump,
      bumpScale: 0.032,
      clearcoat: 0.7,
      wireframe
    }),
    whiteCeramicGlobe: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xf8f6f0),
      metalness: 0.15,
      roughness: 0.2,
      clearcoat: 0.85,
      wireframe
    }),
    mahoganyWood: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x361509),
      metalness: 0.06,
      roughness: 0.32,
      clearcoat: 0.85,
      clearcoatRoughness: 0.14,
      wireframe
    }),
    blackMarble: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x141518),
      metalness: 0.15,
      roughness: 0.16,
      clearcoat: 0.92,
      clearcoatRoughness: 0.08,
      wireframe
    }),
    emeraldAccent: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0c7a3e),
      metalness: 0.35,
      roughness: 0.2,
      clearcoat: 0.8,
      wireframe
    }),
    orangeRibbon: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xe6531c),
      metalness: 0.1,
      roughness: 0.4,
      side: THREE.DoubleSide,
      wireframe
    }),
    greenRibbon: new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x12823b),
      metalness: 0.1,
      roughness: 0.4,
      side: THREE.DoubleSide,
      wireframe
    })
  };
}

// ============================================================================
// 1. COPA LIBERTADORES DA AMÉRICA
// ============================================================================
export function buildLibertadoresTrophy(mats) {
  const group = new THREE.Group();

  const woodBaseBottom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.76, 0.79, 0.24, 64),
    mats.mahoganyWood
  );
  woodBaseBottom.position.y = -2.18;
  group.add(woodBaseBottom);

  const bottomSilverRim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.81, 0.03, 64),
    mats.silverPolished
  );
  bottomSilverRim.position.y = -2.3;
  group.add(bottomSilverRim);

  const plaqueTex = createPlaqueGridTexture();
  const plaqueCylinderMat = new THREE.MeshPhysicalMaterial({
    map: plaqueTex,
    metalness: 0.75,
    roughness: 0.22,
    clearcoat: 0.6,
    wireframe: mats.goldPolished.wireframe
  });
  const woodColumn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.74, 0.76, 1.55, 64),
    plaqueCylinderMat
  );
  woodColumn.position.y = -1.28;
  group.add(woodColumn);

  const plaqueGeo = new THREE.BoxGeometry(0.16, 0.11, 0.018);
  const rows = 8;
  const cols = 12;
  for (let r = 0; r < rows; r++) {
    const y = -1.86 + r * 0.175;
    const rad = 0.752 - r * 0.002;
    for (let c = 0; c < cols; c++) {
      const a = (c / cols) * Math.PI * 2;
      const p = new THREE.Mesh(
        plaqueGeo,
        (r + c) % 5 === 0 ? mats.goldBrushed : mats.silverBrushed
      );
      p.position.set(Math.sin(a) * rad, y, Math.cos(a) * rad);
      p.rotation.y = a;
      group.add(p);
    }
  }

  const neckProfile = [
    new THREE.Vector2(0.75, -0.5),
    new THREE.Vector2(0.75, -0.42),
    new THREE.Vector2(0.68, -0.32),
    new THREE.Vector2(0.62, -0.22),
    new THREE.Vector2(0.48, -0.15),
    new THREE.Vector2(0.32, 0.02),
    new THREE.Vector2(0.22, 0.35),
    new THREE.Vector2(0.18, 0.72),
    new THREE.Vector2(0.16, 0.92),
    new THREE.Vector2(0.26, 0.98),
    new THREE.Vector2(0.18, 1.05)
  ];
  const neckMesh = new THREE.Mesh(
    new THREE.LatheGeometry(neckProfile, 64),
    mats.silverPolished
  );
  group.add(neckMesh);

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const fluteCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.sin(a) * 0.42, -0.12, Math.cos(a) * 0.42),
      new THREE.Vector3(Math.sin(a) * 0.23, 0.35, Math.cos(a) * 0.23),
      new THREE.Vector3(Math.sin(a) * 0.17, 0.88, Math.cos(a) * 0.17)
    ]);
    const flute = new THREE.Mesh(
      new THREE.TubeGeometry(fluteCurve, 20, 0.016, 8, false),
      mats.silverBrushed
    );
    group.add(flute);
  }

  const globeRadius = 0.62;
  const globeCenterY = 1.56;
  const silverSphere = new THREE.Mesh(
    new THREE.SphereGeometry(globeRadius, 64, 64),
    mats.silverPolished
  );
  silverSphere.position.y = globeCenterY;
  group.add(silverSphere);

  const equatorialBand = new THREE.Mesh(
    new THREE.CylinderGeometry(globeRadius + 0.018, globeRadius + 0.018, 0.18, 64),
    mats.silverBrushed
  );
  equatorialBand.position.y = globeCenterY;
  group.add(equatorialBand);

  [-0.09, 0.09].forEach((dy) => {
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(globeRadius + 0.02, 0.014, 16, 64),
      mats.silverPolished
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = globeCenterY + dy;
    group.add(rim);
  });

  const frontMedallion = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.035, 32),
    mats.copperRose
  );
  frontMedallion.rotation.x = Math.PI / 2;
  frontMedallion.position.set(0, globeCenterY + 0.01, globeRadius + 0.015);
  group.add(frontMedallion);

  const seamCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.38, globeCenterY - 0.08, 0.49),
    new THREE.Vector3(-0.22, globeCenterY - 0.28, 0.52),
    new THREE.Vector3(0, globeCenterY - 0.35, 0.53),
    new THREE.Vector3(0.22, globeCenterY - 0.28, 0.52),
    new THREE.Vector3(0.38, globeCenterY - 0.08, 0.49)
  ]);
  const seamTube = new THREE.Mesh(
    new THREE.TubeGeometry(seamCurve, 32, 0.012, 8, false),
    mats.silverBrushed
  );
  group.add(seamTube);

  [-1, 1].forEach((side) => {
    const ear = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.02, 12, 24),
      mats.silverPolished
    );
    ear.position.set(side * (globeRadius + 0.01), globeCenterY, 0);
    ear.scale.set(0.6, 1.2, 0.5);
    group.add(ear);
  });

  const playerPedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.11, 0.12, 24),
    mats.silverPolished
  );
  playerPedestal.position.y = globeCenterY + globeRadius + 0.04;
  group.add(playerPedestal);

  const player = new THREE.Group();
  player.position.y = globeCenterY + globeRadius + 0.1;

  const legSupport = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.014, 0.24, 12),
    mats.silverPolished
  );
  legSupport.position.set(0.02, 0.11, 0);
  legSupport.rotation.z = -0.15;
  player.add(legSupport);

  const legKick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.017, 0.013, 0.22, 12),
    mats.silverPolished
  );
  legKick.position.set(-0.06, 0.13, 0.03);
  legKick.rotation.z = 0.65;
  player.add(legKick);

  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.042, 0.026, 0.18, 14),
    mats.silverPolished
  );
  torso.position.set(-0.01, 0.28, 0);
  torso.rotation.z = 0.18;
  player.add(torso);

  const arms = new THREE.Mesh(
    new THREE.CylinderGeometry(0.013, 0.013, 0.28, 10),
    mats.silverPolished
  );
  arms.position.set(-0.01, 0.32, 0);
  arms.rotation.z = 1.1;
  player.add(arms);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.038, 16, 16),
    mats.silverPolished
  );
  head.position.set(-0.03, 0.41, 0);
  player.add(head);

  group.add(player);
  return group;
}

// ============================================================================
// 2. CAMPEONATO BRASILEIRO SÉRIE A
// ============================================================================
export function buildBrasileiraoTrophy(mats) {
  const group = new THREE.Group();

  const baseTex = createTextBandTexture('BRASILEIRÃO', '#e5e9f0', '#b88917', false);
  const baseConeMat = new THREE.MeshPhysicalMaterial({
    map: baseTex,
    metalness: 0.94,
    roughness: 0.12,
    clearcoat: 0.7,
    wireframe: mats.silverPolished.wireframe
  });

  const baseCone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.68, 0.96, 0.72, 64),
    baseConeMat
  );
  baseCone.position.y = -1.88;
  group.add(baseCone);

  const greenCollar = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.028, 16, 64),
    mats.emeraldAccent
  );
  greenCollar.rotation.x = Math.PI / 2;
  greenCollar.position.y = -1.51;
  group.add(greenCollar);

  const silverFlankCurve = [
    new THREE.Vector2(0.67, -1.5),
    new THREE.Vector2(0.54, -0.75),
    new THREE.Vector2(0.52, -0.1),
    new THREE.Vector2(0.68, 0.65),
    new THREE.Vector2(0.95, 1.45),
    new THREE.Vector2(1.18, 2.08),
    new THREE.Vector2(1.1, 2.08),
    new THREE.Vector2(0.84, 1.35),
    new THREE.Vector2(0.45, 0.2),
    new THREE.Vector2(0.0, -1.4)
  ];
  const silverVessel = new THREE.Mesh(
    new THREE.LatheGeometry(silverFlankCurve, 64),
    mats.silverPolished
  );
  silverVessel.scale.set(1.08, 1.0, 0.52);
  group.add(silverVessel);

  [-1, 1].forEach((side) => {
    const wingCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.66, -1.48, 0),
      new THREE.Vector3(side * 0.52, -0.35, 0),
      new THREE.Vector3(side * 0.76, 0.85, 0),
      new THREE.Vector3(side * 1.18, 2.1, 0)
    ]);
    const wing = new THREE.Mesh(
      new THREE.TubeGeometry(wingCurve, 40, 0.085, 4, false),
      mats.silverBrushed
    );
    wing.scale.set(0.9, 1.0, 0.45);
    group.add(wing);
  });

  const diamondShape = new THREE.Shape();
  diamondShape.moveTo(-0.28, -1.5);
  diamondShape.lineTo(0.28, -1.5);
  diamondShape.quadraticCurveTo(0.24, -0.8, 0.48, -0.05);
  diamondShape.lineTo(0.0, 1.28);
  diamondShape.lineTo(-0.48, -0.05);
  diamondShape.quadraticCurveTo(-0.24, -0.8, -0.28, -1.5);
  diamondShape.closePath();

  const holePath = new THREE.Path();
  holePath.absarc(0, -0.02, 0.36, 0, Math.PI * 2, false);
  diamondShape.holes.push(holePath);

  const goldDiamondHolder = new THREE.Mesh(
    new THREE.ExtrudeGeometry(diamondShape, {
      depth: 0.32,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 4
    }),
    mats.goldPolished
  );
  goldDiamondHolder.position.set(0, 0, -0.16);
  group.add(goldDiamondHolder);

  const centerGoldBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.41, 64, 64),
    mats.goldBall
  );
  centerGoldBall.position.set(0, -0.02, 0.08);
  group.add(centerGoldBall);

  return group;
}

// ============================================================================
// 3. COPA DO BRASIL
// ============================================================================
export function buildCopaDoBrasilTrophy(mats) {
  const group = new THREE.Group();

  const baseProfile = [
    new THREE.Vector2(0.0, -2.28),
    new THREE.Vector2(1.06, -2.28),
    new THREE.Vector2(1.02, -1.78),
    new THREE.Vector2(0.92, -1.72),
    new THREE.Vector2(0.82, -1.68),
    new THREE.Vector2(0.8, -1.42),
    new THREE.Vector2(0.52, -1.32),
    new THREE.Vector2(0.46, -1.18),
    new THREE.Vector2(0.82, -0.62),
    new THREE.Vector2(0.98, -0.15),
    new THREE.Vector2(1.08, 0.65),
    new THREE.Vector2(1.02, 1.25),
    new THREE.Vector2(0.82, 1.42),
    new THREE.Vector2(0.54, 1.44),
    new THREE.Vector2(0.54, 1.66),
    new THREE.Vector2(0.48, 1.66),
    new THREE.Vector2(0.48, 1.35),
    new THREE.Vector2(0.0, 1.25)
  ];
  const chromeCup = new THREE.Mesh(
    new THREE.LatheGeometry(baseProfile, 64),
    mats.silverPolished
  );
  group.add(chromeCup);

  [-1.68, -1.42, 1.65].forEach((yPos, idx) => {
    const r = idx === 0 ? 0.84 : idx === 1 ? 0.78 : 0.54;
    const goldTrim = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.018, 16, 64),
      mats.goldPolished
    );
    goldTrim.rotation.x = Math.PI / 2;
    goldTrim.position.y = yPos;
    group.add(goldTrim);
  });

  const ringTex = createTextBandTexture('COPA DO BRASIL', '#cfd6df', '#d4a017', true);
  const ringMat = new THREE.MeshPhysicalMaterial({
    map: ringTex,
    metalness: 0.9,
    roughness: 0.15,
    clearcoat: 0.6,
    wireframe: mats.silverPolished.wireframe
  });
  const textBelt = new THREE.Mesh(
    new THREE.CylinderGeometry(1.12, 1.12, 0.34, 64, 1, true),
    ringMat
  );
  textBelt.position.y = -0.32;
  group.add(textBelt);

  const beltRimTop = new THREE.Mesh(
    new THREE.TorusGeometry(1.1, 0.025, 16, 64),
    mats.silverPolished
  );
  beltRimTop.rotation.x = Math.PI / 2;
  beltRimTop.position.y = -0.15;
  group.add(beltRimTop);

  const beltRimBot = new THREE.Mesh(
    new THREE.TorusGeometry(1.1, 0.025, 16, 64),
    mats.goldPolished
  );
  beltRimBot.rotation.x = Math.PI / 2;
  beltRimBot.position.y = -0.49;
  group.add(beltRimBot);

  const badgeFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.72, 0.08),
    mats.silverPolished
  );
  badgeFrame.position.set(0, 0.76, 1.02);
  badgeFrame.rotation.x = 0.08;
  group.add(badgeFrame);

  const crossV = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.56, 0.11),
    mats.silverBrushed
  );
  crossV.position.set(0, 0.76, 1.03);
  crossV.rotation.x = 0.08;
  group.add(crossV);

  const crossH = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.22, 0.11),
    mats.silverBrushed
  );
  crossH.position.set(0, 0.76, 1.03);
  crossH.rotation.x = 0.08;
  group.add(crossH);

  const cbfGoldCenter = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.12, 0.13),
    mats.goldPolished
  );
  cbfGoldCenter.position.set(0, 0.76, 1.04);
  cbfGoldCenter.rotation.x = 0.08;
  group.add(cbfGoldCenter);

  [-1, 1].forEach((side) => {
    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.92, 1.32, 0),
      new THREE.Vector3(side * 1.42, 1.36, 0),
      new THREE.Vector3(side * 1.34, 0.55, 0),
      new THREE.Vector3(side * 1.08, -0.18, 0)
    ]);
    const handle = new THREE.Mesh(
      new THREE.TubeGeometry(handleCurve, 32, 0.065, 16, false),
      mats.silverPolished
    );
    handle.scale.z = 0.45;
    group.add(handle);

    const ribbonCurve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 1.18, 1.36, 0.12),
      new THREE.Vector3(side * 1.24, 0.35, 0.18),
      new THREE.Vector3(side * 1.32, -0.75, 0.22),
      new THREE.Vector3(side * 1.42, -1.75, 0.26)
    ]);
    const ribbonOrange = new THREE.Mesh(
      new THREE.TubeGeometry(ribbonCurve1, 32, 0.08, 8, false),
      mats.orangeRibbon
    );
    ribbonOrange.scale.set(1.1, 1.0, 0.15);
    group.add(ribbonOrange);

    const ribbonCurve2 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 1.15, 1.32, -0.05),
      new THREE.Vector3(side * 1.2, 0.25, -0.08),
      new THREE.Vector3(side * 1.26, -0.85, -0.1),
      new THREE.Vector3(side * 1.34, -1.65, -0.12)
    ]);
    const ribbonGreen = new THREE.Mesh(
      new THREE.TubeGeometry(ribbonCurve2, 32, 0.07, 8, false),
      mats.greenRibbon
    );
    ribbonGreen.scale.set(1.1, 1.0, 0.15);
    group.add(ribbonGreen);
  });

  return group;
}

// ============================================================================
// 4. CAMPEONATO PAULISTA
// ============================================================================
export function buildPaulistaoTrophy(mats) {
  const group = new THREE.Group();

  const greenUnderRing = new THREE.Mesh(
    new THREE.CylinderGeometry(1.06, 1.1, 0.08, 64),
    mats.emeraldAccent
  );
  greenUnderRing.position.y = -2.24;
  group.add(greenUnderRing);

  const silverBaseCone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.68, 1.06, 0.62, 64),
    mats.silverPolished
  );
  silverBaseCone.position.y = -1.9;
  group.add(silverBaseCone);

  const bodyPoints = [
    new THREE.Vector2(0.56, -1.6),
    new THREE.Vector2(0.52, -0.7),
    new THREE.Vector2(0.66, 0.45),
    new THREE.Vector2(0.86, 1.65),
    new THREE.Vector2(0.92, 2.15),
    new THREE.Vector2(0.85, 2.15),
    new THREE.Vector2(0.76, 1.5),
    new THREE.Vector2(0.0, 1.3)
  ];
  const chromeCylinder = new THREE.Mesh(
    new THREE.LatheGeometry(bodyPoints, 64),
    mats.silverPolished
  );
  group.add(chromeCylinder);

  const centerSpine = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 1.65, 0.06),
    mats.silverBrushed
  );
  centerSpine.position.set(-0.04, 1.32, 0.78);
  centerSpine.rotation.x = -0.11;
  group.add(centerSpine);

  const hexShield = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.06, 6),
    mats.silverPolished
  );
  hexShield.rotation.x = Math.PI / 2 - 0.11;
  hexShield.position.set(0.22, 1.52, 0.78);
  group.add(hexShield);

  const numFeathers = 9;
  for (let i = 0; i < numFeathers; i++) {
    const t = i / (numFeathers - 1);
    const featherCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.45 - t * 0.12, -1.55 + t * 0.12, 0.48),
      new THREE.Vector3(0.15 - t * 0.18, -0.75 + t * 0.24, 0.65),
      new THREE.Vector3(-0.32 - t * 0.14, 0.15 + t * 0.32, 0.68),
      new THREE.Vector3(-0.72 - t * 0.08, 0.95 + t * 0.28, 0.42)
    ]);
    const featherTube = new THREE.Mesh(
      new THREE.TubeGeometry(featherCurve, 36, 0.062 - t * 0.015, 12, false),
      i % 2 === 0 ? mats.goldPolished : mats.goldBrushed
    );
    featherTube.scale.set(1.15, 1.0, 0.42);
    group.add(featherTube);
  }

  const rightStrutCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.48, -1.4, 0.35),
    new THREE.Vector3(0.62, 0.2, 0.52),
    new THREE.Vector3(0.78, 2.15, 0.48)
  ]);
  const rightStrut = new THREE.Mesh(
    new THREE.TubeGeometry(rightStrutCurve, 32, 0.035, 12, false),
    mats.goldPolished
  );
  group.add(rightStrut);

  return group;
}

// ============================================================================
// 5. COPA RIO INTERNACIONAL 1951
// ============================================================================
export function buildCopaRio51Trophy(mats) {
  const group = new THREE.Group();

  const whitePlinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.76, 0.78, 0.14, 64),
    mats.silverPolished
  );
  whitePlinth.position.y = -2.24;
  group.add(whitePlinth);

  const urnProfile = [
    new THREE.Vector2(0.58, -2.16),
    new THREE.Vector2(0.52, -2.02),
    new THREE.Vector2(0.24, -1.72),
    new THREE.Vector2(0.18, -1.42),
    new THREE.Vector2(0.36, -1.32),
    new THREE.Vector2(0.34, -1.2),
    new THREE.Vector2(0.22, -1.12),
    new THREE.Vector2(0.62, -0.78),
    new THREE.Vector2(0.82, -0.25),
    new THREE.Vector2(0.92, 0.55),
    new THREE.Vector2(0.98, 0.62),
    new THREE.Vector2(0.98, 0.92),
    new THREE.Vector2(0.88, 0.96),
    new THREE.Vector2(0.76, 1.18),
    new THREE.Vector2(0.32, 1.32),
    new THREE.Vector2(0.16, 1.48),
    new THREE.Vector2(0.32, 1.62),
    new THREE.Vector2(0.1, 1.85),
    new THREE.Vector2(0.0, 1.92)
  ];
  const silverUrn = new THREE.Mesh(
    new THREE.LatheGeometry(urnProfile, 64),
    mats.silverPolished
  );
  group.add(silverUrn);

  const numLeaves = 14;
  for (let i = 0; i < numLeaves; i++) {
    const a = (i / numLeaves) * Math.PI * 2;
    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.68, 5),
      mats.silverAntique
    );
    leaf.position.set(Math.sin(a) * 0.72, -0.58, Math.cos(a) * 0.72);
    leaf.rotation.y = a;
    leaf.rotation.x = 0.35;
    leaf.scale.set(1.0, 1.0, 0.35);
    group.add(leaf);
  }

  const upperBand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.99, 0.99, 0.26, 48),
    mats.silverAntique
  );
  upperBand.position.y = 0.77;
  group.add(upperBand);

  const pineconeFinial = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 16, 16),
    mats.silverAntique
  );
  pineconeFinial.position.y = 2.08;
  pineconeFinial.scale.set(0.85, 1.35, 0.85);
  group.add(pineconeFinial);

  [-1, 1].forEach((side) => {
    const handleCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(side * 0.95, 0.82, 0),
        new THREE.Vector3(side * 0.98, 1.18, 0),
        new THREE.Vector3(side * 1.42, 1.12, 0),
        new THREE.Vector3(side * 1.38, 0.32, 0),
        new THREE.Vector3(side * 1.12, -0.38, 0),
        new THREE.Vector3(side * 0.56, -0.88, 0)
      ],
      false,
      'catmullrom',
      0.15
    );
    const handleMesh = new THREE.Mesh(
      new THREE.TubeGeometry(handleCurve, 48, 0.042, 12, false),
      mats.silverPolished
    );
    handleMesh.scale.z = 0.55;
    group.add(handleMesh);
  });

  return group;
}

// ============================================================================
// 6. COPA INTERCONTINENTAL / MUNDIAL DE CLUBES FIFA
// ============================================================================
export function buildIntercontinentalFifaTrophy(mats) {
  const group = new THREE.Group();

  const bottomRim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.74, 0.1, 64),
    mats.goldPolished
  );
  bottomRim.position.y = -2.26;
  group.add(bottomRim);

  const conicalGoldBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.7, 0.72, 64),
    mats.goldPolished
  );
  conicalGoldBase.position.y = -1.86;
  group.add(conicalGoldBase);

  const baseTopRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 0.08, 64),
    mats.goldBrushed
  );
  baseTopRing.position.y = -1.48;
  group.add(baseTopRing);

  const numBlades = 6;
  for (let i = 0; i < numBlades; i++) {
    const startAngle = (i / numBlades) * Math.PI * 2;
    const twist = 0.58;
    const bladeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(
        Math.sin(startAngle) * 0.42,
        -1.45,
        Math.cos(startAngle) * 0.42
      ),
      new THREE.Vector3(
        Math.sin(startAngle + twist * 0.35) * 0.22,
        -0.45,
        Math.cos(startAngle + twist * 0.35) * 0.22
      ),
      new THREE.Vector3(
        Math.sin(startAngle + twist * 0.7) * 0.19,
        0.55,
        Math.cos(startAngle + twist * 0.7) * 0.19
      ),
      new THREE.Vector3(
        Math.sin(startAngle + twist) * 0.52,
        1.78,
        Math.cos(startAngle + twist) * 0.52
      )
    ]);

    const blade = new THREE.Mesh(
      new THREE.TubeGeometry(bladeCurve, 48, 0.052, 8, false),
      i % 2 === 0 ? mats.goldPolished : mats.goldBrushed
    );
    blade.scale.set(1.15, 1.0, 0.65);
    group.add(blade);
  }

  const globeY = 1.82;
  const whiteSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.49, 64, 64),
    mats.whiteCeramicGlobe
  );
  whiteSphere.position.y = globeY;
  group.add(whiteSphere);

  const goldContinentsCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.498, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.55),
    mats.goldPolished
  );
  goldContinentsCap.position.y = globeY;
  goldContinentsCap.rotation.z = 0.22;
  group.add(goldContinentsCap);

  return group;
}

// ============================================================================
// 7. CAMPEONATO CARIOCA FERJ
// ============================================================================
export function buildCariocaFerjTrophy(mats) {
  const group = new THREE.Group();

  const woodPedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.92, 0.92, 0.76, 8),
    mats.mahoganyWood
  );
  woodPedestal.position.y = -1.92;
  woodPedestal.rotation.y = Math.PI / 8;
  group.add(woodPedestal);

  const frontPlaqueMat = new THREE.MeshPhysicalMaterial({
    map: createFerjPlaqueTexture(true),
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 0.5
  });
  const sidePlaqueMat = new THREE.MeshPhysicalMaterial({
    map: createFerjPlaqueTexture(false),
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 0.5
  });

  const centerPlaque = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.66, 0.03),
    frontPlaqueMat
  );
  centerPlaque.position.set(0, -1.92, 0.855);
  group.add(centerPlaque);

  [-1, 1].forEach((side) => {
    const sPlaque = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.66, 0.03),
      sidePlaqueMat
    );
    const angle = side * (Math.PI / 4);
    sPlaque.position.set(Math.sin(angle) * 0.855, -1.92, Math.cos(angle) * 0.855);
    sPlaque.rotation.y = angle;
    group.add(sPlaque);
  });

  const cupProfile = [
    new THREE.Vector2(0.56, -1.54),
    new THREE.Vector2(0.52, -1.42),
    new THREE.Vector2(0.38, -1.25),
    new THREE.Vector2(0.18, -0.95),
    new THREE.Vector2(0.28, -0.82),
    new THREE.Vector2(0.18, -0.72),
    new THREE.Vector2(0.32, -0.58),
    new THREE.Vector2(0.68, -0.22),
    new THREE.Vector2(0.84, 0.45),
    new THREE.Vector2(0.92, 1.15),
    new THREE.Vector2(0.98, 1.22),
    new THREE.Vector2(0.98, 1.48),
    new THREE.Vector2(0.9, 1.48),
    new THREE.Vector2(0.78, 0.5),
    new THREE.Vector2(0.0, -0.45)
  ];
  const goldCup = new THREE.Mesh(
    new THREE.LatheGeometry(cupProfile, 64),
    mats.goldPolished
  );
  group.add(goldCup);

  const floralRim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.99, 0.97, 0.26, 48),
    mats.goldBrushed
  );
  floralRim.position.y = 1.34;
  group.add(floralRim);

  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const ornament = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 12),
      mats.goldPolished
    );
    ornament.position.set(Math.sin(a) * 0.98, 1.34, Math.cos(a) * 0.98);
    ornament.scale.set(1.0, 1.4, 0.5);
    group.add(ornament);
  }

  [-1, 1].forEach((side) => {
    const handleCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(side * 0.94, 1.32, 0),
        new THREE.Vector3(side * 0.98, 1.72, 0),
        new THREE.Vector3(side * 1.42, 1.7, 0),
        new THREE.Vector3(side * 1.36, 0.85, 0),
        new THREE.Vector3(side * 1.05, 0.05, 0),
        new THREE.Vector3(side * 0.52, -0.52, 0)
      ],
      false,
      'catmullrom',
      0.12
    );
    const handle = new THREE.Mesh(
      new THREE.TubeGeometry(handleCurve, 48, 0.038, 12, false),
      mats.goldPolished
    );
    handle.scale.z = 0.55;
    group.add(handle);
  });

  return group;
}

// ============================================================================
// SELETOR DINÂMICO DE TROFÉU
// ============================================================================
export function buildTrophyById(id, mats, variant = 'intercontinental') {
  const normId = (id || '').toLowerCase().replace(/[-_]/g, '');
  
  if (normId.includes('mundial') || normId.includes('intercontinental') || normId.includes('copario')) {
    return variant === 'copario51'
      ? buildCopaRio51Trophy(mats)
      : buildIntercontinentalFifaTrophy(mats);
  }
  
  if (normId.includes('libertadores')) {
    return buildLibertadoresTrophy(mats);
  }
  
  if (normId.includes('brasil') && !normId.includes('copa')) {
    return buildBrasileiraoTrophy(mats);
  }
  
  if (normId.includes('copa') && normId.includes('brasil')) {
    return buildCopaDoBrasilTrophy(mats);
  }
  
  if (normId.includes('estadual') || normId.includes('paulist') || normId.includes('carioca')) {
    return variant === 'paulista'
      ? buildPaulistaoTrophy(mats)
      : buildCariocaFerjTrophy(mats);
  }

  return buildLibertadoresTrophy(mats);
}
