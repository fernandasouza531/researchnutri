import { publicProcedure, router } from "./_core/trpc";
import { supplementsRouter } from "./supplementsRouter";
import { brandsRouter } from "./brandsRouter";
import { productsRouter } from "./productsRouter";
import { comparisonsRouter } from "./comparisonsRouter";
import { briefingRouter } from "./briefingRouter";
import { glp1Router } from "./glp1Router";
import { guiaMalaRouter } from "./guiaMalaRouter";
import { emailRouter } from "./emailRouter";

export const appRouter = router({
  supplements: supplementsRouter,
  brands: brandsRouter,
  products: productsRouter,
  comparisons: comparisonsRouter,
  briefing: briefingRouter,
  glp1: glp1Router,
  guiaMala: guiaMalaRouter,
  email: emailRouter,
});

export type AppRouter = typeof appRouter;
