import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import {
  listTravelGuideItems,
  insertTravelGuideItem,
  updateTravelGuideItem,
  deleteTravelGuideItem,
  listTravelGuideStores,
  insertTravelGuideStore,
  listTravelGuideRules,
} from "./db";

export const guiaMalaRouter = router({
  listItems: publicProcedure.query(async () => {
    return await listTravelGuideItems();
  }),

  listStores: publicProcedure
    .input(z.object({ cidade: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return await listTravelGuideStores(input?.cidade);
    }),

  listRules: publicProcedure.query(async () => {
    return await listTravelGuideRules();
  }),

  createItem: adminProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        categoria: z.string().optional(),
        posicaoRanking: z.number().optional(),
        descricao: z.string().optional(),
        precoMedioUsd: z.string().optional(),
        precoMedioBrl: z.string().optional(),
        economiaEstimadaPercent: z.number().optional(),
        marcaRecomendada: z.string().optional(),
        linkAfiliado: z.string().optional(),
        linkComparadorSlug: z.string().optional(),
        valeAPena: z.boolean().optional(),
        motivo: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const id = await insertTravelGuideItem(input as any);
      return { id };
    }),

  updateItem: adminProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().optional(),
        categoria: z.string().optional(),
        posicaoRanking: z.number().optional(),
        descricao: z.string().optional(),
        precoMedioUsd: z.string().optional(),
        precoMedioBrl: z.string().optional(),
        economiaEstimadaPercent: z.number().optional(),
        marcaRecomendada: z.string().optional(),
        linkAfiliado: z.string().optional(),
        linkComparadorSlug: z.string().optional(),
        valeAPena: z.boolean().optional(),
        motivo: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateTravelGuideItem(id, data as any);
      return { success: true };
    }),

  deleteItem: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteTravelGuideItem(input.id);
    return { success: true };
  }),

  createStore: adminProcedure
    .input(
      z.object({
        nome: z.string().min(1),
        tipo: z.string().optional(),
        endereco: z.string().optional(),
        cidade: z.string().optional(),
        dica: z.string().optional(),
        linkSite: z.string().optional(),
        linkMaps: z.string().optional(),
        atendePortugues: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const id = await insertTravelGuideStore(input as any);
      return { id };
    }),
});
