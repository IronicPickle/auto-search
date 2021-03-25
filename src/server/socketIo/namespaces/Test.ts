import http from "http";
import socketIo, { Socket } from "socket.io";
import { logger } from "../../../app";

export class Test {
  nsp: socketIo.Namespace
  token?: string;

  constructor(httpServer: http.Server, socketServer: socketIo.Server) {
    this.nsp = socketServer.of("/test");
    this.start();
  }

  async start() {
    this.nsp.on("connection", async (socket: Socket) => {
      
      logger.http(`[Socket.IO] Socket connected: ${socket.id}`);
      socket.on("disconnect", () => {
        logger.http(`[Socket.IO] Socket disconnected: ${socket.id}`);
      });

    });
  }
}