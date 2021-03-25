import { NextFunction, Request, Response } from "express";
import { logger } from "../app";

export default function(fn: any): any {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: Error) => {
      logger.error(err);
      return next(err);
    });
  }
}