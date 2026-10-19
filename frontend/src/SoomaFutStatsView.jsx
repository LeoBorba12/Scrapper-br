import React, { useState } from 'react';
import {
  Home,
  Calendar,
  BarChart2,
  Zap,
  Palette,
  Search,
  Sparkles,
  HelpCircle,
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  Bell,
  Eye,
  Check,
  Shield,
  Activity,
  Flame,
  Award,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function SoomaFutStatsView({
  currentUser,
  overview,
  onNavigateTab,
  onSelectH2H,
  onSelectJogador,
  onRunOraculo,
  onLogout
}) {
  const [activeNav, setActiveNav] = useState('home');
  const [activeMode, setActiveMode] = useState('search'); // 'search' | 'ask' | 'create'
  const [query, setQuery] = useState('');
  const [searchFeedback, setSearchFeedback] = useState(null);
  const [heroSlide, setHeroSlide] = useState(0);
  const [momentSlide, setMomentSlide] = useState(0);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  // Cards heróis de Futebol (Highlights da Semana / Clássicos Históricos)
  const heroCards = [
    {
      id: 'derby',
      tag: 'Schedules',
      title: 'Derby Paulista:\nCorinthians x Palmeiras',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
      audience: '48.920',
      audienceLabel: 'público médio',
      badges: ['Clássico', 'Série A', 'H2H'],
      teams: ['Corinthians', 'Palmeiras'],
      actionLabel: 'Ver Raio-X Completo'
    },
    {
      id: 'fla-flu',
      tag: 'Schedules',
      title: 'Fla-Flu Decisivo:\nEstatísticas e Gols',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
      audience: '63.150',
      audienceLabel: 'Maracanã',
      badges: ['Carioca', 'Histórico', 'Gols'],
      teams: ['Flamengo', 'Fluminense'],
      actionLabel: 'Abrir Confronto'
    },
    {
      id: 'grenal',
      tag: 'Schedules',
      title: 'Gre-Nal Centenário:\nCartões & Arbitragem',
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80',
      audience: '44.800',
      audienceLabel: 'Beira-Rio',
      badges: ['Clássico', 'Raio-X', 'Apito'],
      teams: ['Grêmio', 'Internacional'],
      actionLabel: 'Analisar Apito'
    }
  ];

  // Moments (Partidas de Destaque / Rodadas)
  const momentCards = [
    {
      id: 'm1',
      date: 'Out 21',
      title: 'Rodada Decisiva do Brasileirão 2026',
      image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=800&q=80',
      tag: 'Rodada 30',
      sub: 'Previsões com IA e Clima'
    },
    {
      id: 'm2',
      date: 'Out 24',
      title: 'Final da Copa do Brasil: Retrospecto',
      image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80',
      tag: 'Mata-Mata',
      sub: 'Histórico de pênaltis'
    }
  ];

  const currentHero = heroCards[heroSlide % heroCards.length];
  const currentMoment = momentCards[momentSlide % momentCards.length];

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    if (activeMode === 'ask' && onRunOraculo) {
      onRunOraculo(query);
    } else if (activeMode === 'search') {
      const q = query.toLowerCase();
      if (q.includes('corinthians') || q.includes('palmeiras') || q.includes('flamengo') || q.includes('vasco') || q.includes('são paulo') || q.includes('santos')) {
        onNavigateTab?.('h2h');
      } else {
        onNavigateTab?.('playground');
      }
    } else if (activeMode === 'create') {
      onNavigateTab?.('tweets');
    }
  };

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
          gap: '24px',
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
          onClick={() => setActiveNav('home')}
        >
          Sooma
        </div>

        {/* ITENS DE NAVEGAÇÃO VERTICAL */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          {/* Home */}
          <button
            onClick={() => { setActiveNav('home'); onNavigateTab?.('overview'); }}
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
                backgroundColor: activeNav === 'home' ? '#12141A' : 'transparent',
                color: activeNav === 'home' ? '#FFFFFF' : '#8A8F9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease',
                boxShadow: activeNav === 'home' ? '0 6px 16px -2px rgba(18, 20, 26, 0.25)' : 'none'
              }}
            >
              <Home size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: activeNav === 'home' ? '#12141A' : '#9499A8' }}>
              Home
            </span>
          </button>

          {/* Calendário / Rodadas / Ao Vivo */}
          <button
            onClick={() => { setActiveNav('calendar'); onNavigateTab?.('aovivo'); }}
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
                backgroundColor: activeNav === 'calendar' ? '#12141A' : 'transparent',
                color: activeNav === 'calendar' ? '#FFFFFF' : '#8A8F9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease'
              }}
            >
              <Calendar size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: activeNav === 'calendar' ? '#12141A' : '#9499A8' }}>
              Rodada
            </span>
          </button>

          {/* Insights / Análises H2H */}
          <button
            onClick={() => { setActiveNav('insights'); onNavigateTab?.('h2h'); }}
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
                backgroundColor: activeNav === 'insights' ? '#12141A' : 'transparent',
                color: activeNav === 'insights' ? '#FFFFFF' : '#8A8F9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease'
              }}
            >
              <BarChart2 size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: activeNav === 'insights' ? '#12141A' : '#9499A8' }}>
              Insights
            </span>
          </button>

          {/* Promotion / Gerador Tweets */}
          <button
            onClick={() => { setActiveNav('promotion'); onNavigateTab?.('tweets'); }}
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
                backgroundColor: activeNav === 'promotion' ? '#12141A' : 'transparent',
                color: activeNav === 'promotion' ? '#FFFFFF' : '#8A8F9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease'
              }}
            >
              <Zap size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: activeNav === 'promotion' ? '#12141A' : '#9499A8' }}>
              Social
            </span>
          </button>

          {/* Design / Explorador */}
          <button
            onClick={() => { setActiveNav('design'); onNavigateTab?.('playground'); }}
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
                backgroundColor: activeNav === 'design' ? '#12141A' : 'transparent',
                color: activeNav === 'design' ? '#FFFFFF' : '#8A8F9E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms ease'
              }}
            >
              <Palette size={20} strokeWidth={2.2} />
            </div>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: activeNav === 'design' ? '#12141A' : '#9499A8' }}>
              Explorar
            </span>
          </button>
        </nav>
      </aside>

      {/* ================= CORPO PRINCIPAL ================= */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingLeft: '12px' }}>
        
        {/* CABEÇALHO SUPERIOR (NOTIFICAÇÃO + PERFIL) */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}
        >
          {/* Botão Notificação Pill */}
          <button
            onClick={() => setShowNotificationToast(!showNotificationToast)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#343844',
              cursor: 'pointer',
              boxShadow: '0 4px 14px -2px rgba(100, 90, 130, 0.08)',
              transition: 'transform 150ms ease'
            }}
            title="Notificações"
          >
            <Bell size={18} strokeWidth={2} />
          </button>

          {/* User Profile Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#FFFFFF',
              padding: '4px 14px 4px 5px',
              borderRadius: '9999px',
              boxShadow: '0 4px 16px -2px rgba(100, 90, 130, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              cursor: 'pointer'
            }}
            onClick={onLogout}
            title="Sessão ativa — Clique para opções/sair"
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
              alt="Avatar"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1B1E26' }}>
              {currentUser?.nome || 'Alice'}
            </span>
            <span style={{ fontSize: '0.65rem', color: '#9095A2' }}>▼</span>
          </div>
        </header>

        {showNotificationToast && (
          <div
            style={{
              position: 'fixed',
              top: '70px',
              right: '30px',
              zIndex: 99,
              backgroundColor: '#12141A',
              color: '#FFFFFF',
              padding: '12px 18px',
              borderRadius: '16px',
              boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <Flame size={16} color="#FF9066" />
            <span>Banco sincronizado: <strong>55.395 jogos</strong> disponíveis</span>
          </div>
        )}

        {/* ================= HERO HUB CENTRAL (WELCOME & COMMAND BAR) ================= */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '10px',
            marginBottom: '38px',
            width: '100%'
          }}
        >
          {/* Welcome Title */}
          <h1
            style={{
              fontSize: '2.35rem',
              fontWeight: 700,
              color: '#13151B',
              letterSpacing: '-0.03em',
              marginBottom: '16px',
              textAlign: 'center'
            }}
          >
            Welcome Back {currentUser?.nome ? currentUser.nome.split(' ')[0] : 'Alice'}
          </h1>

          {/* Mode Switcher Pill: Search / Ask / Create */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(10px)',
              padding: '5px 7px',
              borderRadius: '9999px',
              boxShadow: '0 4px 18px -4px rgba(100, 85, 140, 0.06)',
              marginBottom: '16px',
              border: '1px solid rgba(255, 255, 255, 0.9)'
            }}
          >
            <button
              onClick={() => setActiveMode('search')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: activeMode === 'search' ? '#FFFFFF' : 'transparent',
                color: activeMode === 'search' ? '#12141A' : '#757B8C',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeMode === 'search' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 160ms ease'
              }}
            >
              <Search size={14} strokeWidth={2.4} />
              Search
            </button>

            <button
              onClick={() => setActiveMode('ask')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: activeMode === 'ask' ? '#FFFFFF' : 'transparent',
                color: activeMode === 'ask' ? '#12141A' : '#757B8C',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeMode === 'ask' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 160ms ease'
              }}
            >
              <HelpCircle size={14} strokeWidth={2.4} />
              Ask
            </button>

            <button
              onClick={() => setActiveMode('create')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: activeMode === 'create' ? '#FFFFFF' : 'transparent',
                color: activeMode === 'create' ? '#12141A' : '#757B8C',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: activeMode === 'create' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 160ms ease'
              }}
            >
              <Sparkles size={14} strokeWidth={2.4} />
              Create
            </button>
          </div>

          {/* Omnibox / Input Card Curvado */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              width: '100%',
              maxWidth: '680px',
              backgroundColor: '#FFFFFF',
              borderRadius: '34px',
              padding: '12px 14px 12px 24px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 16px 42px -8px rgba(115, 95, 150, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                activeMode === 'search'
                  ? 'Buscar Confrontos, Clubes, Partidas, Jogadores...'
                  : activeMode === 'ask'
                  ? 'Pergunte ao Oráculo: "Quem tem mais vitórias no clássico com chuva?"'
                  : 'Criar Card ou Post de Análise para Twitter...'
              }
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.96rem',
                fontWeight: 500,
                color: '#15171C',
                fontFamily: 'inherit'
              }}
            />

            {/* Ação Botão Plus (+) */}
            <button
              type="button"
              onClick={() => onNavigateTab?.('playground')}
              title="Filtrar por Campeonato/Temporada"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#F3F4F7',
                border: 'none',
                color: '#656A79',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              <Plus size={18} strokeWidth={2.2} />
            </button>

            {/* Ação Botão Circular Preto de Envio (▶) */}
            <button
              type="submit"
              title="Executar busca/pergunta"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#111318',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(17, 19, 24, 0.35)',
                transition: 'transform 150ms ease'
              }}
            >
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </form>
        </section>

        {/* ================= GRID DE 3 COLUNAS OUTGROWD ================= */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1.15fr) minmax(0, 0.9fr)',
            gap: '24px',
            alignItems: 'stretch',
            width: '100%',
            maxWidth: '1360px',
            margin: '0 auto'
          }}
        >
          {/* ================= CARD 1: SCHEDULES / HIGHLIGHT DA SEMANA (HERO IMAGE CARD) ================= */}
          <div
            style={{
              position: 'relative',
              borderRadius: '30px',
              overflow: 'hidden',
              backgroundColor: '#1E232B',
              boxShadow: '0 20px 48px -12px rgba(90, 75, 130, 0.14)',
              minHeight: '440px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '24px'
            }}
          >
            {/* Imagem de Fundo com Overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${currentHero.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'brightness(0.85) contrast(1.08)',
                zIndex: 1
              }}
            />
            {/* Gradiente dramático como na referência */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(180deg, rgba(14, 25, 30, 0.7) 0%, rgba(10, 20, 25, 0.25) 40%, rgba(8, 16, 20, 0.88) 100%)',
                zIndex: 2
              }}
            />

            {/* Topo do Hero Card: Badge Schedules + Botão View All */}
            <div
              style={{
                position: 'relative',
                zIndex: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    letterSpacing: '0.02em'
                  }}
                >
                  {currentHero.tag}
                </span>
                <h2
                  style={{
                    color: '#FFFFFF',
                    fontSize: '1.65rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.22,
                    marginTop: '8px',
                    whiteSpace: 'pre-line',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                  }}
                >
                  {currentHero.title}
                </h2>
              </div>

              <button
                onClick={() => {
                  onSelectH2H?.(currentHero.teams[0], currentHero.teams[1]);
                  onNavigateTab?.('h2h');
                }}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(8px)',
                  color: '#12141A',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '7px 16px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                View All
              </button>
            </div>

            {/* Rodapé do Hero Card: Indicadores + Tags + Setas de Navegação */}
            <div
              style={{
                position: 'relative',
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Badge de Público / Audiência */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                    backdropFilter: 'blur(10px)',
                    color: '#FFFFFF',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  {currentHero.audience} <Users size={13} />
                </span>
              </div>

              {/* Linha com Tags Pills e Setas Circulares */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {currentHero.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.18)',
                        backdropFilter: 'blur(10px)',
                        color: '#FFFFFF',
                        padding: '4px 14px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        border: '1px solid rgba(255, 255, 255, 0.25)'
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Controles de Navegação (←) (→) em pílulas translúcidas */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setHeroSlide((prev) => (prev > 0 ? prev - 1 : heroCards.length - 1))}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronLeft size={16} strokeWidth={2.5} />
                  </button>

                  <button
                    onClick={() => setHeroSlide((prev) => prev + 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= CARD 2: MOMENTS (MATCHDAY / VIEWING PARTY) ================= */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '30px',
              padding: '24px',
              boxShadow: '0 16px 40px -12px rgba(100, 85, 140, 0.09)',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '440px'
            }}
          >
            {/* Topo do Card Moments */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#13151B' }}>
                  Moments
                </span>
                <button
                  onClick={() => onNavigateTab?.('aovivo')}
                  style={{
                    backgroundColor: '#F3F4F7',
                    color: '#13151B',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '6px 14px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  View All
                </button>
              </div>

              {/* Data Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#636879',
                  marginBottom: '8px'
                }}
              >
                <Calendar size={14} />
                <span>{currentMoment.date}</span>
              </div>

              {/* Título Moments */}
              <h3
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  color: '#13151B',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                  marginBottom: '16px'
                }}
              >
                {currentMoment.title}
              </h3>
            </div>

            {/* Imagem Imersiva com Rounded Corners interna */}
            <div
              style={{
                position: 'relative',
                borderRadius: '22px',
                overflow: 'hidden',
                height: '210px',
                backgroundColor: '#1E232B',
                boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)'
              }}
            >
              <img
                src={currentMoment.image}
                alt={currentMoment.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)'
                }}
              />

              {/* Controles sobre a imagem */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  left: '14px',
                  right: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  zIndex: 2
                }}
              >
                <span
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {currentMoment.tag}
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => setMomentSlide((p) => (p > 0 ? p - 1 : momentCards.length - 1))}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.35)',
                      backdropFilter: 'blur(8px)',
                      border: 'none',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setMomentSlide((p) => p + 1)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.35)',
                      backdropFilter: 'blur(8px)',
                      border: 'none',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ================= COLUNA 3: STATS & INSIGHTS (DOIS CARDS EMPILHADOS) ================= */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              justifyContent: 'space-between'
            }}
          >
            {/* Card Métricas Topo: Insights */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '30px',
                padding: '24px',
                boxShadow: '0 16px 40px -12px rgba(100, 85, 140, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1
              }}
            >
              {/* Header Insights com Setas */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px'
                }}
              >
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#13151B' }}>
                  Insights
                </span>
                <button
                  onClick={() => onNavigateTab?.('oraculo')}
                  style={{
                    backgroundColor: '#F3F4F7',
                    color: '#13151B',
                    border: 'none',
                    borderRadius: '9999px',
                    padding: '5px 12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  View All
                </button>
              </div>

              {/* Setinhas (←) (→) estilo Outcrowd */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '18px' }}>
                <button
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#F4F5F8',
                    border: 'none',
                    color: '#656A79',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#F4F5F8',
                    border: 'none',
                    color: '#656A79',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Ícone Pill Escuro + Número de Alto Impacto */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '16px',
                    backgroundColor: '#111318',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 16px -2px rgba(17, 19, 24, 0.3)'
                  }}
                >
                  <TrendingUp size={20} strokeWidth={2.4} />
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '2.6rem',
                      fontWeight: 800,
                      color: '#13151B',
                      letterSpacing: '-0.04em',
                      lineHeight: 1
                    }}
                  >
                    345
                  </div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: '#767C8E',
                      marginTop: '4px'
                    }}
                  >
                    Live Moments
                  </div>
                </div>
              </div>
            </div>

            {/* Card Métricas Base: Active Subscribers / Partidas */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '30px',
                padding: '24px',
                boxShadow: '0 16px 40px -12px rgba(100, 85, 140, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <span
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#13151B',
                    display: 'block',
                    lineHeight: 1.2
                  }}
                >
                  Active
                  <br />
                  Subscribers
                </span>
              </div>

              {/* Ícone Pill Escuro + Grande Métrica */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '16px',
                    backgroundColor: '#111318',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 16px -2px rgba(17, 19, 24, 0.3)'
                  }}
                >
                  <Users size={20} strokeWidth={2.4} />
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '2.4rem',
                      fontWeight: 800,
                      color: '#13151B',
                      letterSpacing: '-0.03em',
                      lineHeight: 1
                    }}
                  >
                    {overview?.total_partidas
                      ? overview.total_partidas.toLocaleString('en-US')
                      : '55,395'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: '#767C8E',
                      marginTop: '4px'
                    }}
                  >
                    Matches in Database
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
