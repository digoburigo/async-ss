import { cors } from "@elysiajs/cors";
import { node } from "@elysiajs/node";
import { fromTypes, openapi } from "@elysiajs/openapi";
import { Elysia, t } from "elysia";

import { zenstackController } from "./modules/zenstack";
import { betterAuth } from "./plugins/better-auth";

const trustedOrigins = [
  process.env.PUBLIC_WEB_URL ?? "http://localhost:3001",
].map((url) => new URL(url).origin);

export const app = new Elysia({
  adapter: node(),
  prefix: "/api",
})
  .use(
    openapi({
      references: fromTypes(),
    }),
  )
  // .onError(({ error, code }) => {
  //   console.log(`🚀 -> code:`, code)
  //   console.log(`🚀 -> error:`, error)
  //   if (code === 'VALIDATION') {
  //     return error.detail(error.message);
  //   }

  //   return error
  // })
  .use(
    cors({
      origin: trustedOrigins,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .use(betterAuth)
  .use(zenstackController)
  .get("/", () => ({ message: "Hello Elysia!" }))
  .get("/healthcheck", () => ({ message: "OK" }), {
    response: {
      200: t.Object({
        message: t.String(),
      }),
    },
  })
  .get(
    "/error",
    ({ status }) => {
      const random = Math.random();
      if (random < 0.5) {
        return status(404, { message: "Not Found" });
      }

      return { prop: "value" };
    },
    {
      response: {
        404: t.Object({
          message: t.String(),
        }),
      },
    },
  )
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${hostname}:${port}`);
  });

export type App = typeof app;
