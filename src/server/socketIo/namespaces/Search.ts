import http from "http";
import socketIo, { Socket, Namespace } from "socket.io";
import { logger } from "../../../app";

export class Search {
  nsp: Namespace

  constructor(httpServer: http.Server, socketServer: socketIo.Server) {
    this.nsp = socketServer.of("/search");
    this.start();
  }

  async start() {
    this.nsp.on("connection", async (socket: Socket) => {
      
      logger.http(`[Socket.IO] Socket connected: ${socket.id}`);
      socket.on("disconnect", () => {
        logger.http(`[Socket.IO] Socket disconnected: ${socket.id}`);
      });

      socket.on("search", (data: { council: string }) => {
        const searchBuilder = new SearchBuilder(data.council);

        
      });

    });
  }

  
}