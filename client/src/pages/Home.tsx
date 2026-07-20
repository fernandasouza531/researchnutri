export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#f5faf7", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(135deg, #1a5c3a 0%, #2d7a4f 100%)",
          color: "#fff",
          padding: "3rem 1.5rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Centro de Inteligência Nutricional
        </h1>
        <p style={{ fontSize: "1rem", opacity: 0.85, maxWidth: "500px", margin: "0 auto" }}>
          Suplementos, ciência e decisões práticas para brasileiros.
        </p>
      </header>

      {/* Content placeholder */}
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <section
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "2rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "1.1rem", color: "#374151", marginBottom: "1rem" }}>
            Em construção.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Comparador de suplementos, briefing semanal e mais — em breve.
          </p>
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
        <p>Conteúdo educacional. Não substitui acompanhamento profissional.</p>
      </footer>
    </div>
  );
}
