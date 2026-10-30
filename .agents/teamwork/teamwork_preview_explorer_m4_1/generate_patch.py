import difflib

source_path = 'frontend/src/components/ProtagonistaAtleta.jsx'
with open(source_path, 'r', encoding='utf-8') as f:
    source_lines = f.readlines()

content = "".join(source_lines)

old_hunk1 = """                    {/* Badge Oficial Sofascore (0 a 10.0) */}
                    {resumo.sofascore && (
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          padding: '4px 10px', 
                          borderRadius: 'var(--radius-control)', 
                          background: 'rgba(34, 197, 94, 0.12)',
                          border: '1px solid rgba(34, 197, 94, 0.4)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        title={`Rating Sofascore: ${resumo.sofascore.rating_medio}/10 (${resumo.sofascore.jogos_avaliados} jogos) • Últimas notas: ${resumo.sofascore.ultimas_notas?.join(', ') || 'N/D'}`}
                      >
                        <div style={{ textAlign: 'right', lineHeight: 1.15 }}>
                          <div style={{ fontSize: '0.60rem', fontWeight: 800, textTransform: 'uppercase', color: '#22c55e', letterSpacing: '0.04em' }}>
                            Sofascore
                          </div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {resumo.sofascore.jogos_avaliados}j avaliados
                          </div>
                        </div>
                        <div 
                          className="font-mono tabular-nums" 
                          style={{ 
                            fontSize: '1.45rem', 
                            fontWeight: 900, 
                            color: '#22c55e', 
                            lineHeight: 1 
                          }}
                        >
                          {resumo.sofascore.rating_medio}
                        </div>
                      </div>
                    )}"""

new_hunk1 = """                    {/* Badge Oficial Sofascore ou FutStats Scouting (0 a 10.0) */}
                    {resumo.sofascore && (
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          padding: '4px 10px', 
                          borderRadius: 'var(--radius-control)', 
                          background: 'var(--positive-bg)',
                          border: '1px solid var(--positive)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                        title={resumo.sofascore.fonte === 'futstats_scouting'
                          ? `Rating FutStats Scouting: ${resumo.sofascore.rating_medio}/10 (${resumo.sofascore.jogos_avaliados} jogos) • Últimas notas: ${resumo.sofascore.ultimas_notas?.join(', ') || 'N/D'}`
                          : `Rating Sofascore: ${resumo.sofascore.rating_medio}/10 (${resumo.sofascore.jogos_avaliados} jogos) • Últimas notas: ${resumo.sofascore.ultimas_notas?.join(', ') || 'N/D'}`
                        }
                      >
                        <div style={{ textAlign: 'right', lineHeight: 1.15 }}>
                          <div style={{ fontSize: '0.60rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--positive)', letterSpacing: '0.04em' }}>
                            {resumo.sofascore.fonte === 'futstats_scouting' ? 'Scouting' : 'Sofascore'}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            {resumo.sofascore.jogos_avaliados}j avaliados
                          </div>
                        </div>
                        <div 
                          className="font-mono tabular-nums" 
                          style={{ 
                            fontSize: '1.45rem', 
                            fontWeight: 900, 
                            color: 'var(--positive)', 
                            lineHeight: 1 
                          }}
                        >
                          {resumo.sofascore.rating_medio}
                        </div>
                      </div>
                    )}"""

old_hunk2 = """                    {/* Média de Gols com Paridade Estrita */}
                    <div style={{ marginTop: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      {temCarreira && jogosCarreira ? (
                        <span>Média Oficial: <strong className="tabular-nums font-mono" style={{ color: 'var(--accent)' }}>{(golsCarreira / jogosCarreira).toFixed(2)}</strong> gols/jogo</span>
                      ) : !temCarreira && jogosCatalogo > 0 ? (
                        <span>Média no Catálogo: <strong className="tabular-nums font-mono" style={{ color: 'var(--accent)' }}>{(golsCatalogo / jogosCatalogo).toFixed(2)}</strong> gols/jogo</span>
                      ) : null}
                    </div>"""

new_hunk2 = """                    {/* Média de Gols com Paridade Estrita */}
                    <div style={{ marginTop: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      {temCarreira && jogosCarreira ? (
                        <span>Média Oficial: <strong className="tabular-nums font-mono" style={{ color: 'var(--accent)' }}>{(golsCarreira / jogosCarreira).toFixed(2)}</strong> gols/jogo</span>
                      ) : !temCarreira && jogosCatalogo > 0 ? (
                        resumo.acervo_parcial || (golsCatalogo >= jogosCatalogo && golsCatalogo > 0) ? (
                          <span>Média no Catálogo: <span className="pill-neutral" style={{ fontSize: '0.64rem', padding: '1px 6px' }}>Acervo Parcial*</span></span>
                        ) : (
                          <span>Média no Catálogo: <strong className="tabular-nums font-mono" style={{ color: 'var(--accent)' }}>{(golsCatalogo / jogosCatalogo).toFixed(2)}</strong> gols/jogo</span>
                        )
                      ) : null}
                    </div>"""

old_hunk3 = """                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {resumo.jogos_rotulo || (resumo.acervo_parcial || (resumo.jogos_registrados === resumo.total_gols && Number(resumo.total_gols) > 0 && Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados)) ? 'Jogos c/ Gol' : 'Jogos no Catálogo')}
                    </span>
                    <div className="tabular-nums font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {resumo.jogos_registrados ?? 0}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {resumo.acervo_parcial || (resumo.jogos_registrados === resumo.total_gols && Number(resumo.total_gols) > 0 && Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados)) ? 'Média Carreira' : 'Média Local'}
                    </span>
                    <div className="tabular-nums font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                      {(() => {
                        const isParcial = resumo.acervo_parcial || (resumo.jogos_registrados === resumo.total_gols && Number(resumo.total_gols) > 0 && Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados));
                        if (isParcial && carreira?.jogos && Number(carreira.jogos) > 0) {
                          return (Number(carreira.gols || resumo.total_gols) / Number(carreira.jogos)).toFixed(2);
                        }
                        if (isParcial && resumo.media_oficial_carreira) {
                          return Number(resumo.media_oficial_carreira).toFixed(2);
                        }
                        if (resumo.jogos_registrados && Number(resumo.jogos_registrados) > 0 && !isParcial) {
                          return (Number(resumo.total_gols || 0) / Number(resumo.jogos_registrados)).toFixed(2);
                        }
                        return (resumo.media_gols != null && !isNaN(Number(resumo.media_gols)) && !isParcial ? Number(resumo.media_gols).toFixed(2) : '—');
                      })()}
                    </div>
                  </div>"""

new_hunk3 = """                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {Boolean(
                        resumo.acervo_parcial ||
                        (Number(resumo.total_gols) >= Number(resumo.jogos_registrados) && Number(resumo.total_gols) > 0) ||
                        (Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados))
                      )
                        ? (resumo.jogos_rotulo && resumo.jogos_rotulo !== 'Jogos' ? resumo.jogos_rotulo : 'Jogos c/ Gol')
                        : (resumo.jogos_rotulo || 'Jogos no Catálogo')}
                    </span>
                    <div className="tabular-nums font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {resumo.jogos_registrados ?? 0}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {Boolean(
                        resumo.acervo_parcial ||
                        (Number(resumo.total_gols) >= Number(resumo.jogos_registrados) && Number(resumo.total_gols) > 0) ||
                        (Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados))
                      ) ? 'Média Carreira' : 'Média Local'}
                    </span>
                    <div className="tabular-nums font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
                      {(() => {
                        const isParcial = Boolean(
                          resumo.acervo_parcial ||
                          (Number(resumo.total_gols) >= Number(resumo.jogos_registrados) && Number(resumo.total_gols) > 0) ||
                          (Number(carreira?.jogos || 0) > Number(resumo.jogos_registrados))
                        );
                        if (resumo.media_gols != null && !isNaN(Number(resumo.media_gols))) {
                          return Number(resumo.media_gols).toFixed(2);
                        }
                        if (isParcial && resumo.media_oficial_carreira != null && !isNaN(Number(resumo.media_oficial_carreira))) {
                          return Number(resumo.media_oficial_carreira).toFixed(2);
                        }
                        if (isParcial && carreira?.jogos && Number(carreira.jogos) > 0) {
                          return (Number(carreira.gols || resumo.total_gols) / Number(carreira.jogos)).toFixed(2);
                        }
                        if (!isParcial && resumo.jogos_registrados && Number(resumo.jogos_registrados) > 0) {
                          return (Number(resumo.total_gols || 0) / Number(resumo.jogos_registrados)).toFixed(2);
                        }
                        return '—';
                      })()}
                    </div>
                  </div>"""

assert old_hunk1 in content, "old_hunk1 not found"
assert old_hunk2 in content, "old_hunk2 not found"
assert old_hunk3 in content, "old_hunk3 not found"

mod_content = content.replace(old_hunk1, new_hunk1).replace(old_hunk2, new_hunk2).replace(old_hunk3, new_hunk3)
mod_lines = mod_content.splitlines(keepends=True)

diff = difflib.unified_diff(
    source_lines,
    mod_lines,
    fromfile='a/frontend/src/components/ProtagonistaAtleta.jsx',
    tofile='b/frontend/src/components/ProtagonistaAtleta.jsx',
    n=3
)

patch_text = "".join(diff)

with open('.agents/teamwork/teamwork_preview_explorer_m4_1/protagonista_atleta_feature12.patch', 'w', encoding='utf-8') as f:
    f.write(patch_text)

print("Patch generated successfully! Length:", len(patch_text))
