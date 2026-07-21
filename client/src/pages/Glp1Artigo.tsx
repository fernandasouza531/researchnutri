import { Link, useParams } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

export default function Glp1Artigo() {
  const params = useParams<{ slug: string }>();
  const { data: article, isLoading } = trpc.glp1.getBySlug.useQuery({ slug: params.slug || "" });

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: colors.muted }}>Carregando...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: "'Inter', sans-serif", padding: "2rem", textAlign: "center" }}>
        <p style={{ color: colors.muted }}>Artigo nao encontrado.</p>
        <Link href="/glp1" style={{ color: colors.primary }}>← Voltar</Link>
      </div>
    );
  }

  const fontes = (article.fontes as Array<{ titulo?: string; url?: string }> | null) ?? [];

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
          <Link href="/glp1" style={{ color: "#fff", opacity: 0.7, textDecoration: "none", fontSize: "0.875rem" }}>
            ← GLP-1 Hub
          </Link>
          {article.categoria && (
            <span
              style={{
                display: "inline-block",
                background: "rgba(255,255,255,0.2)",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "0.75rem",
                fontWeight: 600,
                marginTop: "0.5rem",
              }}
            >
              {article.categoria}
            </span>
          )}
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {article.titulo}
          </h1>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
        <article
          style={{
            background: colors.white,
            borderRadius: "10px",
            padding: "1.5rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            lineHeight: 1.8,
            fontSize: "0.9rem",
            color: colors.text,
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.corpo}</ReactMarkdown>
        </article>

        {fontes.length > 0 && (
          <section
            style={{
              background: colors.white,
              borderRadius: "10px",
              padding: "1.25rem",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              marginTop: "1rem",
            }}
          >
            <h3 style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: colors.muted, margin: "0 0 0.75rem 0" }}>
              Fontes
            </h3>
            <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
              {fontes.map((f, i) => (
                <li key={i} style={{ fontSize: "0.8rem", color: colors.muted, marginBottom: "0.25rem" }}>
                  {f.url ? (
                    <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ color: colors.primary }}>
                      {f.titulo || f.url}
                    </a>
                  ) : (
                    f.titulo || JSON.stringify(f)
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer style={{ textAlign: "center", padding: "2rem 1.5rem", fontSize: "0.75rem", color: "#9ca3af" }}>
        <p>Conteudo educacional. Nao substitui acompanhamento profissional.</p>
      </footer>
    </div>
  );
}
