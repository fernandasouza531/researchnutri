import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminBriefings() {
  const utils = trpc.useUtils();
  const { data: briefings, isLoading } = trpc.briefing.list.useQuery();
  const approveMutation = trpc.briefing.approve.useMutation({
    onSuccess: () => {
      utils.briefing.list.invalidate();
      toast.success("Briefing aprovado");
    },
  });
  const publishMutation = trpc.briefing.publish.useMutation({
    onSuccess: () => {
      utils.briefing.list.invalidate();
      toast.success("Briefing publicado");
    },
  });

  if (isLoading) return <p className="text-gray-500 py-8 text-center">Carregando...</p>;

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      draft: "Rascunho",
      pending_review: "Aguardando revisão",
      approved: "Aprovado",
      published: "Publicado",
      auto_published: "Auto-publicado",
    };
    return map[s] || s;
  };

  const statusColor = (s: string) => {
    if (s === "published" || s === "auto_published") return "text-green-600";
    if (s === "approved") return "text-blue-600";
    if (s === "pending_review") return "text-orange-600";
    return "text-gray-500";
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Briefings</h2>
      <div className="space-y-2">
        {briefings?.length === 0 && (
          <p className="text-gray-400 text-center py-8">
            Nenhum briefing gerado ainda. Configure os feeds RSS e aguarde a geração automática.
          </p>
        )}
        {briefings?.map(b => (
          <div key={b.id} className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900">#{b.numeroEdicao} — {b.titulo}</p>
              <span className={`text-xs font-medium ${statusColor(b.status!)}`}>
                {statusLabel(b.status!)}
              </span>
            </div>
            {b.destaqueEstudoTitulo && (
              <p className="text-sm text-gray-600 mb-2">📊 {b.destaqueEstudoTitulo}</p>
            )}
            <div className="flex gap-2">
              {b.status === "pending_review" && (
                <button
                  onClick={() => approveMutation.mutate({ id: b.id })}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                >
                  Aprovar
                </button>
              )}
              {(b.status === "approved" || b.status === "pending_review") && (
                <button
                  onClick={() => publishMutation.mutate({ id: b.id })}
                  className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
                >
                  Publicar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
