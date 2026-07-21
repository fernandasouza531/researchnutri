import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type SubTab = "items" | "lojas" | "regras";

export default function AdminGuiaMala() {
  const [subTab, setSubTab] = useState<SubTab>("items");

  const subTabs: { key: SubTab; label: string }[] = [
    { key: "items", label: "Items" },
    { key: "lojas", label: "Lojas" },
    { key: "regras", label: "Regras" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Guia da Mala</h2>

      <div className="flex gap-2 mb-4">
        {subTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`px-4 py-2 text-sm rounded-lg border ${
              subTab === t.key
                ? "bg-green-700 text-white border-green-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === "items" && <GuiaItems />}
      {subTab === "lojas" && <GuiaLojas />}
      {subTab === "regras" && <GuiaRegras />}
    </div>
  );
}

function GuiaItems() {
  const utils = trpc.useUtils();
  const { data: items, isLoading } = trpc.guiaMala.listItems.useQuery();

  const createMutation = trpc.guiaMala.createItem.useMutation({
    onSuccess: () => {
      utils.guiaMala.listItems.invalidate();
      toast.success("Item criado");
      setShowForm(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.guiaMala.deleteItem.useMutation({
    onSuccess: () => {
      utils.guiaMala.listItems.invalidate();
      toast.success("Item removido");
    },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [posicaoRanking, setPosicaoRanking] = useState<number | "">("");
  const [descricao, setDescricao] = useState("");
  const [precoMedioUsd, setPrecoMedioUsd] = useState("");
  const [precoMedioBrl, setPrecoMedioBrl] = useState("");
  const [economiaEstimadaPercent, setEconomiaEstimadaPercent] = useState<number | "">("");
  const [marcaRecomendada, setMarcaRecomendada] = useState("");
  const [linkAfiliado, setLinkAfiliado] = useState("");
  const [valeAPena, setValeAPena] = useState(false);
  const [motivo, setMotivo] = useState("");

  const resetForm = () => {
    setNome("");
    setCategoria("");
    setPosicaoRanking("");
    setDescricao("");
    setPrecoMedioUsd("");
    setPrecoMedioBrl("");
    setEconomiaEstimadaPercent("");
    setMarcaRecomendada("");
    setLinkAfiliado("");
    setValeAPena(false);
    setMotivo("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      nome,
      categoria: categoria || undefined,
      posicaoRanking: posicaoRanking === "" ? undefined : posicaoRanking,
      descricao: descricao || undefined,
      precoMedioUsd: precoMedioUsd || undefined,
      precoMedioBrl: precoMedioBrl || undefined,
      economiaEstimadaPercent: economiaEstimadaPercent === "" ? undefined : economiaEstimadaPercent,
      marcaRecomendada: marcaRecomendada || undefined,
      linkAfiliado: linkAfiliado || undefined,
      valeAPena: valeAPena || undefined,
      motivo: motivo || undefined,
    });
  };

  if (isLoading) return <p className="text-gray-500 py-8 text-center">Carregando...</p>;

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800"
        >
          {showForm ? "Cancelar" : "+ Novo Item"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <input
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="ex: Vitaminas, Proteinas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posicao Ranking</label>
              <input
                type="number"
                value={posicaoRanking}
                onChange={(e) => setPosicaoRanking(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preco Medio USD</label>
              <input
                value={precoMedioUsd}
                onChange={(e) => setPrecoMedioUsd(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="29.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preco Medio BRL</label>
              <input
                value={precoMedioBrl}
                onChange={(e) => setPrecoMedioBrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="149.90"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Economia Estimada (%)</label>
              <input
                type="number"
                value={economiaEstimadaPercent}
                onChange={(e) => setEconomiaEstimadaPercent(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca Recomendada</label>
              <input
                value={marcaRecomendada}
                onChange={(e) => setMarcaRecomendada(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Afiliado</label>
              <input
                value={linkAfiliado}
                onChange={(e) => setLinkAfiliado(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="https://..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={2}
              placeholder="Por que vale ou nao vale a pena"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={valeAPena}
                onChange={(e) => setValeAPena(e.target.checked)}
                className="rounded"
              />
              Vale a Pena
            </label>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800 disabled:opacity-50"
          >
            {createMutation.isPending ? "Salvando..." : "Salvar"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {items?.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhum item cadastrado.</p>
        )}
        {items?.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg border flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {item.posicaoRanking ? `#${item.posicaoRanking} ` : ""}
                {item.nome}
              </p>
              <p className="text-sm text-gray-500">
                {item.categoria || "—"} ·{" "}
                {item.precoMedioUsd ? `$${item.precoMedioUsd}` : "—"} ·{" "}
                {item.valeAPena ? "Vale a pena" : "Nao vale"}
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm("Remover item?")) deleteMutation.mutate({ id: item.id });
              }}
              className="text-red-500 text-sm hover:text-red-700"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuiaLojas() {
  const utils = trpc.useUtils();
  const { data: stores, isLoading } = trpc.guiaMala.listStores.useQuery();

  const createMutation = trpc.guiaMala.createStore.useMutation({
    onSuccess: () => {
      utils.guiaMala.listStores.invalidate();
      toast.success("Loja criada");
      setShowForm(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cidade, setCidade] = useState("");
  const [dica, setDica] = useState("");
  const [linkSite, setLinkSite] = useState("");
  const [linkMaps, setLinkMaps] = useState("");
  const [atendePortugues, setAtendePortugues] = useState(false);

  const resetForm = () => {
    setNome("");
    setTipo("");
    setEndereco("");
    setCidade("");
    setDica("");
    setLinkSite("");
    setLinkMaps("");
    setAtendePortugues(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      nome,
      tipo: tipo || undefined,
      endereco: endereco || undefined,
      cidade: cidade || undefined,
      dica: dica || undefined,
      linkSite: linkSite || undefined,
      linkMaps: linkMaps || undefined,
      atendePortugues: atendePortugues || undefined,
    });
  };

  if (isLoading) return <p className="text-gray-500 py-8 text-center">Carregando...</p>;

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800"
        >
          {showForm ? "Cancelar" : "+ Nova Loja"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <input
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="ex: Farmacia, Loja, Supermercado"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereco</label>
              <input
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="ex: Orlando, Miami"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Site</label>
              <input
                value={linkSite}
                onChange={(e) => setLinkSite(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Maps</label>
              <input
                value={linkMaps}
                onChange={(e) => setLinkMaps(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dica</label>
            <textarea
              value={dica}
              onChange={(e) => setDica(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={2}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={atendePortugues}
                onChange={(e) => setAtendePortugues(e.target.checked)}
                className="rounded"
              />
              Atende em Portugues
            </label>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800 disabled:opacity-50"
          >
            {createMutation.isPending ? "Salvando..." : "Salvar"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {stores?.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhuma loja cadastrada.</p>
        )}
        {stores?.map((s) => (
          <div key={s.id} className="bg-white p-4 rounded-lg border">
            <p className="font-medium text-gray-900">{s.nome}</p>
            <p className="text-sm text-gray-500">
              {s.tipo || "—"} · {s.cidade || "—"}
              {s.atendePortugues ? " · Portugues" : ""}
            </p>
            {s.dica && <p className="text-sm text-gray-400 mt-1">{s.dica}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function GuiaRegras() {
  const { data: rules, isLoading } = trpc.guiaMala.listRules.useQuery();

  if (isLoading) return <p className="text-gray-500 py-8 text-center">Carregando...</p>;

  return (
    <div>
      <div className="space-y-2">
        {rules?.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhuma regra cadastrada.</p>
        )}
        {rules?.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded-lg border">
            <p className="font-medium text-gray-900">{r.regra}</p>
            {r.detalhe && <p className="text-sm text-gray-500 mt-1">{r.detalhe}</p>}
            {r.fonte && <p className="text-xs text-gray-400 mt-1">Fonte: {r.fonte}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
