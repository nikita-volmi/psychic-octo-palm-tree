import Fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "./db";

const app = Fastify({ logger: true });

app.register(cors, { origin: true });

app.get("/health", async () => {
  return { status: "ok", service: "backend-auth" };
});

app.get("/users", async () => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return { users };
});

const port = Number(process.env.PORT ?? 3001);

app
  .listen({ port, host: "0.0.0.0" })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
