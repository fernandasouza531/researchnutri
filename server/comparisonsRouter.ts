import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import {
  listComparisons,
  getComparisonBySlug,
  getComparisonById,
  insertComparison,
  updateComparison,
  publishComparison,
  listProductsBySupplement,
  getSupplementBySlug,
} from "./db";

export const comparisonsRouter = router({
  list: publicProcedure
    .input(z.object({ status: z.enum(["draft", "published"]).optional() }).optional())
    .query(async ({ input }) => {
      return await listComparisons(input?.status);
    }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const comparison = await getComparisonBySlug(input.slug);
    if (!comparison) return null;
    const products = await listProductsBySupplement(comparison.supplementId);
    return { comparison, products };
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await getComparisonById(input.id);
  }),

  create: adminProcedure
    .input(
      z.object({
        supplementId: z.number(),
        titulo: z.string().min(1),
        slug: z.string().min(1),
        vereditoTexto: z.string().optional(),
        vereditoGlp1: z.string().optional(),
        alternativaEconomica: z.string().optional(),
        alerta: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const id = await insertComparison(input);
      return { id };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        supplementId: z.number().optional(),
        titulo: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        vereditoTexto: z.string().nullable().optional(),
        vereditoGlp1: z.string().nullable().optional(),
        alternativaEconomica: z.string().nullable().optional(),
        alerta: z.string().nullable().optional(),
        metaTitle: z.string().nullable().optional(),
        metaDescription: z.string().nullable().optional(),
        status: z.enum(["draft", "published"]).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateComparison(id, data);
      return { success: true };
    }),

  publish: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await publishComparison(input.id);
    return { success: true };
  }),
});
