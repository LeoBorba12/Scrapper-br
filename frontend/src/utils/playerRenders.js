/**
 * Utilitário de Mapeamento de Renders e Avatares Oficiais (Projeto CraqueView & FutStats)
 * Fornece caminhos para os recortes transparentes em alta definição (card_*.png e face_*.png).
 */

const PLAYER_RENDER_MAP = {
  'alan franco': 'alan_franco',
  'arrascaeta': 'arrascaeta',
  'giorgian de arrascaeta': 'arrascaeta',
  'de arrascaeta': 'arrascaeta',
  'bruno guimaraes': 'bruno_guimaraes',
  'bruno guimarães': 'bruno_guimaraes',
  'campaz': 'campaz',
  'jaminton campaz': 'campaz',
  'casemiro': 'casemiro',
  'claudinho': 'claudinho',
  'diego costa': 'diego_costa',
  'dudu': 'dudu',
  'everson': 'everson',
  'everton ribeiro': 'everton_ribeiro',
  'felipe anderson': 'felipe_anderson',
  'felipe melo': 'felipe_melo',
  'gonzalo plata': 'gonzalo_plata',
  'plata': 'gonzalo_plata',
  'guilherme arana': 'guilherme_arana',
  'arana': 'guilherme_arana',
  'gustavo scarpa': 'gustavo_scarpa',
  'scarpa': 'gustavo_scarpa',
  'hulk': 'hulk',
  'junior santos': 'junior_santos',
  'júnior santos': 'junior_santos',
  'lucas paqueta': 'lucas_paqueta',
  'lucas paquetá': 'lucas_paqueta',
  'paqueta': 'paqueta',
  'paquetá': 'paqueta',
  'marquinhos': 'marquinhos',
  'militao': 'militao',
  'militão': 'militao',
  'eder militao': 'militao',
  'éder militão': 'militao',
  'moises': 'moises',
  'moisés': 'moises',
  'murilo': 'murilo',
  'neymar': 'neymar',
  'neymar jr': 'neymar',
  'neymar junior': 'neymar',
  'pedro rocha': 'pedro_rocha',
  'raphael veiga': 'raphael_veiga',
  'veiga': 'raphael_veiga',
  'richard rios': 'richard_rios',
  'richard ríos': 'richard_rios',
  'richarlison': 'richarlison',
  'rodrygo': 'rodrygo',
  'savinho': 'savinho',
  'sávio': 'savinho',
  'savio': 'savinho',
  'soteldo': 'soteldo',
  'thiago heleno': 'thiago_heleno',
  'thiago silva': 'thiago_silva',
  'vinicius junior': 'vinicius_junior',
  'vinícius júnior': 'vinicius_junior',
  'vinicius jr': 'vinicius_junior',
  'vini jr': 'vinicius_junior',
  'wendel': 'wendel',
  'yuri alberto': 'yuri_alberto'
};

function normalizarNome(nome) {
  if (!nome || typeof nome !== 'string') return '';
  return nome
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ');
}

export function obterRenderAtleta(nome, fotoUrlPadrao = null) {
  if (!nome) {
    return {
      cardUrl: null,
      faceUrl: fotoUrlPadrao,
      hasRender: false
    };
  }

  const nomeLimpo = normalizarNome(nome);
  let slug = PLAYER_RENDER_MAP[nomeLimpo];

  // Tentativa por substring caso não encontre correspondência exata
  if (!slug) {
    const keys = Object.keys(PLAYER_RENDER_MAP);
    for (const k of keys) {
      if (nomeLimpo.includes(k) || k.includes(nomeLimpo)) {
        slug = PLAYER_RENDER_MAP[k];
        break;
      }
    }
  }

  if (slug) {
    return {
      cardUrl: `/assets/players/card_${slug}.png`,
      faceUrl: `/assets/players/face_${slug}.png`,
      hasRender: true,
      slug
    };
  }

  return {
    cardUrl: null,
    faceUrl: fotoUrlPadrao,
    hasRender: false,
    slug: null
  };
}
