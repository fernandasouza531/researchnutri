import { drizzle } from "drizzle-orm/mysql2";
import { eq, desc, asc, sql } from "drizzle-orm";
import {
  supplements,
  brands,
  products,
  comparisons,
  glp1Articles,
  travelGuideItems,
  travelGuideStores,
  travelGuideRules,
  feedItems,
  briefings,
  emailSubscribers,
  analyticsEvents,
} from "../drizzle/schema";
import type {
  InsertSupplement,
  InsertBrand,
  InsertProduct,
  InsertComparison,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (_db) return _db;
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.MYSQL_PUBLIC_URL ||
    (() => {
      const h = process.env.MYSQLHOST || process.env.MYSQL_HOST;
      const p = process.env.MYSQLPORT || process.env.MYSQL_PORT || "3306";
      const u = process.env.MYSQLUSER || process.env.MYSQL_USER;
      const pw = process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD;
      const d = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE;
      return h && u && pw && d ? `mysql://${u}:${pw}@${h}:${p}/${d}` : null;
    })();
  if (!dbUrl) return null;
  _db = drizzle(dbUrl);
  return _db;
}

// ─── Supplements ───

export async function listSupplements() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supplements).orderBy(asc(supplements.nome));
}

export async function getSupplementById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(supplements).where(eq(supplements.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getSupplementBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(supplements).where(eq(supplements.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function insertSupplement(data: InsertSupplement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(supplements).values(data);
  return result[0].insertId;
}

export async function updateSupplement(id: number, data: Partial<InsertSupplement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(supplements).set(data).where(eq(supplements.id, id));
}

export async function deleteSupplement(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(supplements).where(eq(supplements.id, id));
}

// ─── Brands ───

export async function listBrands() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(brands).orderBy(asc(brands.nome));
}

export async function getBrandById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function insertBrand(data: InsertBrand) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(brands).values(data);
  return result[0].insertId;
}

export async function updateBrand(id: number, data: Partial<InsertBrand>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(brands).set(data).where(eq(brands.id, id));
}

export async function deleteBrand(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(brands).where(eq(brands.id, id));
}

// ─── Products ───

export async function listProductsBySupplement(supplementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.supplementId, supplementId));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function insertProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(data);
  return result[0].insertId;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

// ─── Comparisons ───

export async function listComparisons(statusFilter?: "draft" | "published") {
  const db = await getDb();
  if (!db) return [];
  if (statusFilter) {
    return db
      .select()
      .from(comparisons)
      .where(eq(comparisons.status, statusFilter))
      .orderBy(desc(comparisons.createdAt));
  }
  return db.select().from(comparisons).orderBy(desc(comparisons.createdAt));
}

export async function getComparisonBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(comparisons).where(eq(comparisons.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function getComparisonById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(comparisons).where(eq(comparisons.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function insertComparison(data: InsertComparison) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(comparisons).values(data);
  return result[0].insertId;
}

export async function updateComparison(id: number, data: Partial<InsertComparison>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(comparisons).set(data).where(eq(comparisons.id, id));
}

export async function publishComparison(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(comparisons)
    .set({ status: "published", publishedAt: new Date() })
    .where(eq(comparisons.id, id));
}

// ─── GLP-1 Articles ───

export async function listGlp1Articles(statusFilter?: "draft" | "published") {
  const db = await getDb();
  if (!db) return [];
  if (statusFilter) {
    return db
      .select()
      .from(glp1Articles)
      .where(eq(glp1Articles.status, statusFilter))
      .orderBy(desc(glp1Articles.createdAt));
  }
  return db.select().from(glp1Articles).orderBy(desc(glp1Articles.createdAt));
}

export async function getGlp1ArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(glp1Articles).where(eq(glp1Articles.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function insertGlp1Article(data: typeof glp1Articles.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(glp1Articles).values(data);
  return result[0].insertId;
}

export async function updateGlp1Article(id: number, data: Partial<typeof glp1Articles.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(glp1Articles).set(data).where(eq(glp1Articles.id, id));
}

// ─── Travel Guide ───

export async function listTravelGuideItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(travelGuideItems).orderBy(asc(travelGuideItems.posicaoRanking));
}

export async function insertTravelGuideItem(data: typeof travelGuideItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(travelGuideItems).values(data);
  return result[0].insertId;
}

export async function updateTravelGuideItem(id: number, data: Partial<typeof travelGuideItems.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(travelGuideItems).set(data).where(eq(travelGuideItems.id, id));
}

export async function deleteTravelGuideItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(travelGuideItems).where(eq(travelGuideItems.id, id));
}

export async function listTravelGuideStores(cidade?: string) {
  const db = await getDb();
  if (!db) return [];
  if (cidade) {
    return db.select().from(travelGuideStores).where(eq(travelGuideStores.cidade, cidade));
  }
  return db.select().from(travelGuideStores);
}

export async function insertTravelGuideStore(data: typeof travelGuideStores.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(travelGuideStores).values(data);
  return result[0].insertId;
}

export async function listTravelGuideRules() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(travelGuideRules);
}

// ─── Briefings ───

export async function listBriefings(statusFilter?: string) {
  const db = await getDb();
  if (!db) return [];
  if (statusFilter) {
    return db
      .select()
      .from(briefings)
      .where(eq(briefings.status, statusFilter as any))
      .orderBy(desc(briefings.createdAt));
  }
  return db.select().from(briefings).orderBy(desc(briefings.createdAt));
}

export async function getLatestBriefing() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(briefings)
    .where(eq(briefings.status, "published"))
    .orderBy(desc(briefings.publishedAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function getBriefingBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(briefings).where(eq(briefings.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function insertBriefing(data: typeof briefings.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(briefings).values(data);
  return result[0].insertId;
}

export async function updateBriefing(id: number, data: Partial<typeof briefings.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(briefings).set(data).where(eq(briefings.id, id));
}

// ─── Email Subscribers ───

export async function insertEmailSubscriber(data: typeof emailSubscribers.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(emailSubscribers).values(data);
    return result[0].insertId;
  } catch (e: unknown) {
    const msg = String((e as Record<string, unknown>).message || "");
    if (msg.includes("Duplicate entry")) return null;
    throw e;
  }
}

export async function listEmailSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailSubscribers).orderBy(desc(emailSubscribers.subscribedAt));
}

// ─── Analytics ───

export async function trackEvent(data: typeof analyticsEvents.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(analyticsEvents).values(data);
}
