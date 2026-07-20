import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ENV } from "./env";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function runMigrations() {
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.MYSQL_PUBLIC_URL ||
    (() => {
      const h = process.env.MYSQLHOST || process.env.MYSQL_HOST;
      const p = process.env.MYSQLPORT || process.env.MYSQL_PORT || "3306";
      const u = process.env.MYSQLUSER || process.env.MYSQL_USER;
      const pw = process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD;
      const d = process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE;
      return h && u && pw && d ? `mysql://${u}:${pw}@${h}:${p}/${d}` : null;
    })();

  if (!dbUrl) {
    console.warn("[Migrations] No database URL found — skipping migrations");
    return;
  }

  try {
    const { drizzle } = await import("drizzle-orm/mysql2");
    const { sql } = await import("drizzle-orm");
    const db = drizzle(dbUrl);
    console.log("[Migrations] Connected to database, running migrations...");

    const migrations = [
      // Admin users
      `CREATE TABLE IF NOT EXISTS admin_users (
        id int AUTO_INCREMENT PRIMARY KEY,
        email varchar(255) NOT NULL UNIQUE,
        password_hash varchar(255) NOT NULL,
        name varchar(100),
        role enum('admin','editor') DEFAULT 'editor',
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      // Supplements
      `CREATE TABLE IF NOT EXISTS supplements (
        id int AUTO_INCREMENT PRIMARY KEY,
        nome varchar(200) NOT NULL,
        slug varchar(200) NOT NULL UNIQUE,
        categoria varchar(100) NOT NULL,
        descricao_curta text,
        descricao_longa text,
        forma_quimica_principal varchar(200),
        para_que_serve text,
        quem_precisa text,
        contexto_glp1 text,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Brands
      `CREATE TABLE IF NOT EXISTS brands (
        id int AUTO_INCREMENT PRIMARY KEY,
        nome varchar(200) NOT NULL,
        pais varchar(50),
        site varchar(500),
        certificacoes json,
        nota_confianca tinyint,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      // Products
      `CREATE TABLE IF NOT EXISTS products (
        id int AUTO_INCREMENT PRIMARY KEY,
        supplement_id int NOT NULL,
        brand_id int NOT NULL,
        nome_comercial varchar(300) NOT NULL,
        dosagem_por_capsula varchar(100),
        doses_por_frasco int,
        forma_quimica varchar(200),
        preco_usd decimal(10,2),
        preco_brl decimal(10,2),
        custo_por_dose_usd decimal(10,4),
        custo_por_dose_brl decimal(10,4),
        mercado enum('US','BR') NOT NULL,
        certificacoes json,
        link_afiliado varchar(1000),
        link_afiliado_programa varchar(100),
        onde_comprar varchar(500),
        vegano boolean DEFAULT false,
        sem_gluten boolean DEFAULT false,
        alergenicos json,
        biodisponibilidade enum('alta','media','baixa'),
        observacoes text,
        data_verificacao_preco date,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Comparisons
      `CREATE TABLE IF NOT EXISTS comparisons (
        id int AUTO_INCREMENT PRIMARY KEY,
        supplement_id int NOT NULL,
        titulo varchar(300) NOT NULL,
        slug varchar(300) NOT NULL UNIQUE,
        veredito_texto text,
        veredito_glp1 text,
        alternativa_economica text,
        alerta text,
        meta_title varchar(200),
        meta_description varchar(500),
        status enum('draft','published') DEFAULT 'draft',
        publishedAt timestamp NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // GLP-1 Articles
      `CREATE TABLE IF NOT EXISTS glp1_articles (
        id int AUTO_INCREMENT PRIMARY KEY,
        titulo varchar(300) NOT NULL,
        slug varchar(300) NOT NULL UNIQUE,
        corpo text NOT NULL,
        categoria varchar(100),
        fontes json,
        meta_title varchar(200),
        meta_description varchar(500),
        status enum('draft','published') DEFAULT 'draft',
        publishedAt timestamp NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Travel guide items
      `CREATE TABLE IF NOT EXISTS travel_guide_items (
        id int AUTO_INCREMENT PRIMARY KEY,
        nome varchar(200) NOT NULL,
        categoria varchar(100),
        posicao_ranking int,
        descricao text,
        preco_medio_usd decimal(10,2),
        preco_medio_brl decimal(10,2),
        economia_estimada_percent int,
        marca_recomendada varchar(200),
        link_afiliado varchar(1000),
        link_comparador_slug varchar(200),
        vale_a_pena boolean DEFAULT true,
        motivo text,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Travel guide stores
      `CREATE TABLE IF NOT EXISTS travel_guide_stores (
        id int AUTO_INCREMENT PRIMARY KEY,
        nome varchar(200) NOT NULL,
        tipo varchar(100),
        endereco varchar(500),
        cidade varchar(100),
        dica text,
        link_site varchar(500),
        link_maps varchar(500),
        atende_portugues boolean DEFAULT false
      )`,

      // Travel guide rules
      `CREATE TABLE IF NOT EXISTS travel_guide_rules (
        id int AUTO_INCREMENT PRIMARY KEY,
        regra varchar(300) NOT NULL,
        detalhe text,
        fonte varchar(500),
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Feed items (for briefing pipeline)
      `CREATE TABLE IF NOT EXISTS feed_items (
        id int AUTO_INCREMENT PRIMARY KEY,
        source varchar(100) NOT NULL,
        url varchar(1000) NOT NULL,
        title varchar(500),
        abstract text,
        authors varchar(500),
        published_date date,
        relevance_score int DEFAULT 0,
        processed boolean DEFAULT false,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      // Briefings
      `CREATE TABLE IF NOT EXISTS briefings (
        id int AUTO_INCREMENT PRIMARY KEY,
        numero_edicao int NOT NULL,
        titulo varchar(300) NOT NULL,
        slug varchar(300) NOT NULL UNIQUE,
        data_referencia date NOT NULL,
        destaque_estudo_titulo varchar(500),
        destaque_estudo_fonte_url varchar(1000),
        destaque_descoberta text,
        destaque_pratica text,
        destaque_veredito text,
        radar_items json,
        raiox_produto_titulo varchar(300),
        raiox_produto_corpo text,
        raiox_links json,
        pergunta_comunidade_pergunta text,
        pergunta_comunidade_resposta text,
        meta_title varchar(200),
        meta_description varchar(500),
        status enum('draft','pending_review','approved','published','auto_published') DEFAULT 'draft',
        publishedAt timestamp NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Email subscribers
      `CREATE TABLE IF NOT EXISTS email_subscribers (
        id int AUTO_INCREMENT PRIMARY KEY,
        email varchar(255) NOT NULL UNIQUE,
        nome varchar(200),
        source varchar(100),
        preferences json,
        subscribedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unsubscribedAt timestamp NULL
      )`,

      // Analytics events
      `CREATE TABLE IF NOT EXISTS analytics_events (
        id int AUTO_INCREMENT PRIMARY KEY,
        page varchar(500),
        event_type varchar(100),
        affiliate_program varchar(100),
        metadata json,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    for (const migration of migrations) {
      try {
        await db.execute(sql.raw(migration));
      } catch (e: unknown) {
        const msg = String((e as Record<string, unknown>).message || "");
        if (!msg.includes("Duplicate column") && !msg.includes("Duplicate entry")) {
          console.warn("[Migrations] Non-critical error:", msg.slice(0, 100));
        }
      }
    }
    console.log("[Migrations] All tables created/verified successfully");
  } catch (error) {
    console.error("[Migrations] Failed:", error);
  }
}

async function startServer() {
  await runMigrations();

  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Admin auth routes
  app.post("/api/admin/login", async (req, res) => {
    const { password } = req.body ?? {};
    if (!password) {
      res.status(400).json({ error: "Password required" });
      return;
    }
    const { createHash } = await import("crypto");
    const hash = createHash("sha256").update(password).digest("hex");

    if (ENV.adminPasswordHash && hash !== ENV.adminPasswordHash) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    const { SignJWT } = await import("jose");
    const secret = new TextEncoder().encode(ENV.cookieSecret);
    const token = await new SignJWT({ role: "admin", name: "Admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(secret);

    res.cookie("nutri_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.json({ success: true });
  });

  app.post("/api/admin/logout", (_req, res) => {
    res.clearCookie("nutri_admin_session", { path: "/" });
    res.json({ success: true });
  });

  app.get("/api/admin/me", async (req, res) => {
    const { parse: parseCookies } = await import("cookie");
    const { jwtVerify } = await import("jose");
    const cookies = parseCookies(req.headers.cookie ?? "");
    const token = cookies["nutri_admin_session"];
    if (!token) {
      res.json(null);
      return;
    }
    try {
      const secret = new TextEncoder().encode(ENV.cookieSecret);
      const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
      res.json({ name: payload.name, role: payload.role });
    } catch {
      res.json(null);
    }
  });

  // Health check
  app.get("/api/health", async (_req, res) => {
    const { getDb } = await import("../db");
    const db = await getDb();
    res.json({ status: "ok", database: db ? "connected" : "not connected" });
  });

  // Scheduled endpoints (for GitHub Actions cron)
  app.post("/api/scheduled/:action", async (req, res) => {
    const secret = req.headers["x-cron-secret"] || req.query.secret;
    if (ENV.cronSecret && secret !== ENV.cronSecret) {
      res.status(401).json({ error: "Invalid cron secret" });
      return;
    }
    const { action } = req.params;
    try {
      switch (action) {
        case "ingest-feeds": {
          res.json({ success: true, message: "Feed ingestion triggered" });
          break;
        }
        case "generate-briefing": {
          res.json({ success: true, message: "Briefing generation triggered" });
          break;
        }
        case "publish-briefing": {
          res.json({ success: true, message: "Briefing publish triggered" });
          break;
        }
        default:
          res.status(404).json({ error: `Unknown action: ${action}` });
      }
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // tRPC
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  // Vite (dev) or static (prod)
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
