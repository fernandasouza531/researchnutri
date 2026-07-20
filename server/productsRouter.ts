import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { listProductsBySupplement, getProductById, insertProduct, updateProduct, deleteProduct } from "./db";

export const productsRouter = router({
  listBySupplement: publicProcedure
    .input(z.object({ supplementId: z.number() }))
    .query(async ({ input }) => {
      return await listProductsBySupplement(input.supplementId);
    }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await getProductById(input.id);
  }),

  create: adminProcedure
    .input(
      z.object({
        supplementId: z.number(),
        brandId: z.number(),
        nomeComercial: z.string().min(1),
        dosagemPorCapsula: z.string().optional(),
        dosesPorFrasco: z.number().optional(),
        formaQuimica: z.string().optional(),
        precoUsd: z.string().optional(),
        precoBrl: z.string().optional(),
        custoPorDoseUsd: z.string().optional(),
        custoPorDoseBrl: z.string().optional(),
        mercado: z.enum(["US", "BR"]),
        certificacoes: z.any().optional(),
        linkAfiliado: z.string().optional(),
        linkAfiliadoPrograma: z.string().optional(),
        ondeComprar: z.string().optional(),
        vegano: z.boolean().optional(),
        semGluten: z.boolean().optional(),
        alergenicos: z.any().optional(),
        biodisponibilidade: z.enum(["alta", "media", "baixa"]).optional(),
        observacoes: z.string().optional(),
        dataVerificacaoPreco: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const id = await insertProduct(input as any);
      return { id };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        supplementId: z.number().optional(),
        brandId: z.number().optional(),
        nomeComercial: z.string().min(1).optional(),
        dosagemPorCapsula: z.string().nullable().optional(),
        dosesPorFrasco: z.number().nullable().optional(),
        formaQuimica: z.string().nullable().optional(),
        precoUsd: z.string().nullable().optional(),
        precoBrl: z.string().nullable().optional(),
        custoPorDoseUsd: z.string().nullable().optional(),
        custoPorDoseBrl: z.string().nullable().optional(),
        mercado: z.enum(["US", "BR"]).optional(),
        certificacoes: z.any().optional(),
        linkAfiliado: z.string().nullable().optional(),
        linkAfiliadoPrograma: z.string().nullable().optional(),
        ondeComprar: z.string().nullable().optional(),
        vegano: z.boolean().optional(),
        semGluten: z.boolean().optional(),
        alergenicos: z.any().optional(),
        biodisponibilidade: z.enum(["alta", "media", "baixa"]).nullable().optional(),
        observacoes: z.string().nullable().optional(),
        dataVerificacaoPreco: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateProduct(id, data as any);
      return { success: true };
    }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteProduct(input.id);
    return { success: true };
  }),
});
