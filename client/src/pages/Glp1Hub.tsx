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

export default function Glp1Hub() {
  const { data: articles, isLoading } = trpc.glp1.list.useQuery({ status: "published" });

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: "'Inter', sans-serif" }}>
      <header
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
          color: "#fff",
          padding: "2.5rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Link href="/" style={{ color: "#fff", opacity: 0.7, textDecoration: "none", fontSize: "0.875rem" }}>
            ← Inicio
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.75rem" }}>
            GLP-1 e Nutricao
          </h1>
          <p style={{ fontSize: "0.95rem", opacity: 0.9, marginTop: "0.5rem", maxWidth: "500px", margin: "0.5rem auto 0" }}>
            Nutricao para quem usa Ozempic, Wegovy ou Mounjaro
          </p>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
        {isLoading && (
          <p style={{ textAlign: "center", color: colors.muted }}>Carregando...</p>
        )}

        {!isLoading && (!articles || articles.length === 0) && (
          <p style={{ textAlign: "center", color: colors.muted }}>Nenhum artigo publicado ainda.</p>
        )}

        <div style={{ display: "grid", gap: "1rem" }}>
          {(articles ?? []).map((a) => (
            <Link key={a.id} href={`/glp1/${a.slug}`} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: colors.white,
                  borderRadius: "10px",
                  padding: "1.25rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  {a.categoria && (
                    <span
                      style={{
                        background: "#f0f9ff",
                        color: "#0369a1",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                        display: "inline-block",
                      }}
                    >
                      {a.categoria}
                    </span>
                  )}
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: colors.text, margin: "0.25rem 0 0 0" }}>
                    {a.titulo}
                  </h3>
                </div>
                <span style={{ color: colors.primary, fontSize: "0.875rem", fontWeight: 500, whiteSpace: "nowrap", marginLeft: "1rem" }}>
                  Ler →
                </span>
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
