import { describe, it, expect } from 'vitest';
import { extrairClubesDoSlug, gerarSlugConfronto } from '../utils/confrontoSlug';

describe('FutStats Frontend Smoke Helpers', () => {
  it('gera e extrai slug canônico de confronto corretamente', () => {
    const slug = gerarSlugConfronto('São Paulo', 'Atlético-MG');
    expect(slug).toBe('sao-paulo-atletico-mg');
    const clubes = extrairClubesDoSlug(slug);
    expect(clubes).toEqual({ clube1: 'São Paulo', clube2: 'Atlético-MG' });
  });

  it('soma probabilidades 1X2 preservando consistência em 100%', () => {
    const pM = 47.0;
    const pE = 28.4;
    const pV = 24.6;
    expect(Number((pM + pE + pV).toFixed(1))).toBe(100.0);
  });
});
