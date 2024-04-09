import Fastify from 'fastify';
import ENV from './env';
import { Home, CliTeapot } from './home';
import logConfig from './logging';

const fastify = Fastify({
  logger: logConfig
})

fastify.get('/', async (_, reply) => {
  reply.status(418).type('text/html').send(Home);
});

fastify.setNotFoundHandler((_, reply) => {
  reply.status(418).type('text/html').send(Home);
});

const start = async () => {
  try {
    await fastify.listen({ host: ENV.HOST, port: ENV.PORT });
    fastify.log.info(`server listening on ${fastify.server.address()}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

console.log(CliTeapot);

start();
