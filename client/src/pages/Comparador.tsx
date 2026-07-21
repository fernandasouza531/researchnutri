import { useState } from "react";
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

export default function Comparador() {
  const [search, setSearch] = useState("");
  const { data: comparisons, isLoading } = trpc.comparisons.list.useQuery({ status: "published" });

  const filtered = (comparisons ?? []).filter((c) =>
    c.titulo.toLowerCase().includes(search.toLowerCase())
  );

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
            Comparador de Suplementos
          </h1>
          <p style={{ fontSize: "0.875rem", opacity: 0.85, marginTop: "0.25rem" }}>
            Compare precos, formas quimicas e custo-beneficio entre EUA e Brasil.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
        <input
          type="text"
          placeholder="Buscar suplemento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            border: `1px solid ${colors.border}`,
            fontSize: "1rem",
            marginBottom: "1.5rem",
            boxSizing: "border-box",
            outline: "none",
          }}
        />

        {isLoading && (
          <p style={{ textAlign: "center", color: colors.muted }}>Carregando...</p>
        )}

        {!isLoading && filtered.length === 0 && (
          <p style={{ textAlign: "center", color: colors.muted }}>Nenhuma comparacao encontrada.</p>
        )}

        <div style={{ display: "grid", gap: "1rem" }}>
          {filtered.map((c) => (
            <Link key={c.id} href={`/comparador/${c.slug}`} style={{ textDecoration: "none" }}>
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
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: colors.text, margin: 0 }}>
                    {c.titulo}
                  </h3>
                </div>
                <span style={{ color: colors.primary, fontSize: "0.875rem", fontWeight: 500, whiteSpace: "nowrap" }}>
                  Ver comparacao →
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
