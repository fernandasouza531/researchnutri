import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { listBrands, getBrandById, insertBrand, updateBrand, deleteBrand } from "./db";

export const brandsRouter = router({
  list: publicProcedure.query(async () => {
    return await listBrands();
  }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await getBrandById(input.id);
  }),

  create: adminProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        pais: z.string().optional(),
        site: z.string().optional(),
        certificacoes: z.any().optional(),
        notaConfianca: z.number().min(1).max(10).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const id = await insertBrand(input);
      return { id };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        pais: z.string().nullable().optional(),
        site: z.string().nullable().optional(),
        certificacoes: z.any().optional(),
        notaConfianca: z.number().min(1).max(10).nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateBrand(id, data);
      return { success: true };
    }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteBrand(input.id);
    return { success: true };
  }),
});
