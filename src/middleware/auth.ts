
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { TUserRole } from "../modules/user/user.interface";
import config from "../config";


const auth =(...roles: TUserRole[]) =>(req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, config.jwt_secret as string);

    const user = decoded as any;

    req.user = user;

    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };

export default auth;