# Relatório de Auditoria Universal de Atletas e Cruzamento de Fontes Oficiais

*Gerado automaticamente em: 2026-10-26 15:22:54*

## Resumo Executivo da Auditoria

- **Total de Atletas Analisados**: 60
- 🟢 **Atletas Íntegros e Consistentes**: 57
- 🛠️ **Casos Auto-Reparados (Auto-healing)**: 3
- ⚠️ **Casos com Discrepância Pendente (Requer Moderação)**: 0

## Metodologia de Verificação & Regra do ID
Cada registro atômico na tabela `gols` e `escalacoes` é cruzado com a chave `id_jogador` e validado contra o `ogol_id` e a carreira oficial de referência. Quando $gols_{acervo} > gols_{oficiais}$, o sistema consulta o perfil oficial no portal OGol para atualizar os metadados de carreira. Se a divergência persistir, ele isola e desassocia gols pertencentes a homônimos de clubes distintos.

## 🛠️ Atletas com Auto-Reparo Concluído

| ID | Atleta | OGol ID | Gols Acervo | Gols Carreira | Detalhe da Auto-Arrumação |
| :---: | :--- | :---: | :---: | :---: | :--- |
| `13953` | **Zico** | `N/D` | **142** | 481 | Carreira oficial enriquecida via OGol (481 gols em 705 jogos). Acervo consistente. |
| `3116` | **Bebeto** | `N/D` | **96** | 373 | Carreira oficial enriquecida via OGol (373 gols em 695 jogos). Acervo consistente. |
| `8798` | **Luciano da Rocha Neves** | `N/D` | **93** | 178 | Carreira oficial enriquecida via OGol (178 gols em 618 jogos). Acervo consistente. |


## 🟢 Amostra de Atletas Auditados e Verificados (Top Craques)

| ID | Atleta | OGol ID | Gols Acervo | Gols Carreira | Clubes no Acervo | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :---: |
| `6051` | **Fred** | `9839` | 216 | 413 | `Cruzeiro,Fluminense,Vitória,Emelec,Atlét` | 🟢 OK |
| `9350` | **Marcelinho Carioca** | `5653` | 207 | 305 | `Flamengo,Corinthians,Santos,Vasco,Táchir` | 🟢 OK |
| `5168` | **Edmundo** | `2513` | 204 | 360 | `Vasco,Palmeiras,Cruzeiro,Corinthians,Grê` | 🟢 OK |
| `7` | **Gabriel Barbosa** | `75171` | 183 | 284 | `Flamengo,Santos,Cruzeiro,Juventude` | 🟢 OK |
| `3636` | **Careca** | `5744` | 176 | 365 | `Botafogo,América-RN,Palmeiras,Athletico-` | 🟢 OK |
| `11967` | **Roberto Dinamite** | `27464` | 174 | 507 | `Vasco,Portuguesa` | 🟢 OK |
| `2373` | **Alex** | `9673` | 173 | 379 | `Internacional,Goiás,Remo,Guarani,União S` | 🟢 OK |
| `101387` | **Renato (São Paulo/Guarani - Anos 70)** | `N/D` | 172 | 0 | `Nacional,Guarani,Brasil,Leônico,São Paul` | 🟢 OK |
| `9033` | **Luís Fabiano** | `5685` | 168 | 403 | `São Paulo,Portuguesa,River Plate,Univers` | 🟢 OK |
| `4960` | **Dodô** | `32395` | 156 | 333 | `Santos,Botafogo,Palmeiras,Operário (MS),` | 🟢 OK |
| `17483` | **Serginho Chulapa** | `20479` | 156 | 357 | `São Paulo,Santos,Corinthians` | 🟢 OK |
| `11782` | **Ricardinho** | `8541` | 152 | 502 | `Corinthians,Cruzeiro,Sport,São Paulo,Atl` | 🟢 OK |
| `8980` | **Luizão** | `4663` | 145 | 242 | `Guarani,Corinthians,Atlético-MG,Flamengo` | 🟢 OK |
| `2325` | **Alecsandro** | `5691` | 142 | 261 | `Cruzeiro,Náutico,Internacional,Vasco,Fla` | 🟢 OK |
| `10176` | **Mirandinha** | `162619` | 142 | 218 | `Corinthians,São Paulo,ABC,Caldense,Bangu` | 🟢 OK |
| `13219` | **Túlio Maravilha** | `42587` | 140 | 599 | `Goiás,Botafogo,Santa Cruz,Vitória,Juvent` | 🟢 OK |
| `101593` | **Toninho (Palmeiras/Portuguesa - Anos 70)** | `N/D` | 140 | 0 | `São Paulo,Fluminense,Cruzeiro,Rio Negro,` | 🟢 OK |
| `8916` | **Luisinho** | `N/D` | 139 | 0 | `Portuguesa,América-RJ,Remo,Paysandu,Spor` | 🟢 OK |
| `10` | **Pedro** | `481359` | 135 | 239 | `Flamengo,Fluminense` | 🟢 OK |
| `12212` | **Romário** | `2521` | 135 | 744 | `Flamengo,abd  Vasco da Gama,Vasco,Flumin` | 🟢 OK |
| `13693` | **Wellington Paulista** | `6041` | 129 | 265 | `Botafogo,Chapecoense,Coritiba,Cruzeiro,R` | 🟢 OK |
| `100058` | **Guilherme (Atlético-MG/Cruzeiro - Anos 90)** | `N/D` | 129 | 0 | `São Paulo,Remo,Atlético-MG,Corinthians,U` | 🟢 OK |
| `6037` | **França** | `N/D` | 125 | 0 | `Vasco,São Paulo,Botafogo,Sport` | 🟢 OK |
| `17777` | **Washington (Coração Valente)** | `5108` | 125 | 379 | `Paraná,Ponte Preta,Ceará,Fluminense,São ` | 🟢 OK |
| `11053` | **Paulo César** | `137249` | 124 | 0 | `Botafogo,Internacional,Flamengo,Cruzeiro` | 🟢 OK |
| `11031` | **Paulinho (Histórico Anos 70/80)** | `N/D` | 121 | 0 | `Náutico,Fortaleza,Sergipe,Flamengo,Vitór` | 🟢 OK |
| `12161` | **Roger** | `435806` | 120 | 196 | `Grêmio,Atlético-GO,Brasiliense,Ponte Pre` | 🟢 OK |
| `100962` | **Leandro (Portuguesa/Goiás - Anos 90)** | `N/D` | 120 | 0 | `Portuguesa,Paraná,São Paulo,Grêmio,Vitór` | 🟢 OK |
| `11470` | **Rafael Moura** | `32411` | 119 | 178 | `ABC,Athletico-PR,Goiás,Internacional,Cui` | 🟢 OK |