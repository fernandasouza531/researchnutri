import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AdminSupplementsProps {
  onSelectSupplement?: (id: number, nome: string) => void;
}

export default function AdminSupplements({ onSelectSupplement }: AdminSupplementsProps) {
  const utils = trpc.useUtils();
  const { data: supplements, isLoading } = trpc.supplements.list.useQuery();
  const createMutation = trpc.supplements.create.useMutation({
    onSuccess: () => {
      utils.supplements.list.invalidate();
      toast.success("Suplemento criado");
      setShowForm(false);
      resetForm();
    },
    onError: e => toast.error(e.message),
  });
  const deleteMutation = trpc.supplements.delete.useMutation({
    onSuccess: () => {
      utils.supplements.list.invalidate();
      toast.success("Suplemento removido");
    },
    onError: e => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricaoCurta, setDescricaoCurta] = useState("");
  const [paraQueServe, setParaQueServe] = useState("");

  const resetForm = () => {
    setNome("");
    setSlug("");
    setCategoria("");
    setDescricaoCurta("");
    setParaQueServe("");
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      nome,
      slug: slug || generateSlug(nome),
      categoria,
      descricaoCurta: descricaoCurta || undefined,
      paraQueServe: paraQueServe || undefined,
    });
  };

  if (isLoading) return <p className="text-gray-500 py-8 text-center">Carregando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Suplementos</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800"
        >
          {showForm ? "Cancelar" : "+ Novo"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              value={nome}
              onChange={e => {
                setNome(e.target.value);
                if (!slug) setSlug(generateSlug(e.target.value));
              }}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              value={slug}
              onChange={e => setSlug(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder={generateSlug(nome) || "auto-gerado"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            >
              <option value="">Selecione...</option>
              <option value="Vitaminas e Minerais">Vitaminas e Minerais</option>
              <option value="Proteínas e Aminoácidos">Proteínas e Aminoácidos</option>
              <option value="Saúde Intestinal">Saúde Intestinal</option>
              <option value="Específicos">Específicos</option>
              <option value="Longevidade">Longevidade</option>
              <option value="Performance">Performance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição curta</label>
            <textarea
              value={descricaoCurta}
              onChange={e => setDescricaoCurta(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Para que serve</label>
            <textarea
              value={paraQueServe}
              onChange={e => setParaQueServe(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={2}
            />
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
        {supplements?.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhum suplemento cadastrado.</p>
        )}
        {supplements?.map(s => (
          <div key={s.id} className="bg-white p-4 rounded-lg border flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{s.nome}</p>
              <p className="text-sm text-gray-500">{s.categoria} · /{s.slug}</p>
            </div>
            <div className="flex items-center gap-3">
              {onSelectSupplement && (
                <button
                  onClick={() => onSelectSupplement(s.id, s.nome)}
                  className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
                >
                  Produtos
                </button>
              )}
              <button
                onClick={() => {
                  if (confirm("Remover suplemento?")) deleteMutation.mutate({ id: s.id });
                }}
                className="text-red-500 text-sm hover:text-red-700"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
