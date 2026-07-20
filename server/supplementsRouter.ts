import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import {
  listSupplements,
  getSupplementById,
  getSupplementBySlug,
  insertSupplement,
  updateSupplement,
  deleteSupplement,
} from "./db";

export const supplementsRouter = router({
  list: publicProcedure.query(async () => {
    return await listSupplements();
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await getSupplementById(input.id);
  }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    return await getSupplementBySlug(input.slug);
  }),

  create: adminProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        slug: z.string().min(1),
        categoria: z.string().min(1),
        descricaoCurta: z.string().optional(),
        descricaoLonga: z.string().optional(),
        formaQuimicaPrincipal: z.string().optional(),
        paraQueServe: z.string().optional(),
        quemPrecisa: z.string().optional(),
        contextoGlp1: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const id = await insertSupplement(input);
      return { id };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        categoria: z.string().min(1).optional(),
        descricaoCurta: z.string().nullable().optional(),
        descricaoLonga: z.string().nullable().optional(),
        formaQuimicaPrincipal: z.string().nullable().optional(),
        paraQueServe: z.string().nullable().optional(),
        quemPrecisa: z.string().nullable().optional(),
        contextoGlp1: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateSupplement(id, data);
      return { success: true };
    }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteSupplement(input.id);
    return { success: true };
  }),
});
