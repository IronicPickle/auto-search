import { Request, NextFunction, Response } from "express";
import csurf from "csurf";

const csrfProtection = (process.env.NODE_ENV === "production") ? csurf() : null;

export default function authenticator() {
  return async (req: Request, res: Response, next?: NextFunction) => {

    if(csrfProtection != null && next != null) return csrfProtection(req, res, next);

  }
}