/**
 * Utilitário de Slugs e Deep Links para o Confronto Direto Secular (FutStats)
 */

export const MAPA_SLUG_CLUBES = {
  'palmeiras': 'Palmeiras',
  'corinthians': 'Corinthians',
  'flamengo': 'Flamengo',
  'fluminense': 'Fluminense',
  'vasco': 'Vasco',
  'gremio': 'Grêmio',
  'internacional': 'Internacional',
  'santos': 'Santos',
  'sao-paulo': 'São Paulo',
  'atletico-mg': 'Atlético-MG',
  'cruzeiro': 'Cruzeiro',
  'bahia': 'Bahia',
  'vitoria': 'Vitória',
  'botafogo': 'Botafogo',
  'athletico-pr': 'Athletico-PR',
  'coritiba': 'Coritiba',
  'fortaleza': 'Fortaleza',
  'ceara': 'Ceará',
  'sport': 'Sport',
  'nautico': 'Náutico',
  'santa-cruz': 'Santa Cruz',
  'goias': 'Goiás',
  'vila-nova': 'Vila Nova',
  'atletico-go': 'Atlético-GO',
  'cuiaba': 'Cuiabá',
  'juventude': 'Juventude',
  'criciuma': 'Criciúma',
  'avai': 'Avaí',
  'figueirense': 'Figueirense',
  'ponte-preta': 'Ponte Preta',
  'guarani': 'Guarani',
  'america-mg': 'América-MG'
};

export function slugifyClube(nome = '') {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function gerarSlugConfronto(c1, c2) {
  const s1 = slugifyClube(c1);
  const s2 = slugifyClube(c2);
  return `${s1}-${s2}`;
}

export function gerarDeepLinkConfronto(c1, c2) {
  return `/confrontos/${gerarSlugConfronto(c1, c2)}`;
}

export function extrairClubesDoSlug(slug = '') {
  if (!slug) return null;
  const clean = slug.toLowerCase().replace(/^\/confrontos\//, '').replace(/^confrontos\//, '').replace(/\.svg$/, '');
  
  // 1. Tenta encontrar pares conhecidos no mapa
  const slugsConhecidos = Object.keys(MAPA_SLUG_CLUBES).sort((a, b) => b.length - a.length);
  for (const s1 of slugsConhecidos) {
    if (clean.startsWith(`${s1}-`)) {
      const resto = clean.slice(s1.length + 1);
      for (const s2 of slugsConhecidos) {
        if (resto === s2) {
          return {
            clube1: MAPA_SLUG_CLUBES[s1],
            clube2: MAPA_SLUG_CLUBES[s2]
          };
        }
      }
    }
  }

  // 2. Fallback por divisão em '-' se forem dois nomes simples
  const parts = clean.split('-');
  if (parts.length === 2) {
    const nome1 = MAPA_SLUG_CLUBES[parts[0]] || (parts[0].charAt(0).toUpperCase() + parts[0].slice(1));
    const nome2 = MAPA_SLUG_CLUBES[parts[1]] || (parts[1].charAt(0).toUpperCase() + parts[1].slice(1));
    return { clube1: nome1, clube2: nome2 };
  }

  return null;
}
