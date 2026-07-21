import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AdminProductsProps {
  supplementId: number;
  supplementName: string;
  onClose: () => void;
}

export default function AdminProducts({ supplementId, supplementName, onClose }: AdminProductsProps) {
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.products.listBySupplement.useQuery({ supplementId });
  const { data: brands } = trpc.brands.list.useQuery();

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      utils.products.listBySupplement.invalidate({ supplementId });
      toast.success("Produto criado");
      setShowForm(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.listBySupplement.invalidate({ supplementId });
      toast.success("Produto removido");
    },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [nomeComercial, setNomeComercial] = useState("");
  const [brandId, setBrandId] = useState<number | "">("");
  const [mercado, setMercado] = useState<"US" | "BR">("US");
  const [dosagemPorCapsula, setDosagemPorCapsula] = useState("");
  const [dosesPorFrasco, setDosesPorFrasco] = useState<number | "">("");
  const [formaQuimica, setFormaQuimica] = useState("");
  const [precoUsd, setPrecoUsd] = useState("");
  const [precoBrl, setPrecoBrl] = useState("");
  const [linkAfiliado, setLinkAfiliado] = useState("");
  const [linkAfiliadoPrograma, setLinkAfiliadoPrograma] = useState("");
  const [ondeComprar, setOndeComprar] = useState("");
  const [vegano, setVegano] = useState(false);
  const [semGluten, setSemGluten] = useState(false);
  const [biodisponibilidade, setBiodisponibilidade] = useState<"alta" | "media" | "baixa" | "">("");

  const resetForm = () => {
    setNomeComercial("");
    setBrandId("");
    setMercado("US");
    setDosagemPorCapsula("");
    setDosesPorFrasco("");
    setFormaQuimica("");
    setPrecoUsd("");
    setPrecoBrl("");
    setLinkAfiliado("");
    setLinkAfiliadoPrograma("");
    setOndeComprar("");
    setVegano(false);
    setSemGluten(false);
    setBiodisponibilidade("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandId === "") return toast.error("Selecione uma marca");
    createMutation.mutate({
      supplementId,
      nomeComercial,
      brandId: brandId as number,
      mercado,
      dosagemPorCapsula: dosagemPorCapsula || undefined,
      dosesPorFrasco: dosesPorFrasco === "" ? undefined : dosesPorFrasco,
      formaQuimica: formaQuimica || undefined,
      precoUsd: precoUsd || undefined,
      precoBrl: precoBrl || undefined,
      linkAfiliado: linkAfiliado || undefined,
      linkAfiliadoPrograma: linkAfiliadoPrograma || undefined,
      ondeComprar: ondeComprar || undefined,
      vegano: vegano || undefined,
      semGluten: semGluten || undefined,
      biodisponibilidade: biodisponibilidade || undefined,
    });
  };

  if (isLoading) return <p className="text-gray-500 py-8 text-center">Carregando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            &larr; Voltar
          </button>
          <h2 className="text-xl font-bold text-gray-900">Produtos — {supplementName}</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800"
        >
          {showForm ? "Cancelar" : "+ Novo"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Comercial</label>
              <input
                value={nomeComercial}
                onChange={(e) => setNomeComercial(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              >
                <option value="">Selecione...</option>
                {brands?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mercado</label>
              <select
                value={mercado}
                onChange={(e) => setMercado(e.target.value as "US" | "BR")}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              >
                <option value="US">US</option>
                <option value="BR">BR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosagem por Capsula</label>
              <input
                value={dosagemPorCapsula}
                onChange={(e) => setDosagemPorCapsula(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="ex: 1000mcg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doses por Frasco</label>
              <input
                type="number"
                value={dosesPorFrasco}
                onChange={(e) => setDosesPorFrasco(e.target.value ? Number(e.target.value) : "")}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Forma Quimica</label>
              <input
                value={formaQuimica}
                onChange={(e) => setFormaQuimica(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="ex: Metilcobalamina"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preco USD</label>
              <input
                value={precoUsd}
                onChange={(e) => setPrecoUsd(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="29.99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preco BRL</label>
              <input
                value={precoBrl}
                onChange={(e) => setPrecoBrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="149.90"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Programa Afiliado</label>
              <input
                value={linkAfiliadoPrograma}
                onChange={(e) => setLinkAfiliadoPrograma(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="ex: iHerb, Amazon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Onde Comprar</label>
              <input
                value={ondeComprar}
                onChange={(e) => setOndeComprar(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="ex: iHerb, Amazon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biodisponibilidade</label>
              <select
                value={biodisponibilidade}
                onChange={(e) => setBiodisponibilidade(e.target.value as "alta" | "media" | "baixa" | "")}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Selecione...</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={vegano}
                onChange={(e) => setVegano(e.target.checked)}
                className="rounded"
              />
              Vegano
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={semGluten}
                onChange={(e) => setSemGluten(e.target.checked)}
                className="rounded"
              />
              Sem Gluten
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
        {products?.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhum produto cadastrado para este suplemento.</p>
        )}
        {products?.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-lg border flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{p.nomeComercial}</p>
              <p className="text-sm text-gray-500">
                {p.mercado} · {p.formaQuimica || "—"} · {p.precoUsd ? `$${p.precoUsd}` : p.precoBrl ? `R$${p.precoBrl}` : "sem preco"}
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm("Remover produto?")) deleteMutation.mutate({ id: p.id });
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
