import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminBrands() {
  const utils = trpc.useUtils();
  const { data: brands, isLoading } = trpc.brands.list.useQuery();
  const createMutation = trpc.brands.create.useMutation({
    onSuccess: () => {
      utils.brands.list.invalidate();
      toast.success("Marca criada");
      setShowForm(false);
      setNome("");
      setPais("");
      setSite("");
    },
    onError: e => toast.error(e.message),
  });
  const deleteMutation = trpc.brands.delete.useMutation({
    onSuccess: () => {
      utils.brands.list.invalidate();
      toast.success("Marca removida");
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [pais, setPais] = useState("");
  const [site, setSite] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      nome,
      pais: pais || undefined,
      site: site || undefined,
    });
  };

  if (isLoading) return <p className="text-gray-500 py-8 text-center">Carregando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Marcas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800"
        >
          {showForm ? "Cancelar" : "+ Nova"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
            <select
              value={pais}
              onChange={e => setPais(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Selecione...</option>
              <option value="EUA">EUA</option>
              <option value="Brasil">Brasil</option>
              <option value="Canadá">Canadá</option>
              <option value="Europa">Europa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
            <input
              value={site}
              onChange={e => setSite(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder="https://..."
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
        {brands?.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhuma marca cadastrada.</p>
        )}
        {brands?.map(b => (
          <div key={b.id} className="bg-white p-4 rounded-lg border flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{b.nome}</p>
              <p className="text-sm text-gray-500">{b.pais || "—"}</p>
            </div>
            <button
              onClick={() => {
                if (confirm("Remover marca?")) deleteMutation.mutate({ id: b.id });
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
