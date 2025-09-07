import { NextFunction, Request, Response } from "express";
import { User } from "../../domain";

export class PermissionMiddleware {
  static async isAdmin(req: Request, res: Response, next: NextFunction) {
    const user: Partial<User> = req.user!;

    if (!user || !user.roles) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    if (!user.roles.includes("admin")) {
      res.status(403).json({ error: "Admin role required" });
      return;
    }

    next();
  }

  static elevateRole(req: Request, res: Response, next: NextFunction) {
    const user: Partial<User> = req.user!;

    if (!user || !user.roles) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    // role need to be 'admin' or 'administrativo'
    if (
      !user.roles.includes("admin") &&
      !user.roles.includes("administrativo")
    ) {
      res.status(403).json({ error: "Admin or Administrative role required" });
      return;
    }

    next();
  }
}
