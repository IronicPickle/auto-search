import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import path from "path";
import { Express } from "express-serve-static-core";
import routes from "./routes";
import http from "http";
import csurf from "csurf";
import fs from "fs";
import { logger } from "../app";
import { config } from "../utils/Config";
import socketIo from "socket.io";
import { Search } from "./socketIo/namespaces/Search";

export default class NodeServer {
  public port: number;

  private express: Express;
  private httpServer: http.Server;
  private socketServer: socketIo.Server;
  private publicPath: string;

  constructor() {
    const environment = process.env.NODE_ENV;

    this.port = config.port;

    this.express = express();
    this.httpServer = new http.Server(this.express);
    this.socketServer = new socketIo.Server(this.httpServer);
    
    this.publicPath = path.join(__dirname, (environment === "production") ? "../../client/build" : "../../client/public" );
    this.express.use(express.static(this.publicPath, { index: false }));

    this.express.use(cookieParser());
    this.express.use(bodyParser.urlencoded({ extended: false }));
    this.express.use(bodyParser.json());

    if(config.proxy) this.express.set("trust proxy", 1);
  }

  start() {
    return new Promise<void>(async (resolve, reject) => {

      const environment = process.env.NODE_ENV;

      const express = this.express;
      const port = this.port;
      
      this.socketServer = this.socketServer.listen(this.httpServer);
      this.httpServer = this.httpServer.listen(port);

      // Express routes
      express.all("*", (req: Request, res: Response, next: NextFunction) => {
        logger.http(`[${req.method}] ${req.url} from ${req.ip}`);
        return next();
      });
      
      // Socket namespaces
      new Search(this.httpServer, this.socketServer);

      for(const i in routes) {
        express.use(i, routes[i](this.httpServer, this.socketServer));
        logger.info(`[Node] Registered route '${i}'`);
      }

      if(environment === "production") express.use(csurf());

      express.all("*", (req: Request, res: Response, next: NextFunction) => {
        let file = fs.readFileSync(path.join(this.publicPath, "index.html")).toString();
        if(environment === "production") {
          file = file.replace("__CSRF_TOKEN__", req.csrfToken());
          res.status(200).send(file);
        } else if(config.devUrl) {
          res.redirect(config.devUrl);
        } else {
          res.sendStatus(404);
        }
        return next();

      });

      express.use((err: any, req: Request, res: Response, next: NextFunction) => {
        if(err.code === "EBADCSRFTOKEN") {
          logger.http(`[EBADCSRFTOKEN] ${req.url} from ${req.ip}`);
          res.status(403).send({ success: false, msg: "Invalid CSRF token" });
        }

        return next();

      });
      
    });

  }
}