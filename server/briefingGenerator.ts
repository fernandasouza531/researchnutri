import { getRecentFeedItems } from "./feeds";
import { insertBriefing, listBriefings } from "./db";
import { invokeLLM } from "./_core/llm";
import type { FeedItem } from "../drizzle/schema";

// ─── Relevance keywords for scoring/filtering ───

const SCORING_KEYWORDS = [
  "glp-1", "glp1", "microbiome", "microbiota", "supplement", "suplemento",
  "vitamin", "vitamina", "recall", "fda", "ultraprocessed", "ultraprocessado",
  "semaglutide", "tirzepatide", "ozempic", "functional nutrition",
  "nutricao funcional", "muscle", "deficiency", "deficiencia", "anvisa",
];

function scoreFeedItem(item: FeedItem): number {
  const text = `${item.title ?? ""} ${item.abstract ?? ""}`.toLowerCase();
  let score = item.relevanceScore ?? 0;
  for (const kw of SCORING_KEYWORDS) {
    if (text.includes(kw)) score += 3;
  }
  return score;
}

// ─── Slug generation ───

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

// ─── Build LLM prompt ───

function buildPrompt(items: FeedItem[]): string {
  const itemsSummary = items
    .map((item, i) => {
      return `[${i + 1}] Fonte: ${item.source}\nTitulo: ${item.title}\nResumo: ${(item.abstract ?? "").slice(0, 400)}\nURL: ${item.url}`;
    })
    .join("\n\n");

  return `Voce e uma nutricionista funcional, direta, didatica e baseada em evidencias. Seu publico sao profissionais de saude e pacientes informados no Brasil.

Analise os artigos/noticias abaixo da ultima semana e gere um briefing semanal em portugues brasileiro.

ARTIGOS DA SEMANA:
${itemsSummary}

Gere um JSON com exatamente esta estrutura:
{
  "titulo": "titulo do briefing semanal (curto, direto)",
  "destaque": {
    "estudo_titulo": "titulo do estudo/noticia mais relevante",
    "estudo_fonte_url": "URL da fonte",
    "descoberta": "o que o estudo descobriu (2-3 frases)",
    "pratica": "implicacao pratica para nutricionista funcional (2-3 frases)",
    "veredito": "veredito direto: muda conduta? sim/nao e por que (1-2 frases)"
  },
  "radar": [
    {
      "titulo": "titulo curto",
      "resumo": "1-2 frases do que importa",
      "fonte_url": "URL"
    }
  ],
  "raiox": {
    "produto_titulo": "nome do suplemento/produto analisado",
    "corpo": "analise objetiva: forma quimica, biodisponibilidade, custo-beneficio, para quem serve (3-5 frases)",
    "links": [{"texto": "texto do link", "url": "URL"}]
  },
  "pergunta": {
    "pergunta": "uma pergunta clinica relevante que profissionais fariam",
    "resposta": "resposta baseada em evidencia, direta, 3-5 frases"
  },
  "meta_title": "titulo SEO (max 60 chars)",
  "meta_description": "descricao SEO (max 155 chars)"
}

REGRAS:
- Radar deve ter 3-5 itens
- Linguagem direta, sem rodeios, sem "vale ressaltar" ou "cenario desafiador"
- Cite fontes sempre que possivel
- Se nao houver estudo forte, use a noticia mais impactante como destaque
- O raiox deve ser sobre um suplemento mencionado nos artigos
- Responda APENAS com o JSON, sem markdown, sem explicacao`;
}

// ─── Parse LLM response ───

type BriefingLLMResponse = {
  titulo: string;
  destaque: {
    estudo_titulo: string;
    estudo_fonte_url: string;
    descoberta: string;
    pratica: string;
    veredito: string;
  };
  radar: Array<{
    titulo: string;
    resumo: string;
    fonte_url: string;
  }>;
  raiox: {
    produto_titulo: string;
    corpo: string;
    links: Array<{ texto: string; url: string }>;
  };
  pergunta: {
    pergunta: string;
    resposta: string;
  };
  meta_title: string;
  meta_description: string;
};

function parseLLMResponse(content: string): BriefingLLMResponse {
  // Strip markdown code fences if present
  let cleaned = content.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }
  return JSON.parse(cleaned) as BriefingLLMResponse;
}

// ─── Main generator ───

export async function generateBriefing(): Promise<{
  success: boolean;
  briefingId?: number;
  error?: string;
}> {
  console.log("[BriefingGenerator] Starting briefing generation...");

  // 1. Get recent feed items
  const recentItems = await getRecentFeedItems(7);
  if (recentItems.length === 0) {
    console.warn("[BriefingGenerator] No feed items found for last 7 days");
    return { success: false, error: "No feed items found for last 7 days" };
  }

  // 2. Score and pick top items
  const scored = recentItems
    .map((item) => ({ item, score: scoreFeedItem(item) }))
    .sort((a, b) => b.score - a.score);

  const topItems = scored.slice(0, 10).map((s) => s.item);
  console.log(`[BriefingGenerator] Selected ${topItems.length} items from ${recentItems.length} total`);

  // 3. Call LLM
  const prompt = buildPrompt(topItems);
  const llmResult = await invokeLLM({
    messages: [
      { role: "system", content: "Voce e uma nutricionista funcional expert. Responda apenas em JSON valido." },
      { role: "user", content: prompt },
    ],
    responseFormat: { type: "json_object" },
    maxTokens: 4096,
  });

  const rawContent = llmResult.choices[0]?.message?.content;
  if (!rawContent) {
    return { success: false, error: "LLM returned empty response" };
  }

  // 4. Parse response
  let parsed: BriefingLLMResponse;
  try {
    parsed = parseLLMResponse(rawContent);
  } catch (err) {
    console.error("[BriefingGenerator] Failed to parse LLM response:", rawContent.slice(0, 500));
    return { success: false, error: `Failed to parse LLM JSON: ${String(err)}` };
  }

  // 5. Determine edition number
  const existingBriefings = await listBriefings();
  const nextEdition = existingBriefings.length > 0
    ? Math.max(...existingBriefings.map((b) => b.numeroEdicao)) + 1
    : 1;

  // 6. Save to DB
  const today = new Date().toISOString().slice(0, 10);
  const slug = `briefing-${nextEdition}-${generateSlug(parsed.titulo)}`;

  const briefingId = await insertBriefing({
    numeroEdicao: nextEdition,
    titulo: parsed.titulo,
    slug,
    dataReferencia: new Date(today),
    destaqueEstudoTitulo: parsed.destaque.estudo_titulo,
    destaqueEstudoFonteUrl: parsed.destaque.estudo_fonte_url,
    destaqueDescoberta: parsed.destaque.descoberta,
    destaquePratica: parsed.destaque.pratica,
    destaqueVeredito: parsed.destaque.veredito,
    radarItems: parsed.radar,
    raioxProdutoTitulo: parsed.raiox.produto_titulo,
    raioxProdutoCorpo: parsed.raiox.corpo,
    raioxLinks: parsed.raiox.links,
    perguntaComunidadePergunta: parsed.pergunta.pergunta,
    perguntaComunidadeResposta: parsed.pergunta.resposta,
    metaTitle: parsed.meta_title,
    metaDescription: parsed.meta_description,
    status: "pending_review",
  });

  console.log(`[BriefingGenerator] Briefing #${nextEdition} created with id=${briefingId}, status=pending_review`);
  return { success: true, briefingId: Number(briefingId) };
}
