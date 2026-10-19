import React, { useState, useEffect } from 'react';
import { 
  Trophy, CloudRain, Swords, Search, Copy, Check, Sparkles, 
  Sun, Moon, Flame, ShieldAlert, Calendar, MapPin, BarChart3, 
  ArrowRight, RefreshCw, Share2, User, Users, Award, AlertCircle, 
  X, ChevronRight, Filter, Bot, Brain, Code, Terminal, Settings, 
  Key, Lightbulb, Zap, Lock, LogOut, UserPlus, ShieldCheck,
  Download, Camera, Scale
} from 'lucide-react';
import { baixarCardSocialPNG } from './utils/cardGenerator';
import SoomaFutStatsView from './SoomaFutStatsView';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('h2h'); // 'h2h', 'jogadores', 'oraculo', 'playground', 'clima', 'arbitragem', 'tweets'
  const [viewTheme, setViewTheme] = useState('sooma'); // 'sooma' (referência Outcrowd) | 'classic' (Soft UI)

  // ==================== AUTH STATE ====================
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'registro'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loginUsername, setLoginUsername] = useState('LB');
  const [loginPassword, setLoginPassword] = useState('');
  const [regNome, setRegNome] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCodigoConvite, setRegCodigoConvite] = useState('');
  const [conviteCopiado, setConviteCopiado] = useState(false);

  // Overview
  const [overview, setOverview] = useState(null);

  // Tab 1: H2H state
  const [clubesList, setClubesList] = useState([]);
  const [clube1, setClube1] = useState('Flamengo');
  const [clube2, setClube2] = useState('Vasco');
  const [h2hData, setH2hData] = useState(null);
  const [h2hLoading, setH2hLoading] = useState(false);

  // Tab 2: Jogadores state
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerSuggestions, setPlayerSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerProfile, setPlayerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [destaques, setDestaques] = useState(null);
  const [destaquesLoading, setDestaquesLoading] = useState(false);
  const [playerClubeFiltro, setPlayerClubeFiltro] = useState('');

  // Tab 3: Oráculo & IA Analista state
  const [oraculoPrompt, setOraculoPrompt] = useState('');
  const [oraculoModel, setOraculoModel] = useState('gemini'); // 'gemini' | 'deepseek'
  const [oraculoLoading, setOraculoLoading] = useState(false);
  const [oraculoResult, setOraculoResult] = useState(null);
  const [oraculoError, setOraculoError] = useState(null);
  const [showSql, setShowSql] = useState(false);

  // Tab 4: Playground state
  const [campeonatosList, setCampeonatosList] = useState([]);
  const [pgClube, setPgClube] = useState('');
  const [pgCamp, setPgCamp] = useState('');
  const [pgCenario, setPgCenario] = useState('todos');
  const [pgBusca, setPgBusca] = useState('');
  const [pgPage, setPgPage] = useState(1);
  const [partidasData, setPartidasData] = useState(null);
  const [partidasLoading, setPartidasLoading] = useState(false);

  // Tab 5: Clima state
  const [climaData, setClimaData] = useState(null);
  const [climaLoading, setClimaLoading] = useState(false);

  // Tab 7: Raio-X do Apito & VAR state
  const [arbitrosList, setArbitrosList] = useState([]);
  const [arbitroBusca, setArbitroBusca] = useState('');
  const [arbitroClubeFiltro, setArbitroClubeFiltro] = useState('');
  const [arbitroPerfil, setArbitroPerfil] = useState(null);
  const [arbitroLoading, setArbitroLoading] = useState(false);
  const [arbitragemData, setArbitragemData] = useState(null);
  const [downloadingCard, setDownloadingCard] = useState(false);

  // Tab 8: Brasileirão Ao Vivo (Classificação & Rodada Atual)
  const [aovivoData, setAovivoData] = useState(null);
  const [aovivoSerie, setAovivoSerie] = useState('a');
  const [aovivoLoading, setAovivoLoading] = useState(false);

  // Feedback de cópia do Twitter
  const [copiedKey, setCopiedKey] = useState(null);

  // ==================== CLIENTE HTTP CENTRALIZADO COM JWT ====================
  const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('futstats_auth_token');
    const headers = {
      ...(options.headers || {})
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      localStorage.removeItem('futstats_auth_token');
      setCurrentUser(null);
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    return res;
  };

  // Alternar modo escuro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Verificar sessão ativa ao iniciar
  useEffect(() => {
    const token = localStorage.getItem('futstats_auth_token');
    
    // Auto-preencher convite se vier na URL (?convite=...)
    const params = new URLSearchParams(window.location.search);
    const conviteParam = params.get('convite');
    if (conviteParam) {
      setRegCodigoConvite(conviteParam);
      setAuthMode('registro');
    }

    if (!token) {
      setAuthChecking(false);
      return;
    }

    apiFetch('/api/auth/me')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setCurrentUser(d.user);
        } else {
          localStorage.removeItem('futstats_auth_token');
        }
        setAuthChecking(false);
      })
      .catch(() => {
        setAuthChecking(false);
      });
  }, []);

  // Login handler
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: loginUsername,
        password: loginPassword
      })
    })
      .then(async r => {
        const contentType = r.headers.get("content-type") || "";
        let d = null;
        if (contentType.includes("application/json")) {
          d = await r.json();
        } else {
          const raw = await r.text();
          throw new Error(`Erro ${r.status} do servidor: ${raw.slice(0, 100)}`);
        }
        if (!r.ok) throw new Error(d?.error || 'Erro ao realizar login.');
        return d;
      })
      .then(d => {
        localStorage.setItem('futstats_auth_token', d.token);
        setCurrentUser(d.user);
        setAuthLoading(false);
      })
      .catch(err => {
        setAuthError(err.message);
        setAuthLoading(false);
      });
  };

  // Registro com convite handler
  const handleRegistro = (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: regNome,
        username: regUsername,
        password: regPassword,
        codigo_convite: regCodigoConvite
      })
    })
      .then(async r => {
        const contentType = r.headers.get("content-type") || "";
        let d = null;
        if (contentType.includes("application/json")) {
          d = await r.json();
        } else {
          const raw = await r.text();
          throw new Error(`Erro ${r.status} do servidor: ${raw.slice(0, 100)}`);
        }
        if (!r.ok) throw new Error(d?.error || 'Erro ao criar conta.');
        return d;
      })
      .then(d => {
        localStorage.setItem('futstats_auth_token', d.token);
        setCurrentUser(d.user);
        setAuthLoading(false);
      })
      .catch(err => {
        setAuthError(err.message);
        setAuthLoading(false);
      });
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('futstats_auth_token');
    setCurrentUser(null);
    setLoginPassword('');
  };

  // Busca o código de convite da API restrita a admins em vez de expor no bundle JS
  const copiarConviteEquipe = async () => {
    try {
      const r = await apiFetch('/api/auth/convite-codigo');
      const d = await r.json();
      if (d.codigo_convite) {
        const inviteText = `Convite de Acesso à Dashboard FutStats & Clima:\nCódigo de Convite: ${d.codigo_convite}\nLink Direto: ${window.location.origin}/?convite=${d.codigo_convite}`;
        await navigator.clipboard.writeText(inviteText);
        setConviteCopiado(true);
        setTimeout(() => setConviteCopiado(false), 3000);
      }
    } catch (e) {
      console.error('Erro ao obter convite:', e);
    }
  };

  // Carregar dados iniciais (overview, clubes, campeonatos) quando logado via apiFetch
  useEffect(() => {
    if (!currentUser) return;

    apiFetch('/api/overview')
      .then(r => r.json())
      .then(d => setOverview(d))
      .catch(() => {});

    apiFetch('/api/clubes')
      .then(r => r.json())
      .then(d => setClubesList(d))
      .catch(() => {});

    apiFetch('/api/campeonatos')
      .then(r => r.json())
      .then(d => setCampeonatosList(d))
      .catch(() => {});
  }, [currentUser]);

  // Buscar H2H
  const carregarH2H = () => {
    if (!clube1 || !clube2) return;
    setH2hLoading(true);
    apiFetch(`/api/h2h?clube1=${encodeURIComponent(clube1)}&clube2=${encodeURIComponent(clube2)}`)
      .then(r => r.json())
      .then(d => {
        setH2hData(d);
        setH2hLoading(false);
      })
      .catch(() => setH2hLoading(false));
  };

  useEffect(() => {
    if (currentUser) {
      carregarH2H();
    }
  }, [currentUser]);

  // Carregar destaques de jogadores quando abrir a aba de jogadores
  useEffect(() => {
    if (activeTab === 'jogadores' && !destaques && currentUser) {
      setDestaquesLoading(true);
      apiFetch('/api/jogadores/destaques')
        .then(r => r.json())
        .then(d => {
          setDestaques(d);
          setDestaquesLoading(false);
        })
        .catch(() => setDestaquesLoading(false));
    }
  }, [activeTab, destaques, currentUser]);

  // Busca de jogadores com autocomplete via apiFetch
  useEffect(() => {
    if (!playerSearch || playerSearch.trim().length < 2) {
      setPlayerSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearchLoading(true);
      apiFetch(`/api/jogadores/busca?q=${encodeURIComponent(playerSearch.trim())}`)
        .then(r => r.json())
        .then(d => {
          setPlayerSuggestions(Array.isArray(d) ? d : []);
          setSearchLoading(false);
        })
        .catch(() => setSearchLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [playerSearch]);

  // Carregar perfil completo do jogador via apiFetch
  const carregarPerfilJogador = (nome, clube = '') => {
    if (!nome) return;
    setProfileLoading(true);
    setSelectedPlayer(nome);
    setPlayerClubeFiltro(clube);
    setPlayerSuggestions([]);

    let url = `/api/jogadores/perfil?nome=${encodeURIComponent(nome)}`;
    if (clube) {
      url += `&clube=${encodeURIComponent(clube)}`;
    }

    apiFetch(url)
      .then(r => r.json())
      .then(d => {
        setPlayerProfile(d);
        setProfileLoading(false);
      })
      .catch(() => setProfileLoading(false));
  };

  // Enviar pergunta ao Oráculo via apiFetch
  const enviarPerguntaOraculo = (perguntaTexto) => {
    const texto = (perguntaTexto || oraculoPrompt).trim();
    if (!texto) return;

    setOraculoLoading(true);
    setOraculoError(null);
    if (perguntaTexto) {
      setOraculoPrompt(perguntaTexto);
    }

    apiFetch('/api/ia/perguntar', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pergunta: texto,
        modelo: oraculoModel
      })
    })
      .then(async r => {
        const contentType = r.headers.get("content-type") || "";
        let data = null;

        if (contentType.includes("application/json")) {
          data = await r.json();
        } else {
          const rawText = await r.text();
          if (r.status === 504 || rawText.includes("TIMEOUT")) {
            throw new Error("A consulta demorou mais tempo que o limite de 10s da Vercel. Dica: use o Gemini 2.0 Flash que responde de forma ultrarrápida!");
          }
          throw new Error(`Falha no servidor (${r.status}): ${rawText.slice(0, 150)}`);
        }

        if (!r.ok) {
          throw new Error(data?.error || data?.mensagem || 'Erro na comunicação com a IA.');
        }

        if (data.requer_api_key) {
          throw new Error(data.mensagem || 'Chave de API não configurada no servidor Vercel.');
        }

        return data;
      })
      .then(d => {
        setOraculoResult(d);
        setOraculoLoading(false);
      })
      .catch(err => {
        setOraculoError(err.message || 'Erro ao consultar o Oráculo.');
        setOraculoLoading(false);
      });
  };

  // Buscar Partidas no Playground via apiFetch
  const carregarPartidas = (p = 1) => {
    setPartidasLoading(true);
    const params = new URLSearchParams({
      page: p,
      limit: 15,
      clube: pgClube,
      campeonato: pgCamp,
      cenario: pgCenario,
      busca: pgBusca
    });
    apiFetch(`/api/partidas?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        setPartidasData(d);
        setPartidasLoading(false);
      })
      .catch(() => setPartidasLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'playground' && !partidasData && currentUser) {
      carregarPartidas(1);
    }
  }, [activeTab, currentUser]);

  // Carregar dados do clima via apiFetch
  useEffect(() => {
    if (activeTab === 'clima' && !climaData && currentUser) {
      setClimaLoading(true);
      apiFetch('/api/clima-futebol')
        .then(r => r.json())
        .then(d => {
          setClimaData(d);
          setClimaLoading(false);
        })
        .catch(() => setClimaLoading(false));
    }
  }, [activeTab, currentUser]);

  const carregarPerfilArbitro = (nome, clube = '') => {
    if (!nome) return;
    setArbitroLoading(true);
    setArbitroBusca(nome);
    const url = `/api/arbitros/perfil?nome=${encodeURIComponent(nome)}&clube=${encodeURIComponent(clube)}`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        setArbitroPerfil(d);
        setArbitroLoading(false);
      })
      .catch(() => setArbitroLoading(false));
  };

  useEffect(() => {
    if ((activeTab === 'arbitros' || activeTab === 'arbitragem') && arbitrosList.length === 0 && currentUser) {
      fetch('/api/arbitros/destaques')
        .then(r => r.json())
        .then(d => setArbitrosList(Array.isArray(d) ? d : []))
        .catch(() => {});
    }
  }, [activeTab, currentUser]);

  useEffect(() => {
    if (activeTab === 'aovivo') {
      setAovivoLoading(true);
      fetch(`/api/brasileirao/aovivo?serie=${aovivoSerie}`)
        .then(r => r.json())
        .then(d => {
          setAovivoData(d);
          setAovivoLoading(false);
        })
        .catch(() => setAovivoLoading(false));
    }
  }, [activeTab, aovivoSerie]);

  // ==================== GERADORES DE CARDS VISUAIS (CANVAS) ====================
  const baixarCardH2H = () => {
    if (!h2hData) return;
    setDownloadingCard(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');

      // Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
      grad.addColorStop(0, '#0a0f1d');
      grad.addColorStop(0.5, '#111827');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1080);

      // Linha de destaque no topo
      const lineGrad = ctx.createLinearGradient(80, 0, 1000, 0);
      lineGrad.addColorStop(0, '#38bdf8');
      lineGrad.addColorStop(0.5, '#10b981');
      lineGrad.addColorStop(1, '#f43f5e');
      ctx.fillStyle = lineGrad;
      ctx.fillRect(80, 60, 920, 6);

      // Marca FutStats
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FUTSTATS • RAIO-X HISTÓRICO OFICIAL', 540, 110);

      // Título do Duelo
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${h2hData.clube1.toUpperCase()}  ×  ${h2hData.clube2.toUpperCase()}`, 540, 185);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 22px system-ui, -apple-system, sans-serif';
      ctx.fillText(`Confrontos Diretos Catalogados no Futebol Brasileiro`, 540, 230);

      // Card Container Central
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(80, 275, 920, 520, 24);
      ctx.fill();
      ctx.stroke();

      // Total de Jogos
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText('TOTAL DE PARTIDAS', 540, 330);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 64px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${h2hData.total_jogos}`, 540, 400);

      // Coluna 1: Vitórias Clube 1
      ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
      ctx.beginPath();
      ctx.roundRect(110, 450, 260, 210, 16);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText('VITÓRIAS', 240, 495);
      ctx.font = '600 17px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(h2hData.clube1.slice(0, 15), 240, 525);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 66px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${h2hData.vitorias_clube1}`, 240, 600);
      const pct1 = h2hData.total_jogos > 0 ? ((h2hData.vitorias_clube1 / h2hData.total_jogos) * 100).toFixed(1) : 0;
      ctx.font = '500 17px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`${pct1}% dos jogos`, 240, 638);

      // Coluna 2: Empates
      ctx.fillStyle = 'rgba(148, 163, 184, 0.1)';
      ctx.beginPath();
      ctx.roundRect(410, 450, 260, 210, 16);
      ctx.fill();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText('EMPATES', 540, 495);
      ctx.font = '600 17px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Igualdade', 540, 525);
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 66px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${h2hData.empates}`, 540, 600);
      const pctE = h2hData.total_jogos > 0 ? ((h2hData.empates / h2hData.total_jogos) * 100).toFixed(1) : 0;
      ctx.font = '500 17px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`${pctE}% dos jogos`, 540, 638);

      // Coluna 3: Vitórias Clube 2
      ctx.fillStyle = 'rgba(244, 63, 94, 0.1)';
      ctx.beginPath();
      ctx.roundRect(710, 450, 260, 210, 16);
      ctx.fill();

      ctx.fillStyle = '#fb7185';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText('VITÓRIAS', 840, 495);
      ctx.font = '600 17px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(h2hData.clube2.slice(0, 15), 840, 525);
      ctx.fillStyle = '#fb7185';
      ctx.font = '900 66px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${h2hData.vitorias_clube2}`, 840, 600);
      const pct2 = h2hData.total_jogos > 0 ? ((h2hData.vitorias_clube2 / h2hData.total_jogos) * 100).toFixed(1) : 0;
      ctx.font = '500 17px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`${pct2}% dos jogos`, 840, 638);

      // Gols Banner
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.beginPath();
      ctx.roundRect(110, 685, 860, 80, 12);
      ctx.fill();

      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`⚽  GOLS MARCADOS:   ${h2hData.clube1} ${h2hData.gols_clube1}  ×  ${h2hData.gols_clube2} ${h2hData.clube2}`, 540, 735);

      // Série invicta no rodapé
      if (h2hData.tabu_invicto) {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(80, 825, 920, 95, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
        ctx.fillText(`🔥 SÉRIE INVICTA ATUAL: ${h2hData.tabu_invicto.clube} está há ${h2hData.tabu_invicto.jogos} jogos sem perder!`, 540, 880);
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.roundRect(80, 825, 920, 95, 16);
        ctx.fill();

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
        ctx.fillText(`Equilíbrio histórico marcante nos duelos do futebol brasileiro`, 540, 880);
      }

      // Rodapé marca
      ctx.fillStyle = '#64748b';
      ctx.font = '500 18px system-ui, -apple-system, sans-serif';
      ctx.fillText('Gerado por FutStats & Clima • Base Oficial com 55.395 Partidas', 540, 1020);

      // Download do PNG
      const link = document.createElement('a');
      link.download = `futstats_h2h_${h2hData.clube1}_vs_${h2hData.clube2}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingCard(false);
    }
  };

  const baixarCardOraculo = () => {
    if (!oraculoResult) return;
    setDownloadingCard(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');

      // Fundo Gradient
      const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#064e3b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1080);

      // Linha de acento
      const lineGrad = ctx.createLinearGradient(80, 0, 1000, 0);
      lineGrad.addColorStop(0, '#10b981');
      lineGrad.addColorStop(0.5, '#38bdf8');
      lineGrad.addColorStop(1, '#a855f7');
      ctx.fillStyle = lineGrad;
      ctx.fillRect(80, 60, 920, 6);

      // Tag
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FUTSTATS • ORÁCULO DE INTELIGÊNCIA ARTIFICIAL', 540, 115);

      // Quebra de texto auxiliar
      const wrapText = (text, x, startY, maxWidth, lineHeight, maxLines = 5) => {
        const words = text.split(' ');
        let line = '';
        let y = startY;
        let lineCount = 0;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line.trim(), x, y);
            line = words[n] + ' ';
            y += lineHeight;
            lineCount++;
            if (lineCount >= maxLines - 1 && n < words.length - 1) {
              line += '...';
              break;
            }
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line.trim(), x, y);
        return y;
      };

      // Pergunta
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
      const endY = wrapText(`"${oraculoResult.pergunta}"`, 540, 190, 880, 46, 3);

      // Card Container do Insight
      const cardStartY = Math.max(endY + 35, 330);
      const cardHeight = 880 - cardStartY;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(80, cardStartY, 920, cardHeight, 20);
      ctx.fill();
      ctx.stroke();

      // Badge do Insight
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      ctx.fillText('VEREDITO DOS DADOS (55.395 PARTIDAS)', 540, cardStartY + 50);

      // Texto do Insight
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '500 26px system-ui, -apple-system, sans-serif';
      const cleanInsight = (oraculoResult.insight || '').replace(/[#*`]/g, '');
      wrapText(cleanInsight, 540, cardStartY + 115, 840, 42, 8);

      // Watermark
      ctx.fillStyle = '#64748b';
      ctx.font = '500 18px system-ui, -apple-system, sans-serif';
      ctx.fillText('Gerado via FutStats Code Interpreter • Text-to-SQL em Tempo Real', 540, 1020);

      const link = document.createElement('a');
      link.download = 'futstats_oraculo_insight.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingCard(false);
    }
  };

  // Função auxiliar para copiar texto do tweet
  const copiarTweet = (texto, key) => {
    navigator.clipboard.writeText(texto);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Jogadores populares rápidos
  const jogadoresPopulares = [
    'Zico', 'Roberto Dinamite', 'Reinaldo', 'Careca', 'Dario', 
    'Thiago Heleno', 'Fagner', 'Gabriel Barbosa', 'Felipe Melo', 'Romário'
  ];

  // Perguntas sugeridas para o Oráculo
  const perguntasSugeridas = [
    { label: "📺 Palmeiras Pós-Novela das 9", pergunta: "Qual é o retrospecto do Palmeiras em jogos logo após o último capítulo de uma novela das 9 da Globo?" },
    { label: "🗓️ Dias Pares vs Ímpares", pergunta: "Qual o aproveitamento de vitórias do Corinthians jogando em dias pares vs dias ímpares?" },
    { label: "⏱️ Gols nos Acréscimos (45+)", pergunta: "Quais clubes mais marcaram gols nos acréscimos (minuto 45+ ou 90+) na história catalogada?" },
    { label: "🏆 Maiores Artilheiros da Série B", pergunta: "Quais são os 5 maiores artilheiros da história da Série B do Brasileirão?" },
    { label: "🌧️ Flamengo Sob Chuva Forte", pergunta: "Qual o aproveitamento do Flamengo jogando com chuva torrencial acima de 15mm?" },
    { label: "⚽ Gols de Falta na História", pergunta: "Quem são os jogadores com mais gols de falta catalogados no futebol brasileiro?" },
    { label: "🟨 Clássicos com Mais Cartões", pergunta: "Quais os clássicos com a maior média de cartões vermelhos por partida?" }
  ];

  // Se estiver verificando sessão inicial
  if (authChecking) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg)' }}>
        <RefreshCw size={36} className="animate-spin" color="#87CEEB" />
      </div>
    );
  }

  // ==================== TELA DE LOGIN / CADASTRO (SOOMA STYLE) ====================
  if (!currentUser) {
    return (
      <div 
        style={{ 
          minHeight: '100dvh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '24px', 
          background: 'linear-gradient(135deg, #FBF9FF 0%, #F5F1FB 45%, #FDEEE9 100%)',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}
      >
        <div 
          style={{ 
            maxWidth: '460px', 
            width: '100%', 
            padding: '42px 36px', 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: '34px',
            boxShadow: '0 24px 60px -15px rgba(100, 85, 140, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.95)'
          }}
        >
          {/* LOGO & CABEÇALHO */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '58px', 
                height: '42px', 
                borderRadius: '21px', 
                backgroundColor: '#111318', 
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.86rem',
                letterSpacing: '-0.02em',
                marginBottom: '16px',
                boxShadow: '0 8px 20px -4px rgba(17, 19, 24, 0.35)'
              }}
            >
              Sooma
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#12141A', marginBottom: '6px' }}>
              Welcome Back
            </h1>
            <p style={{ color: '#767C8E', fontSize: '0.88rem', fontWeight: 500 }}>
              The simplest way to keep everyone updated.
            </p>
          </div>

          {/* TABS LOGIN / REGISTRO COM CONVITE */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '6px', 
              backgroundColor: '#F3F4F8', 
              padding: '5px', 
              borderRadius: '9999px', 
              marginBottom: '26px' 
            }}
          >
            <button
              onClick={() => { setAuthMode('login'); setAuthError(null); }}
              style={{
                padding: '9px',
                borderRadius: '9999px',
                border: 'none',
                background: authMode === 'login' ? '#FFFFFF' : 'transparent',
                color: authMode === 'login' ? '#111318' : '#757B8C',
                fontWeight: authMode === 'login' ? 700 : 500,
                boxShadow: authMode === 'login' ? '0 2px 10px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                fontSize: '0.84rem',
                transition: 'all 150ms'
              }}
            >
              Log In
            </button>

            <button
              onClick={() => { setAuthMode('registro'); setAuthError(null); }}
              style={{
                padding: '9px',
                borderRadius: '9999px',
                border: 'none',
                background: authMode === 'registro' ? '#FFFFFF' : 'transparent',
                color: authMode === 'registro' ? '#111318' : '#757B8C',
                fontWeight: authMode === 'registro' ? 700 : 500,
                boxShadow: authMode === 'registro' ? '0 2px 10px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                fontSize: '0.84rem',
                transition: 'all 150ms'
              }}
            >
              First Time Here? Sign Up
            </button>
          </div>

          {/* ERRO BANNER */}
          {authError && (
            <div 
              style={{ 
                padding: '12px 16px', 
                backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                border: '1px solid rgba(239, 68, 68, 0.25)', 
                borderRadius: '16px', 
                color: '#DC2626', 
                fontSize: '0.82rem', 
                fontWeight: 500,
                marginBottom: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}
            >
              <AlertCircle size={16} />
              <span>{authError}</span>
            </div>
          )}

          {/* FORMULÁRIO DE LOGIN */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4B5262', marginBottom: '6px' }}>
                  Enter Email / Username
                </label>
                <input 
                  type="text" 
                  className="soft-input font-mono"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  placeholder="LB"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4B5262', marginBottom: '6px' }}>
                  Enter Password
                </label>
                <input 
                  type="password" 
                  className="soft-input font-mono"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', height: '48px', marginTop: '8px', fontSize: '0.92rem' }}
                disabled={authLoading}
              >
                {authLoading ? <RefreshCw size={18} className="animate-spin" /> : null}
                {authLoading ? 'Verifying...' : 'Log In'}
              </button>
            </form>
          )}

          {/* FORMULÁRIO DE CADASTRO COM CONVITE */}
          {authMode === 'registro' && (
            <form onSubmit={handleRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4B5262', marginBottom: '4px' }}>
                  Invite Code
                </label>
                <input 
                  type="text" 
                  className="soft-input font-mono"
                  value={regCodigoConvite}
                  onChange={e => setRegCodigoConvite(e.target.value)}
                  placeholder="FUTSTATS-2026"
                  required
                  style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4B5262', marginBottom: '4px' }}>
                  Full Name / Nickname
                </label>
                <input 
                  type="text" 
                  className="soft-input"
                  value={regNome}
                  onChange={e => setRegNome(e.target.value)}
                  placeholder="Alice James"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4B5262', marginBottom: '4px' }}>
                  Choose Username
                </label>
                <input 
                  type="text" 
                  className="soft-input font-mono"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  placeholder="alice"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4B5262', marginBottom: '4px' }}>
                  Choose Password
                </label>
                <input 
                  type="password" 
                  className="soft-input font-mono"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Min 4 chars"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', height: '48px', marginTop: '6px' }}
                disabled={authLoading}
              >
                {authLoading ? <RefreshCw size={18} className="animate-spin" /> : null}
                {authLoading ? 'Creating Account...' : 'Get Started'}
              </button>
            </form>
          )}

          {/* DICA DE SUPORTE */}
          <div style={{ marginTop: '22px', textAlign: 'center', fontSize: '0.76rem', color: '#8E94A4' }}>
            By continuing, you agree to our Terms of Service & Privacy Policy.
          </div>
        </div>
      </div>
    );
  }

  // ==================== DASHBOARD AUTENTICADA (SOOMA EXPERIENCE INTEGRADA) ====================
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #FBF9FF 0%, #F5F1FB 45%, #FDEEE9 100%)',
        color: '#15171C',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        padding: '18px 24px 28px 20px',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      {/* ================= BARRA LATERAL (DOCK COMPACTO OUTGROWD) ================= */}
      <aside
        style={{
          width: '74px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          flexShrink: 0,
          paddingTop: '6px'
        }}
      >
        {/* LOGO PILL SOOMA */}
        <div
          style={{
            backgroundColor: '#12141A',
            color: '#FFFFFF',
            width: '56px',
            height: '42px',
            borderRadius: '21px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.85rem',
            letterSpacing: '-0.02em',
            boxShadow: '0 8px 20px -4px rgba(18, 20, 26, 0.35)',
            cursor: 'pointer'
          }}
          title="FutStats by Sooma"
          onClick={() => setActiveTab('overview')}
        >
          Sooma
        </div>

        {/* ITENS DE NAVEGAÇÃO VERTICAL */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          {/* Home / Overview */}
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: activeTab === 'overview' ? '#12141A' : 'transparent',
                color: activeTab === 'overview' ? '#FFFFFF' : '#8A8F9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease',
                boxShadow: activeTab === 'overview' ? '0 6px 16px -2px rgba(18, 20, 26, 0.25)' : 'none'
              }}
            >
              <Flame size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 600, color: activeTab === 'overview' ? '#12141A' : '#9499A8' }}>
              Home
            </span>
          </button>

          {/* Confrontos H2H */}
          <button
            onClick={() => setActiveTab('h2h')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: activeTab === 'h2h' ? '#12141A' : 'transparent',
                color: activeTab === 'h2h' ? '#FFFFFF' : '#8A8F9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease',
                boxShadow: activeTab === 'h2h' ? '0 6px 16px -2px rgba(18, 20, 26, 0.25)' : 'none'
              }}
            >
              <Swords size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 600, color: activeTab === 'h2h' ? '#12141A' : '#9499A8' }}>
              H2H
            </span>
          </button>

          {/* Jogadores */}
          <button
            onClick={() => setActiveTab('jogadores')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: activeTab === 'jogadores' ? '#12141A' : 'transparent',
                color: activeTab === 'jogadores' ? '#FFFFFF' : '#8A8F9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease',
                boxShadow: activeTab === 'jogadores' ? '0 6px 16px -2px rgba(18, 20, 26, 0.25)' : 'none'
              }}
            >
              <User size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 600, color: activeTab === 'jogadores' ? '#12141A' : '#9499A8' }}>
              Atletas
            </span>
          </button>

          {/* Oráculo & IA */}
          <button
            onClick={() => setActiveTab('oraculo')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: activeTab === 'oraculo' ? '#12141A' : 'transparent',
                color: activeTab === 'oraculo' ? '#FFFFFF' : '#8A8F9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease',
                boxShadow: activeTab === 'oraculo' ? '0 6px 16px -2px rgba(18, 20, 26, 0.25)' : 'none'
              }}
            >
              <Brain size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 600, color: activeTab === 'oraculo' ? '#12141A' : '#9499A8' }}>
              Oráculo
            </span>
          </button>

          {/* Explorador de Jogos */}
          <button
            onClick={() => setActiveTab('playground')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: activeTab === 'playground' ? '#12141A' : 'transparent',
                color: activeTab === 'playground' ? '#FFFFFF' : '#8A8F9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease',
                boxShadow: activeTab === 'playground' ? '0 6px 16px -2px rgba(18, 20, 26, 0.25)' : 'none'
              }}
            >
              <Search size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 600, color: activeTab === 'playground' ? '#12141A' : '#9499A8' }}>
              Jogos
            </span>
          </button>

          {/* Clima */}
          <button
            onClick={() => setActiveTab('clima')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: activeTab === 'clima' ? '#12141A' : 'transparent',
                color: activeTab === 'clima' ? '#FFFFFF' : '#8A8F9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease',
                boxShadow: activeTab === 'clima' ? '0 6px 16px -2px rgba(18, 20, 26, 0.25)' : 'none'
              }}
            >
              <CloudRain size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 600, color: activeTab === 'clima' ? '#12141A' : '#9499A8' }}>
              Clima
            </span>
          </button>

          {/* Apito */}
          <button
            onClick={() => setActiveTab('arbitros')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: (activeTab === 'arbitros' || activeTab === 'arbitragem') ? '#12141A' : 'transparent',
                color: (activeTab === 'arbitros' || activeTab === 'arbitragem') ? '#FFFFFF' : '#8A8F9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease',
                boxShadow: (activeTab === 'arbitros' || activeTab === 'arbitragem') ? '0 6px 16px -2px rgba(18, 20, 26, 0.25)' : 'none'
              }}
            >
              <ShieldAlert size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 600, color: (activeTab === 'arbitros' || activeTab === 'arbitragem') ? '#12141A' : '#9499A8' }}>
              Apito
            </span>
          </button>

          {/* Social Tweets */}
          <button
            onClick={() => setActiveTab('tweets')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: activeTab === 'tweets' ? '#12141A' : 'transparent',
                color: activeTab === 'tweets' ? '#FFFFFF' : '#8A8F9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease',
                boxShadow: activeTab === 'tweets' ? '0 6px 16px -2px rgba(18, 20, 26, 0.25)' : 'none'
              }}
            >
              <Sparkles size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 600, color: activeTab === 'tweets' ? '#12141A' : '#9499A8' }}>
              Social
            </span>
          </button>

          {/* Tabela Ao Vivo */}
          <button
            onClick={() => setActiveTab('aovivo')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: activeTab === 'aovivo' ? '#12141A' : 'transparent',
                color: activeTab === 'aovivo' ? '#FFFFFF' : '#8A8F9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease',
                boxShadow: activeTab === 'aovivo' ? '0 6px 16px -2px rgba(18, 20, 26, 0.25)' : 'none'
              }}
            >
              <Trophy size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 600, color: activeTab === 'aovivo' ? '#12141A' : '#9499A8' }}>
              Ao Vivo
            </span>
          </button>
        </nav>
      </aside>

      {/* ================= CORPO PRINCIPAL ================= */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingLeft: '16px' }}>
        
        {/* CABEÇALHO SUPERIOR (USUÁRIO + AÇÕES SOOMA) */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span 
              style={{
                backgroundColor: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#111318',
                boxShadow: '0 4px 14px -2px rgba(100, 90, 130, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.9)'
              }}
            >
              ⚽ {overview?.total_partidas ? `${overview.total_partidas.toLocaleString('pt-BR')} Partidas` : '55.395 Jogos'}
            </span>
            <span 
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#059669',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              ● Sistema Conectado
            </span>
          </div>

          {/* Controles da Direita */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {currentUser.role === 'admin' && (
              <button
                onClick={copiarConviteEquipe}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#12141A',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: '9999px',
                  padding: '7px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px -2px rgba(100, 90, 130, 0.08)'
                }}
              >
                {conviteCopiado ? <Check size={14} color="#10B981" /> : <UserPlus size={14} />}
                {conviteCopiado ? 'Convite Copiado!' : 'Convidar'}
              </button>
            )}

            {/* User Profile Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                padding: '4px 14px 4px 5px',
                borderRadius: '9999px',
                boxShadow: '0 4px 16px -2px rgba(100, 90, 130, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                cursor: 'pointer'
              }}
              onClick={handleLogout}
              title="Clique para sair"
            >
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
                alt="Avatar"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1B1E26' }}>
                {currentUser?.nome || 'LB'}
              </span>
              <LogOut size={13} color="#9095A2" />
            </div>
          </div>
        </header>

        {/* ================= SELETOR HORIZONTAL DE SUB-ABAS (ESTILO PILL OUTGROWD) ================= */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(12px)',
            padding: '6px',
            borderRadius: '9999px',
            boxShadow: '0 4px 18px -4px rgba(100, 85, 140, 0.06)',
            marginBottom: '26px',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            overflowX: 'auto'
          }}
        >
          {[
            { id: 'overview', label: 'Home Overview' },
            { id: 'h2h', label: 'Raio-X de Confrontos' },
            { id: 'jogadores', label: 'Atletas & Estatísticas' },
            { id: 'oraculo', label: 'Oráculo & IA' },
            { id: 'playground', label: 'Explorador de Jogos' },
            { id: 'clima', label: 'Futebol x Clima' },
            { id: 'arbitros', label: 'Raio-X do Apito' },
            { id: 'tweets', label: 'Gerador Social' },
            { id: 'aovivo', label: 'Tabela & Ao Vivo' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '7px 18px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#12141A' : 'transparent',
                color: activeTab === tab.id ? '#FFFFFF' : '#6B7280',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 160ms ease',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(18, 20, 26, 0.25)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ================= VIEW 1: HOME OVERVIEW (HERO CARDS DA REFERÊNCIA) ================= */}
        {activeTab === 'overview' && (
          <SoomaFutStatsView
            currentUser={currentUser}
            overview={overview}
            onNavigateTab={(t) => setActiveTab(t)}
            onSelectH2H={(c1, c2) => { setClube1(c1); setClube2(c2); setActiveTab('h2h'); }}
            onSelectJogador={(p) => { setSelectedPlayer(p); setActiveTab('jogadores'); }}
            onRunOraculo={(text) => { setOraculoPrompt(text); setActiveTab('oraculo'); }}
            onLogout={handleLogout}
          />
        )}

      {/* ABA 1: RAIO-X H2H */}
      {activeTab === 'h2h' && (
        <section>
          {/* SELETOR DE CLUBES */}
          <div className="soft-card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Swords size={20} color="#87CEEB" /> Escolha os Clubes do Duelo
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Primeiro Clube
                </label>
                <input 
                  type="text" 
                  className="soft-input"
                  value={clube1}
                  onChange={e => setClube1(e.target.value)}
                  placeholder="Ex: Flamengo, Palmeiras, Corinthians..."
                  list="clubes-sugestoes"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Segundo Clube (Rival)
                </label>
                <input 
                  type="text" 
                  className="soft-input"
                  value={clube2}
                  onChange={e => setClube2(e.target.value)}
                  placeholder="Ex: Vasco, São Paulo, Santos..."
                  list="clubes-sugestoes"
                />
              </div>

              <div>
                <button className="btn-primary" style={{ width: '100%' }} onClick={carregarH2H} disabled={h2hLoading}>
                  {h2hLoading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
                  Comparar Retrospecto
                </button>
              </div>
            </div>

            <datalist id="clubes-sugestoes">
              {clubesList.map(c => (
                <option key={c.nome} value={c.nome} />
              ))}
            </datalist>
          </div>

          {/* RESULTADO DO CONFRONTO */}
          {h2hData && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                  Retrospecto Histórico: {h2hData.clube1} × {h2hData.clube2}
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="btn-secondary"
                    onClick={() =>
                      baixarCardSocialPNG({
                        categoria: 'Raio-X de Confrontos',
                        titulo: `${h2hData.clube1} x ${h2hData.clube2}`,
                        subtitulo: `${h2hData.total_jogos} confrontos oficiais catalogados no acervo`,
                        metricas: [
                          { label: `Vitórias ${h2hData.clube1}`, valor: h2hData.vitorias_clube1, cor: '#38BDF8' },
                          { label: 'Empates', valor: h2hData.empates, cor: '#94A3B8' },
                          { label: `Vitórias ${h2hData.clube2}`, valor: h2hData.vitorias_clube2, cor: '#F472B6' },
                          { label: 'Total de Gols', valor: `${h2hData.gols_clube1}x${h2hData.gols_clube2}`, cor: '#10B981' }
                        ],
                        destaqueTexto: h2hData.tabu_invicto
                          ? `Tabu ativo: ${h2hData.tabu_invicto.clube} está invicto há ${h2hData.tabu_invicto.jogos} jogos no confronto!`
                          : `Média histórica de ${((h2hData.gols_clube1 + h2hData.gols_clube2) / Math.max(1, h2hData.total_jogos)).toFixed(2)} golos por partida.`,
                        nomeArquivo: `h2h-${h2hData.clube1.toLowerCase()}-${h2hData.clube2.toLowerCase()}.png`
                      })
                    }
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    <Share2 size={16} /> Baixar Card PNG (Twitter/X)
                  </button>
                  <button
                    className="btn-primary"
                    onClick={baixarCardH2H}
                    disabled={downloadingCard}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    <Camera size={16} />
                    {downloadingCard ? 'Gerando Card...' : '📸 Baixar Card Quadrado (Instagram)'}
                  </button>
                </div>
              </div>

              {/* PLACAR GERAL RESUMO */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="soft-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Vitórias de {h2hData.clube1}</div>
                  <div className="font-mono" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#0369A1' }}>
                    {h2hData.vitorias_clube1}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {h2hData.total_jogos > 0 ? ((h2hData.vitorias_clube1 / h2hData.total_jogos) * 100).toFixed(1) : 0}% dos jogos
                  </div>
                </div>

                <div className="soft-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Empates</div>
                  <div className="font-mono" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#64748B' }}>
                    {h2hData.empates}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {h2hData.total_jogos > 0 ? ((h2hData.empates / h2hData.total_jogos) * 100).toFixed(1) : 0}% dos jogos
                  </div>
                </div>

                <div className="soft-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Vitórias de {h2hData.clube2}</div>
                  <div className="font-mono" style={{ fontSize: '2.5rem', fontWeight: '700', color: '#BE185D' }}>
                    {h2hData.vitorias_clube2}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {h2hData.total_jogos > 0 ? ((h2hData.vitorias_clube2 / h2hData.total_jogos) * 100).toFixed(1) : 0}% dos jogos
                  </div>
                </div>

                <div className="soft-card" style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total de Jogos Oficiais</div>
                  <div className="font-mono" style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                    {h2hData.total_jogos}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Gols: {h2hData.gols_clube1} x {h2hData.gols_clube2}
                  </div>
                </div>
              </div>

              {/* CARD DE TABU / INVENCIBILIDADE */}
              {h2hData.tabu_invicto && (
                <div className="soft-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px', borderLeft: '4px solid #10B981' }}>
                  <Flame size={24} color="#10B981" />
                  <div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Série Invicte em Vigor: </strong>
                    <span style={{ color: 'var(--text-muted)' }}>
                      O <strong style={{ color: '#10B981' }}>{h2hData.tabu_invicto.clube}</strong> não perde para o rival há <strong>{h2hData.tabu_invicto.jogos} confrontos seguidos</strong>.
                    </span>
                  </div>
                </div>
              )}

              {/* MAIORES GOLEADAS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="soft-card" style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Trophy size={18} color="#0369A1" />
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Maior Goleada de {h2hData.clube1}</span>
                  </div>
                  {h2hData.maior_goleada_clube1 ? (
                    <div>
                      <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0369A1' }}>
                        {h2hData.maior_goleada_clube1.mandante} {h2hData.maior_goleada_clube1.placar} {h2hData.maior_goleada_clube1.visitante}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {h2hData.maior_goleada_clube1.data} • {h2hData.maior_goleada_clube1.campeonato} • {h2hData.maior_goleada_clube1.estadio || 'Estádio não inf.'}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhuma vitória catalogada</span>
                  )}
                </div>

                <div className="soft-card" style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Trophy size={18} color="#BE185D" />
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Maior Goleada de {h2hData.clube2}</span>
                  </div>
                  {h2hData.maior_goleada_clube2 ? (
                    <div>
                      <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: '700', color: '#BE185D' }}>
                        {h2hData.maior_goleada_clube2.mandante} {h2hData.maior_goleada_clube2.placar} {h2hData.maior_goleada_clube2.visitante}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {h2hData.maior_goleada_clube2.data} • {h2hData.maior_goleada_clube2.campeonato} • {h2hData.maior_goleada_clube2.estadio || 'Estádio não inf.'}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhuma vitória catalogada</span>
                  )}
                </div>
              </div>

              {/* LISTA DOS ÚLTIMOS CONFRONTOS */}
              <div className="soft-card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '14px' }}>
                  Últimos Confrontos Oficiais
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 8px' }}>Data</th>
                        <th style={{ padding: '10px 8px' }}>Campeonato</th>
                        <th style={{ padding: '10px 8px' }}>Partida</th>
                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>Placar</th>
                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>Odds & Favorito</th>
                        <th style={{ padding: '10px 8px' }}>Estádio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {h2hData.partidas.map(p => (
                        <tr key={p.id_partida} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="font-mono" style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{p.data}</td>
                          <td style={{ padding: '10px 8px' }}>
                            <span className="badge badge-blue">{p.campeonato}</span>
                          </td>
                          <td style={{ padding: '10px 8px', fontWeight: '500' }}>
                            {p.mandante} <span style={{ color: 'var(--text-subtle)' }}>x</span> {p.visitante}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '700' }}>
                            {p.placar || `${p.gols_mandante} x ${p.gols_visitante}`}
                          </td>
                          <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                            {p.odd_mandante ? (
                              <div style={{ fontSize: '0.78rem' }} className="font-mono">
                                <span title={`Probabilidade Mandante: ${p.prob_mandante}%`}>
                                  <strong>{p.odd_mandante}</strong>
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}> • </span>
                                <span title={`Probabilidade Empate: ${p.prob_empate}%`}>
                                  {p.odd_empate}
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}> • </span>
                                <span title={`Probabilidade Visitante: ${p.prob_visitante}%`}>
                                  <strong>{p.odd_visitante}</strong>
                                </span>
                                {p.status_zebra && p.status_zebra.includes('Zebra') && (
                                  <div style={{ marginTop: '2px' }}>
                                    <span className="badge badge-pink" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                                      {p.status_zebra}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {p.estadio || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ABA 2: JOGADORES & ESTATÍSTICAS */}
      {activeTab === 'jogadores' && (
        <section>
          {/* BARRA DE PESQUISA DE JOGADORES */}
          <div className="soft-card" style={{ padding: '22px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={22} color="#87CEEB" /> Busca de Jogadores & Histórico Individual
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
              Pesquise qualquer atleta da história do futebol brasileiro para ver gols, cartões, jogos e maiores vítimas.
            </p>

            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input 
                    type="text" 
                    className="soft-input"
                    value={playerSearch}
                    onChange={e => setPlayerSearch(e.target.value)}
                    placeholder="Digite o nome do jogador (Ex: Zico, Roberto Dinamite, Thiago Heleno, Fagner, Gabigol...)"
                    style={{ paddingLeft: '40px', fontSize: '1rem', height: '46px' }}
                  />
                  <Search size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                  {playerSearch && (
                    <button 
                      onClick={() => { setPlayerSearch(''); setPlayerSuggestions([]); }}
                      style={{ position: 'absolute', right: '12px', top: '13px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {searchLoading && (
                  <RefreshCw size={20} className="animate-spin" color="#87CEEB" />
                )}
              </div>

              {/* DROPDOWN DE SUGESTÕES AUTOCOMPLETE */}
              {playerSuggestions.length > 0 && (
                <div 
                  className="soft-card" 
                  style={{ 
                    position: 'absolute', 
                    top: '52px', 
                    left: 0, 
                    right: 0, 
                    zIndex: 50, 
                    maxHeight: '360px', 
                    overflowY: 'auto',
                    boxShadow: 'var(--shadow-lift)',
                    border: '1px solid var(--border-focus)'
                  }}
                >
                  {playerSuggestions.map((s, idx) => (
                    <div 
                      key={idx}
                      onClick={() => carregarPerfilJogador(s.nome)}
                      style={{ 
                        padding: '12px 16px', 
                        borderBottom: '1px solid var(--border)', 
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'background-color 150ms'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div>
                        <strong style={{ fontSize: '0.98rem', color: 'var(--text-main)' }}>{s.nome}</strong>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {s.clubes?.slice(0, 4).map((c, i) => (
                            <span key={i} className="badge badge-blue" style={{ fontSize: '0.72rem' }}>{c}</span>
                          ))}
                          {s.clubes?.length > 4 && (
                            <span className="badge" style={{ fontSize: '0.72rem', backgroundColor: 'var(--surface-active)' }}>
                              +{s.clubes.length - 4} clubes
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '0.85rem' }}>
                        {s.gols > 0 && (
                          <span style={{ color: '#15803D', fontWeight: '600' }}>⚽ {s.gols} gols</span>
                        )}
                        {(s.amarelos > 0 || s.vermelhos > 0) && (
                          <span>
                            {s.amarelos > 0 && <span style={{ color: '#D97706', marginRight: '6px' }}>🟨 {s.amarelos}</span>}
                            {s.vermelhos > 0 && <span style={{ color: '#DC2626' }}>🟥 {s.vermelhos}</span>}
                          </span>
                        )}
                        <ChevronRight size={16} color="var(--text-subtle)" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ATALHOS RÁPIDOS DE JOGADORES FAMOSOS */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Sugestões rápidas:</span>
              {jogadoresPopulares.map(nome => (
                <button
                  key={nome}
                  onClick={() => carregarPerfilJogador(nome)}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '14px' }}
                >
                  {nome}
                </button>
              ))}
            </div>
          </div>

          {/* LOADING DO PERFIL */}
          {profileLoading && (
            <div className="soft-card" style={{ padding: '40px', textAlign: 'center' }}>
              <RefreshCw size={32} className="animate-spin" color="#87CEEB" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Carregando dados detalhados do atleta...</p>
            </div>
          )}

          {/* PERFIL DO ATLETA SELECIONADO */}
          {!profileLoading && playerProfile && (
            <div>
              {/* HEADER DO ATLETA */}
              <div className="soft-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontSize: '1.7rem', fontWeight: '700' }}>
                        {playerProfile.nome}
                      </h2>
                      {playerProfile.posicao && (
                        <span className="badge font-mono" style={{ background: '#FEF3C7', color: '#92400E' }}>
                          {playerProfile.posicao}
                        </span>
                      )}
                      {playerProfile.ogol_id && (
                        <a 
                          href={`https://www.ogol.com.br/jogador/${playerProfile.ogol_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="badge font-mono"
                          style={{ background: '#F1F5F9', color: '#475569', textDecoration: 'none', border: '1px solid #CBD5E1', fontSize: '0.75rem' }}
                          title="Perfil oficial no OGol"
                        >
                          🆔 OGol #{playerProfile.ogol_id}
                        </a>
                      )}
                      {playerProfile.resumo?.ano_min && (
                        <span className="badge badge-blue font-mono">
                          {playerProfile.resumo.ano_min} - {playerProfile.resumo.ano_max}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {playerProfile.historico_clubes?.map(c => (
                        <span 
                          key={c.clube}
                          onClick={() => carregarPerfilJogador(playerProfile.nome, playerClubeFiltro === c.clube ? '' : c.clube)}
                          className={playerClubeFiltro === c.clube ? 'badge badge-green' : 'badge badge-blue'}
                          style={{ cursor: 'pointer', fontSize: '0.78rem' }}
                          title="Clique para filtrar por este clube"
                        >
                          {c.clube} ({c.jogos}j / {c.gols}g)
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {playerClubeFiltro && (
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                        onClick={() => carregarPerfilJogador(playerProfile.nome, '')}
                      >
                        Limpar Filtro ({playerClubeFiltro})
                      </button>
                    )}
                    <button 
                      className="btn-primary" 
                      style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                      onClick={() => {
                        const topV = playerProfile.top_vitimas?.[0] ? `${playerProfile.top_vitimas[0].clube} (${playerProfile.top_vitimas[0].gols} gols)` : 'Vários';
                        const txt = `📊 RAIO-X DO CRAQUE: ${playerProfile.nome}\n\n` +
                          `⚽ Gols: ${playerProfile.resumo.total_gols} (${playerProfile.resumo.media_gols} por jogo)\n` +
                          `🎯 Assistências: ${playerProfile.resumo.assistencias ?? 0}\n` +
                          `🟨 Cartões Amarelos: ${playerProfile.resumo.amarelos}\n` +
                          `🟥 Cartões Vermelhos: ${playerProfile.resumo.vermelhos}\n` +
                          `🏟️ Jogos Catalogados: ${playerProfile.resumo.jogos_registrados} (${playerProfile.resumo.ano_min}-${playerProfile.resumo.ano_max})\n` +
                          `🎯 Maior Vítima: ${topV}\n\n` +
                          `#Futebol #Dados #Estatisticas #FutStats`;
                        copiarTweet(txt, 'tweet-jogador');
                      }}
                    >
                      {copiedKey === 'tweet-jogador' ? <Check size={16} /> : <Share2 size={16} />}
                      {copiedKey === 'tweet-jogador' ? 'Copiado!' : 'Compartilhar no X/Twitter'}
                    </button>
                  </div>
                </div>

                {/* 5 CARDS DE MÉTRICAS PRINCIPAIS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', marginTop: '22px' }}>
                  {/* CARD GOLS */}
                  <div className="soft-card" style={{ padding: '16px', textAlign: 'center', borderTop: '3px solid #10B981' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⚽ Gols Marcados</div>
                    <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: '700', color: '#15803D', margin: '4px 0' }}>
                      {playerProfile.resumo.total_gols}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
                      <span>Normais: {playerProfile.resumo.gols_normais}</span>
                      {playerProfile.resumo.gols_penalti > 0 && <span>• Pên: {playerProfile.resumo.gols_penalti}</span>}
                      {playerProfile.resumo.gols_falta > 0 && <span>• Falta: {playerProfile.resumo.gols_falta}</span>}
                    </div>
                  </div>

                  {/* CARD AMARELOS */}
                  <div className="soft-card" style={{ padding: '16px', textAlign: 'center', borderTop: '3px solid #F59E0B' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🟨 Cartões Amarelos</div>
                    <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: '700', color: '#D97706', margin: '4px 0' }}>
                      {playerProfile.resumo.amarelos}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Em {playerProfile.resumo.jogos_registrados} partidas
                    </div>
                  </div>

                  {/* CARD VERMELHOS */}
                  <div className="soft-card" style={{ padding: '16px', textAlign: 'center', borderTop: '3px solid #EF4444' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🟥 Cartões Vermelhos</div>
                    <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: '700', color: '#DC2626', margin: '4px 0' }}>
                      {playerProfile.resumo.vermelhos}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Expulsões diretas / 2º amarelo
                    </div>
                  </div>

                  {/* CARD ASSISTÊNCIAS */}
                  <div className="soft-card" style={{ padding: '16px', textAlign: 'center', borderTop: '3px solid #0284C7' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🎯 Assistências</div>
                    <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: '700', color: '#0284C7', margin: '4px 0' }}>
                      {playerProfile.resumo.assistencias ?? 0}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }} title={playerProfile.resumo.nota_assistencias}>
                      Passes para gol (OGol / CBF)
                    </div>
                  </div>

                  {/* CARD JOGOS */}
                  <div className="soft-card" style={{ padding: '16px', textAlign: 'center', borderTop: '3px solid #6366F1' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🏟️ Jogos Catalogados</div>
                    <div className="font-mono" style={{ fontSize: '2.2rem', fontWeight: '700', color: '#4F46E5', margin: '4px 0' }}>
                      {playerProfile.resumo.jogos_registrados}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Média: {playerProfile.resumo.media_gols} gols/jogo
                    </div>
                  </div>
                </div>

                {/* NOTA METODOLÓGICA SÚMULA CBF */}
                <div style={{ marginTop: '16px', padding: '10px 14px', backgroundColor: 'var(--surface-hover)', borderRadius: '8px', fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={15} color="#87CEEB" />
                  <span>
                    <strong>Metodologia Oficial:</strong> {playerProfile.resumo.nota_assistencias}
                  </span>
                </div>
              </div>

              {/* DUAS COLUNAS: MAIORES VÍTIMAS E DESEMPENHO POR CLUBE */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {/* MAIORES VÍTIMAS */}
                <div className="soft-card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={18} color="#EF4444" /> Maiores Vítimas (Clubes Mais Vazados)
                  </h3>
                  {playerProfile.top_vitimas?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {playerProfile.top_vitimas.map((v, i) => {
                        const maxG = playerProfile.top_vitimas[0].gols;
                        const pct = Math.max(10, (v.gols / maxG) * 100);
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                              <span><strong>{i + 1}º</strong> {v.clube}</span>
                              <span className="font-mono" style={{ fontWeight: '700', color: '#15803D' }}>{v.gols} {v.gols === 1 ? 'gol' : 'gols'}</span>
                            </div>
                            <div style={{ height: '7px', width: '100%', backgroundColor: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#10B981', borderRadius: '4px' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Sem gols catalogados ou dados de adversários.
                    </p>
                  )}
                </div>

                {/* DESEMPENHO POR CLUBE */}
                <div className="soft-card" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={18} color="#87CEEB" /> Desempenho por Clube Defendido
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '8px 6px' }}>Clube</th>
                          <th style={{ padding: '8px 6px', textAlign: 'center' }}>Jogos</th>
                          <th style={{ padding: '8px 6px', textAlign: 'center' }}>Gols</th>
                          <th style={{ padding: '8px 6px', textAlign: 'center' }}>🟨</th>
                          <th style={{ padding: '8px 6px', textAlign: 'center' }}>🟥</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playerProfile.historico_clubes?.map((c, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '8px 6px', fontWeight: '500' }}>{c.clube}</td>
                            <td className="font-mono" style={{ padding: '8px 6px', textAlign: 'center' }}>{c.jogos}</td>
                            <td className="font-mono" style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '700', color: '#15803D' }}>{c.gols}</td>
                            <td className="font-mono" style={{ padding: '8px 6px', textAlign: 'center', color: '#D97706' }}>{c.amarelos}</td>
                            <td className="font-mono" style={{ padding: '8px 6px', textAlign: 'center', color: '#DC2626' }}>{c.vermelhos}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* DESEMPENHO POR TORNEIO */}
              {playerProfile.historico_torneios?.length > 0 && (
                <div className="soft-card" style={{ padding: '20px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Trophy size={18} color="#F59E0B" /> Histórico por Campeonato
                  </h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '8px 6px' }}>Campeonato</th>
                          <th style={{ padding: '8px 6px', textAlign: 'center' }}>Período</th>
                          <th style={{ padding: '8px 6px', textAlign: 'center' }}>Jogos</th>
                          <th style={{ padding: '8px 6px', textAlign: 'center' }}>Gols</th>
                          <th style={{ padding: '8px 6px', textAlign: 'center' }}>Amarelos</th>
                          <th style={{ padding: '8px 6px', textAlign: 'center' }}>Vermelhos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {playerProfile.historico_torneios.map((t, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '8px 6px', fontWeight: '500' }}>
                              <span className="badge badge-blue">{t.campeonato}</span>
                            </td>
                            <td className="font-mono" style={{ padding: '8px 6px', textAlign: 'center', color: 'var(--text-muted)' }}>
                              {t.ano_min ? `${t.ano_min} - ${t.ano_max}` : '-'}
                            </td>
                            <td className="font-mono" style={{ padding: '8px 6px', textAlign: 'center' }}>{t.jogos}</td>
                            <td className="font-mono" style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '700', color: '#15803D' }}>{t.gols}</td>
                            <td className="font-mono" style={{ padding: '8px 6px', textAlign: 'center', color: '#D97706' }}>{t.amarelos}</td>
                            <td className="font-mono" style={{ padding: '8px 6px', textAlign: 'center', color: '#DC2626' }}>{t.vermelhos}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* LISTA COMPLETA DAS PARTIDAS DO ATLETA */}
              <div className="soft-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '600' }}>
                    Partidas Catalogadas & Lances ({playerProfile.partidas?.length})
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Exibindo as partidas mais recentes onde o atleta atuou, marcou ou foi punido
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 8px' }}>Data</th>
                        <th style={{ padding: '10px 8px' }}>Campeonato</th>
                        <th style={{ padding: '10px 8px' }}>Partida</th>
                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>Placar</th>
                        <th style={{ padding: '10px 8px' }}>Lances & Ações do Atleta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerProfile.partidas?.map(p => (
                        <tr key={p.id_partida} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="font-mono" style={{ padding: '10px 8px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {p.data}
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <span className="badge badge-blue">{p.campeonato}</span>
                          </td>
                          <td style={{ padding: '10px 8px', fontWeight: '500' }}>
                            {p.mandante} <span style={{ color: 'var(--text-subtle)' }}>x</span> {p.visitante}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '700' }}>
                            {p.placar || '-'}
                          </td>
                          <td style={{ padding: '10px 8px' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {p.gols?.map((g, gi) => (
                                <span key={`g-${gi}`} className="badge badge-green">
                                  ⚽ Gol {g.minuto ? `aos ${g.minuto}'` : ''} {g.tipo && g.tipo !== 'Normal' ? `(${g.tipo})` : ''}
                                </span>
                              ))}
                              {p.cartoes?.map((c, ci) => (
                                <span 
                                  key={`c-${ci}`} 
                                  className={c.cartao?.toLowerCase().includes('vermelho') ? 'badge badge-pink' : 'badge'}
                                  style={{ backgroundColor: c.cartao?.toLowerCase().includes('amarelo') ? 'rgba(245, 158, 11, 0.2)' : undefined, color: c.cartao?.toLowerCase().includes('amarelo') ? '#D97706' : undefined }}
                                >
                                  {c.cartao?.toLowerCase().includes('vermelho') ? '🟥 Vermelho' : '🟨 Amarelo'} {c.minuto ? `aos ${c.minuto}'` : ''} {c.motivo ? `(${c.motivo})` : ''}
                                </span>
                              ))}
                              {p.escalacao && (
                                <span className="badge" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-muted)' }}>
                                  📋 {p.escalacao.titular ? 'Titular' : 'Reserva'} {p.escalacao.posicao ? `• ${p.escalacao.posicao}` : ''} {p.escalacao.camisa ? `(Nº ${p.escalacao.camisa})` : ''}
                                </span>
                              )}
                              {!p.gols?.length && !p.cartoes?.length && !p.escalacao && (
                                <span style={{ color: 'var(--text-subtle)', fontSize: '0.78rem' }}>Sem eventos registrados</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ESTADO INICIAL / LEADERBOARDS QUANDO NENHUM JOGADOR ESTIVER SELECIONADO */}
          {!playerProfile && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '600' }}>
                  Rankings Históricos & Destaques Nacionais
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Clique em qualquer jogador para abrir o dossiê completo de estatísticas da carreira.
                </p>
              </div>

              {destaquesLoading ? (
                <div className="soft-card" style={{ padding: '30px', textAlign: 'center' }}>
                  <RefreshCw size={24} className="animate-spin" color="#87CEEB" style={{ margin: '0 auto 8px' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Carregando rankings históricos...</p>
                </div>
              ) : destaques ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '20px' }}>
                  {/* TOP ARTILHEIROS */}
                  <div className="soft-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <Award size={20} color="#10B981" />
                      <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>Top 10 Maiores Artilheiros</h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {destaques.artilheiros.map((a, i) => (
                        <div 
                          key={i}
                          onClick={() => carregarPerfilJogador(a.nome)}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '8px 10px', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            backgroundColor: 'var(--surface-hover)',
                            transition: 'transform 150ms'
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                        >
                          <div>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                              <strong style={{ color: '#10B981', marginRight: '6px' }}>{i + 1}º</strong> {a.nome}
                            </span>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {a.clubes.slice(0, 3).join(', ')}
                            </div>
                          </div>
                          <span className="badge badge-green font-mono" style={{ fontSize: '0.85rem' }}>
                            ⚽ {a.total} gols
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TOP AMARELOS */}
                  <div className="soft-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <ShieldAlert size={20} color="#F59E0B" />
                      <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>Top 10 Cartões Amarelos</h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {destaques.amarelos.map((a, i) => (
                        <div 
                          key={i}
                          onClick={() => carregarPerfilJogador(a.nome)}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '8px 10px', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            backgroundColor: 'var(--surface-hover)',
                            transition: 'transform 150ms'
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                        >
                          <div>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                              <strong style={{ color: '#F59E0B', marginRight: '6px' }}>{i + 1}º</strong> {a.nome}
                            </span>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {a.clubes.slice(0, 3).join(', ')}
                            </div>
                          </div>
                          <span className="badge font-mono" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#D97706', fontSize: '0.85rem' }}>
                            🟨 {a.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TOP VERMELHOS */}
                  <div className="soft-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <AlertCircle size={20} color="#EF4444" />
                      <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>Top 10 Cartões Vermelhos</h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {destaques.vermelhos.map((a, i) => (
                        <div 
                          key={i}
                          onClick={() => carregarPerfilJogador(a.nome)}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '8px 10px', 
                            borderRadius: '8px', 
                            cursor: 'pointer',
                            backgroundColor: 'var(--surface-hover)',
                            transition: 'transform 150ms'
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                        >
                          <div>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                              <strong style={{ color: '#EF4444', marginRight: '6px' }}>{i + 1}º</strong> {a.nome}
                            </span>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {a.clubes.slice(0, 3).join(', ')}
                            </div>
                          </div>
                          <span className="badge badge-pink font-mono" style={{ fontSize: '0.85rem' }}>
                            🟥 {a.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </section>
      )}

      {/* ABA 3: ORÁCULO & IA ANALISTA */}
      {activeTab === 'oraculo' && (
        <section>
          {/* BANNER PRINCIPAL DO ORÁCULO */}
          <div className="soft-card" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-hover) 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Brain size={28} color="#87CEEB" />
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>
                    Oráculo Estatístico & IA Analista
                  </h2>
                  <span className="badge badge-blue">Code Interpreter Real</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px', maxWidth: '780px' }}>
                  Pergunte qualquer curiosidade inusitada, mito ou correlação histórica. O modelo gera e executa queries SQL no banco de <strong>55.395 jogos</strong> e <strong>42.138 gols</strong> para trazer a verdade estatística.
                </p>
              </div>

              {/* SELETOR DE MODELOS */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setOraculoModel('gemini')}
                  className={oraculoModel === 'gemini' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                  title="Respostas instantâneas em 1 segundo via Google AI Studio"
                >
                  <Zap size={16} /> Gemini Flash (Rápido)
                </button>

                <button
                  onClick={() => setOraculoModel('deepseek')}
                  className={oraculoModel === 'deepseek' ? 'btn-primary' : 'btn-secondary'}
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                  title="Raciocínio lógico e correlações inusitadas via DeepSeek"
                >
                  <Bot size={16} /> DeepSeek (Raciocínio)
                </button>

                <span className="badge badge-green" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                  🔒 Chaves Seguras no Servidor
                </span>
              </div>
            </div>

            {/* CAMPO DE ENTRADA DA PERGUNTA */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  className="soft-input"
                  value={oraculoPrompt}
                  onChange={e => setOraculoPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') enviarPerguntaOraculo(); }}
                  placeholder="Ex: Qual o aproveitamento do Corinthians em dias pares? Quem mais fez gols nos acréscimos?"
                  style={{ fontSize: '1rem', height: '48px', paddingLeft: '16px' }}
                />
                <button 
                  className="btn-primary" 
                  style={{ padding: '0 24px', whiteSpace: 'nowrap', minWidth: '150px' }}
                  onClick={() => enviarPerguntaOraculo()}
                  disabled={oraculoLoading || !oraculoPrompt.trim()}
                >
                  {oraculoLoading ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {oraculoLoading ? 'Consultando...' : 'Consultar'}
                </button>
              </div>

              {/* SUGESTÕES RÁPIDAS DE PERGUNTAS INUSITADAS */}
              <div style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lightbulb size={14} color="#F59E0B" /> Teste uma curiosidade:
                </span>
                {perguntasSugeridas.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => enviarPerguntaOraculo(item.pergunta)}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '14px' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MENSAGEM DE ERRO OU PEDIDO DE CHAVE */}
          {oraculoError && (
            <div className="soft-card" style={{ padding: '16px 20px', marginBottom: '20px', borderLeft: '4px solid #EF4444', color: '#DC2626' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} />
                <strong>Erro ao consultar o Oráculo:</strong> {oraculoError}
              </div>
            </div>
          )}

          {/* LOADING DA CONSULTA */}
          {oraculoLoading && (
            <div className="soft-card" style={{ padding: '48px 20px', textAlign: 'center', marginBottom: '24px' }}>
              <RefreshCw size={36} className="animate-spin" color="#87CEEB" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>O Oráculo está pesquisando no banco...</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
                Traduzindo sua pergunta para SQL, consultando 55.395 partidas e gerando o insight.
              </p>
            </div>
          )}

          {/* RESULTADO DA CONSULTA DA IA */}
          {!oraculoLoading && oraculoResult && (
            <div>
              {/* CARD PRINCIPAL DO INSIGHT */}
              <div className="soft-card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '5px solid #10B981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <span className="badge badge-green" style={{ marginBottom: '6px' }}>
                      {oraculoResult.modelo_usado || 'IA Analista'}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                      "{oraculoResult.pergunta}"
                    </h3>
                  </div>

                  <button 
                    className="btn-secondary" 
                    style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                    onClick={() => setShowSql(!showSql)}
                  >
                    <Code size={15} /> {showSql ? 'Ocultar SQL' : 'Ver Consulta SQL'}
                  </button>
                </div>

                {/* TEXTO DO INSIGHT */}
                <div style={{ fontSize: '1.02rem', lineHeight: '1.7', color: 'var(--text-main)', marginBottom: '16px' }}>
                  {oraculoResult.insight}
                </div>

                {/* BLOCO SQL EXPANSÍVEL */}
                {showSql && oraculoResult.sql_executado && (
                  <div style={{ marginBottom: '16px', backgroundColor: 'var(--bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Terminal size={14} /> SQL Executado em modo somente-leitura no SQLite:
                    </div>
                    <pre className="font-mono" style={{ fontSize: '0.82rem', overflowX: 'auto', color: 'var(--text-main)', margin: 0 }}>
                      {oraculoResult.sql_executado}
                    </pre>
                  </div>
                )}

                {/* CARD DE TWEET PRONTO PARA POSTAR */}
                {oraculoResult.tweet && (
                  <div style={{ padding: '16px', backgroundColor: 'var(--surface-hover)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} color="#FFB6C1" /> Sugestão de Post para o Twitter/X:
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.88rem', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                        {oraculoResult.tweet}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={baixarCardOraculo}
                        disabled={downloadingCard}
                      >
                        <Camera size={16} />
                        {downloadingCard ? 'Gerando...' : '📸 Baixar Card Visual'}
                      </button>

                      <button 
                        className="btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                        onClick={() => copiarTweet(oraculoResult.tweet, 'tweet-oraculo')}
                      >
                        {copiedKey === 'tweet-oraculo' ? <Check size={16} /> : <Copy size={16} />}
                        {copiedKey === 'tweet-oraculo' ? 'Copiado!' : 'Copiar Tweet'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* TABELA DE DADOS EXTRAÍDOS PELA QUERY */}
              {oraculoResult.dados?.length > 0 && (
                <div className="soft-card" style={{ padding: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart3 size={18} color="#87CEEB" /> Dados Encontrados ({oraculoResult.total_registros} registros)
                    </h4>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          {oraculoResult.colunas?.map((col, idx) => (
                            <th key={idx} style={{ padding: '10px 8px' }}>
                              {col.replace(/_/g, ' ').toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {oraculoResult.dados.map((row, rowIdx) => (
                          <tr key={rowIdx} style={{ borderBottom: '1px solid var(--border)' }}>
                            {oraculoResult.colunas?.map((col, colIdx) => (
                              <td key={colIdx} className="font-mono" style={{ padding: '10px 8px' }}>
                                {typeof row[col] === 'number' ? (
                                  <strong style={{ color: '#0369A1' }}>{row[col]}</strong>
                                ) : (
                                  row[col] ?? '-'
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ABA 4: EXPLORADOR DE JOGOS & GOLS (PLAYGROUND) */}
      {activeTab === 'playground' && (
        <section>
          {/* FILTROS DO PLAYGROUND */}
          <div className="soft-card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={20} color="#87CEEB" /> Filtros do Banco de Partidas
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Clube Envolvido
                </label>
                <input 
                  type="text" 
                  className="soft-input"
                  value={pgClube}
                  onChange={e => setPgClube(e.target.value)}
                  placeholder="Ex: Palmeiras, Grêmio..."
                  list="clubes-sugestoes"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Campeonato
                </label>
                <select 
                  className="soft-input"
                  value={pgCamp}
                  onChange={e => setPgCamp(e.target.value)}
                >
                  <option value="">Todos os Torneios</option>
                  {campeonatosList.map(c => (
                    <option key={c.campeonato} value={c.campeonato}>
                      {c.campeonato} ({c.jogos} jogos)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Cenário Especial
                </label>
                <select 
                  className="soft-input"
                  value={pgCenario}
                  onChange={e => setPgCenario(e.target.value)}
                >
                  <option value="todos">Todos os Jogos</option>
                  <option value="goleadas">Apenas Goleadas (4+ gols dif ou 6+ total)</option>
                  <option value="finais">Finais e Decisões</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Busca Textual (Estádio, Árbitro...)
                </label>
                <input 
                  type="text" 
                  className="soft-input"
                  value={pgBusca}
                  onChange={e => setPgBusca(e.target.value)}
                  placeholder="Ex: Maracanã, Claus..."
                />
              </div>

              <div>
                <button 
                  className="btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => { setPgPage(1); carregarPartidas(1); }}
                  disabled={partidasLoading}
                >
                  {partidasLoading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
                  Filtrar Partidas
                </button>
              </div>
            </div>
          </div>

          {/* TABELA DE PARTIDAS ENCONTRADAS */}
          {partidasData && (
            <div className="soft-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Total encontrado: <strong className="font-mono">{partidasData.total.toLocaleString('pt-BR')}</strong> partidas
                </span>

                {/* PAGINAÇÃO */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    disabled={pgPage <= 1}
                    onClick={() => {
                      const next = pgPage - 1;
                      setPgPage(next);
                      carregarPartidas(next);
                    }}
                  >
                    Anterior
                  </button>
                  <span className="font-mono" style={{ fontSize: '0.85rem', padding: '0 4px' }}>
                    Pág. {pgPage} de {Math.max(1, Math.ceil(partidasData.total / 15))}
                  </span>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    disabled={pgPage >= Math.ceil(partidasData.total / 15)}
                    onClick={() => {
                      const next = pgPage + 1;
                      setPgPage(next);
                      carregarPartidas(next);
                    }}
                  >
                    Próxima
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 8px' }}>Data / Ano</th>
                      <th style={{ padding: '10px 8px' }}>Torneio</th>
                      <th style={{ padding: '10px 8px' }}>Confronto</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>Placar</th>
                      <th style={{ padding: '10px 8px' }}>Gols Catalogados</th>
                      <th style={{ padding: '10px 8px' }}>Estádio / Local</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partidasData.partidas.map(p => (
                      <tr key={p.id_partida} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="font-mono" style={{ padding: '10px 8px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {p.data || p.ano}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span className="badge badge-blue">{p.campeonato}</span>
                        </td>
                        <td style={{ padding: '10px 8px', fontWeight: '500' }}>
                          {p.mandante} <span style={{ color: 'var(--text-subtle)' }}>x</span> {p.visitante}
                        </td>
                        <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '700' }}>
                          {p.placar || `${p.gols_mandante} x ${p.gols_visitante}`}
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '0.8rem' }}>
                          {p.gols?.length > 0 ? (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {p.gols.map((g, idx) => (
                                <span key={idx} className="badge badge-green">
                                  ⚽ {g.atleta} {g.minuto ? `(${g.minuto}')` : ''}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-subtle)' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {p.estadio ? `${p.estadio} (${p.cidade || ''})` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ABA 5: FUTEBOL X CLIMA */}
      {activeTab === 'clima' && (
        <section>
          <div className="soft-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CloudRain size={22} color="#87CEEB" /> Impacto Meteorológico no Futebol Brasileiro
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Cruzamento científico de mais de 7.000 partidas com medições das estações meteorológicas oficiais do INMET nas capitais brasileiras (2015 - 2024).
            </p>
          </div>

          {climaLoading ? (
            <div className="soft-card" style={{ padding: '40px', textAlign: 'center' }}>
              <RefreshCw size={32} className="animate-spin" color="#87CEEB" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Processando dados de meteorologia e partidas...</p>
            </div>
          ) : climaData ? (
            <div>
              {/* COMPARATIVO CHUVA X TEMPO SECO */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {climaData.impacto_chuva?.map((item, idx) => (
                  <div key={idx} className="soft-card" style={{ padding: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span className="badge badge-blue">{item.cond_chuva}</span>
                      <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {item.total_jogos.toLocaleString('pt-BR')} partidas
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Média Total de Gols</div>
                        <div className="font-mono" style={{ fontSize: '2rem', fontWeight: '700', color: '#0369A1' }}>
                          {item.media_gols}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>% Vitórias Mandante</div>
                        <div className="font-mono" style={{ fontSize: '2rem', fontWeight: '700', color: '#15803D' }}>
                          {item.pct_vit_mandante}%
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Média Mandante: <strong>{item.media_mandante}</strong> • Visitante: <strong>{item.media_visitante}</strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* JOGOS SOB TEMPESTADES EXTREMAS */}
              <div className="soft-card" style={{ padding: '22px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CloudRain size={18} color="#0369A1" /> Top Jogos com Maior Volume de Chuva (mm)
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 8px' }}>Data</th>
                        <th style={{ padding: '10px 8px' }}>Precipitação</th>
                        <th style={{ padding: '10px 8px' }}>Temperatura</th>
                        <th style={{ padding: '10px 8px' }}>Partida</th>
                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>Placar</th>
                        <th style={{ padding: '10px 8px' }}>Cidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {climaData.jogos_chuva_extrema?.map((j, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="font-mono" style={{ padding: '10px 8px' }}>{j.data}</td>
                          <td style={{ padding: '10px 8px' }}>
                            <span className="badge badge-pink font-mono">{j.precipitacao_mm} mm</span>
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px' }}>{j.temperatura_media ? `${j.temperatura_media}°C` : '-'}</td>
                          <td style={{ padding: '10px 8px', fontWeight: '500' }}>
                            {j.mandante} <span style={{ color: 'var(--text-subtle)' }}>x</span> {j.visitante}
                          </td>
                          <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '700' }}>
                            {j.placar}
                          </td>
                          <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{j.cidade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      )}

      {/* ABA 7: RAIO-X DO APITO */}
      {(activeTab === 'arbitros' || activeTab === 'arbitragem') && (
        <section>
          <div className="soft-card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="#F59E0B" /> Raio-X do Apito (Histórico de Árbitros & Cartões)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Árbitro</label>
                <input
                  type="text"
                  className="soft-input"
                  value={arbitroBusca}
                  onChange={e => setArbitroBusca(e.target.value)}
                  placeholder="Ex: Anderson Daronco, Raphael Claus, Wilton Pereira..."
                  list="arbitros-sugestoes"
                />
                <datalist id="arbitros-sugestoes">
                  {arbitrosList.map(a => <option key={a.arbitro} value={a.arbitro} />)}
                </datalist>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Filtrar por Clube (Opcional)</label>
                <input
                  type="text"
                  className="soft-input"
                  value={arbitroClubeFiltro}
                  onChange={e => setArbitroClubeFiltro(e.target.value)}
                  placeholder="Ex: Flamengo, Palmeiras, Corinthians..."
                  list="clubes-sugestoes"
                />
              </div>

              <button className="btn-primary" onClick={() => carregarPerfilArbitro(arbitroBusca, arbitroClubeFiltro)} disabled={arbitroLoading}>
                {arbitroLoading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />} Analisar Árbitro
              </button>
            </div>
          </div>

          {arbitroLoading && (
            <div className="soft-card" style={{ padding: '40px 20px', textAlign: 'center', marginBottom: '24px' }}>
              <RefreshCw size={32} className="animate-spin" color="#F59E0B" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Analisando súmulas e histórico do árbitro...</p>
            </div>
          )}

          {arbitroPerfil && !arbitroLoading && (
            <div className="soft-card" style={{ padding: '22px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '700' }}>
                    {arbitroPerfil.arbitro} {arbitroPerfil.clube_filtro ? `(Jogos do ${arbitroPerfil.clube_filtro})` : ''}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Período catalogado: {arbitroPerfil.resumo.ano_min} a {arbitroPerfil.resumo.ano_max}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setArbitroPerfil(null)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    Voltar ao Ranking
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() =>
                      baixarCardSocialPNG({
                        categoria: 'Raio-X do Apito',
                        titulo: arbitroPerfil.arbitro,
                        subtitulo: arbitroPerfil.clube_filtro
                          ? `Retrospecto apitando jogos do ${arbitroPerfil.clube_filtro}`
                          : `${arbitroPerfil.resumo.total_jogos} partidas oficiais apitadas no acervo`,
                        metricas: [
                          { label: 'Jogos Apitados', valor: arbitroPerfil.resumo.total_jogos, cor: '#38BDF8' },
                          { label: '% Vit. Mandante', valor: `${arbitroPerfil.resumo.pct_mandante}%`, cor: '#10B981' },
                          { label: 'Amarelos / Jogo', valor: arbitroPerfil.resumo.media_amarelos, cor: '#F59E0B' },
                          { label: 'Total Vermelhos', valor: arbitroPerfil.resumo.vermelhos, cor: '#EF4444' }
                        ],
                        destaqueTexto: `Média de ${arbitroPerfil.resumo.media_gols} gols por jogo | Mandantes: ${arbitroPerfil.resumo.vit_mandante}V • ${arbitroPerfil.resumo.empates}E • ${arbitroPerfil.resumo.vit_visitante}D`,
                        nomeArquivo: `arbitro-${arbitroPerfil.arbitro.toLowerCase().replace(/\s+/g, '-')}.png`
                      })
                    }
                  >
                    <Share2 size={16} /> Baixar Card PNG do Árbitro
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <div className="soft-card" style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jogos Apitados</div>
                  <div className="font-mono" style={{ fontSize: '2rem', fontWeight: '700', color: '#0369A1' }}>{arbitroPerfil.resumo.total_jogos}</div>
                </div>
                <div className="soft-card" style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vitórias do Mandante</div>
                  <div className="font-mono" style={{ fontSize: '2rem', fontWeight: '700', color: '#15803D' }}>{arbitroPerfil.resumo.pct_mandante}%</div>
                </div>
                <div className="soft-card" style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🟨 Média Amarelos</div>
                  <div className="font-mono" style={{ fontSize: '2rem', fontWeight: '700', color: '#D97706' }}>{arbitroPerfil.resumo.media_amarelos}</div>
                </div>
                <div className="soft-card" style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🟥 Total Expulsões</div>
                  <div className="font-mono" style={{ fontSize: '2rem', fontWeight: '700', color: '#DC2626' }}>{arbitroPerfil.resumo.vermelhos}</div>
                </div>
              </div>

              {/* Desempenho dos clubes apitados */}
              {arbitroPerfil.clubes_apitados && arbitroPerfil.clubes_apitados.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>
                    Clubes Mais Apitados por {arbitroPerfil.arbitro}
                  </h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '8px' }}>Clube</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>Jogos</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>V</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>E</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>D</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>Aproveitamento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {arbitroPerfil.clubes_apitados.map((c, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '8px', fontWeight: '600' }}>{c.clube}</td>
                            <td className="font-mono" style={{ padding: '8px', textAlign: 'center' }}>{c.jogos}</td>
                            <td className="font-mono" style={{ padding: '8px', textAlign: 'center', color: '#15803D' }}>{c.vitorias}</td>
                            <td className="font-mono" style={{ padding: '8px', textAlign: 'center', color: 'var(--text-muted)' }}>{c.empates}</td>
                            <td className="font-mono" style={{ padding: '8px', textAlign: 'center', color: '#DC2626' }}>{c.derrotas}</td>
                            <td className="font-mono" style={{ padding: '8px', textAlign: 'center', fontWeight: '700', color: c.aproveitamento_pct >= 50 ? '#15803D' : '#DC2626' }}>
                              {c.aproveitamento_pct}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Últimas partidas apitadas */}
              {arbitroPerfil.partidas && arbitroPerfil.partidas.length > 0 && (
                <div style={{ marginTop: '24px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px' }}>
                    Últimas Partidas Oficiais Apitadas
                  </h4>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '8px' }}>Data</th>
                          <th style={{ padding: '8px' }}>Campeonato</th>
                          <th style={{ padding: '8px' }}>Confronto</th>
                          <th style={{ padding: '8px', textAlign: 'center' }}>Placar</th>
                          <th style={{ padding: '8px' }}>Estádio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {arbitroPerfil.partidas.map((p, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td className="font-mono" style={{ padding: '8px', color: 'var(--text-muted)' }}>{p.data}</td>
                            <td style={{ padding: '8px' }}><span className="badge badge-blue">{p.campeonato}</span></td>
                            <td style={{ padding: '8px', fontWeight: '500' }}>{p.mandante} x {p.visitante}</td>
                            <td className="font-mono" style={{ padding: '8px', textAlign: 'center', fontWeight: '700' }}>{p.placar}</td>
                            <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{p.estadio || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ranking Geral de Árbitros quando nenhum estiver filtrado */}
          {!arbitroPerfil && !arbitroLoading && arbitrosList.length > 0 && (
            <div className="soft-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '14px' }}>
                Árbitros Mais Atuantes no Acervo (Clique para abrir o Raio-X)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 8px' }}>Árbitro</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>Jogos</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>% Vit. Mandante</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>🟨 Amarelos/J</th>
                      <th style={{ padding: '10px 8px', textAlign: 'center' }}>🟥 Vermelhos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arbitrosList
                      .filter(a => !arbitroBusca || a.arbitro.toLowerCase().includes(arbitroBusca.toLowerCase()))
                      .map((a, idx) => (
                      <tr
                        key={idx}
                        onClick={() => carregarPerfilArbitro(a.arbitro)}
                        style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background-color 150ms' }}
                      >
                        <td style={{ padding: '10px 8px', fontWeight: '600', color: '#0369A1' }}>{a.arbitro}</td>
                        <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center' }}>{a.total_jogos}</td>
                        <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center' }}>{a.pct_vit_mandante}%</td>
                        <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', color: '#D97706' }}>{a.media_amarelos || '-'}</td>
                        <td className="font-mono" style={{ padding: '10px 8px', textAlign: 'center', color: '#DC2626' }}>{a.total_vermelhos || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ABA 6: GERADOR DE TWEETS & POSTS */}
      {activeTab === 'tweets' && (
        <section>
          <div className="soft-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={22} color="#FFB6C1" /> Gerador de Tweets & Posts com Dados Históricos
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Modelos de postagens prontos com estatísticas verificadas para engajamento no X/Twitter.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* CARD MODELO 1: RETROSPECTO DO DUELO ATUAL */}
            {h2hData && (
              <div className="soft-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span className="badge badge-blue">Template: Raio-X Pré-Jogo</span>
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.85rem', whiteSpace: 'pre-line', backgroundColor: 'var(--bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    {`🔥 HISTÓRICO DO CLÁSSICO: ${h2hData.clube1} x ${h2hData.clube2}\n\n` +
                     `Em ${h2hData.total_jogos} jogos oficiais catalogados:\n\n` +
                     `🟢 ${h2hData.vitorias_clube1} vitórias do ${h2hData.clube1}\n` +
                     `⚪ ${h2hData.empates} empates\n` +
                     `🔴 ${h2hData.vitorias_clube2} vitórias do ${h2hData.clube2}\n\n` +
                     `⚽ Gols: ${h2hData.gols_clube1} do ${h2hData.clube1} x ${h2hData.gols_clube2} do ${h2hData.clube2}`}
                  </div>
                </div>
                <button 
                  className="btn-primary" 
                  style={{ marginTop: '14px' }}
                  onClick={() => copiarTweet(
                    `🔥 HISTÓRICO DO CLÁSSICO: ${h2hData.clube1} x ${h2hData.clube2}\n\n` +
                    `Em ${h2hData.total_jogos} jogos oficiais catalogados:\n\n` +
                    `🟢 ${h2hData.vitorias_clube1} vitórias do ${h2hData.clube1}\n` +
                    `⚪ ${h2hData.empates} empates\n` +
                    `🔴 ${h2hData.vitorias_clube2} vitórias do ${h2hData.clube2}\n\n` +
                    `⚽ Gols: ${h2hData.gols_clube1} x ${h2hData.gols_clube2}\n#Futebol #Brasileirao #Estatisticas`,
                    'tweet-h2h'
                  )}
                >
                  {copiedKey === 'tweet-h2h' ? <Check size={16} /> : <Copy size={16} />}
                  {copiedKey === 'tweet-h2h' ? 'Copiado para Área de Transferência!' : 'Copiar Tweet'}
                </button>
              </div>
            )}

            {/* CARD MODELO 2: CURIOSIDADE CLIMA X FUTEBOL */}
            <div className="soft-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-green">Template: Curiosidade Clima</span>
                </div>
                <div className="font-mono" style={{ fontSize: '0.85rem', whiteSpace: 'pre-line', backgroundColor: 'var(--bg)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {`🌧️ O gramado molhado realmente gera mais gols no futebol brasileiro?\n\n` +
                   `Analisamos mais de 7.000 jogos entre 2015 e 2024 cruzando com estações meteorológicas:\n\n` +
                   `☔ Jogos com chuva: 2.37 gols por partida\n` +
                   `☀️ Jogos com tempo seco: 2.38 gols por partida\n\n` +
                   `A diferença na média de gols é de menos de 1%, desmistificando o mito de que 'chuva é garantia de gol'!`}
                </div>
              </div>
              <button 
                className="btn-primary" 
                style={{ marginTop: '14px' }}
                onClick={() => copiarTweet(
                  `🌧️ O gramado molhado realmente gera mais gols no futebol brasileiro?\n\n` +
                  `Analisamos mais de 7.000 jogos entre 2015 e 2024 cruzando com estações meteorológicas:\n\n` +
                  `☔ Jogos com chuva: 2.37 gols por partida\n` +
                  `☀️ Jogos com tempo seco: 2.38 gols por partida\n\n` +
                  `A diferença na média de gols é de menos de 1%, desmistificando o mito de que 'chuva é garantia de gol'!\n#Futebol #Dados #Curiosidade`,
                  'tweet-clima'
                )}
              >
                {copiedKey === 'tweet-clima' ? <Check size={16} /> : <Copy size={16} />}
                {copiedKey === 'tweet-clima' ? 'Copiado para Área de Transferência!' : 'Copiar Tweet'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ABA 8: TABELA E RODADA AO VIVO (INTEGRAÇÃO EZEFRANCA) */}
      {activeTab === 'aovivo' && (
        <section>
          {/* HEADER COM SELETOR DE SÉRIES */}
          <div className="soft-card" style={{ padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Trophy size={22} color="#10B981" /> Brasileirão em Tempo Real (Classificação & Rodada)
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
                  Dados oficiais atualizados ao vivo via GE & <code>campeonato-brasileiro-api</code>.
                </p>
              </div>

              {/* SELETOR DE SÉRIE */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'a', label: 'Série A' },
                  { id: 'b', label: 'Série B' },
                  { id: 'c', label: 'Série C' },
                  { id: 'd', label: 'Série D' },
                ].map(s => (
                  <button
                    key={s.id}
                    className={aovivoSerie === s.id ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setAovivoSerie(s.id)}
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* LOADING STATE */}
          {aovivoLoading && (
            <div className="soft-card" style={{ padding: '48px 20px', textAlign: 'center', marginBottom: '24px' }}>
              <RefreshCw size={36} className="animate-spin" color="#10B981" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Carregando tabela e rodada ao vivo...</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
                Conectando à fonte oficial de dados esportivos.
              </p>
            </div>
          )}

          {/* CONTEÚDO PRINCIPAL: TABELA + JOGOS DA RODADA */}
          {!aovivoLoading && aovivoData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'flex-start' }}>
              
              {/* COLUNA ESQUERDA: TABELA DE CLASSIFICAÇÃO */}
              <div className="soft-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '600' }}>
                    Classificação • {aovivoData.edicao}
                  </h3>
                  <span className="badge badge-blue">
                    {aovivoData.tabela.length} Clubes
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '8px 4px', textAlign: 'center' }}>#</th>
                        <th style={{ padding: '8px' }}>Clube</th>
                        <th style={{ padding: '8px 4px', textAlign: 'center' }}>P</th>
                        <th style={{ padding: '8px 4px', textAlign: 'center' }}>J</th>
                        <th style={{ padding: '8px 4px', textAlign: 'center' }}>V</th>
                        <th style={{ padding: '8px 4px', textAlign: 'center' }}>SG</th>
                        <th style={{ padding: '8px 4px', textAlign: 'center' }}>%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aovivoData.tabela.map((t) => (
                        <tr 
                          key={t.posicao} 
                          style={{ 
                            borderBottom: '1px solid var(--border)',
                            backgroundColor: t.posicao <= 4 ? 'rgba(16, 185, 129, 0.04)' : (t.posicao >= 17 ? 'rgba(239, 68, 68, 0.04)' : 'transparent')
                          }}
                        >
                          <td className="font-mono" style={{ padding: '8px 4px', textAlign: 'center', fontWeight: '700', color: t.posicao <= 4 ? '#10B981' : (t.posicao >= 17 ? '#EF4444' : 'var(--text-muted)') }}>
                            {t.posicao}º
                          </td>
                          <td style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {t.escudo ? (
                              <img src={t.escudo} alt={t.clube} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                            ) : null}
                            <strong style={{ color: 'var(--text-main)' }}>{t.clube}</strong>
                          </td>
                          <td className="font-mono" style={{ padding: '8px 4px', textAlign: 'center', fontWeight: '700', color: '#0369A1' }}>
                            {t.pontos}
                          </td>
                          <td className="font-mono" style={{ padding: '8px 4px', textAlign: 'center' }}>{t.jogos}</td>
                          <td className="font-mono" style={{ padding: '8px 4px', textAlign: 'center', color: '#15803D' }}>{t.vitorias}</td>
                          <td className="font-mono" style={{ padding: '8px 4px', textAlign: 'center', color: t.saldo_gols >= 0 ? '#15803D' : '#DC2626' }}>
                            {t.saldo_gols > 0 ? `+${t.saldo_gols}` : t.saldo_gols}
                          </td>
                          <td className="font-mono" style={{ padding: '8px 4px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            {t.aproveitamento}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* COLUNA DIREITA: JOGOS DA RODADA ATUAL */}
              <div className="soft-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '600' }}>
                    Jogos da {aovivoData.rodada_atual}ª Rodada
                  </h3>
                  <span className="badge badge-green">Ao Vivo / Recentes</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {aovivoData.jogos_rodada.map((j) => (
                    <div 
                      key={j.id} 
                      className="soft-card" 
                      style={{ padding: '14px', border: '1px solid var(--border)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        <span>{j.data} • {j.hora}</span>
                        <span style={{ fontWeight: '600', color: j.status === 'live' ? '#EF4444' : '#64748B' }}>
                          {j.status_label || (j.comecou ? 'ENCERRADO' : 'AGENDADO')}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '8px' }}>
                        {/* Mandante */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
                          {j.mandante.escudo && (
                            <img src={j.mandante.escudo} alt={j.mandante.nome} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                          )}
                          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{j.mandante.nome}</span>
                        </div>

                        {/* Placar */}
                        <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: '700', padding: '0 10px', color: '#0369A1' }}>
                          {j.comecou ? `${j.mandante.placar ?? 0} × ${j.visitante.placar ?? 0}` : 'vs'}
                        </div>

                        {/* Visitante */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{j.visitante.nome}</span>
                          {j.visitante.escudo && (
                            <img src={j.visitante.escudo} alt={j.visitante.nome} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                          )}
                        </div>
                      </div>

                      {j.estadio && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                          📍 {j.estadio}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ marginTop: '48px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: '#8A8F9E', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          FutStats & Clima • Feito com <strong style={{ color: '#12141A' }}>Outcrowd Experience</strong>
        </div>
        <div className="font-mono">
          {overview?.total_partidas?.toLocaleString('pt-BR') || '55.395'} jogos oficiais • {overview?.total_gols?.toLocaleString('pt-BR') || '42.138'} gols catalogados • 12 capitais climáticas
        </div>
      </footer>

      </main>
    </div>
  );
}
