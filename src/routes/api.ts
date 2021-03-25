import express, { Request, Response, NextFunction } from "express";
import http from "http";
import wrap from "../utils/wrap";
import authenticator from "../utils/authenticator";
import csurf from "csurf";

export default (httpInstance: http.Server) => {
  const router = express.Router();

  router.get("/test", wrap(async (req: Request, res: Response, next: NextFunction) => {
    
    let success = true;
    let msg = "Query Successful";

    res.status((success) ? 200 : 404).send({ success, msg });

  }));

  router.post("/test", csurf, wrap(async (req: Request, res: Response, next: NextFunction) => {
    
    let success = true;
    let msg = "Query Successful";

    res.status((success) ? 200 : 404).send({ success, msg });

  }));

  return router;
}