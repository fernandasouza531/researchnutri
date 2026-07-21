import { Link } from "wouter";
import { trpc } from "../lib/trpc";

const colors = {
  primary: "#1a5c3a",
  primaryLight: "#2d7a4f",
  bg: "#f5faf7",
  white: "#fff",
  text: "#1f2937",
  muted: "#6b7280",
  border: "#e5e7eb",
};

export default function BriefingList() {
  const { data: briefings, isLoading } = trpc.briefing.list.useQuery({ status: "published" });

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: "'Inter', sans-serif" }}>
      <header
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
          color: "#fff",
          padding: "2rem 1.5rem",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Link href="/" style={{ color: "#fff", opacity: 0.7, textDecoration: "none", fontSize: "0.875rem" }}>
            ← Inicio
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            Briefing Semanal
          </h1>
          <p style={{ fontSize: "0.875rem", opacity: 0.85, marginTop: "0.25rem" }}>
            Ciencia traduzida em decisoes praticas, toda semana.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
        {isLoading && (
          <p style={{ textAlign: "center", color: colors.muted }}>Carregando...</p>
        )}

        {!isLoading && (!briefings || briefings.length === 0) && (
          <p style={{ textAlign: "center", color: colors.muted }}>Nenhum briefing publicado ainda.</p>
        )}

        <div style={{ display: "grid", gap: "1rem" }}>
          {(briefings ?? []).map((b) => (
            <Link key={b.id} href={`/briefing/${b.slug}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: colors.white,
                  borderRadius: "10px",
                  padding: "1.25rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <span
                    style={{
                      background: colors.primary,
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    #{b.numeroEdicao}
                  </span>
                  {b.dataReferencia && (
                    <span style={{ fontSize: "0.8rem", color: colors.muted }}>
                      {new Date(b.dataReferencia).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: colors.text, margin: "0 0 0.5rem 0" }}>
                  {b.titulo}
                </h3>
                {b.destaqueDescoberta && (
                  <p style={{ fontSize: "0.85rem", color: colors.muted, margin: 0, lineHeight: 1.5 }}>
                    {b.destaqueDescoberta.slice(0, 150)}
                    {b.destaqueDescoberta.length > 150 ? "..." : ""}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer style={{ textAlign: "center", padding: "2rem 1.5rem", fontSize: "0.75rem", color: "#9ca3af" }}>
        <p>Conteudo educacional. Nao substitui acompanhamento profissional.</p>
      </footer>
    </div>
  );
}
