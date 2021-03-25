import api from "../routes/api";
import { Router } from "express";
import http from "http";
import socketIo from "socket.io";

const routes: { [key: string]: (httpServer: http.Server, socketServer?: socketIo.Server) => Router } = {
  "/api": api
}

export default routes;