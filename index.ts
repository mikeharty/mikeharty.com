import { Env } from "./env";
import Fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import { logToEnv } from "./logging";
import { Home, CliTeapot } from "./home";
import { AICompletionsProxy } from "./ai-proxy/ai-proxy";
const { PORT, COMPLETIONS_PATH, ENV } = Env;

const options: FastifyServerOptions = {
  logger: logToEnv[ENV] ?? true,
  requestIdHeader: "x-request-id",
};

const server: FastifyInstance = Fastify(options);

server.get("/", async (_, reply) => {
  reply.status(418).type("text/html").send(Home);
});

server.setNotFoundHandler((_, reply) => {
  reply.status(418).type("text/html").send(Home);
});

server.post(COMPLETIONS_PATH, AICompletionsProxy);

const start = async () => {
  try {
    await server.listen({ port: PORT });
    server.log.info(`server listening on ${server.server.address()}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

console.log(CliTeapot);
start();
