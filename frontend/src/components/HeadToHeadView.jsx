import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Trophy, Shield, Calendar, MapPin, TrendingUp, AlertCircle, History } from 'lucide-react';

export default function HeadToHeadView() {
  const [clubesLista, setClubesLista] = useState([]);
  const [clubeAId, setClubeAId] = useState(2459); // Palmeiras
  const [clubeBId, setClubeBId] = useState(2902); // Santos
  const [loading, setLoading] = useState(false);
  const [dadosH2H, setDadosH2H] = useState(null);
  const [erro, setErro] = useState(null);

  // Carrega catálogo de clubes
  useEffect(() => {
    fetch('/api/clubes/lista-geral')
      .then(res => res.json())
      .then(data => {
        if (data && data.clubes) {
          setClubesLista(data.clubes);
        }
      })
      .catch(() => {
        // Fallback básico se a rota demorar
        setClubesLista([
          { clube_id: 2459, nome: 'Palmeiras' },
          { clube_id: 2902, nome: 'Santos' },
          { clube_id: 2450, nome: 'Corinthians' },
          { clube_id: 2460, nome: 'São Paulo' },
          { clube_id: 2452, nome: 'Flamengo' },
          { clube_id: 2454, nome: 'Fluminense' },
          { clube_id: 2457, nome: 'Grêmio' },
          { clube_id: 2458, nome: 'Internacional' },
          { clube_id: 2451, nome: 'Cruzeiro' },
          { clube_id: 2449, nome: 'Atlético-MG' }
        ]);
      });
  }, []);

  // Busca confrontos diretos
  useEffect(() => {
    if (!clubeAId || !clubeBId || clubeAId === clubeBId) return;

    setLoading(true);
    setErro(null);

    fetch(`/api/confrontos/h2h?clube_a=${clubeAId}&clube_b=${clubeBId}`)
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar dados do confronto');
        return res.json();
      })
      .then(data => {
        setDadosH2H(data);
        setLoading(false);
      })
      .catch(err => {
        setErro(err.message);
        setLoading(false);
      });
  }, [clubeAId, clubeBId]);

  const handleInverterPerspectiva = () => {
    const temp = clubeAId;
    setClubeAId(clubeBId);
    setClubeBId(temp);
  };

  const infoA = dadosH2H?.clubes?.clube_a;
  const infoB = dadosH2H?.clubes?.clube_b;
  const retro = dadosH2H?.retrospecto_geral;
  const mando = dadosH2H?.retrospecto_mando;

  return (
    <div className="space-y-6 text-[#1B1A17] font-sans">
      {/* Topo Editorial e Seletores */}
      <div className="bg-[#FAF6F0] border border-[#E5DBCF] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#85573B] mb-2">
              Clube Principal (A)
            </label>
            <select
              value={clubeAId}
              onChange={(e) => setClubeAId(Number(e.target.value))}
              className="w-full bg-white border border-[#D8C7B5] rounded-lg px-4 py-2.5 font-serif text-lg font-bold text-[#1B1A17] focus:ring-2 focus:ring-[#5A673E] focus:outline-none"
            >
              {clubesLista.map(c => (
                <option key={`a-${c.clube_id}`} value={c.clube_id} disabled={c.clube_id === clubeBId}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleInverterPerspectiva}
            className="p-3 bg-[#EAE0D2] hover:bg-[#D8C7B5] border border-[#CBB8A3] rounded-full transition-transform active:scale-95 touch-tactile mt-6 md:mt-6 shadow-inner"
            title="Inverter perspectiva dos clubes"
          >
            <ArrowLeftRight className="w-5 h-5 text-[#85573B]" />
          </button>

          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#85573B] mb-2">
              Clube Oponente (B)
            </label>
            <select
              value={clubeBId}
              onChange={(e) => setClubeBId(Number(e.target.value))}
              className="w-full bg-white border border-[#D8C7B5] rounded-lg px-4 py-2.5 font-serif text-lg font-bold text-[#1B1A17] focus:ring-2 focus:ring-[#5A673E] focus:outline-none"
            >
              {clubesLista.map(c => (
                <option key={`b-${c.clube_id}`} value={c.clube_id} disabled={c.clube_id === clubeAId}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {erro && (
        <div className="bg-[#FDF2F0] border border-[#EAC4BE] rounded-lg p-4 text-[#85573B] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{erro}</span>
        </div>
      )}

      {loading && (
        <div className="p-12 text-center text-[#5A673E] space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#5A673E] border-t-transparent" />
          <p className="font-serif italic">Consultando histórico de 115.755 partidas catalogadas...</p>
        </div>
      )}

      {!loading && dadosH2H && (
        <>
          {/* Card de Retrospecto Geral */}
          <div className="bg-[#FAF6F0] border border-[#E5DBCF] rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
                <Trophy className="w-6 h-6 text-[#5A673E]" />
                Retrospecto Geral no Acervo
              </h2>
              <span className="text-xs font-mono font-bold bg-[#EAE0D2] px-3 py-1 rounded-full text-[#85573B]">
                {retro.total_jogos} Confrontos Catalogados
              </span>
            </div>

            {/* Placar Numérico de Vitórias */}
            <div className="grid grid-cols-3 gap-4 my-6 text-center">
              <div className="p-4 bg-white border border-[#E5DBCF] rounded-lg shadow-inner">
                <p className="text-xs uppercase font-semibold text-[#5A673E] mb-1">Vitórias {infoA.nome}</p>
                <p className="font-mono text-4xl font-black text-[#5A673E]">{retro.vitorias_clube_a}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">{retro.aproveitamento_clube_a_pct}% aproveitamento</p>
              </div>

              <div className="p-4 bg-white border border-[#E5DBCF] rounded-lg shadow-inner">
                <p className="text-xs uppercase font-semibold text-gray-500 mb-1">Empates</p>
                <p className="font-mono text-4xl font-black text-gray-700">{retro.empates}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">Saldo de Gols: {retro.saldo_gols_clube_a > 0 ? `+${retro.saldo_gols_clube_a}` : retro.saldo_gols_clube_a}</p>
              </div>

              <div className="p-4 bg-white border border-[#E5DBCF] rounded-lg shadow-inner">
                <p className="text-xs uppercase font-semibold text-[#85573B] mb-1">Vitórias {infoB.nome}</p>
                <p className="font-mono text-4xl font-black text-[#85573B]">{retro.vitorias_clube_b}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">{retro.aproveitamento_clube_b_pct}% aproveitamento</p>
              </div>
            </div>

            {/* Barra de Distribuição */}
            {retro.total_jogos > 0 && (
              <div className="space-y-1">
                <div className="h-4 rounded-full overflow-hidden flex bg-gray-200 shadow-inner">
                  <div
                    style={{ width: `${(retro.vitorias_clube_a / retro.total_jogos) * 100}%` }}
                    className="bg-[#5A673E] h-full"
                    title={`Vitórias ${infoA.nome}`}
                  />
                  <div
                    style={{ width: `${(retro.empates / retro.total_jogos) * 100}%` }}
                    className="bg-[#D8C7B5] h-full"
                    title="Empates"
                  />
                  <div
                    style={{ width: `${(retro.vitorias_clube_b / retro.total_jogos) * 100}%` }}
                    className="bg-[#85573B] h-full"
                    title={`Vitórias ${infoB.nome}`}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-gray-500 px-1">
                  <span>{infoA.nome}: {retro.gols_clube_a} gols</span>
                  <span>{infoB.nome}: {retro.gols_clube_b} gols</span>
                </div>
              </div>
            )}
          </div>

          {/* Retrospecto por Mando */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FAF6F0] border border-[#E5DBCF] rounded-xl p-5 shadow-sm">
              <h3 className="font-serif text-lg font-bold flex items-center gap-2 text-[#5A673E] mb-3">
                <Shield className="w-5 h-5" />
                {infoA.nome} como Mandante
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2 bg-white rounded border border-[#E5DBCF]">
                  <span className="block text-xs text-gray-500 font-sans">Vitórias</span>
                  <span className="text-xl font-bold text-[#5A673E]">{mando.clube_a_mandante.vitorias}</span>
                </div>
                <div className="p-2 bg-white rounded border border-[#E5DBCF]">
                  <span className="block text-xs text-gray-500 font-sans">Empates</span>
                  <span className="text-xl font-bold">{mando.clube_a_mandante.empates}</span>
                </div>
                <div className="p-2 bg-white rounded border border-[#E5DBCF]">
                  <span className="block text-xs text-gray-500 font-sans">Derrotas</span>
                  <span className="text-xl font-bold text-[#85573B]">{mando.clube_a_mandante.derrotas}</span>
                </div>
              </div>
              <p className="text-xs font-mono text-gray-600 mt-2 text-center">
                Gols: {mando.clube_a_mandante.gols_pro} pró, {mando.clube_a_mandante.gols_contra} contra
              </p>
            </div>

            <div className="bg-[#FAF6F0] border border-[#E5DBCF] rounded-xl p-5 shadow-sm">
              <h3 className="font-serif text-lg font-bold flex items-center gap-2 text-[#85573B] mb-3">
                <Shield className="w-5 h-5" />
                {infoB.nome} como Mandante
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2 bg-white rounded border border-[#E5DBCF]">
                  <span className="block text-xs text-gray-500 font-sans">Vitórias</span>
                  <span className="text-xl font-bold text-[#85573B]">{mando.clube_b_mandante.vitorias}</span>
                </div>
                <div className="p-2 bg-white rounded border border-[#E5DBCF]">
                  <span className="block text-xs text-gray-500 font-sans">Empates</span>
                  <span className="text-xl font-bold">{mando.clube_b_mandante.empates}</span>
                </div>
                <div className="p-2 bg-white rounded border border-[#E5DBCF]">
                  <span className="block text-xs text-gray-500 font-sans">Derrotas</span>
                  <span className="text-xl font-bold text-[#5A673E]">{mando.clube_b_mandante.derrotas}</span>
                </div>
              </div>
              <p className="text-xs font-mono text-gray-600 mt-2 text-center">
                Gols: {mando.clube_b_mandante.gols_pro} pró, {mando.clube_b_mandante.gols_contra} contra
              </p>
            </div>
          </div>

          {/* Maiores Goleadas */}
          {dadosH2H.maiores_goleadas?.length > 0 && (
            <div className="bg-[#FAF6F0] border border-[#E5DBCF] rounded-xl p-6 shadow-sm">
              <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#85573B]" />
                Maiores Goleadas Históricas (Diferença ≥ 3 Gols)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dadosH2H.maiores_goleadas.map((gol, idx) => (
                  <div key={`goleada-${idx}`} className="bg-white border border-[#E5DBCF] p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center text-xs font-mono text-gray-500 mb-1">
                      <span>{gol.data}</span>
                      <span className="bg-[#EAE0D2] px-2 py-0.5 rounded text-[#85573B]">{gol.competicao}</span>
                    </div>
                    <div className="font-mono text-2xl font-black text-center my-2 text-[#1B1A17]">
                      {gol.placar}
                    </div>
                    <p className="text-xs text-center text-gray-600">
                      {gol.mandante} x {gol.visitante}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Histórico Recente de Confrontos */}
          <div className="bg-[#FAF6F0] border border-[#E5DBCF] rounded-xl p-6 shadow-sm">
            <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-[#5A673E]" />
              Confrontos Recentes no Acervo
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5DBCF] text-xs font-semibold uppercase text-gray-500 font-sans">
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Competição</th>
                    <th className="py-2.5 px-3 text-right">Mandante</th>
                    <th className="py-2.5 px-3 text-center">Placar</th>
                    <th className="py-2.5 px-3">Visitante</th>
                    <th className="py-2.5 px-3">Estádio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE5DB] font-mono text-sm">
                  {dadosH2H.historico_recente?.map(partida => (
                    <tr key={partida.id_partida} className="hover:bg-white/60 transition-colors">
                      <td className="py-2.5 px-3 text-xs text-gray-600">{partida.data}</td>
                      <td className="py-2.5 px-3 text-xs text-gray-700 font-sans">{partida.campeonato}</td>
                      <td className={`py-2.5 px-3 text-right font-sans ${partida.mandante === infoA.nome ? 'font-bold text-[#5A673E]' : ''}`}>
                        {partida.mandante}
                      </td>
                      <td className="py-2.5 px-3 text-center font-black bg-[#FAF6F0] rounded">
                        {partida.placar || `${partida.gols_mandante} x ${partida.gols_visitante}`}
                      </td>
                      <td className={`py-2.5 px-3 font-sans ${partida.visitante === infoA.nome ? 'font-bold text-[#5A673E]' : ''}`}>
                        {partida.visitante}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-gray-500 font-sans">{partida.estadio || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
