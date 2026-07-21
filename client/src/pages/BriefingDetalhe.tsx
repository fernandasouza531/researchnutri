import { Link, useParams } from "wouter";
import { trpc } from "../lib/trpc";

const colors = {
  primary: "#1a5c3a",
  primaryLight: "#2d7a4f",
  bg: "#f5faf7",
  white: "#fff",
  text: "#1f2937",
  muted: "#6b7280",
  border: "#e5e7eb",
  greenBg: "#ecfdf5",
};

export default function BriefingDetalhe() {
  const params = useParams<{ slug: string }>();
  const { data: briefing, isLoading } = trpc.briefing.getBySlug.useQuery({ slug: params.slug || "" });

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: colors.muted }}>Carregando...</p>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: "'Inter', sans-serif", padding: "2rem", textAlign: "center" }}>
        <p style={{ color: colors.muted }}>Briefing nao encontrado.</p>
        <Link href="/briefing" style={{ color: colors.primary }}>← Voltar</Link>
      </div>
    );
  }

  const radarItems = (briefing.radarItems as string[] | null) ?? [];

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
          <Link href="/briefing" style={{ color: "#fff", opacity: 0.7, textDecoration: "none", fontSize: "0.875rem" }}>
            ← Briefings
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.5rem" }}>
            <span
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              #{briefing.numeroEdicao}
            </span>
            {briefing.dataReferencia && (
              <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                {new Date(briefing.dataReferencia).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {briefing.titulo}
          </h1>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
        {/* Destaque da Semana */}
        {(briefing.destaqueEstudoTitulo || briefing.destaqueDescoberta) && (
          <section style={{ ...sectionStyle, borderLeft: `4px solid ${colors.primary}` }}>
            <h2 style={sectionTitleStyle}>Destaque da Semana</h2>
            {briefing.destaqueEstudoTitulo && (
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: colors.text, margin: "0 0 1rem 0" }}>
                {briefing.destaqueEstudoTitulo}
              </h3>
            )}
            {briefing.destaqueDescoberta && (
              <div style={{ marginBottom: "0.75rem" }}>
                <span style={labelStyle}>Descoberta</span>
                <p style={bodyStyle}>{briefing.destaqueDescoberta}</p>
              </div>
            )}
            {briefing.destaquePratica && (
              <div style={{ marginBottom: "0.75rem" }}>
                <span style={labelStyle}>Pratica</span>
                <p style={bodyStyle}>{briefing.destaquePratica}</p>
              </div>
            )}
            {briefing.destaqueVeredito && (
              <div
                style={{
                  background: colors.greenBg,
                  padding: "0.75rem 1rem",
                  borderRadius: "6px",
                  marginTop: "0.5rem",
                }}
              >
                <span style={{ ...labelStyle, color: colors.primary }}>Veredito</span>
                <p style={{ ...bodyStyle, fontWeight: 600 }}>{briefing.destaqueVeredito}</p>
              </div>
            )}
            {briefing.destaqueEstudoFonteUrl && (
              <a
                href={briefing.destaqueEstudoFonteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "0.8rem", color: colors.primary, marginTop: "0.5rem", display: "inline-block" }}
              >
                Ver estudo original →
              </a>
            )}
          </section>
        )}

        {/* Radar de Alertas */}
        {radarItems.length > 0 && (
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Radar de Alertas</h2>
            <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
              {radarItems.map((item, i) => (
                <li key={i} style={{ fontSize: "0.875rem", color: colors.text, lineHeight: 1.7, marginBottom: "0.25rem" }}>
                  {typeof item === "string" ? item : JSON.stringify(item)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Raio-X de Produto */}
        {(briefing.raioxProdutoTitulo || briefing.raioxProdutoCorpo) && (
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Raio-X de Produto</h2>
            {briefing.raioxProdutoTitulo && (
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: colors.text, margin: "0 0 0.75rem 0" }}>
                {briefing.raioxProdutoTitulo}
              </h3>
            )}
            {briefing.raioxProdutoCorpo && (
              <p style={bodyStyle}>{briefing.raioxProdutoCorpo}</p>
            )}
          </section>
        )}

        {/* Pergunta da Comunidade */}
        {(briefing.perguntaComunidadePergunta || briefing.perguntaComunidadeResposta) && (
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Pergunta da Comunidade</h2>
            {briefing.perguntaComunidadePergunta && (
              <p style={{ fontSize: "0.95rem", fontWeight: 600, color: colors.text, fontStyle: "italic", margin: "0 0 0.75rem 0" }}>
                "{briefing.perguntaComunidadePergunta}"
              </p>
            )}
            {briefing.perguntaComunidadeResposta && (
              <p style={bodyStyle}>{briefing.perguntaComunidadeResposta}</p>
            )}
          </section>
        )}
      </main>

      <footer style={{ textAlign: "center", padding: "2rem 1.5rem", fontSize: "0.75rem", color: "#9ca3af" }}>
        <p>Conteudo educacional. Nao substitui acompanhamento profissional.</p>
      </footer>
    </div>
  );
}

const sectionStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "10px",
  padding: "1.5rem",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  marginBottom: "1rem",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#6b7280",
  margin: "0 0 1rem 0",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  color: "#6b7280",
  display: "block",
  marginBottom: "0.25rem",
};

const bodyStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#1f2937",
  lineHeight: 1.7,
  margin: 0,
};
