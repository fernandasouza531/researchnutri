import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const CATEGORIAS = [
  { value: "visao-geral", label: "Visao Geral" },
  { value: "perda-muscular", label: "Perda Muscular" },
  { value: "deficiencias", label: "Deficiencias" },
  { value: "suplementos", label: "Suplementos" },
  { value: "proteina", label: "Proteina" },
  { value: "receitas", label: "Receitas" },
  { value: "faq", label: "FAQ" },
];

export default function AdminGlp1() {
  const utils = trpc.useUtils();
  const { data: articles, isLoading } = trpc.glp1.list.useQuery();

  const createMutation = trpc.glp1.create.useMutation({
    onSuccess: () => {
      utils.glp1.list.invalidate();
      toast.success("Artigo criado");
      setShowForm(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.glp1.update.useMutation({
    onSuccess: () => {
      utils.glp1.list.invalidate();
      toast.success("Artigo atualizado");
    },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [corpo, setCorpo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fontes, setFontes] = useState("");

  const resetForm = () => {
    setTitulo("");
    setSlug("");
    setCorpo("");
    setCategoria("");
    setFontes("");
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
    let parsedFontes: string[] | undefined;
    if (fontes.trim()) {
      try {
        parsedFontes = JSON.parse(fontes);
      } catch {
        toast.error("Fontes deve ser um JSON array valido, ex: [\"url1\", \"url2\"]");
        return;
      }
    }
    createMutation.mutate({
      titulo,
      slug: slug || generateSlug(titulo),
      corpo,
      categoria: categoria || undefined,
      fontes: parsedFontes,
    });
  };

  const handlePublish = (id: number) => {
    updateMutation.mutate({ id, status: "published" });
  };

  if (isLoading) return <p className="text-gray-500 py-8 text-center">Carregando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Artigos GLP-1</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Titulo</label>
            <input
              value={titulo}
              onChange={(e) => {
                setTitulo(e.target.value);
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
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              placeholder={generateSlug(titulo) || "auto-gerado"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Selecione...</option>
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Corpo</label>
            <textarea
              value={corpo}
              onChange={(e) => setCorpo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
              rows={12}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fontes (JSON array de URLs)
            </label>
            <textarea
              value={fontes}
              onChange={(e) => setFontes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
              rows={3}
              placeholder='["https://pubmed.ncbi.nlm.nih.gov/...", "https://..."]'
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
        {articles?.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhum artigo GLP-1 cadastrado.</p>
        )}
        {articles?.map((a) => (
          <div key={a.id} className="bg-white p-4 rounded-lg border flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{a.titulo}</p>
              <p className="text-sm text-gray-500">
                /{a.slug} · {a.categoria || "sem categoria"} ·{" "}
                <span
                  className={a.status === "published" ? "text-green-600" : "text-yellow-600"}
                >
                  {a.status}
                </span>
              </p>
            </div>
            {a.status === "draft" && (
              <button
                onClick={() => handlePublish(a.id)}
                className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
              >
                Publicar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
