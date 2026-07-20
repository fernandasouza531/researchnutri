import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminComparisons() {
  const utils = trpc.useUtils();
  const { data: comparisons, isLoading } = trpc.comparisons.list.useQuery();
  const publishMutation = trpc.comparisons.publish.useMutation({
    onSuccess: () => {
      utils.comparisons.list.invalidate();
      toast.success("Comparação publicada");
    },
  });

  if (isLoading) return <p className="text-gray-500 py-8 text-center">Carregando...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Comparações</h2>
      <div className="space-y-2">
        {comparisons?.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhuma comparação cadastrada.</p>
        )}
        {comparisons?.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-lg border flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{c.titulo}</p>
              <p className="text-sm text-gray-500">
                /{c.slug} ·{" "}
                <span
                  className={c.status === "published" ? "text-green-600" : "text-yellow-600"}
                >
                  {c.status}
                </span>
              </p>
            </div>
            {c.status === "draft" && (
              <button
                onClick={() => publishMutation.mutate({ id: c.id })}
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
