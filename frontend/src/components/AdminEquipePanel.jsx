import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Link2, Copy, Check, Trash2, UserCheck, UserX,
  Clock, Users, Settings, RefreshCw, Key, AlertCircle, Lock, Unlock, Activity
} from 'lucide-react';

function formatarRestante(segundos) {
  if (!segundos || segundos <= 0) return 'Expirado';
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return `${d}d ${rh}h`;
  }
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

export default function AdminEquipePanel({ apiFetch, currentUser }) {
  const [subTab, setSubTab] = useState('convites'); // 'convites' | 'usuarios' | 'ferramentas' | 'logs'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [globalBlocked, setGlobalBlocked] = useState([]);
  const [logs, setLogs] = useState([]);

  // Novo convite 24h
  const [tituloConvite, setTituloConvite] = useState('Acesso Exclusivo 24h');
  const [duracaoHoras, setDuracaoHoras] = useState(24);
  const [rolePadrao, setRolePadrao] = useState('leitor');
  const [maxUsos, setMaxUsos] = useState(0);
  const [toolsConvite, setToolsConvite] = useState(null); // null = todas liberadas
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  // Edição inline de usuário
  const [expandedToolsUser, setExpandedToolsUser] = useState(null);
  const [draftUserTools, setDraftUserTools] = useState({});
  const [resetPwdUser, setResetPwdUser] = useState(null);
  const [newPwdValue, setNewPwdValue] = useState('');
  const [savingKey, setSavingKey] = useState(null);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiFetch('/api/admin/equipe');
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Erro ao carregar painel administrativo.');
      setUsers(data.users || []);
      setInvites(data.invites || []);
      setCatalogo(data.catalogo_ferramentas || []);
      setGlobalBlocked(data.ferramentas_bloqueadas_global || []);
      setLogs(data.logs || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const notificar = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const montarUrlConvite = (token) => `${window.location.origin}/?convite=${token}`;

  const copiarLink = async (token) => {
    const url = montarUrlConvite(token);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2500);
    } catch {
      window.prompt('Copie o link exclusivo:', url);
    }
  };

  const handleGerarConvite = async (e) => {
    e.preventDefault();
    setCreatingInvite(true);
    setError(null);
    try {
      const resp = await apiFetch('/api/admin/equipe/convites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: tituloConvite,
          duracao_horas: Number(duracaoHoras),
          role_padrao: rolePadrao,
          max_usos: Number(maxUsos),
          ferramentas: toolsConvite,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Erro ao gerar link.');
      await copiarLink(data.token);
      notificar(`Link de ${duracaoHoras}h criado e copiado para a área de transferência!`);
      await carregarDados();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreatingInvite(false);
    }
  };

  const handleRevogarConvite = async (token) => {
    setSavingKey(`inv_${token}`);
    try {
      const resp = await apiFetch(`/api/admin/equipe/convites/${token}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Falha ao revogar link.');
      notificar('Link de convite revogado imediatamente.');
      await carregarDados();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleAtualizarUsuario = async (username, payload, msgSucesso) => {
    setSavingKey(`usr_${username}`);
    setError(null);
    try {
      const resp = await apiFetch(`/api/admin/equipe/usuarios/${encodeURIComponent(username)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Falha ao atualizar usuário.');
      if (msgSucesso) notificar(msgSucesso);
      await carregarDados();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleExcluirUsuario = async (username) => {
    if (!window.confirm(`Remover permanentemente a conta @${username}?`)) return;
    setSavingKey(`del_${username}`);
    try {
      const resp = await apiFetch(`/api/admin/equipe/usuarios/${encodeURIComponent(username)}`, {
        method: 'DELETE',
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Erro ao excluir usuário.');
      notificar(`Conta @${username} removida.`);
      await carregarDados();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleToggleGlobalTool = async (toolId) => {
    const isBlocked = globalBlocked.includes(toolId);
    const updated = isBlocked
      ? globalBlocked.filter((t) => t !== toolId)
      : [...globalBlocked, toolId];
    setGlobalBlocked(updated);
    try {
      const resp = await apiFetch('/api/admin/equipe/ferramentas-globais', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ferramentas_bloqueadas_global: updated }),
      });
      if (!resp.ok) throw new Error('Falha ao atualizar ferramentas globais.');
      notificar('Política global de ferramentas atualizada.');
    } catch (e) {
      setError(e.message);
      await carregarDados();
    }
  };

  const pendentes = users.filter((u) => u.status === 'pendente');
  const ativos = users.filter((u) => u.status === 'ativo');
  const bloqueados = users.filter((u) => u.status === 'bloqueado');
  const invitesAtivos = invites.filter((i) => i.ativo);

  const abrirEditorFerramentas = (u) => {
    if (expandedToolsUser === u.username) {
      setExpandedToolsUser(null);
      return;
    }
    setDraftUserTools((prev) => ({
      ...prev,
      [u.username]: Array.isArray(u.ferramentas_custom)
        ? u.ferramentas_custom
        : catalogo.map((c) => c.id),
    }));
    setExpandedToolsUser(u.username);
  };

  const toggleToolInDraft = (username, toolId) => {
    setDraftUserTools((prev) => {
      const cur = prev[username] || [];
      const next = cur.includes(toolId) ? cur.filter((x) => x !== toolId) : [...cur, toolId];
      return { ...prev, [username]: next };
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
      {/* Cabeçalho */}
      <div
        className="soft-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldCheck size={18} color="var(--accent)" />
            <span className="font-mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Governança & Controle de Acesso
            </span>
          </div>
          <h1 className="font-editorial" style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Painel de Administração da Equipe
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Gere links temporários de 24h, aprove novas solicitações e defina exatamente quais abas cada usuário pode usar.
          </p>
        </div>

        <button
          type="button"
          onClick={carregarDados}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: 'var(--radius-control)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-raised)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Atualizar</span>
        </button>
      </div>

      {/* KPIs rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        <div className="soft-card" style={{ padding: '14px 16px' }}>
          <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Aguardando Autorização</div>
          <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: pendentes.length > 0 ? '#f59e0b' : 'var(--text-primary)', marginTop: '4px' }}>
            {pendentes.length}
          </div>
        </div>
        <div className="soft-card" style={{ padding: '14px 16px' }}>
          <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Usuários Ativos</div>
          <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--positive)', marginTop: '4px' }}>
            {ativos.length}
          </div>
        </div>
        <div className="soft-card" style={{ padding: '14px 16px' }}>
          <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Links 24h Ativos</div>
          <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--accent)', marginTop: '4px' }}>
            {invitesAtivos.length}
          </div>
        </div>
        <div className="soft-card" style={{ padding: '14px 16px' }}>
          <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contas Bloqueadas</div>
          <div className="font-mono" style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '4px' }}>
            {bloqueados.length}
          </div>
        </div>
      </div>

      {/* Feedbacks */}
      {error && (
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-control)', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {feedback && (
        <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-control)', backgroundColor: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.35)', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
          <Check size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Alerta imediato se houver pendentes */}
      {pendentes.length > 0 && (
        <div className="soft-card" style={{ padding: '16px 20px', borderColor: 'rgba(245, 158, 11, 0.45)', backgroundColor: 'rgba(245, 158, 11, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontWeight: 700, fontSize: '0.9rem', color: '#f59e0b' }}>
            <Clock size={16} />
            <span>Solicitações pendentes aguardando sua autorização ({pendentes.length})</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pendentes.map((u) => (
              <div key={u.username} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-panel)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>{u.nome}</strong>{' '}
                  <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>@{u.username}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Origem: {u.origem_cadastro} • Solicitado em {u.criado_em} UTC
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={savingKey === `usr_${u.username}`}
                    onClick={() => handleAtualizarUsuario(u.username, { status: 'ativo', role: 'leitor' }, `Acesso de @${u.username} autorizado!`)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: 'var(--radius-control)', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    <UserCheck size={14} /> Autorizar Acesso
                  </button>
                  <button
                    type="button"
                    disabled={savingKey === `usr_${u.username}`}
                    onClick={() => handleAtualizarUsuario(u.username, { status: 'bloqueado' }, `Solicitação de @${u.username} bloqueada.`)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: 'var(--radius-control)', border: '1px solid rgba(239, 68, 68, 0.35)', backgroundColor: 'transparent', color: '#ef4444', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <UserX size={14} /> Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navegação interna */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {[
          { id: 'convites', label: 'Links Temporários (24h)', icon: Link2 },
          { id: 'usuarios', label: `Usuários & Permissões (${users.length})`, icon: Users },
          { id: 'ferramentas', label: 'Ferramentas Globais', icon: Settings },
          { id: 'logs', label: 'Registro de Auditoria', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '9px 14px',
                borderRadius: 'var(--radius-control)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border-subtle)'}`,
                backgroundColor: active ? 'var(--accent-soft)' : 'var(--surface-panel)',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= ABA 1: CONVITES TEMPORÁRIOS (24H) ================= */}
      {subTab === 'convites' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <form onSubmit={handleGerarConvite} className="soft-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Gerar novo link de cadastro exclusivo
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Identificação do Link
                </label>
                <input
                  type="text"
                  className="soft-input"
                  value={tituloConvite}
                  onChange={(e) => setTituloConvite(e.target.value)}
                  placeholder="Ex: Colegas Redação"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Validade do Link
                </label>
                <select className="soft-input" value={duracaoHoras} onChange={(e) => setDuracaoHoras(Number(e.target.value))}>
                  <option value={24}>24 horas (1 dia) — Padrão</option>
                  <option value={12}>12 horas</option>
                  <option value={48}>48 horas (2 dias)</option>
                  <option value={168}>7 dias</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Perfil Inicial
                </label>
                <select className="soft-input" value={rolePadrao} onChange={(e) => setRolePadrao(e.target.value)}>
                  <option value="leitor">Leitor (Consulta e análises)</option>
                  <option value="moderador">Moderador (Leitura completa)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Limite de Cadastros
                </label>
                <select className="soft-input" value={maxUsos} onChange={(e) => setMaxUsos(Number(e.target.value))}>
                  <option value={0}>Ilimitado durante a validade</option>
                  <option value={1}>Uso único (1 pessoa)</option>
                  <option value={2}>Até 2 colegas</option>
                  <option value={5}>Até 5 colegas</option>
                  <option value={10}>Até 10 colegas</option>
                </select>
              </div>
            </div>

            {/* Seleção opcional de ferramentas para este convite */}
            <div style={{ padding: '12px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Ferramentas liberadas para quem entrar por este link:
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setToolsConvite(null)}
                    style={{ fontSize: '0.72rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', backgroundColor: toolsConvite === null ? 'var(--accent-soft)' : 'transparent', color: toolsConvite === null ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Todas (Padrão Global)
                  </button>
                  <button
                    type="button"
                    onClick={() => setToolsConvite(catalogo.filter((c) => !globalBlocked.includes(c.id)).map((c) => c.id))}
                    style={{ fontSize: '0.72rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', backgroundColor: Array.isArray(toolsConvite) ? 'var(--accent-soft)' : 'transparent', color: Array.isArray(toolsConvite) ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Personalizar Lista
                  </button>
                </div>
              </div>

              {Array.isArray(toolsConvite) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: '6px', marginTop: '8px' }}>
                  {catalogo.map((tool) => {
                    const checked = toolsConvite.includes(tool.id);
                    return (
                      <label key={tool.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.77rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setToolsConvite((prev) =>
                              prev.includes(tool.id) ? prev.filter((t) => t !== tool.id) : [...prev, tool.id]
                            )
                          }
                        />
                        <span>{tool.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={creatingInvite}
                style={{ padding: '10px 18px', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '7px' }}
              >
                {creatingInvite ? <RefreshCw size={15} className="animate-spin" /> : <Link2 size={15} />}
                <span>{creatingInvite ? 'Gerando...' : 'Gerar e Copiar Link 24h'}</span>
              </button>
            </div>
          </form>

          {/* Lista de convites */}
          <div className="soft-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              Links gerados recentemente ({invites.length})
            </div>
            {invites.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Nenhum link temporário criado ainda. Use o formulário acima para gerar um link válido por 24 horas.
              </p>
            ) : (
              invites.map((inv) => {
                const statusLabel = inv.revogado
                  ? 'REVOGADO'
                  : inv.ativo
                  ? 'ATIVO'
                  : inv.restante_segundos <= 0
                  ? 'EXPIRADO'
                  : 'ESGOTADO';
                const badgeColor = inv.ativo ? '#22c55e' : inv.revogado ? '#ef4444' : '#f59e0b';
                return (
                  <div
                    key={inv.token}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-control)',
                      backgroundColor: 'var(--surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      opacity: inv.ativo ? 1 : 0.72,
                    }}
                  >
                    <div style={{ minWidth: '220px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>{inv.titulo}</strong>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            border: `1px solid ${badgeColor}`,
                            color: badgeColor,
                          }}
                        >
                          {statusLabel}
                        </span>
                        <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Perfil: {inv.role_padrao}
                        </span>
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px', wordBreak: 'break-all' }}>
                        {montarUrlConvite(inv.token)}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        {inv.ativo ? `Expira em ${formatarRestante(inv.restante_segundos)}` : 'Sem validade ativa'} •{' '}
                        Usos: {inv.usos_atuais}/{inv.max_usos === 0 ? '∞' : inv.max_usos} •{' '}
                        Ferramentas: {Array.isArray(inv.ferramentas) ? `${inv.ferramentas.length} selecionadas` : 'Padrão global'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => copiarLink(inv.token)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 11px', borderRadius: 'var(--radius-control)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-panel)', color: 'var(--text-primary)', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        {copiedToken === inv.token ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                        <span>{copiedToken === inv.token ? 'Copiado!' : 'Copiar URL'}</span>
                      </button>
                      {inv.ativo && (
                        <button
                          type="button"
                          disabled={savingKey === `inv_${inv.token}`}
                          onClick={() => handleRevogarConvite(inv.token)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 11px', borderRadius: 'var(--radius-control)', border: '1px solid rgba(239, 68, 68, 0.35)', backgroundColor: 'transparent', color: '#ef4444', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <Trash2 size={14} /> Revogar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= ABA 2: USUÁRIOS & PERMISSÕES ================= */}
      {subTab === 'usuarios' && (
        <div className="soft-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {users.map((u) => {
            const isSelf = currentUser?.username?.toLowerCase() === u.username.toLowerCase();
            const isExpanded = expandedToolsUser === u.username;
            const statusColor = u.status === 'ativo' ? '#22c55e' : u.status === 'pendente' ? '#f59e0b' : '#ef4444';
            return (
              <div
                key={u.username}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-control)',
                  backgroundColor: 'var(--surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{u.nome}</strong>
                      <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>@{u.username}</span>
                      <span className="font-mono" style={{ fontSize: '0.66rem', fontWeight: 800, padding: '2px 7px', borderRadius: '4px', border: `1px solid ${statusColor}`, color: statusColor, textTransform: 'uppercase' }}>
                        {u.status}
                      </span>
                      {isSelf && (
                        <span className="font-mono" style={{ fontSize: '0.66rem', color: 'var(--accent)', fontWeight: 700 }}>(Você)</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      Criado: {u.criado_em} • Último login: {u.ultimo_login || 'Nunca acessou'} • Origem: {u.origem_cadastro}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                    <select
                      className="soft-input"
                      style={{ width: 'auto', padding: '5px 10px', fontSize: '0.78rem', height: '34px' }}
                      value={u.role}
                      disabled={isSelf || savingKey === `usr_${u.username}`}
                      onChange={(e) =>
                        handleAtualizarUsuario(u.username, { role: e.target.value }, `Perfil de @${u.username} alterado para ${e.target.value}.`)
                      }
                    >
                      <option value="leitor">Leitor</option>
                      <option value="moderador">Moderador</option>
                      <option value="admin">Administrador</option>
                    </select>

                    {u.role !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => abrirEditorFerramentas(u)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: 'var(--radius-control)', border: '1px solid var(--border-subtle)', backgroundColor: isExpanded ? 'var(--accent-soft)' : 'var(--surface-panel)', color: isExpanded ? 'var(--accent)' : 'var(--text-primary)', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <Settings size={13} />
                        <span>Ferramentas ({u.ferramentas_permitidas?.length || 0}/{catalogo.length})</span>
                      </button>
                    )}

                    {!isSelf && u.status !== 'ativo' && (
                      <button
                        type="button"
                        disabled={savingKey === `usr_${u.username}`}
                        onClick={() => handleAtualizarUsuario(u.username, { status: 'ativo' }, `@${u.username} ativado!`)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: 'var(--radius-control)', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        <Unlock size={13} /> Ativar
                      </button>
                    )}

                    {!isSelf && u.status === 'ativo' && (
                      <button
                        type="button"
                        disabled={savingKey === `usr_${u.username}`}
                        onClick={() => handleAtualizarUsuario(u.username, { status: 'bloqueado' }, `@${u.username} bloqueado.`)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: 'var(--radius-control)', border: '1px solid rgba(245, 158, 11, 0.4)', backgroundColor: 'transparent', color: '#f59e0b', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <Lock size={13} /> Bloquear
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setResetPwdUser(resetPwdUser === u.username ? null : u.username);
                        setNewPwdValue('');
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: 'var(--radius-control)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-panel)', color: 'var(--text-secondary)', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}
                      title="Definir nova senha para este usuário"
                    >
                      <Key size={13} /> Senha
                    </button>

                    {!isSelf && (
                      <button
                        type="button"
                        disabled={savingKey === `del_${u.username}`}
                        onClick={() => handleExcluirUsuario(u.username)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 9px', borderRadius: 'var(--radius-control)', border: '1px solid rgba(239, 68, 68, 0.35)', backgroundColor: 'transparent', color: '#ef4444', fontSize: '0.76rem', cursor: 'pointer' }}
                        title="Excluir usuário"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Redefinir senha inline */}
                {resetPwdUser === u.username && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '10px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-panel)', border: '1px solid var(--border-subtle)' }}>
                    <input
                      type="password"
                      className="soft-input font-mono"
                      style={{ flex: 1, minWidth: '180px', height: '36px', fontSize: '0.8rem' }}
                      placeholder="Nova senha temporária (mín. 6 caracteres)"
                      value={newPwdValue}
                      onChange={(e) => setNewPwdValue(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={newPwdValue.length < 6}
                      onClick={() => {
                        handleAtualizarUsuario(u.username, { nova_senha: newPwdValue }, `Senha de @${u.username} redefinida.`);
                        setResetPwdUser(null);
                      }}
                      className="btn-primary"
                      style={{ padding: '0 14px', height: '36px', fontSize: '0.78rem' }}
                    >
                      Salvar Senha
                    </button>
                  </div>
                )}

                {/* Permissões granulares por ferramenta */}
                {isExpanded && u.role !== 'admin' && (
                  <div style={{ padding: '12px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-panel)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Abas liberadas para @{u.username}:
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setDraftUserTools((p) => ({ ...p, [u.username]: catalogo.map((c) => c.id) }))}
                          style={{ fontSize: '0.72rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                          Marcar todas
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraftUserTools((p) => ({ ...p, [u.username]: ['overview'] }))}
                          style={{ fontSize: '0.72rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                          Só Painel do Dia
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: '6px' }}>
                      {catalogo.map((tool) => {
                        const checked = (draftUserTools[u.username] || []).includes(tool.id);
                        const blockedGlobally = globalBlocked.includes(tool.id);
                        return (
                          <label key={tool.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: blockedGlobally ? 'var(--text-muted)' : 'var(--text-secondary)', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleToolInDraft(u.username, tool.id)}
                            />
                            <span>{tool.label}{blockedGlobally ? ' (bloq. global)' : ''}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          handleAtualizarUsuario(u.username, { ferramentas: null }, `@${u.username} voltou a seguir o padrão global.`);
                          setExpandedToolsUser(null);
                        }}
                        style={{ padding: '7px 12px', borderRadius: 'var(--radius-control)', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer' }}
                      >
                        Usar Padrão Global
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleAtualizarUsuario(
                            u.username,
                            { ferramentas: draftUserTools[u.username] || [] },
                            `Ferramentas de @${u.username} salvas!`
                          );
                          setExpandedToolsUser(null);
                        }}
                        className="btn-primary"
                        style={{ padding: '7px 14px', fontSize: '0.78rem' }}
                      >
                        Salvar Permissões
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================= ABA 3: FERRAMENTAS GLOBAIS ================= */}
      {subTab === 'ferramentas' && (
        <div className="soft-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-primary)' }}>
              Visibilidade Global das Ferramentas
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Desative uma aba abaixo para ocultá-la de todos os usuários não-administradores (administradores sempre mantêm acesso total).
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
            {catalogo.map((tool) => {
              const habilitada = !globalBlocked.includes(tool.id);
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => handleToggleGlobalTool(tool.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-control)',
                    border: `1px solid ${habilitada ? 'rgba(34, 197, 94, 0.35)' : 'var(--border-subtle)'}`,
                    backgroundColor: habilitada ? 'var(--accent-soft)' : 'var(--surface-raised)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>{tool.label}</div>
                    <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{tool.grupo} • {tool.id}</div>
                  </div>
                  <span className="font-mono" style={{ fontSize: '0.7rem', fontWeight: 800, color: habilitada ? '#22c55e' : '#ef4444' }}>
                    {habilitada ? 'ATIVA' : 'OCULTA'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= ABA 4: AUDITORIA ================= */}
      {subTab === 'logs' && (
        <div className="soft-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Eventos recentes de segurança
          </div>
          {logs.map((l) => (
            <div key={l.id} className="font-mono" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px', padding: '8px 10px', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--surface-raised)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>
                <strong style={{ color: 'var(--accent)' }}>{l.acao}</strong> • ator: {l.ator || '-'} • alvo: {l.alvo || '-'} {l.detalhes ? `(${l.detalhes})` : ''}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{l.criado_em}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
