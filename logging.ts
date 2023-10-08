import { FastifyLoggerOptions } from "fastify";
import pino from "pino";

export const logToEnv: { [key: string]: any } = {
  development: {
    transport: {
      targets: [
        {
          level: "debug",
          target: "pino-pretty",
          options: {
            translateTime: 'SYS:yyyy-mm-dd"T"HH:MM:ss.l',
            ignore: "pid,hostname",
          },
        },
        {
          level: "trace",
          target: "pino/file",
          options: {
            translateTime: 'SYS:yyyy-mm-dd"T"HH:MM:ss.l',
            destination: "/var/log/mike/mikeharty.com.log",
          },
        },
      ],
    },
  },
  production: true,
  test: false,
};
