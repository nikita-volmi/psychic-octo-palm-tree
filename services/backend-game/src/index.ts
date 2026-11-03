import Fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "./db";

const app = Fastify({ logger: true });

app.register(cors, { origin: true });

app.get("/health", async () => {
  return { status: "ok", service: "backend-game" };
});

app.get("/games", async () => {
  const games = await prisma.game.findMany({ orderBy: { createdAt: "asc" } });
  return { games };
});

const port = Number(process.env.PORT ?? 3002);

app
  .listen({ port, host: "0.0.0.0" })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
