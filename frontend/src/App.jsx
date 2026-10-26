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
import AuthView from './components/AuthView';
import HomeMatchdayView from './components/HomeMatchdayView';
import AppShell from './components/AppShell';
import EditorialClubes from './components/EditorialClubes';
import ProtagonistaAtleta from './components/ProtagonistaAtleta';
import BettingHubView from './components/BettingHubView';
import { H2HCompetitionDualBarChart, ClubEvolutionChart } from './components/charts';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' (Matchday Cockpit), 'h2h', 'jogadores', etc.

  // ==================== AUTH STATE ====================
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('futstats_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authChecking, setAuthChecking] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'registro'
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regNome, setRegNome] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCodigoConvite, setRegCodigoConvite] = useState('');
  const [conviteCopiado, setConviteCopiado] = useState(false);

  // Modal Alterar Senha
  const [showTrocarSenhaModal, setShowTrocarSenhaModal] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [trocarSenhaLoading, setTrocarSenhaLoading] = useState(false);
  const [trocarSenhaError, setTrocarSenhaError] = useState(null);
  const [trocarSenhaSuccess, setTrocarSenhaSuccess] = useState(null);

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
  const [activeRankingTab, setActiveRankingTab] = useState('carreira'); // 'carreira' | 'gols' | 'assistencias' | 'clutch' | 'participacoes' | 'aproveitamento'
  const [rankingData, setRankingData] = useState([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

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

  // Tab: Análise de Times & Histórico Recente
  const [timesAnalise, setTimesAnalise] = useState([]);
  const [timesLoading, setTimesLoading] = useState(false);
  const [timesRecorte, setTimesRecorte] = useState('10');
  const [timesCampeonato, setTimesCampeonato] = useState('');
  const [timesSearch, setTimesSearch] = useState('');
  const [timesSortBy, setTimesSortBy] = useState('aproveitamento');
  const [timesSortAsc, setTimesSortAsc] = useState(false);
  const [selectedTeamRecent, setSelectedTeamRecent] = useState(null);

  const carregarAnaliseTimes = (recorte = timesRecorte, camp = timesCampeonato) => {
    setTimesLoading(true);
    const params = new URLSearchParams({ recorte });
    if (camp) params.append('campeonato', camp);
    apiFetch(`/api/times/analise-recente?${params.toString()}`)
      .then(r => r.json())
      .then(d => {
        setTimesAnalise(d.times || []);
        setTimesLoading(false);
      })
      .catch(() => setTimesLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'times' && timesAnalise.length === 0 && currentUser) {
      carregarAnaliseTimes();
    }
  }, [activeTab, currentUser]);


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
      // Apenas desloga o usuário se o endpoint de validação de sessão falhar
      if (url.includes('/api/auth/me')) {
        localStorage.removeItem('futstats_auth_token');
        localStorage.removeItem('futstats_auth_user');
        setCurrentUser(null);
      }
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
          localStorage.setItem('futstats_auth_user', JSON.stringify(d.user));
        } else {
          localStorage.removeItem('futstats_auth_token');
          localStorage.removeItem('futstats_auth_user');
          setCurrentUser(null);
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
        localStorage.setItem('futstats_auth_user', JSON.stringify(d.user));
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
        localStorage.setItem('futstats_auth_user', JSON.stringify(d.user));
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
    localStorage.removeItem('futstats_auth_user');
    setCurrentUser(null);
    setLoginPassword('');
  };

  const handleAlterarSenha = async (e) => {
    e.preventDefault();
    setTrocarSenhaError(null);
    setTrocarSenhaSuccess(null);

    if (novaSenha !== confirmarNovaSenha) {
      setTrocarSenhaError('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (novaSenha.length < 4) {
      setTrocarSenhaError('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }

    setTrocarSenhaLoading(true);
    try {
      const res = await apiFetch('/api/auth/alterar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senha_atual: senhaAtual,
          nova_senha: novaSenha
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao alterar senha.');
      }
      setTrocarSenhaSuccess('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
      setTimeout(() => {
        setShowTrocarSenhaModal(false);
        setTrocarSenhaSuccess(null);
      }, 1500);
    } catch (err) {
      setTrocarSenhaError(err.message);
    } finally {
      setTrocarSenhaLoading(false);
    }
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

  // Carregar perfil completo do jogador via apiFetch (suporta nome ou id_jogador)
  const carregarPerfilJogador = (nome, clube = '', idJogador = null) => {
    if (!nome && !idJogador) return;
    setProfileLoading(true);
    setSelectedPlayer(nome || `Atleta #${idJogador}`);
    setPlayerClubeFiltro(clube);
    setPlayerSuggestions([]);

    let url = `/api/jogadores/perfil?`;
    const params = [];
    if (idJogador) params.push(`id=${encodeURIComponent(idJogador)}`);
    if (nome) params.push(`nome=${encodeURIComponent(nome)}`);
    if (clube) params.push(`clube=${encodeURIComponent(clube)}`);
    url += params.join('&');

    apiFetch(url)
      .then(r => r.json())
      .then(d => {
        setPlayerProfile(d);
        setProfileLoading(false);
      })
      .catch(() => setProfileLoading(false));
  };

  // Carregar ranking analítico por categoria
  const carregarRanking = (tipo = 'carreira') => {
    setActiveRankingTab(tipo);
    setRankingLoading(true);
    apiFetch(`/api/jogadores/ranking?tipo=${tipo}&limit=15`)
      .then(r => r.json())
      .then(d => {
        setRankingData(Array.isArray(d) ? d : []);
        setRankingLoading(false);
        setLastSyncTime(new Date());
      })
      .catch(() => setRankingLoading(false));
  };

  // Buscar ranking inicial ao abrir a aba de jogadores
  useEffect(() => {
    if (activeTab === 'jogadores' && rankingData.length === 0 && currentUser) {
      carregarRanking('carreira');
    }
  }, [activeTab, rankingData.length, currentUser]);

  // Auto-refresh inteligente: recarrega dados a cada 5 min ou quando o usuário volta à janela
  useEffect(() => {
    const handleFocus = () => {
      if (activeTab === 'jogadores' && currentUser) {
        carregarRanking(activeRankingTab);
      }
    };
    window.addEventListener('focus', handleFocus);
    const interval = setInterval(() => {
      if (activeTab === 'jogadores' && currentUser && !document.hidden) {
        carregarRanking(activeRankingTab);
      }
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [activeTab, activeRankingTab, currentUser]);

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
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(d => {
          setAovivoData(d || {});
          setAovivoLoading(false);
        })
        .catch((err) => {
          console.error('[AoVivo Fetch Error]', err);
          setAovivoData({
            error: 'Não foi possível carregar os dados ao vivo no momento.',
            tabela: [],
            jogos_rodada: []
          });
          setAovivoLoading(false);
        });
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

  // ==================== TELA DE LOGIN / CADASTRO (IDENTIDADE EDITORIAL) ====================
  if (!currentUser) {
    return (
      <AuthView
        authMode={authMode}
        setAuthMode={setAuthMode}
        loginUsername={loginUsername}
        setLoginUsername={setLoginUsername}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        regCodigoConvite={regCodigoConvite}
        setRegCodigoConvite={setRegCodigoConvite}
        regNome={regNome}
        setRegNome={setRegNome}
        regUsername={regUsername}
        setRegUsername={setRegUsername}
        regPassword={regPassword}
        setRegPassword={setRegPassword}
        authLoading={authLoading}
        authError={authError}
        setAuthError={setAuthError}
        handleLogin={handleLogin}
        handleRegistro={handleRegistro}
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
      />
    );
  }

  // ==================== DASHBOARD AUTENTICADA (ARQUITETURA EDITORIAL 2026) ====================
  return (
    <AppShell
      activeTab={activeTab}
      onNavigateTab={setActiveTab}
      darkMode={darkMode}
      onToggleTheme={() => setDarkMode(!darkMode)}
      currentUser={currentUser}
      onOpenTrocarSenha={() => {
        setShowTrocarSenhaModal(true);
        setTrocarSenhaError(null);
        setTrocarSenhaSuccess(null);
      }}
      onLogout={handleLogout}
      onCopiarConvite={copiarConviteEquipe}
      conviteCopiado={conviteCopiado}
    >
      {/* ================= PILOTO 1: CLUBES NO MODELO EDITORIAL ================= */}
      {activeTab === 'times' && (
        <EditorialClubes
          timesAnalise={timesAnalise}
          timesLoading={timesLoading}
          timesRecorte={timesRecorte}
          setTimesRecorte={(r) => {
            setTimesRecorte(r);
            carregarAnaliseTimes(r, timesCampeonato);
          }}
          timesCampeonato={timesCampeonato}
          setTimesCampeonato={(c) => {
            setTimesCampeonato(c);
            carregarAnaliseTimes(timesRecorte, c);
          }}
          timesSearch={timesSearch}
          setTimesSearch={setTimesSearch}
          onRecarregar={carregarAnaliseTimes}
        />
      )}

      {/* ================= PILOTO 2: ATLETAS NO MODELO PROTAGONISTA ================= */}
      {activeTab === 'jogadores' && (
        <ProtagonistaAtleta
          playerSearch={playerSearch}
          setPlayerSearch={setPlayerSearch}
          searchSuggestions={playerSuggestions}
          selectedPlayer={selectedPlayer}
          setSelectedPlayer={setSelectedPlayer}
          playerProfile={playerProfile}
          profileLoading={profileLoading}
          rankingType={activeRankingTab}
          setRankingType={(tipo) => carregarRanking(tipo)}
          topPlayers={rankingData}
          onCarregarPerfilPorId={(id, nome) => carregarPerfilJogador(nome, '', id)}
        />
      )}

        {activeTab === 'overview' && (
          <HomeMatchdayView
            currentUser={currentUser}
            overview={overview}
            onNavigateTab={(t) => setActiveTab(t)}
            onSelectH2H={(c1, c2) => { setClube1(c1); setClube2(c2); setActiveTab('h2h'); }}
            onSelectJogador={(p) => { setSelectedPlayer(p); setActiveTab('jogadores'); }}
            onRunOraculo={(text) => { setOraculoPrompt(text); setActiveTab('oraculo'); }}
            onLogout={handleLogout}
            apiFetch={apiFetch}
          />
        )}

        {/* ABA: BETTING HUB & APOSTAS ESPORTIVAS */}
        {activeTab === 'apostas' && (
          <BettingHubView
            currentUser={currentUser}
            apiFetch={apiFetch}
            onNavigateTab={(t) => setActiveTab(t)}
            onSelectH2H={(c1, c2) => { setClube1(c1); setClube2(c2); setActiveTab('h2h'); }}
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

              {/* GRÁFICO COMPARATIVO H2H POR COMPETIÇÃO (BARRAS DUPLAS) */}
              <div style={{ marginBottom: '24px' }}>
                <H2HCompetitionDualBarChart
                  clube1={h2hData.clube1}
                  clube2={h2hData.clube2}
                  partidas={h2hData.partidas || []}
                  cor1="#0369A1"
                  cor2="#BE185D"
                />
              </div>

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
                            {p.placar || (p.gols_mandante != null && p.gols_visitante != null ? `${p.gols_mandante} x ${p.gols_visitante}` : '—')}
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
                                  <strong style={{ color: 'var(--accent)' }}>{row[col]}</strong>
                                ) : typeof row[col] === 'object' && row[col] !== null ? (
                                  JSON.stringify(row[col])
                                ) : (
                                  row[col] ?? '—'
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
                          {p.placar || (p.gols_mandante != null && p.gols_visitante != null ? `${p.gols_mandante} x ${p.gols_visitante}` : '—')}
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
                  <div className="font-mono" style={{ fontSize: '0.85rem', whiteSpace: 'pre-line', backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
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
                <div className="font-mono" style={{ fontSize: '0.85rem', whiteSpace: 'pre-line', backgroundColor: 'var(--surface-raised)', color: 'var(--text-primary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
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
            <div>
              {/* ALERTA DE ERRO / AVISO SE HOUVER */}
              {aovivoData.error && (
                <div className="soft-card" style={{ padding: '20px', marginBottom: '24px', borderLeft: '4px solid #F59E0B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle size={24} color="#F59E0B" />
                    <div>
                      <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>Aviso de Conexão em Tempo Real</strong>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>{aovivoData.error}</p>
                    </div>
                  </div>
                  <button 
                    className="btn-secondary" 
                    onClick={() => {
                      setAovivoLoading(true);
                      fetch(`/api/brasileirao/aovivo?serie=${aovivoSerie}`)
                        .then(r => r.json())
                        .then(d => { setAovivoData(d || {}); setAovivoLoading(false); })
                        .catch(() => setAovivoLoading(false));
                    }}
                    style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}

              {/* SE NÃO HOUVER DADOS DISPONÍVEIS PARA A SÉRIE (ex: Série C ou D fora de temporada) */}
              {!aovivoData.error && (!aovivoData.tabela || aovivoData.tabela.length === 0) && (!aovivoData.jogos_rodada || aovivoData.jogos_rodada.length === 0) && (
                <div className="soft-card" style={{ padding: '40px 20px', textAlign: 'center', marginBottom: '24px' }}>
                  <Trophy size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>
                    Série {aovivoSerie.toUpperCase()} - Fora de Temporada ou Aguardando Início
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '500px', margin: '8px auto 0' }}>
                    Esta divisão do Campeonato Brasileiro não possui partidas ativas ou tabela publicada no momento pela fonte oficial.
                  </p>
                </div>
              )}

              {/* SE HOUVER DADOS: TABELA E RODADA */}
              {((aovivoData.tabela && aovivoData.tabela.length > 0) || (aovivoData.jogos_rodada && aovivoData.jogos_rodada.length > 0)) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'flex-start' }}>
                  
                  {/* COLUNA ESQUERDA: TABELA DE CLASSIFICAÇÃO */}
                  <div className="soft-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '600' }}>
                        Classificação • {aovivoData.edicao || `Brasileirão Série ${aovivoSerie.toUpperCase()}`}
                      </h3>
                      <span className="badge badge-blue">
                        {(aovivoData.tabela || []).length} Clubes
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
                          {(aovivoData.tabela || []).map((t, idx) => (
                            <tr 
                              key={t.posicao || idx} 
                              style={{ 
                                borderBottom: '1px solid var(--border)',
                                backgroundColor: (t.posicao <= 4) ? 'rgba(16, 185, 129, 0.04)' : (t.posicao >= 17 ? 'rgba(239, 68, 68, 0.04)' : 'transparent')
                              }}
                            >
                              <td className="font-mono" style={{ padding: '8px 4px', textAlign: 'center', fontWeight: '700', color: t.posicao <= 4 ? '#10B981' : (t.posicao >= 17 ? '#EF4444' : 'var(--text-muted)') }}>
                                {t.posicao || idx + 1}º
                              </td>
                              <td style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {t.escudo ? (
                                  <img src={t.escudo} alt={t.clube || ''} style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                                ) : null}
                                <strong style={{ color: 'var(--text-main)' }}>{t.clube || 'A definir'}</strong>
                              </td>
                              <td className="font-mono" style={{ padding: '8px 4px', textAlign: 'center', fontWeight: '700', color: '#0369A1' }}>
                                {t.pontos ?? 0}
                              </td>
                              <td className="font-mono" style={{ padding: '8px 4px', textAlign: 'center' }}>{t.jogos ?? 0}</td>
                              <td className="font-mono" style={{ padding: '8px 4px', textAlign: 'center', color: '#15803D' }}>{t.vitorias ?? 0}</td>
                              <td className="font-mono" style={{ padding: '8px 4px', textAlign: 'center', color: (t.saldo_gols ?? 0) >= 0 ? '#15803D' : '#DC2626' }}>
                                {(t.saldo_gols ?? 0) > 0 ? `+${t.saldo_gols}` : (t.saldo_gols ?? 0)}
                              </td>
                              <td className="font-mono" style={{ padding: '8px 4px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                {t.aproveitamento ?? 0}%
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
                        Jogos da {aovivoData.rodada_atual || 1}ª Rodada
                      </h3>
                      <span className="badge badge-green">Ao Vivo / Recentes</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(aovivoData.jogos_rodada || []).map((j, idx) => (
                        <div 
                          key={j.id || idx} 
                          className="soft-card" 
                          style={{ padding: '14px', border: '1px solid var(--border)' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                            <span>{j.data || 'Data a confirmar'} {j.hora ? `• ${j.hora}` : ''}</span>
                            <span style={{ fontWeight: '600', color: j.status === 'live' ? '#EF4444' : '#64748B' }}>
                              {j.status_label || (j.comecou ? 'ENCERRADO' : 'AGENDADO')}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '8px' }}>
                            {/* Mandante */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
                              {j.mandante?.escudo && (
                                <img src={j.mandante.escudo} alt={j.mandante?.nome || ''} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                              )}
                              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{j.mandante?.nome || 'Mandante'}</span>
                            </div>

                            {/* Placar */}
                            <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: '700', padding: '0 10px', color: '#0369A1' }}>
                              {j.comecou ? `${j.mandante?.placar ?? 0} × ${j.visitante?.placar ?? 0}` : 'vs'}
                            </div>

                            {/* Visitante */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{j.visitante?.nome || 'Visitante'}</span>
                              {j.visitante?.escudo && (
                                <img src={j.visitante.escudo} alt={j.visitante?.nome || ''} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
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
            </div>
          )}
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ marginTop: '48px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          FutStats & Clima • Feito com <strong style={{ color: 'var(--text-primary)' }}>Arquitetura Editorial 2026</strong>
        </div>
        <div className="font-mono">
          {overview?.total_partidas?.toLocaleString('pt-BR') || '55.395'} jogos oficiais • {overview?.total_gols?.toLocaleString('pt-BR') || '42.138'} gols catalogados • 12 capitais climáticas
        </div>
      </footer>


      {/* MODAL ALTERAR SENHA */}
      {showTrocarSenhaModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(18, 20, 26, 0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !trocarSenhaLoading) {
              setShowTrocarSenhaModal(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--surface-card)',
              borderRadius: '24px',
              padding: '28px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: 'var(--shadow-editorial)',
              border: '1px solid var(--border-subtle)',
              position: 'relative'
            }}
          >
            {/* Header Modal */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Key size={20} color="var(--accent)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Alterar Senha</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Usuário logado: <strong style={{ color: 'var(--text-primary)' }}>{currentUser?.username || 'LB'}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => !trocarSenhaLoading && setShowTrocarSenhaModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  padding: '6px',
                  borderRadius: '50%'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Mensagem de Erro */}
            {trocarSenhaError && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '12px', padding: '10px 14px', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{trocarSenhaError}</span>
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {trocarSenhaSuccess && (
              <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #6EE7B7', color: '#065F46', borderRadius: '12px', padding: '10px 14px', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} />
                <span>{trocarSenhaSuccess}</span>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleAlterarSenha} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4B5262', marginBottom: '5px' }}>
                  Senha Atual
                </label>
                <input
                  type="password"
                  className="soft-input font-mono"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={trocarSenhaLoading}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4B5262', marginBottom: '5px' }}>
                  Nova Senha
                </label>
                <input
                  type="password"
                  className="soft-input font-mono"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  required
                  disabled={trocarSenhaLoading}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#4B5262', marginBottom: '5px' }}>
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  className="soft-input font-mono"
                  value={confirmarNovaSenha}
                  onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  required
                  disabled={trocarSenhaLoading}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowTrocarSenhaModal(false)}
                  disabled={trocarSenhaLoading}
                  style={{
                    flex: 1,
                    height: '44px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.08)',
                    backgroundColor: '#F3F4F6',
                    color: '#4B5262',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={trocarSenhaLoading}
                  style={{
                    flex: 1.6,
                    height: '44px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {trocarSenhaLoading ? <RefreshCw size={16} className="animate-spin" /> : <Lock size={16} />}
                  <span>{trocarSenhaLoading ? 'Salvando...' : 'Salvar Nova Senha'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </AppShell>
  );
}
