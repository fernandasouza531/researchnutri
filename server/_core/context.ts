import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { ENV } from "./env";
import { parse as parseCookieHeader } from "cookie";
import { jwtVerify } from "jose";

export type AdminUser = {
  id: number;
  name: string;
  role: "admin";
};

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: AdminUser | null;
};

async function resolveUser(req: CreateExpressContextOptions["req"]): Promise<AdminUser | null> {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const token = cookies["nutri_admin_session"];
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(ENV.cookieSecret);
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    if (payload.role === "admin") {
      return {
        id: 1,
        name: (payload.name as string) ?? "Admin",
        role: "admin",
      };
    }
  } catch {
    // invalid token
  }

  return null;
}

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  const user = await resolveUser(opts.req);
  return { req: opts.req, res: opts.res, user };
}
