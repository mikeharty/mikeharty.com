import path from 'node:path';
import fs from 'node:fs/promises';
import Fastify from 'fastify';
import fastifyIp from 'fastify-ip';
import fastifyStatic from '@fastify/static';
import ENV from './env';
import { renderHome, CliTeapot } from './home';
import logConfig from './logging';

const fastify = Fastify({
  logger: logConfig,
});

fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'static'),
  prefix: '/static/',
});

fastify.register(fastifyIp, {});

fastify.get('/favicon.ico', async (_, reply) => {
  const icon = await fs.readFile(path.join(__dirname, '..', 'static', 'teapot.ico'));
  reply.send(icon);
});

fastify.get('/', async (_, reply) => {
  const Home = await renderHome();
  reply.status(418).type('text/html').send(Home);
});

fastify.setNotFoundHandler(async (_, reply) => {
  const Home = await renderHome();
  reply.status(418).type('text/html').send(Home);
});

const start = async () => {
  try {
    console.log('Booting up mikeharty.com...');
    console.log(CliTeapot);
    await fastify.listen({ host: ENV.HOST, port: ENV.PORT });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
