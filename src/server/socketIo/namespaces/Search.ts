import http from "http";
import { Address } from "node:cluster";
import socketIo, { Socket, Namespace } from "socket.io";
import { logger } from "../../../app";
import SearchBuilder, { LogType } from "../../../utils/SearchBuilder";

export class Search {
  nsp: Namespace

  constructor(httpServer: http.Server, socketServer: socketIo.Server) {
    this.nsp = socketServer.of("/search");
    this.start();
  }

  async start() {
    this.nsp.on("connection", async (socket: Socket) => {
      
      logger.http(`[Search] Socket connected: ${socket.id}`);
      socket.on("disconnect", () => {
        logger.http(`[Search] Socket disconnected: ${socket.id}`);
      });

      socket.on("completeSearch", (data: { council: string, address: Address }) => {
        const searchBuilder = new SearchBuilder(data.council, data.address);
        if(searchBuilder.planningBuilder == null) {
          socket.emit("error", `'${data.council}' is not a valid council`);
          return logger.info(`[Search] Client requested search for invalid council '${data.council}'`);
        }

        const planningBuilder = searchBuilder.planningBuilder;
        planningBuilder.completeSearch((type: LogType | "data", msg: string,  data?: any) => {
          switch(type) {
            case "data":
              logger.info(`[Search] ${msg}`);
              socket.emit("planning", data);
              break;
            case "error":
              logger.error(`[Search] ${msg}`);
              socket.emit("error", msg);
              break;
            default:
              logger.info(`[Search] ${msg}`);
              socket.emit(type, msg);
              break;

          }
        }).then((data: any) => {
          //console.log(data)
        }).catch((err: Error) => {
          logger.error(`[Search] ${err}`);
          socket.emit("error", err.message);
        });
        
      });

    });
  }

  
}