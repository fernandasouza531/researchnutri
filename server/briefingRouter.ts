import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { listBriefings, getLatestBriefing, getBriefingBySlug, insertBriefing, updateBriefing } from "./db";

export const briefingRouter = router({
  list: publicProcedure
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return await listBriefings(input?.status);
    }),

  latest: publicProcedure.query(async () => {
    return await getLatestBriefing();
  }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    return await getBriefingBySlug(input.slug);
  }),

  create: adminProcedure
    .input(
      z.object({
        numeroEdicao: z.number(),
        titulo: z.string().min(1),
        slug: z.string().min(1),
        dataReferencia: z.string(),
        destaqueEstudoTitulo: z.string().optional(),
        destaqueEstudoFonteUrl: z.string().optional(),
        destaqueDescoberta: z.string().optional(),
        destaquePratica: z.string().optional(),
        destaqueVeredito: z.string().optional(),
        radarItems: z.any().optional(),
        raioxProdutoTitulo: z.string().optional(),
        raioxProdutoCorpo: z.string().optional(),
        raioxLinks: z.any().optional(),
        perguntaComunidadePergunta: z.string().optional(),
        perguntaComunidadeResposta: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const id = await insertBriefing(input as any);
      return { id };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().optional(),
        destaqueEstudoTitulo: z.string().nullable().optional(),
        destaqueEstudoFonteUrl: z.string().nullable().optional(),
        destaqueDescoberta: z.string().nullable().optional(),
        destaquePratica: z.string().nullable().optional(),
        destaqueVeredito: z.string().nullable().optional(),
        radarItems: z.any().optional(),
        raioxProdutoTitulo: z.string().nullable().optional(),
        raioxProdutoCorpo: z.string().nullable().optional(),
        raioxLinks: z.any().optional(),
        perguntaComunidadePergunta: z.string().nullable().optional(),
        perguntaComunidadeResposta: z.string().nullable().optional(),
        status: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateBriefing(id, data as any);
      return { success: true };
    }),

  approve: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await updateBriefing(input.id, { status: "approved" } as any);
    return { success: true };
  }),

  publish: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await updateBriefing(input.id, { status: "published", publishedAt: new Date() } as any);
    return { success: true };
  }),
});
