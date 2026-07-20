import {
  boolean,
  date,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Admin Users ───

export const adminUsers = mysqlTable("admin_users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 100 }),
  role: mysqlEnum("role", ["admin", "editor"]).default("editor"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Comparador ───

export const supplements = mysqlTable("supplements", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  categoria: varchar("categoria", { length: 100 }).notNull(),
  descricaoCurta: text("descricao_curta"),
  descricaoLonga: text("descricao_longa"),
  formaQuimicaPrincipal: varchar("forma_quimica_principal", { length: 200 }),
  paraQueServe: text("para_que_serve"),
  quemPrecisa: text("quem_precisa"),
  contextoGlp1: text("contexto_glp1"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Supplement = typeof supplements.$inferSelect;
export type InsertSupplement = typeof supplements.$inferInsert;

export const brands = mysqlTable("brands", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 200 }).notNull(),
  pais: varchar("pais", { length: 50 }),
  site: varchar("site", { length: 500 }),
  certificacoes: json("certificacoes"),
  notaConfianca: tinyint("nota_confianca"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  supplementId: int("supplement_id").notNull(),
  brandId: int("brand_id").notNull(),
  nomeComercial: varchar("nome_comercial", { length: 300 }).notNull(),
  dosagemPorCapsula: varchar("dosagem_por_capsula", { length: 100 }),
  dosesPorFrasco: int("doses_por_frasco"),
  formaQuimica: varchar("forma_quimica", { length: 200 }),
  precoUsd: decimal("preco_usd", { precision: 10, scale: 2 }),
  precoBrl: decimal("preco_brl", { precision: 10, scale: 2 }),
  custoPorDoseUsd: decimal("custo_por_dose_usd", { precision: 10, scale: 4 }),
  custoPorDoseBrl: decimal("custo_por_dose_brl", { precision: 10, scale: 4 }),
  mercado: mysqlEnum("mercado", ["US", "BR"]).notNull(),
  certificacoes: json("certificacoes"),
  linkAfiliado: varchar("link_afiliado", { length: 1000 }),
  linkAfiliadoPrograma: varchar("link_afiliado_programa", { length: 100 }),
  ondeComprar: varchar("onde_comprar", { length: 500 }),
  vegano: boolean("vegano").default(false),
  semGluten: boolean("sem_gluten").default(false),
  alergenicos: json("alergenicos"),
  biodisponibilidade: mysqlEnum("biodisponibilidade", ["alta", "media", "baixa"]),
  observacoes: text("observacoes"),
  dataVerificacaoPreco: date("data_verificacao_preco"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const comparisons = mysqlTable("comparisons", {
  id: int("id").autoincrement().primaryKey(),
  supplementId: int("supplement_id").notNull(),
  titulo: varchar("titulo", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  vereditoTexto: text("veredito_texto"),
  vereditoGlp1: text("veredito_glp1"),
  alternativaEconomica: text("alternativa_economica"),
  alerta: text("alerta"),
  metaTitle: varchar("meta_title", { length: 200 }),
  metaDescription: varchar("meta_description", { length: 500 }),
  status: mysqlEnum("status", ["draft", "published"]).default("draft"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Comparison = typeof comparisons.$inferSelect;
export type InsertComparison = typeof comparisons.$inferInsert;

// ─── GLP-1 Hub ───

export const glp1Articles = mysqlTable("glp1_articles", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  corpo: text("corpo").notNull(),
  categoria: varchar("categoria", { length: 100 }),
  fontes: json("fontes"),
  metaTitle: varchar("meta_title", { length: 200 }),
  metaDescription: varchar("meta_description", { length: 500 }),
  status: mysqlEnum("status", ["draft", "published"]).default("draft"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Glp1Article = typeof glp1Articles.$inferSelect;

// ─── Guia de Mala ───

export const travelGuideItems = mysqlTable("travel_guide_items", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 200 }).notNull(),
  categoria: varchar("categoria", { length: 100 }),
  posicaoRanking: int("posicao_ranking"),
  descricao: text("descricao"),
  precoMedioUsd: decimal("preco_medio_usd", { precision: 10, scale: 2 }),
  precoMedioBrl: decimal("preco_medio_brl", { precision: 10, scale: 2 }),
  economiaEstimadaPercent: int("economia_estimada_percent"),
  marcaRecomendada: varchar("marca_recomendada", { length: 200 }),
  linkAfiliado: varchar("link_afiliado", { length: 1000 }),
  linkComparadorSlug: varchar("link_comparador_slug", { length: 200 }),
  valeAPena: boolean("vale_a_pena").default(true),
  motivo: text("motivo"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TravelGuideItem = typeof travelGuideItems.$inferSelect;

export const travelGuideStores = mysqlTable("travel_guide_stores", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 200 }).notNull(),
  tipo: varchar("tipo", { length: 100 }),
  endereco: varchar("endereco", { length: 500 }),
  cidade: varchar("cidade", { length: 100 }),
  dica: text("dica"),
  linkSite: varchar("link_site", { length: 500 }),
  linkMaps: varchar("link_maps", { length: 500 }),
  atendePortugues: boolean("atende_portugues").default(false),
});

export type TravelGuideStore = typeof travelGuideStores.$inferSelect;

export const travelGuideRules = mysqlTable("travel_guide_rules", {
  id: int("id").autoincrement().primaryKey(),
  regra: varchar("regra", { length: 300 }).notNull(),
  detalhe: text("detalhe"),
  fonte: varchar("fonte", { length: 500 }),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Briefing ───

export const feedItems = mysqlTable("feed_items", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 100 }).notNull(),
  url: varchar("url", { length: 1000 }).notNull(),
  title: varchar("title", { length: 500 }),
  abstract: text("abstract"),
  authors: varchar("authors", { length: 500 }),
  publishedDate: date("published_date"),
  relevanceScore: int("relevance_score").default(0),
  processed: boolean("processed").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FeedItem = typeof feedItems.$inferSelect;

export const briefings = mysqlTable("briefings", {
  id: int("id").autoincrement().primaryKey(),
  numeroEdicao: int("numero_edicao").notNull(),
  titulo: varchar("titulo", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  dataReferencia: date("data_referencia").notNull(),
  destaqueEstudoTitulo: varchar("destaque_estudo_titulo", { length: 500 }),
  destaqueEstudoFonteUrl: varchar("destaque_estudo_fonte_url", { length: 1000 }),
  destaqueDescoberta: text("destaque_descoberta"),
  destaquePratica: text("destaque_pratica"),
  destaqueVeredito: text("destaque_veredito"),
  radarItems: json("radar_items"),
  raioxProdutoTitulo: varchar("raiox_produto_titulo", { length: 300 }),
  raioxProdutoCorpo: text("raiox_produto_corpo"),
  raioxLinks: json("raiox_links"),
  perguntaComunidadePergunta: text("pergunta_comunidade_pergunta"),
  perguntaComunidadeResposta: text("pergunta_comunidade_resposta"),
  metaTitle: varchar("meta_title", { length: 200 }),
  metaDescription: varchar("meta_description", { length: 500 }),
  status: mysqlEnum("status", [
    "draft",
    "pending_review",
    "approved",
    "published",
    "auto_published",
  ]).default("draft"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Briefing = typeof briefings.$inferSelect;

// ─── Email ───

export const emailSubscribers = mysqlTable("email_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  nome: varchar("nome", { length: 200 }),
  source: varchar("source", { length: 100 }),
  preferences: json("preferences"),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
});

// ─── Analytics ───

export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  page: varchar("page", { length: 500 }),
  eventType: varchar("event_type", { length: 100 }),
  affiliateProgram: varchar("affiliate_program", { length: 100 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
