import dotenv from "dotenv";
dotenv.config();

export const Env = {
  ENV: process.env.ENV || "development",
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 1337,
  OWNER: process.env.OWNER || "mikeharty",
  PUBLIC_HOST: process.env.PUBLIC_HOST || "https://www.mikeharty.com",
  COMPLETIONS_PATH: process.env.COMPLETIONS_PATH || "/api/v1/chat/completions",
  OPENROUTER_HOST: process.env.OPENROUTER_HOST || "https://openrouter.ai",
  OPENROUTER_KEY: process.env.OPENROUTER_KEY || "",
  OPENAI_KEY: process.env.OPENAI_KEY || "",
};
