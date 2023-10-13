import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { Home, CliTeapot } from './home';
import logConfig from './logging';
import ENV from './env';

const options: FastifyServerOptions = {
  logger: logConfig,
  requestIdHeader: 'x-request-id',
};

const server: FastifyInstance = Fastify(options);

server.get('/', async (_, reply) => {
  reply.status(418).type('text/html').send(Home);
});

server.setNotFoundHandler((_, reply) => {
  reply.status(418).type('text/html').send(Home);
});

const start = async () => {
  try {
    await server.listen({ host: ENV.HOST, port: ENV.PORT });
    server.log.info(`server listening on ${server.server.address()}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

console.log(CliTeapot);

start();
