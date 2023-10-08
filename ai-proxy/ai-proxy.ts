import { FastifyRequest, FastifyReply } from "fastify";
import { Env } from "../env";
import { OpenAI } from "openai";

/**
 * AI Proxy
 * This proxies requests from my IntelliJ plugin to the OpenAI
 * and OpenRouter APIs. OpenAI hasn't made GPT-4 32k available
 * in their official API, so I'm using OpenRouter for that. The
 * GPT-4 32k model is useful when I want to provide a massive
 * amount of context.
 */
const openai = new OpenAI({
  apiKey: Env.OPENAI_KEY,
});

const openrouter = new OpenAI({
  apiKey: Env.OPENROUTER_KEY,
  baseURL: `${Env.OPENROUTER_HOST}/api/v1`,
  defaultHeaders: {
    "HTTP-Referer": Env.PUBLIC_HOST,
    "X-Title": Env.OWNER,
  },
});

type CompletionParams = OpenAI.Chat.Completions.ChatCompletionCreateParams;
async function AICompletionsProxy(
  request: FastifyRequest,
  reply: FastifyReply
) {
  let api;
  const log = request.server.log;
  const body = request.body as CompletionParams;
  if (body.model.includes("gpt-4-32k")) {
    body.model = "openai/gpt-4-32k";
    log.info("Using OpenRouter for gpt-4-32k");
    api = openrouter;
  } else {
    log.info(`Using OpenAI for ${body.model}`);
    api = openai;
  }

  // Streaming response requested
  // Will proxy the stream from AI to the client
  if (body.stream) {
    const response = await api.chat.completions.create(body).asResponse();
    log.info("Opened AI Stream");
    reply.hijack();
    const headers = {
      "content-type": "text/event-stream",
      "transfer-encoding": "chunked",
    };
    reply.raw.writeHead(200, headers);
    log.info("Wrote Response Stream headers");
    log.info("Piping AI Stream to Response Stream");
    let chunksProxied = 0;
    response.body.on("data", (chunk: any) => {
      reply.raw.write(chunk);
      chunksProxied++;
    });
    response.body.on("end", () => {
      reply.raw.end();
      log.info(
        `Streams closed, wrote ${chunksProxied} chunks to Response Stream`
      );
    });
    response.body.on("error", (err: any) => {
      log.info("AI Stream sent an error", err);
      reply.raw.end();
    });
  }
  // Buffered response, ezpz
  else {
    const response = await api.chat.completions.create(body);
    reply.send(response);
  }
}

export { AICompletionsProxy };
