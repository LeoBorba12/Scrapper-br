# Relatório de Auditoria Universal de Atletas e Cruzamento de Fontes Oficiais

*Gerado automaticamente em: 2026-11-26 14:08:23*

## Resumo Executivo da Auditoria

- **Total de Atletas Analisados**: 30
- 🟢 **Atletas Íntegros e Consistentes**: 22
- 🛠️ **Casos Auto-Reparados (Auto-healing)**: 7
- ⚠️ **Casos com Discrepância Pendente (Requer Moderação)**: 1

## Metodologia de Verificação & Regra do ID
Cada registro atômico na tabela `gols` e `escalacoes` é cruzado com a chave `id_jogador` e validado contra o `ogol_id` e a carreira oficial de referência. Quando $gols_{acervo} > gols_{oficiais}$, o sistema consulta o perfil oficial no portal OGol para atualizar os metadados de carreira. Se a divergência persistir, ele isola e desassocia gols pertencentes a homônimos de clubes distintos.

## ⚠️ Atletas que Requerem Atenção da Moderação

| ID | Atleta | OGol ID | Gols Acervo | Gols Carreira | Diagnóstico |
| :---: | :--- | :---: | :---: | :---: | :--- |
| `1867` | **Reiner** | `N/D` | **7** | 6 | Gols no acervo (7) superam carreira oficial (6). Perfil OGol não localizado. |


## 🛠️ Atletas com Auto-Reparo Concluído

| ID | Atleta | OGol ID | Gols Acervo | Gols Carreira | Detalhe da Auto-Arrumação |
| :---: | :--- | :---: | :---: | :---: | :--- |
| `7` | **Gabriel Barbosa** | `75171` | **252** | 285 | Carreira oficial enriquecida via OGol (285 gols em 627 jogos). Acervo consistente. |
| `6051` | **Fred** | `9839` | **269** | 413 | Contador de cabeçalho ajustado de 273 para 269 (Invariância Atômica). |
| `14953` | **Diego Souza** | `1283` | **202** | 310 | Contador de cabeçalho ajustado de 206 para 202 (Invariância Atômica). |
| `2373` | **Alex** | `9673` | **174** | 391 | Contador de cabeçalho ajustado de 177 para 174 (Invariância Atômica). |
| `11046` | **Paulo Baier** | `5378` | **155** | 223 | Contador de cabeçalho ajustado de 157 para 155 (Invariância Atômica). |
| `13693` | **Wellington Paulista** | `6041` | **153** | 265 | Contador de cabeçalho ajustado de 156 para 153 (Invariância Atômica). |
| `12161` | **Roger** | `5713` | **140** | 143 | Contador de cabeçalho ajustado de 143 para 140 (Invariância Atômica). |


## 🟢 Amostra de Atletas Auditados e Verificados (Top Craques)

| ID | Atleta | OGol ID | Gols Acervo | Gols Carreira | Clubes no Acervo | Status |
| :---: | :--- | :---: | :---: | :---: | :--- | :---: |
| `11220` | **Pelé** | `1047` | 513 | 757 | `Santos,Botafogo` | 🟢 OK |
| `11967` | **Roberto Dinamite** | `27464` | 463 | 512 | `Vasco,Portuguesa` | 🟢 OK |
| `13953` | **Zico** | `1058` | 374 | 530 | `Flamengo` | 🟢 OK |
| `12212` | **Romário** | `5270` | 351 | 744 | `Vasco,Flamengo,Fluminense,River-PI` | 🟢 OK |
| `5168` | **Edmundo** | `5267` | 216 | 348 | `Vasco,Palmeiras,Cruzeiro,Corinthians,Grê` | 🟢 OK |
| `5174` | **Heitor** | `270515` | 214 | 214 | `Palestra Itália` | 🟢 OK |
| `9350` | **Marcelinho Carioca** | `5653` | 214 | 307 | `Flamengo,Corinthians,Santos,Vasco,Táchir` | 🟢 OK |
| `4960` | **Dodô** | `32395` | 197 | 333 | `Santos,Botafogo,Palmeiras,Bahia,Fluminen` | 🟢 OK |
| `4105` | **Cláudio Adão** | `144860` | 190 | 190 | `Santos,Flamengo,Botafogo,Fluminense,Vasc` | 🟢 OK |
| `17483` | **Serginho Chulapa** | `20479` | 189 | 365 | `São Paulo,Santos,Corinthians` | 🟢 OK |
| `9033` | **Luís Fabiano** | `5685` | 187 | 403 | `São Paulo,Vasco,Ponte Preta` | 🟢 OK |
| `10` | **Pedro** | `481359` | 180 | 239 | `Flamengo,Fluminense` | 🟢 OK |
| `3636` | **Careca** | `5744` | 176 | 365 | `Botafogo,América-RN,Palmeiras,Athletico-` | 🟢 OK |
| `13491` | **Viola** | `27469` | 174 | 174 | `Corinthians,São José,Santos,Vasco,Bahia,` | 🟢 OK |
| `101387` | **Renato** | `155284` | 172 | 172 | `Nacional,Guarani,Brasil,Leônico,São Paul` | 🟢 OK |
| `11782` | **Ricardinho** | `8541` | 169 | 502 | `Corinthians,Atlético-MG,Cruzeiro,Sport,S` | 🟢 OK |
| `2325` | **Gabriel Feliciano** | `5691` | 156 | 261 | `Cruzeiro,Náutico,Internacional,Vasco,Fla` | 🟢 OK |
| `809` | **Souza** | `941506` | 152 | 152 | `Red Bull Bragantino,Portuguesa,Corinthia` | 🟢 OK |
| `352` | **Neymar** | `54814` | 149 | 439 | `Santos,Atlético Goianiense` | 🟢 OK |
| `100377` | **Caio** | `500317` | 146 | 146 | `Grêmio,América-RJ,Flamengo,Athletico-PR,` | 🟢 OK |
| `101593` | **Toninho** | `234241` | 144 | 144 | `São Paulo,Fluminense,Cruzeiro,Rio Negro,` | 🟢 OK |
| `8980` | **Luizão** | `4663` | 142 | 242 | `Guarani,Corinthians,Flamengo,Vasco,São P` | 🟢 OK |