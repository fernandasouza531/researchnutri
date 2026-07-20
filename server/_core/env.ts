export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "dev-secret-key",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? "",
  llmApiKey: process.env.LLM_API_KEY ?? "",
  cronSecret: process.env.CRON_SECRET ?? "",
  pubmedApiKey: process.env.PUBMED_API_KEY ?? "",
};
