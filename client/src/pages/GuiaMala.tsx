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
  greenBg: "#ecfdf5",
  redBg: "#fef2f2",
  red: "#dc2626",
};

export default function GuiaMala() {
  const { data: items, isLoading: loadingItems } = trpc.guiaMala.listItems.useQuery();
  const { data: stores, isLoading: loadingStores } = trpc.guiaMala.listStores.useQuery();
  const { data: rules, isLoading: loadingRules } = trpc.guiaMala.listRules.useQuery();

  const isLoading = loadingItems || loadingStores || loadingRules;

  const worthIt = (items ?? []).filter((i) => i.valeAPena !== false).sort((a, b) => (a.posicaoRanking ?? 99) - (b.posicaoRanking ?? 99));
  const notWorthIt = (items ?? []).filter((i) => i.valeAPena === false);

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: "'Inter', sans-serif" }}>
      <header
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
          color: "#fff",
          padding: "2rem 1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Link href="/" style={{ color: "#fff", opacity: 0.7, textDecoration: "none", fontSize: "0.875rem" }}>
            ← Inicio
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "0.75rem" }}>
            Guia de Mala: Suplementos EUA → Brasil
          </h1>
          <p style={{ fontSize: "0.875rem", opacity: 0.85, marginTop: "0.25rem" }}>
            O que vale trazer, onde comprar e o que a ANVISA permite.
          </p>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
        {isLoading && (
          <p style={{ textAlign: "center", color: colors.muted }}>Carregando...</p>
        )}

        {/* Rules */}
        {(rules ?? []).length > 0 && (
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={sectionTitleStyle}>Regras (ANVISA / Receita Federal)</h2>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {(rules ?? []).map((r) => (
                <div
                  key={r.id}
                  style={{
                    background: colors.white,
                    borderRadius: "10px",
                    padding: "1rem 1.25rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    borderLeft: `4px solid ${colors.primary}`,
                  }}
                >
                  <p style={{ fontSize: "0.9rem", fontWeight: 600, color: colors.text, margin: "0 0 0.25rem 0" }}>
                    {r.regra}
                  </p>
                  {r.detalhe && (
                    <p style={{ fontSize: "0.8rem", color: colors.muted, margin: 0, lineHeight: 1.5 }}>
                      {r.detalhe}
                    </p>
                  )}
                  {r.fonte && (
                    <a href={r.fonte} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: colors.primary, marginTop: "0.25rem", display: "inline-block" }}>
                      Fonte
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top Supplements */}
        {worthIt.length > 0 && (
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={sectionTitleStyle}>Top Suplementos para Trazer</h2>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {worthIt.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    background: colors.white,
                    borderRadius: "10px",
                    padding: "1rem 1.25rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      background: colors.greenBg,
                      color: colors.primary,
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {item.posicaoRanking ?? idx + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: colors.text, margin: "0 0 0.25rem 0" }}>
                      {item.nome}
                    </h3>
                    {item.descricao && (
                      <p style={{ fontSize: "0.8rem", color: colors.muted, margin: "0 0 0.5rem 0", lineHeight: 1.5 }}>
                        {item.descricao}
                      </p>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.8rem" }}>
                      {item.precoMedioUsd && (
                        <span style={{ color: colors.text }}>EUA: <strong>${item.precoMedioUsd}</strong></span>
                      )}
                      {item.precoMedioBrl && (
                        <span style={{ color: colors.text }}>BR: <strong>R${item.precoMedioBrl}</strong></span>
                      )}
                      {item.economiaEstimadaPercent != null && (
                        <span style={{ color: colors.primary, fontWeight: 600 }}>
                          Economia: ~{item.economiaEstimadaPercent}%
                        </span>
                      )}
                    </div>
                    {item.marcaRecomendada && (
                      <p style={{ fontSize: "0.8rem", color: colors.muted, margin: "0.25rem 0 0 0" }}>
                        Marca: {item.marcaRecomendada}
                      </p>
                    )}
                    {item.linkAfiliado && (
                      <a
                        href={item.linkAfiliado}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          background: colors.primary,
                          color: "#fff",
                          padding: "0.4rem 0.75rem",
                          borderRadius: "6px",
                          textDecoration: "none",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          marginTop: "0.5rem",
                        }}
                      >
                        Comprar →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Not worth it */}
        {notWorthIt.length > 0 && (
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={sectionTitleStyle}>O Que NAO Vale a Pena</h2>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {notWorthIt.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: colors.redBg,
                    borderRadius: "10px",
                    padding: "1rem 1.25rem",
                    border: "1px solid #fecaca",
                  }}
                >
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: colors.red, margin: "0 0 0.25rem 0" }}>
                    {item.nome}
                  </h3>
                  {item.motivo && (
                    <p style={{ fontSize: "0.8rem", color: colors.text, margin: 0, lineHeight: 1.5 }}>
                      {item.motivo}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stores */}
        {(stores ?? []).length > 0 && (
          <section style={{ marginBottom: "2rem" }}>
            <h2 style={sectionTitleStyle}>Onde Comprar</h2>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {(stores ?? []).map((s) => (
                <div
                  key={s.id}
                  style={{
                    background: colors.white,
                    borderRadius: "10px",
                    padding: "1rem 1.25rem",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: colors.text, margin: 0 }}>
                      {s.nome}
                    </h3>
                    {s.atendePortugues && (
                      <span
                        style={{
                          background: colors.greenBg,
                          color: colors.primary,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                        }}
                      >
                        Atende em portugues
                      </span>
                    )}
                  </div>
                  {s.endereco && (
                    <p style={{ fontSize: "0.8rem", color: colors.muted, margin: "0.25rem 0 0 0" }}>
                      {s.endereco}{s.cidade ? ` - ${s.cidade}` : ""}
                    </p>
                  )}
                  {s.dica && (
                    <p style={{ fontSize: "0.8rem", color: colors.text, margin: "0.25rem 0 0 0", lineHeight: 1.5 }}>
                      {s.dica}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                    {s.linkSite && (
                      <a href={s.linkSite} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8rem", color: colors.primary }}>
                        Site
                      </a>
                    )}
                    {s.linkMaps && (
                      <a href={s.linkMaps} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8rem", color: colors.primary }}>
                        Maps
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer style={{ textAlign: "center", padding: "2rem 1.5rem", fontSize: "0.75rem", color: "#9ca3af" }}>
        <p>Conteudo educacional. Nao substitui acompanhamento profissional.</p>
      </footer>
    </div>
  );
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#1f2937",
  marginBottom: "1rem",
};
