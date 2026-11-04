# Relatório de Auditoria Universal de Atletas e Cruzamento de Fontes Oficiais

*Gerado automaticamente em: 2026-11-04 01:01:57*

## Resumo Executivo da Auditoria

- **Total de Atletas Analisados**: 30
- 🟢 **Atletas Íntegros e Consistentes**: 27
- 🛠️ **Casos Auto-Reparados (Auto-healing)**: 2
- ⚠️ **Casos com Discrepância Pendente (Requer Moderação)**: 1

## Metodologia de Verificação & Regra do ID
Cada registro atômico na tabela `gols` e `escalacoes` é cruzado com a chave `id_jogador` e validado contra o `ogol_id` e a carreira oficial de referência. Quando $gols_{acervo} > gols_{oficiais}$, o sistema consulta o perfil oficial no portal OGol para atualizar os metadados de carreira. Se a divergência persistir, ele isola e desassocia gols pertencentes a homônimos de clubes distintos.

## ⚠️ Atletas que Requerem Atenção da Moderação

| ID | Atleta | OGol ID | Gols Acervo | Gols Carreira | Diagnóstico |
| :---: | :--- | :---: | :---: | :---: | :--- |
| `106` | **Reinaldo** | `241987` | **87** | 86 | Gols no acervo (87) superam carreira oficial (86). Perfil OGol não localizado. |


## 🛠️ Atletas com Auto-Reparo Concluído

| ID | Atleta | OGol ID | Gols Acervo | Gols Carreira | Detalhe da Auto-Arrumação |
| :---: | :--- | :---: | :---: | :---: | :--- |
| `7` | **Gabriel Barbosa** | `75171` | **251** | 284 | Carreira oficial enriquecida via OGol (284 gols em 625 jogos). Acervo consistente. |
| `12212` | **Romário** | `N/D` | **351** | 699 | Carreira oficial enriquecida via OGol (699 gols em 901 jogos). Acervo consistente. |


## 🟢 Amostra de Atletas Auditados e Verificados (Top Craques)

| ID | Atleta | OGol ID | Gols Acervo | Gols Carreira | Clubes no Acervo | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :---: |
| `11220` | **Pelé** | `1047` | 513 | 757 | `Santos,Botafogo` | 🟢 OK |
| `11967` | **Roberto Dinamite** | `27464` | 463 | 512 | `Vasco,Portuguesa` | 🟢 OK |
| `13953` | **Zico** | `1058` | 374 | 530 | `Flamengo` | 🟢 OK |
| `6051` | **Fred** | `9839` | 273 | 413 | `Cruzeiro,Fluminense,Atlético-MG,Internac` | 🟢 OK |
| `5168` | **Edmundo** | `5267` | 216 | 348 | `Vasco,Palmeiras,Cruzeiro,Corinthians,Grê` | 🟢 OK |
| `5174` | **Heitor** | `270515` | 214 | 214 | `Palestra Itália` | 🟢 OK |
| `9350` | **Marcelinho Carioca** | `5653` | 214 | 307 | `Flamengo,Corinthians,Santos,Vasco,Táchir` | 🟢 OK |
| `14953` | **Diego Souza** | `1283` | 206 | 310 | `Moto Clube (MA),Vasco,São Paulo,Grêmio,P` | 🟢 OK |
| `4960` | **Dodô** | `32395` | 197 | 333 | `Santos,Botafogo,Palmeiras,Bahia,Fluminen` | 🟢 OK |
| `4105` | **Cláudio Adão** | `144860` | 190 | 190 | `Santos,Flamengo,Botafogo,Fluminense,Vasc` | 🟢 OK |
| `17483` | **Serginho Chulapa** | `20479` | 190 | 365 | `São Paulo,Santos,Corinthians` | 🟢 OK |
| `9033` | **Luís Fabiano** | `5685` | 187 | 403 | `São Paulo,Vasco,Ponte Preta` | 🟢 OK |
| `10` | **Pedro** | `481359` | 178 | 239 | `Flamengo,Fluminense` | 🟢 OK |
| `2373` | **Alex** | `9673` | 177 | 391 | `Internacional,Goiás,Remo,Guarani,União S` | 🟢 OK |
| `3636` | **Careca** | `5744` | 176 | 365 | `Botafogo,América-RN,Palmeiras,Athletico-` | 🟢 OK |
| `13491` | **Viola** | `27469` | 174 | 174 | `Corinthians,São José,Santos,Vasco,Bahia,` | 🟢 OK |
| `101387` | **Renato (São Paulo/Guarani - Anos 70)** | `N/D` | 172 | 172 | `Nacional,Guarani,Brasil,Leônico,São Paul` | 🟢 OK |
| `11782` | **Ricardinho** | `8541` | 169 | 502 | `Corinthians,Atlético-MG,Cruzeiro,Sport,S` | 🟢 OK |
| `11046` | **Paulo Baier** | `5378` | 158 | 223 | `Goiás,Athletico-PR,Sport,Goiás EC,Criciú` | 🟢 OK |
| `2325` | **Gabriel Feliciano** | `5691` | 156 | 261 | `Cruzeiro,Náutico,Internacional,Vasco,Fla` | 🟢 OK |
| `13693` | **Wellington Paulista** | `6041` | 156 | 265 | `Botafogo,Cruzeiro,Coritiba,Lanús,Santos,` | 🟢 OK |
| `809` | **Souza** | `941506` | 151 | 151 | `Red Bull Bragantino,Portuguesa,Corinthia` | 🟢 OK |
| `352` | **Neymar** | `54814` | 149 | 439 | `Santos,Atlético Goianiense` | 🟢 OK |
| `17777` | **Washington** | `5679` | 144 | 144 | `Paraná,Ponte Preta,Ceará,Fluminense,São ` | 🟢 OK |
| `12161` | **Roger** | `5713` | 143 | 143 | `Grêmio,Atlético-GO,Brasiliense,Ponte Pre` | 🟢 OK |
| `8980` | **Luizão** | `4663` | 142 | 242 | `Guarani,Corinthians,Flamengo,Vasco,São P` | 🟢 OK |
| `13219` | **Túlio Maravilha** | `42587` | 141 | 599 | `Goiás,Botafogo,Santa Cruz,Vitória,Juvent` | 🟢 OK |