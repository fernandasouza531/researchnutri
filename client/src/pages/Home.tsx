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

const navLinks = [
  { href: "/comparador", label: "Comparador" },
  { href: "/glp1", label: "GLP-1" },
  { href: "/guia-mala", label: "Guia de Mala" },
  { href: "/briefing", label: "Briefing" },
];

export default function Home() {
  const { data: latestBriefing } = trpc.briefing.latest.useQuery();
  const { data: comparisons } = trpc.comparisons.list.useQuery({ status: "published" });

  const topComparisons = (comparisons ?? []).slice(0, 6);

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: "'Inter', sans-serif" }}>
      {/* Nav */}
      <nav
        style={{
          background: colors.primary,
          padding: "0.75rem 1.5rem",
          display: "flex",
          justifyContent: "center",
          gap: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {navLinks.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            style={{
              color: "#fff",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
              opacity: 0.9,
            }}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      {/* Hero */}
      <header
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
          color: "#fff",
          padding: "3rem 1.5rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Centro de Inteligencia Nutricional
        </h1>
        <p style={{ fontSize: "1rem", opacity: 0.85, maxWidth: "500px", margin: "0 auto 1.5rem" }}>
          Suplementos, ciencia e decisoes praticas para brasileiros.
        </p>
        <Link href="/comparador">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "8px",
              padding: "0.75rem 1.25rem",
              cursor: "pointer",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <span style={{ color: "#fff", opacity: 0.7, fontSize: "0.9rem" }}>
              Buscar suplemento...
            </span>
          </div>
        </Link>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
        {/* Ultimo Briefing */}
        {latestBriefing && (
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={sectionTitle}>Ultimo Briefing</h2>
            <Link href={`/briefing/${latestBriefing.slug}`} style={{ textDecoration: "none" }}>
              <div style={cardStyle}>
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
                    #{latestBriefing.numeroEdicao}
                  </span>
                  {latestBriefing.dataReferencia && (
                    <span style={{ fontSize: "0.8rem", color: colors.muted }}>
                      {new Date(latestBriefing.dataReferencia).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: colors.text, margin: "0 0 0.25rem 0" }}>
                  {latestBriefing.titulo}
                </h3>
                {latestBriefing.destaqueDescoberta && (
                  <p style={{ fontSize: "0.85rem", color: colors.muted, margin: 0, lineHeight: 1.5 }}>
                    {latestBriefing.destaqueDescoberta.slice(0, 120)}
                    {latestBriefing.destaqueDescoberta.length > 120 ? "..." : ""}
                  </p>
                )}
                <span style={{ fontSize: "0.8rem", color: colors.primary, fontWeight: 500, marginTop: "0.5rem", display: "inline-block" }}>
                  Ler briefing →
                </span>
              </div>
            </Link>
          </section>
        )}

        {/* Comparacoes Populares */}
        {topComparisons.length > 0 && (
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={sectionTitle}>Comparacoes Populares</h2>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {topComparisons.map((c) => (
                <Link key={c.id} href={`/comparador/${c.slug}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      ...cardStyle,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: colors.text, margin: 0 }}>
                      {c.titulo}
                    </h3>
                    <span style={{ color: colors.primary, fontSize: "0.8rem", fontWeight: 500, whiteSpace: "nowrap" }}>
                      Ver →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/comparador" style={{ fontSize: "0.85rem", color: colors.primary, fontWeight: 500, marginTop: "0.75rem", display: "inline-block" }}>
              Ver todas as comparacoes →
            </Link>
          </section>
        )}

        {/* GLP-1 Banner */}
        <section style={{ marginBottom: "1rem" }}>
          <Link href="/glp1" style={{ textDecoration: "none" }}>
            <div
              style={{
                background: `linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)`,
                borderRadius: "10px",
                padding: "1.5rem",
                color: "#fff",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.25rem 0" }}>
                GLP-1 e Nutricao
              </h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.9, margin: 0 }}>
                Guia nutricional para quem usa Ozempic, Wegovy ou Mounjaro →
              </p>
            </div>
          </Link>
        </section>

        {/* Guia de Mala Banner */}
        <section style={{ marginBottom: "2rem" }}>
          <Link href="/guia-mala" style={{ textDecoration: "none" }}>
            <div
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, #3d9970 100%)`,
                borderRadius: "10px",
                padding: "1.5rem",
                color: "#fff",
              }}
            >
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.25rem 0" }}>
                Guia de Mala
              </h3>
              <p style={{ fontSize: "0.85rem", opacity: 0.9, margin: 0 }}>
                O que vale trazer dos EUA, onde comprar e regras da ANVISA →
              </p>
            </div>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "2rem 1.5rem",
          fontSize: "0.75rem",
          color: "#9ca3af",
        }}
      >
        <p>Conteudo educacional. Nao substitui acompanhamento profissional.</p>
      </footer>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#1f2937",
  marginBottom: "0.75rem",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "10px",
  padding: "1.25rem",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};
