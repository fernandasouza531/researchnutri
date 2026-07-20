import { z } from "zod";
import { publicProcedure, adminProcedure, router } from "./_core/trpc";
import { insertEmailSubscriber, listEmailSubscribers } from "./db";

export const emailRouter = router({
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        nome: z.string().optional(),
        source: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const id = await insertEmailSubscriber(input);
      return { success: true, id };
    }),

  list: adminProcedure.query(async () => {
    return await listEmailSubscribers();
  }),
});
