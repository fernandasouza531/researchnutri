import { desc, sql } from "drizzle-orm";
import { feedItems } from "../drizzle/schema";
import { getDb } from "./db";
import { ENV } from "./_core/env";

// ─── Types ───

type ParsedFeedItem = {
  source: string;
  url: string;
  title: string;
  abstract: string;
  authors: string;
  publishedDate: string | null;
};

// ─── XML parsing helpers (regex-based, no external lib) ───

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") : "";
}

function extractAllTags(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const results: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[1].trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"));
  }
  return results;
}

function extractItems(xml: string): string[] {
  const regex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  const results: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[1]);
  }
  return results;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
}

// ─── PubMed via E-utilities ───

async function fetchPubMed(): Promise<ParsedFeedItem[]> {
  const items: ParsedFeedItem[] = [];
  const searchTerms = [
    "functional nutrition supplementation",
    "GLP-1 nutrition muscle deficiency",
  ];

  for (const term of searchTerms) {
    try {
      const apiKeyParam = ENV.pubmedApiKey ? `&api_key=${ENV.pubmedApiKey}` : "";
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=5&sort=date&term=${encodeURIComponent(term)}${apiKeyParam}`;

      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) continue;

      const searchData = (await searchRes.json()) as {
        esearchresult?: { idlist?: string[] };
      };
      const ids = searchData.esearchresult?.idlist ?? [];
      if (ids.length === 0) continue;

      const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=xml&id=${ids.join(",")}${apiKeyParam}`;
      const fetchRes = await fetch(fetchUrl);
      if (!fetchRes.ok) continue;

      const xml = await fetchRes.text();

      // Extract each PubmedArticle
      const articleRegex = /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/gi;
      let articleMatch;
      while ((articleMatch = articleRegex.exec(xml)) !== null) {
        const article = articleMatch[1];
        const title = stripHtml(extractTag(article, "ArticleTitle"));
        const abstractText = stripHtml(extractTag(article, "AbstractText") || extractTag(article, "Abstract"));
        const pmid = extractTag(article, "PMID");
        const url = pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : "";

        // Authors
        const lastNames = extractAllTags(article, "LastName");
        const foreNames = extractAllTags(article, "ForeName");
        const authorList = lastNames.map((ln, i) => {
          const fn = foreNames[i] ?? "";
          return `${ln} ${fn}`.trim();
        });
        const authors = authorList.slice(0, 5).join(", ") + (authorList.length > 5 ? " et al." : "");

        // Date
        const year = extractTag(article, "Year");
        const month = extractTag(article, "Month");
        const day = extractTag(article, "Day");
        let publishedDate: string | null = null;
        if (year) {
          const m = (month || "01").padStart(2, "0");
          const d = (day || "01").padStart(2, "0");
          publishedDate = `${year}-${m}-${d}`;
        }

        if (title && url) {
          items.push({ source: "pubmed", url, title, abstract: abstractText, authors, publishedDate });
        }
      }
    } catch (err) {
      console.error(`[Feeds] PubMed error for "${term}":`, err);
    }
  }

  return items;
}

// ─── openFDA ───

async function fetchOpenFDA(): Promise<ParsedFeedItem[]> {
  const items: ParsedFeedItem[] = [];
  try {
    const url = `https://api.fda.gov/food/enforcement.json?search=product_type:"dietary+supplement"&sort=report_date:desc&limit=10`;
    const res = await fetch(url);
    if (!res.ok) return items;

    const data = (await res.json()) as {
      results?: Array<{
        recall_number?: string;
        product_description?: string;
        reason_for_recall?: string;
        report_date?: string;
        recalling_firm?: string;
      }>;
    };

    for (const result of data.results ?? []) {
      const title = `FDA Recall: ${(result.product_description ?? "").slice(0, 200)}`;
      const recallUrl = `https://api.fda.gov/food/enforcement.json?search=recall_number:"${result.recall_number}"`;
      let publishedDate: string | null = null;
      if (result.report_date && result.report_date.length >= 8) {
        const rd = result.report_date;
        publishedDate = `${rd.slice(0, 4)}-${rd.slice(4, 6)}-${rd.slice(6, 8)}`;
      }

      items.push({
        source: "openfda",
        url: recallUrl,
        title,
        abstract: result.reason_for_recall ?? "",
        authors: result.recalling_firm ?? "",
        publishedDate,
      });
    }
  } catch (err) {
    console.error("[Feeds] openFDA error:", err);
  }
  return items;
}

// ─── Medscape RSS ───

async function fetchMedscapeRSS(): Promise<ParsedFeedItem[]> {
  const items: ParsedFeedItem[] = [];
  try {
    const rssUrl = "https://www.medscape.com/cx/rssfeeds/2702.xml";
    const res = await fetch(rssUrl, {
      headers: { "User-Agent": "NutriIntel/1.0 (RSS Reader)" },
    });
    if (!res.ok) return items;

    const xml = await res.text();
    const rssItems = extractItems(xml);

    for (const item of rssItems.slice(0, 10)) {
      const title = stripHtml(extractTag(item, "title"));
      const link = extractTag(item, "link").trim();
      const description = stripHtml(extractTag(item, "description"));
      const pubDate = extractTag(item, "pubDate");

      let publishedDate: string | null = null;
      if (pubDate) {
        try {
          const d = new Date(pubDate);
          if (!isNaN(d.getTime())) {
            publishedDate = d.toISOString().slice(0, 10);
          }
        } catch { /* ignore */ }
      }

      if (title && link) {
        items.push({
          source: "medscape",
          url: link,
          title,
          abstract: description,
          authors: "",
          publishedDate,
        });
      }
    }
  } catch (err) {
    console.error("[Feeds] Medscape RSS error:", err);
  }
  return items;
}

// ─── ANVISA RSS ───

async function fetchAnvisaRSS(): Promise<ParsedFeedItem[]> {
  const items: ParsedFeedItem[] = [];
  try {
    const rssUrl = "https://www.gov.br/anvisa/pt-br/assuntos/noticias-anvisa/RSS";
    const res = await fetch(rssUrl, {
      headers: { "User-Agent": "NutriIntel/1.0 (RSS Reader)" },
    });
    if (!res.ok) return items;

    const xml = await res.text();
    const rssItems = extractItems(xml);

    for (const item of rssItems.slice(0, 10)) {
      const title = stripHtml(extractTag(item, "title"));
      const link = extractTag(item, "link").trim();
      const description = stripHtml(extractTag(item, "description"));
      const pubDate = extractTag(item, "pubDate") || extractTag(item, "dc:date");

      let publishedDate: string | null = null;
      if (pubDate) {
        try {
          const d = new Date(pubDate);
          if (!isNaN(d.getTime())) {
            publishedDate = d.toISOString().slice(0, 10);
          }
        } catch { /* ignore */ }
      }

      if (title && link) {
        items.push({
          source: "anvisa",
          url: link,
          title,
          abstract: description,
          authors: "",
          publishedDate,
        });
      }
    }
  } catch (err) {
    console.error("[Feeds] ANVISA RSS error:", err);
  }
  return items;
}

// ─── Relevance scoring ───

const RELEVANCE_KEYWORDS: Record<string, number> = {
  "glp-1": 10,
  "glp1": 10,
  "semaglutide": 8,
  "tirzepatide": 8,
  "ozempic": 8,
  "microbiome": 7,
  "microbiota": 7,
  "supplement": 5,
  "suplemento": 5,
  "vitamin": 4,
  "vitamina": 4,
  "recall": 6,
  "fda": 5,
  "anvisa": 5,
  "ultraprocessed": 7,
  "ultraprocessado": 7,
  "functional nutrition": 8,
  "nutricao funcional": 8,
  "muscle": 4,
  "deficiency": 5,
  "deficiencia": 5,
};

function scoreRelevance(title: string, abstract: string): number {
  const text = `${title} ${abstract}`.toLowerCase();
  let score = 0;
  for (const [keyword, weight] of Object.entries(RELEVANCE_KEYWORDS)) {
    if (text.includes(keyword)) {
      score += weight;
    }
  }
  return score;
}

// ─── Save items to DB ───

async function saveItems(items: ParsedFeedItem[]): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Feeds] Database not available — skipping save");
    return 0;
  }

  let saved = 0;
  for (const item of items) {
    try {
      const relevance = scoreRelevance(item.title, item.abstract);
      await db.insert(feedItems).values({
        source: item.source,
        url: item.url,
        title: item.title,
        abstract: item.abstract || null,
        authors: item.authors || null,
        publishedDate: item.publishedDate ? new Date(item.publishedDate) : null,
        relevanceScore: relevance,
        processed: false,
      });
      saved++;
    } catch (e: unknown) {
      const msg = String((e as Record<string, unknown>).message || "");
      if (!msg.includes("Duplicate entry")) {
        console.warn("[Feeds] Insert error:", msg.slice(0, 150));
      }
    }
  }
  return saved;
}

// ─── Public API ───

export async function ingestAllFeeds(): Promise<{
  total: number;
  saved: number;
  sources: Record<string, number>;
}> {
  console.log("[Feeds] Starting feed ingestion...");

  const [pubmed, openfda, medscape, anvisa] = await Promise.allSettled([
    fetchPubMed(),
    fetchOpenFDA(),
    fetchMedscapeRSS(),
    fetchAnvisaRSS(),
  ]);

  const extract = (r: PromiseSettledResult<ParsedFeedItem[]>) =>
    r.status === "fulfilled" ? r.value : [];

  const pubmedItems = extract(pubmed);
  const openfdaItems = extract(openfda);
  const medscapeItems = extract(medscape);
  const anvisaItems = extract(anvisa);

  const allItems = [...pubmedItems, ...openfdaItems, ...medscapeItems, ...anvisaItems];
  const saved = await saveItems(allItems);

  const sources: Record<string, number> = {
    pubmed: pubmedItems.length,
    openfda: openfdaItems.length,
    medscape: medscapeItems.length,
    anvisa: anvisaItems.length,
  };

  console.log(`[Feeds] Ingestion complete: ${allItems.length} fetched, ${saved} new items saved`);
  return { total: allItems.length, saved, sources };
}

export async function getRecentFeedItems(days: number) {
  const db = await getDb();
  if (!db) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  return db
    .select()
    .from(feedItems)
    .where(sql`${feedItems.createdAt} >= ${cutoffStr}`)
    .orderBy(desc(feedItems.relevanceScore));
}
