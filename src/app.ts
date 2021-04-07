import NodeServer from "./server/NodeServer";
import winston, { transports } from "winston";
import Config, { config } from "./utils/Config";
import { exit } from "process";
import figlet from "figlet";

const logLevel = (process.env.NODE_ENV === "production" ? "info" : "debug");

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.simple(),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "./log/error.log", level: "error" }),
    new transports.File({ filename: "./log/combined.log" })
  ],
  exceptionHandlers: [
    new transports.Console(),
    new transports.File({ filename: "./log/exceptions.log" })
  ]
});

console.log("\n#========================================================#");
console.log(`${figlet.textSync(" Auto Search", { font: "Doom" })}`);
console.log("#========================================================#\n");

export let nodeServer: NodeServer;

logger.info("[Node] Initialising");

Config.load().then(() => {

  if(!config.url) throw new Error("[Config] No public URL configured");

  const environment = process.env.NODE_ENV;
  logger.info(`[Node] Environment: ${environment}`);

  nodeServer = new NodeServer();
  nodeServer.start().then(() => {
    logger.info(`[Node] Listening on: ${nodeServer.port}`);
  }).catch((err: Error) => {
    logger.error(err);
    exit();
  });

}).catch((err: Error) => {
  logger.error(err);
  exit();
});