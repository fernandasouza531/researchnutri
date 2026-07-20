import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { listGlp1Articles, getGlp1ArticleBySlug, insertGlp1Article, updateGlp1Article } from "./db";

export const glp1Router = router({
  list: publicProcedure
    .input(z.object({ status: z.enum(["draft", "published"]).optional() }).optional())
    .query(async ({ input }) => {
      return await listGlp1Articles(input?.status);
    }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    return await getGlp1ArticleBySlug(input.slug);
  }),

  create: adminProcedure
    .input(
      z.object({
        titulo: z.string().min(1),
        slug: z.string().min(1),
        corpo: z.string().min(1),
        categoria: z.string().optional(),
        fontes: z.any().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const id = await insertGlp1Article(input as any);
      return { id };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        titulo: z.string().optional(),
        slug: z.string().optional(),
        corpo: z.string().optional(),
        categoria: z.string().nullable().optional(),
        fontes: z.any().optional(),
        metaTitle: z.string().nullable().optional(),
        metaDescription: z.string().nullable().optional(),
        status: z.enum(["draft", "published"]).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateGlp1Article(id, data as any);
      return { success: true };
    }),
});
