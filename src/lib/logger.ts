import pino from "pino";
import path from "node:path";

const logDir = path.resolve(import.meta.dirname, "../../logs");

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    targets: [
      // Console output with pretty printing in development
      ...(process.env.NODE_ENV !== "production"
        ? [
            {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
              },
              level: "info" as const,
            },
          ]
        : [
            {
              target: "pino/file",
              options: { destination: 1 }, // stdout
              level: "info" as const,
            },
          ]),
      // info.log — all logs (info and above)
      {
        target: "pino/file",
        options: { destination: path.join(logDir, "info.log"), mkdir: true },
        level: "info" as const,
      },
      // error.log — errors and fatals only
      {
        target: "pino/file",
        options: { destination: path.join(logDir, "error.log"), mkdir: true },
        level: "error" as const,
      },
    ],
  },
});
