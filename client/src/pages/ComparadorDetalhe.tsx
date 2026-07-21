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
  green: "#059669",
  yellow: "#d97706",
  red: "#dc2626",
  greenBg: "#ecfdf5",
  yellowBg: "#fffbeb",
  redBg: "#fef2f2",
};

const bioBadge = (level: string | null) => {
  if (!level) return null;
  const map: Record<string, { bg: string; color: string; label: string }> = {
    alta: { bg: colors.greenBg, color: colors.green, label: "Alta" },
    media: { bg: colors.yellowBg, color: colors.yellow, label: "Media" },
    baixa: { bg: colors.redBg, color: colors.red, label: "Baixa" },
  };
  const s = map[level] || map["media"];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "0.75rem",
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
};

export default function ComparadorDetalhe() {
  const params = useParams<{ slug: string }>();
  const { data, isLoading } = trpc.comparisons.getBySlug.useQuery({ slug: params.slug || "" });

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: colors.muted }}>Carregando...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: "'Inter', sans-serif", padding: "2rem", textAlign: "center" }}>
        <p style={{ color: colors.muted }}>Comparacao nao encontrada.</p>
        <Link href="/comparador" style={{ color: colors.primary }}>← Voltar</Link>
      </div>
    );
  }

  const { comparison, products } = data;
  const usProducts = products.filter((p) => p.mercado === "US");
  const brProducts = products.filter((p) => p.mercado === "BR");
  const allProducts = [...usProducts, ...brProducts];

  // Find best choice: lowest cost per dose among alta biodisponibilidade, fallback to any
  const bestChoice = [...allProducts]
    .filter((p) => p.custoPorDoseUsd || p.custoPorDoseBrl)
    .sort((a, b) => {
      const scoreA = (a.biodisponibilidade === "alta" ? 0 : a.biodisponibilidade === "media" ? 1 : 2);
      const scoreB = (b.biodisponibilidade === "alta" ? 0 : b.biodisponibilidade === "media" ? 1 : 2);
      if (scoreA !== scoreB) return scoreA - scoreB;
      const costA = Number(a.custoPorDoseUsd || a.custoPorDoseBrl || 999);
      const costB = Number(b.custoPorDoseUsd || b.custoPorDoseBrl || 999);
      return costA - costB;
    })[0];

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
          <Link href="/comparador" style={{ color: "#fff", opacity: 0.7, textDecoration: "none", fontSize: "0.875rem" }}>
            ← Comparador
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {comparison.titulo}
          </h1>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
        {/* Products table */}
        {allProducts.length > 0 && (
          <div
            style={{
              background: colors.white,
              borderRadius: "10px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              overflowX: "auto",
              marginBottom: "1.5rem",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", minWidth: "600px" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
                  <th style={thStyle}>Produto</th>
                  <th style={thStyle}>Mercado</th>
                  <th style={thStyle}>Forma Quimica</th>
                  <th style={thStyle}>Dosagem</th>
                  <th style={thStyle}>Preco</th>
                  <th style={thStyle}>Custo/Dose</th>
                  <th style={thStyle}>Biodisponibilidade</th>
                </tr>
              </thead>
              <tbody>
                {allProducts.map((p) => {
                  const isBest = bestChoice && p.id === bestChoice.id;
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        background: isBest ? colors.greenBg : "transparent",
                      }}
                    >
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600 }}>{p.nomeComercial}</span>
                        {isBest && (
                          <span
                            style={{
                              display: "block",
                              fontSize: "0.7rem",
                              color: colors.green,
                              fontWeight: 700,
                              marginTop: "2px",
                            }}
                          >
                            Melhor escolha
                          </span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <span
                          style={{
                            background: p.mercado === "US" ? "#dbeafe" : "#fef3c7",
                            color: p.mercado === "US" ? "#1d4ed8" : "#92400e",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        >
                          {p.mercado}
                        </span>
                      </td>
                      <td style={tdStyle}>{p.formaQuimica || "—"}</td>
                      <td style={tdStyle}>{p.dosagemPorCapsula || "—"}</td>
                      <td style={tdStyle}>
                        {p.mercado === "US" && p.precoUsd ? `$${p.precoUsd}` : ""}
                        {p.mercado === "BR" && p.precoBrl ? `R$${p.precoBrl}` : ""}
                        {!p.precoUsd && !p.precoBrl ? "—" : ""}
                      </td>
                      <td style={tdStyle}>
                        {p.mercado === "US" && p.custoPorDoseUsd ? `$${p.custoPorDoseUsd}` : ""}
                        {p.mercado === "BR" && p.custoPorDoseBrl ? `R$${p.custoPorDoseBrl}` : ""}
                        {!p.custoPorDoseUsd && !p.custoPorDoseBrl ? "—" : ""}
                      </td>
                      <td style={tdStyle}>{bioBadge(p.biodisponibilidade)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Veredito */}
        {comparison.vereditoTexto && (
          <div
            style={{
              background: colors.greenBg,
              border: `1px solid #a7f3d0`,
              borderRadius: "10px",
              padding: "1.25rem",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.primary, margin: "0 0 0.5rem 0" }}>
              Veredito
            </h3>
            <p style={{ fontSize: "0.875rem", color: colors.text, margin: 0, lineHeight: 1.6 }}>
              {comparison.vereditoTexto}
            </p>
          </div>
        )}

        {/* Veredito GLP-1 */}
        {comparison.vereditoGlp1 && (
          <div
            style={{
              background: "#f0f9ff",
              border: "1px solid #bae6fd",
              borderRadius: "10px",
              padding: "1.25rem",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0369a1", margin: "0 0 0.5rem 0" }}>
              Para usuarios de GLP-1
            </h3>
            <p style={{ fontSize: "0.875rem", color: colors.text, margin: 0, lineHeight: 1.6 }}>
              {comparison.vereditoGlp1}
            </p>
          </div>
        )}

        {/* Alternativa economica */}
        {comparison.alternativaEconomica && (
          <div
            style={{
              background: colors.white,
              border: `1px solid ${colors.border}`,
              borderRadius: "10px",
              padding: "1.25rem",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.text, margin: "0 0 0.5rem 0" }}>
              Alternativa Economica
            </h3>
            <p style={{ fontSize: "0.875rem", color: colors.text, margin: 0, lineHeight: 1.6 }}>
              {comparison.alternativaEconomica}
            </p>
          </div>
        )}

        {/* Alerta */}
        {comparison.alerta && (
          <div
            style={{
              background: colors.redBg,
              border: "1px solid #fecaca",
              borderRadius: "10px",
              padding: "1.25rem",
              marginBottom: "1rem",
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: colors.red, margin: "0 0 0.5rem 0" }}>
              Alerta
            </h3>
            <p style={{ fontSize: "0.875rem", color: colors.text, margin: 0, lineHeight: 1.6 }}>
              {comparison.alerta}
            </p>
          </div>
        )}

        {/* Affiliate links */}
        {allProducts.some((p) => p.linkAfiliado) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.5rem" }}>
            {allProducts
              .filter((p) => p.linkAfiliado)
              .map((p) => (
                <a
                  key={p.id}
                  href={p.linkAfiliado!}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    background: colors.primary,
                    color: "#fff",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {p.ondeComprar ? `Comprar na ${p.ondeComprar} →` : `Comprar ${p.nomeComercial} →`}
                </a>
              ))}
          </div>
        )}
      </main>

      <footer style={{ textAlign: "center", padding: "2rem 1.5rem", fontSize: "0.75rem", color: "#9ca3af" }}>
        <p>Conteudo educacional. Nao substitui acompanhamento profissional.</p>
      </footer>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.75rem",
  fontWeight: 600,
  color: "#374151",
  fontSize: "0.8rem",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "0.75rem",
  verticalAlign: "middle",
};
