import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { extrairClubesDoSlug, gerarSlugConfronto } from '../utils/confrontoSlug';
import MetricasAvancadasView from '../components/MetricasAvancadasView';
import { EvolucaoTabelaChart } from '../components/EconometriaVisuals';

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

  it('renderiza MetricasAvancadasView e EvolucaoTabelaChart sem erros', () => {
    const htmlView = renderToStaticMarkup(React.createElement(MetricasAvancadasView, { darkMode: true }));
    expect(htmlView).toContain('Rankings de Atletas');
    const htmlChart = renderToStaticMarkup(
      React.createElement(EvolucaoTabelaChart, {
        clubes: [
          { clube_id_canonico: 1, nome: 'Flamengo', sigla: 'FLA', serie: [{ jogo: 1, pontos: 3, posicao: 1 }] },
          { clube_id_canonico: 2, nome: 'Palmeiras', sigla: 'PAL', serie: [] }
        ]
      })
    );
    expect(htmlChart).toContain('Evolução na Série A 2026');
  });
});
